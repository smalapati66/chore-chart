// src/api/rotations.ts
import { supabase } from "../lib/supabaseClient";

export async function applyPendingRotations(houseId: string) {
  const { error } = await supabase.rpc("apply_due_weekly_rotations", {
    p_house_id: houseId,
  });
  if (error) throw error;
}
