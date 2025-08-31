// src/lib/auth.ts
import { supabase } from "./supabase";

export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

export function onAuthStateChanged(cb: (user: any) => void) {
  supabase.auth.onAuthStateChange((_event, session) => cb(session?.user ?? null));
}
