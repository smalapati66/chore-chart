// src/api/completions.ts
import { supabase } from "../lib/supabaseClient";

export async function fetchCompletedChoreIdsSince(params: {
  houseId: string;
  sinceIso: string;
}) {
  const { houseId, sinceIso } = params;

  const { data, error } = await supabase
    .from("completions")
    .select("chore_id")
    .eq("house_id", houseId)
    .gte("completed_at", sinceIso);

  if (error) throw error;

  const set = new Set<string>();
  for (const row of data ?? []) set.add(row.chore_id as string);
  return set;
}
