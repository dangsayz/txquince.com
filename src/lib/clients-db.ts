import "server-only";
import { cache } from "react";
import { getDb, isDbConfigured } from "@/lib/db";
import { ACTIVE_BOOKING_STATUSES, fullDates } from "@/lib/booking-capacity";

/**
 * clients-db.ts — read-only admin views of the two pipelines that matter:
 * paid/pending BOOKINGS and inbound INQUIRIES (leads). Service-role, server
 * only, never imported into a client component. Mirrors content-db.ts: every
 * query is guarded by isDbConfigured() and try/catch so the admin UI
 * degrades to an empty state instead of crashing when env isn't wired yet.
 */

export type BookingRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  event_date: string;
  /** Service type: 'photo' | 'video' | 'both'. */
  package: string;
  /** Collection tier: 'essential' | 'signature' | 'legacy' | null (legacy rows). */
  collection: string | null;
  notes: string | null;
  status: string;
  deposit_amount_cents: number;
  currency: string;
  paid_at: string | null;
  expires_at: string;
  /** First-touch acquisition source { source, medium, campaign, referrer, landing, ts }. */
  attribution: Record<string, string> | null;
  /** Commission details for homepage bookings { tier, add_ons, total_usd, language, … }. */
  metadata?: Record<string, unknown> | null;
};

export type InquiryRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  venue: string | null;
  services: string | null;
  budget_range: string | null;
  referral: string | null;
  message: string | null;
  status: string | null;
  last_touch_at: string | null;
  unsubscribed_at: string | null;
  attribution: Record<string, string> | null;
  /** Why a 'lost' lead was lost (migration 0018) — optional until that runs. */
  lost_reason?: string | null;
  /** Who they booked instead, if known (migration 0018). */
  competitor_name?: string | null;
};

export type InquiryActivityRow = {
  id: string;
  inquiry_id: string;
  kind: "note" | "contact" | "reminder";
  note: string;
  actor_email: string;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export const getInquiryActivity = cache(async (): Promise<InquiryActivityRow[]> => {
  if (!isDbConfigured()) throw new Error("The client database is not configured.");
  const { data, error } = await getDb()
    .from("inquiry_activity")
    .select("id, inquiry_id, kind, note, actor_email, due_at, completed_at, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load client follow-up activity.");
  return (data ?? []) as InquiryActivityRow[];
});

/**
 * All bookings, newest first. Paid + pending holds + expired/cancelled —
 * everything, so the photographer sees the full picture and can reconcile.
 */
export const getBookings = cache(async (): Promise<BookingRow[]> => {
  if (!isDbConfigured()) return [];
  try {
    const dbc = getDb();
    const { data, error } = await dbc
      .from("bookings")
      .select(
        "id, created_at, name, email, phone, event_date, package, collection, notes, status, deposit_amount_cents, currency, paid_at, expires_at, attribution, metadata",
      )
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as BookingRow[];
  } catch {
    return [];
  }
});

/** All inquiries (leads), newest first. */
export const getInquiries = cache(async (): Promise<InquiryRow[]> => {
  if (!isDbConfigured()) return [];
  const base =
    "id, created_at, name, email, phone, event_date, venue, services, budget_range, referral, message, status, last_touch_at, unsubscribed_at, attribution";
  try {
    const dbc = getDb();
    // Try the enriched select; fall back to base if migration 0018 hasn't run
    // yet, so the admin never blanks out on a missing-column error.
    const enriched = await dbc
      .from("inquiries")
      .select(`${base}, lost_reason, competitor_name`)
      .order("created_at", { ascending: false });
    if (!enriched.error && enriched.data) return enriched.data as InquiryRow[];

    const basic = await dbc
      .from("inquiries")
      .select(base)
      .order("created_at", { ascending: false });
    if (basic.error || !basic.data) return [];
    return basic.data as InquiryRow[];
  } catch {
    return [];
  }
});

/**
 * Future dates with an ACTIVE claim (a live hold or a paid booking) — i.e. the
 * dates a new family cannot book. Powers the public availability check on the
 * reserve form. Only the dates leak (no PII), and only future ones. `today` is
 * UTC-safe (event_date is a DATE).
 */
export const getTakenEventDates = cache(async (): Promise<string[]> => {
  if (!isDbConfigured()) return [];
  try {
    const dbc = getDb();
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await dbc
      .from("bookings")
      .select("event_date")
      .in("status", [...ACTIVE_BOOKING_STATUSES])
      .gte("event_date", today);
    if (error || !data) return [];
    // A date is taken once it holds BOOKINGS_PER_DATE active bookings.
    return fullDates(data.map((r) => r.event_date as string));
  } catch {
    return [];
  }
});

/** Count of bookings whose deposit actually cleared. Drives the dashboard tile. */
export function countPaid(bookings: BookingRow[]): number {
  return bookings.filter((b) => b.status === "paid").length;
}

/** Leads not yet turned into a paid booking — the active follow-up pile. */
export function countOpenLeads(inquiries: InquiryRow[]): number {
  // DB constraint allows new | won | lost | unsubscribed — only "new" is open.
  return inquiries.filter((i) => i.status === "new" && !i.unsubscribed_at).length;
}
