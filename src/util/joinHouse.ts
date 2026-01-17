// joinHouse.ts
import { supabase } from "../lib/supabaseClient";

export async function ensureAnon() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }
}

export async function joinHouse(code: string) {
  await ensureAnon();
  const { data, error } = await supabase.rpc("join_house", {
    p_code: code.trim(),
    p_display_name: null,
  });
  if (error) throw error;
  return data as string; // uuid
}
