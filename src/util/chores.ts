 // src/api/chores.ts
import { supabase } from "../lib/supabaseClient";

export type ChoreRow = {
  id: string;
  title: string;
  weekly: boolean | null;
  active: boolean | null;
  house_id: string;
  cur_user_id: string | null;
  pending_user_id: string | null;
  pending_effective_at: string | null; // ISO string
};

export async function fetchChores(houseId: string) {
  const { data, error } = await supabase
    .from("chores")
    .select(
      "id,title,weekly,active,house_id,cur_user_id,pending_user_id,pending_effective_at"
    )
    .eq("house_id", houseId)
    .eq("active", true);

  if (error) throw error;
  return (data ?? []) as ChoreRow[];
}


