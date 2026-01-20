import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { data: { session } } = await supabase.auth.getSession();
console.log("role", session?.user?.role, "uid", session?.user?.id);

await supabase.auth.signInAnonymously