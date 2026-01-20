// src/api/completeChore.ts
import { supabase } from "../lib/supabaseClient";
import { USER_TO_NEXT } from "../config";
import { nextSundayNoon } from "./week";

export async function completeChore(params: {
  houseId: string;
  choreId: string;
  curUserId: string | null;
  weekly: boolean;
}) {
  const { houseId, choreId, curUserId, weekly } = params;

  if (!curUserId) throw new Error("Chore is unassigned.");
  const nextId = USER_TO_NEXT[curUserId];
  if (!nextId) throw new Error("Missing USER_TO_NEXT mapping for current assignee.");

  // 1) Insert completion
  const { error: insErr } = await supabase.from("completions").insert({
    house_id: houseId,
    chore_id: choreId,
    completed_by_user_id: curUserId,
  });
  if (insErr) throw insErr;

  // 2) Rotate now or schedule for Sunday noon
  if (!weekly) {
    const { error: updErr } = await supabase
      .from("chores")
      .update({ cur_user_id: nextId, pending_user_id: null, pending_effective_at: null })
      .eq("id", choreId)
      .eq("house_id", houseId);
    if (updErr) throw updErr;
  } else {
    const effectiveAt = nextSundayNoon().toISOString();
    const { error: updErr } = await supabase
      .from("chores")
      .update({ pending_user_id: nextId, pending_effective_at: effectiveAt })
      .eq("id", choreId)
      .eq("house_id", houseId);
    if (updErr) throw updErr;
  }

  return { nextId };
}
