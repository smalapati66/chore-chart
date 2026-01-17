import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useAnonymousAuth() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        supabase.auth.signInAnonymously();
      }
    });
  }, []);
}
