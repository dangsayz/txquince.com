import "server-only";
import { cache } from "react";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";

/**
 * clients-db.ts — read-only admin views of the two pipelines that matter:
 * paid/pending BOOKINGS and inbound INQUIRIES (leads). Service-role, server
 * only, never imported into a client component. Mirrors content-db.ts: every
 * query is guarded by isSupabaseConfigured() and try/catch so the admin UI
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
};

/**
 * All bookings, newest first. Paid + pending holds + expired/cancelled —
 * everything, so the photographer sees the full picture and can reconcile.
 */
export const getBookings = cache(async (): Promise<BookingRow[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, created_at, name, email, phone, event_date, package, collection, notes, status, deposit_amount_cents, currency, paid_at, expires_at, attribution",
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
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("inquiries")
      .select(
        "id, created_at, name, email, phone, event_date, venue, services, budget_range, referral, message, status, last_touch_at, unsubscribed_at, attribution",
      )
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as InquiryRow[];
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
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = getServiceSupabase();
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("bookings")
      .select("event_date")
      .in("status", ["requested", "pending_payment", "paid"])
      .gte("event_date", today);
    if (error || !data) return [];
    // De-dupe (a date can have one active row, but be defensive).
    return Array.from(new Set(data.map((r) => r.event_date as string)));
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
