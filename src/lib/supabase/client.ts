"use client";

import { createBrowserClient } from "@supabase/ssr";

type PublicConfig = { supabaseUrl: string; supabaseAnonKey: string };
let runtimeConfig: Promise<PublicConfig> | null = null;

/**
 * Browser Supabase client — used by the admin login form (auth only).
 * Uses the build-inlined NEXT_PUBLIC_* values when present, otherwise reads
 * them from the Worker at runtime, so a build without .env.local can't break
 * admin sign-in.
 */
export async function createBrowserSupabaseClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    runtimeConfig ??= fetch("/api/public-config", { cache: "no-store" }).then(
      (r) => r.json() as Promise<PublicConfig>,
    );
    runtimeConfig.catch(() => (runtimeConfig = null)); // let a retry refetch
    const cfg = await runtimeConfig;
    url = cfg.supabaseUrl;
    key = cfg.supabaseAnonKey;
  }
  return createBrowserClient(url, key);
}
