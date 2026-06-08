"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client — used by the admin login form (auth only). */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
