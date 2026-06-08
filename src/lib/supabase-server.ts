/**
 * supabase-server.ts — SERVER-ONLY Supabase client (SERVICE ROLE).
 *
 * SECURITY LAW: the service-role key bypasses RLS and must NEVER reach the
 * browser. This module is imported only by server code (/api/inquiry). It has no
 * "use client" and uses non-public env vars. The anon/public key never touches
 * the `inquiries` table — all inserts happen here, server-side.
 *
 * The client is created lazily so a missing env var doesn't crash the build;
 * it throws a clear error only when actually used without configuration.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getServiceSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
