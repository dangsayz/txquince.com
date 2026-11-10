/**
 * db — SERVER-ONLY access to TX Quince's database: Cloudflare D1 (binding DB,
 * database "txquince", schema in /migrations). Replaces the old Supabase
 * service-role client with the same call shape (see d1-query.ts).
 *
 * SECURITY: only server code imports this; D1 has no public access path.
 */
import "server-only";
import { createD1Client, type D1Client } from "@/lib/db/d1-query";
import { requireD1, type D1Database } from "@/lib/d1";

let cached: D1Client | null = null;

/** The database client (throws a clear error on use if the binding is missing). */
export function getDb(): D1Client {
  cached ??= createD1Client(requireD1);
  return cached;
}

/** True when the D1 binding is present (Workers; false in plain `next dev`/tests). */
export function isDbConfigured(): boolean {
  const ctx = (globalThis as Record<symbol, { env?: { DB?: D1Database } } | undefined>)[
    Symbol.for("__cloudflare-context__")
  ];
  return Boolean(ctx?.env?.DB);
}

/**
 * Frees dates whose hold ran out: unpaid 'requested' / 'pending_payment'
 * bookings past expires_at become 'expired'. Postgres ran this on a timer;
 * D1 has no timer, so the paths that read or claim a date call it first.
 * One cheap UPDATE; never throws (a failed sweep must not block a booking).
 */
export async function releaseExpiredHolds(): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    await getDb().rpc("release_expired_booking_holds");
  } catch (err) {
    console.error("[db] release holds:", err);
  }
}
