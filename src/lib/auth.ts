import { supabase } from "./supabaseClient";

export async function ensureAnonSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;

  if (!session) {
    const { error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError) throw signInError;
  }
}
