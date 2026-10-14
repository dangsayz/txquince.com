/**
 * db.ts — the journey's data access. One interface, two implementations:
 *   - supabaseJourneyDb(): PostgREST via the service-role client (production,
 *     and the local PostgREST in scripts/local).
 *   - tests/helpers/memory-db.ts: an in-memory fake with the same unique keys,
 *     for handler tests that don't need a database.
 *
 * Every method selects explicit columns. Guarded updates take a `where` that is
 * spliced into the UPDATE itself (status in …, column is null), so a check
 * and its write are one statement.
 */
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Status } from "./state";
import type {
  AccessTokenRow,
  BookingEventRow,
  BookingRow,
  CheckoutSessionRow,
  ContractTemplateRow,
  MessageRow,
  NewBooking,
  NewPayment,
  NoteRow,
  PaymentRow,
  ReminderKind,
  ReminderRow,
  SessionKind,
  SessionStatus,
} from "./types";

/** A unique-key conflict the caller is expected to handle. */
export class DbConflict extends Error {
  constructor(readonly code: "date_taken" | "already_requested" | "duplicate" | "immutable") {
    super(code);
  }
}

export type BookingWhere = {
  /** Only update when the current status is one of these. */
  status?: readonly Status[];
  /** Only update while these columns are still null. */
  isNull?: (keyof BookingRow)[];
};

export type BookingQuery = {
  statuses?: readonly Status[];
  email?: string;
  ids?: string[];
  /** expires_at strictly before this ISO time. */
  expiresBefore?: string;
  eventFrom?: string;
  eventTo?: string;
  limit?: number;
};

export interface JourneyDb {
  insertBooking(row: NewBooking): Promise<BookingRow>;
  getBooking(id: string): Promise<BookingRow | null>;
  updateBooking(id: string, patch: Partial<BookingRow>, where?: BookingWhere): Promise<BookingRow | null>;
  listBookings(q?: BookingQuery): Promise<BookingRow[]>;

  insertAccessToken(row: Omit<AccessTokenRow, "created_at" | "revoked_at" | "last_used_at">): Promise<void>;
  findAccessToken(hash: string): Promise<AccessTokenRow | null>;
  touchAccessToken(hash: string, at: string): Promise<void>;

  insertEvent(e: Omit<BookingEventRow, "id" | "at"> & { at?: string }): Promise<void>;
  listEvents(bookingId: string): Promise<BookingEventRow[]>;

  /** Idempotent on stripe_checkout_session_id / stripe_refund_id. */
  insertPayment(p: NewPayment): Promise<{ inserted: boolean; row: PaymentRow }>;
  listPayments(bookingId: string): Promise<PaymentRow[]>;
  /** Payments for many bookings at once (admin list). */
  listPaymentsFor(bookingIds: string[]): Promise<PaymentRow[]>;
  /** The Stripe charge (not refund) row for a PaymentIntent, if it's ours. */
  findPaymentByIntent(paymentIntentId: string): Promise<PaymentRow | null>;

  insertSession(s: Omit<CheckoutSessionRow, "created_at" | "completed_at" | "status"> & { status?: SessionStatus }): Promise<void>;
  getSession(id: string): Promise<CheckoutSessionRow | null>;
  listSessions(bookingId: string, opts?: { kind?: SessionKind; status?: SessionStatus[] }): Promise<CheckoutSessionRow[]>;
  updateSession(id: string, patch: Partial<CheckoutSessionRow>, whereStatus?: SessionStatus[]): Promise<boolean>;

  /** Insert-first claim: true only for the first caller for (booking, kind). */
  claimReminder(bookingId: string, kind: ReminderKind): Promise<boolean>;
  releaseReminder(bookingId: string, kind: ReminderKind): Promise<void>;
  listReminders(bookingId: string): Promise<ReminderRow[]>;

  insertMessage(m: Omit<MessageRow, "id" | "created_at" | "read_at">): Promise<MessageRow>;
  listMessages(bookingId: string): Promise<MessageRow[]>;
  markFamilyMessagesRead(bookingId: string, at: string): Promise<void>;
  unreadCounts(): Promise<Record<string, number>>;

  insertNote(n: Omit<NoteRow, "id" | "created_at">): Promise<NoteRow>;
  listNotes(bookingId: string): Promise<NoteRow[]>;

  latestTemplate(): Promise<ContractTemplateRow | null>;
  insertTemplate(t: Omit<ContractTemplateRow, "version" | "created_at">): Promise<ContractTemplateRow>;
}

/* ------------------------------------------------------------------ */
/* PostgREST implementation                                            */
/* ------------------------------------------------------------------ */

export const BOOKING_COLUMNS = [
  "id",
  "created_at",
  "updated_at",
  "name",
  "email",
  "phone",
  "event_date",
  "package",
  "notes",
  "status",
  "deposit_amount_cents",
  "currency",
  "expires_at",
  "paid_at",
  "cancelled_at",
  "lang",
  "total_cents",
  "balance_cents",
  "deposit_percent",
  "balance_due_days",
  "balance_due_date",
  "price_book",
  "request",
  "approved_at",
  "declined_at",
  "signed_at",
  "agreement",
  "contract_sha256",
  "contract_pdf_key",
  "confirmed_at",
  "paid_in_full_at",
  "completed_at",
  "gallery_url",
  "video_url",
  "album_status",
  "review_url",
  "delivery_note",
  "delivery_updated_at",
  "metadata",
].join(", ");
const PAYMENT_COLUMNS =
  "id, booking_id, created_at, kind, method, amount_cents, currency, refund_of, stripe_checkout_session_id, stripe_payment_intent_id, stripe_refund_id, stripe_event_id, recorded_by, note";
const SESSION_COLUMNS = "id, booking_id, kind, amount_cents, url, status, expires_at, created_at, completed_at";
const MESSAGE_COLUMNS = "id, booking_id, created_at, author, author_email, kind, body, read_at";
const TOKEN_COLUMNS = "token_hash, booking_id, purpose, created_at, expires_at, revoked_at, last_used_at";
const EVENT_COLUMNS = "id, booking_id, at, event, actor, actor_email, ip, user_agent, detail";

type PgError = { code?: string; message: string; details?: string | null } | null;

function fail(where: string, error: PgError): never {
  throw new Error(`[journey-db] ${where}: ${error?.message ?? "unknown error"}`);
}

function conflictFrom(error: PgError): DbConflict | null {
  if (!error) return null;
  if (error.code === "23505") {
    const text = `${error.message} ${error.details ?? ""}`;
    if (text.includes("bookings_active_email_date_idx")) return new DbConflict("already_requested");
    if (text.includes("bookings_active_event_date_idx")) return new DbConflict("date_taken");
    return new DbConflict("duplicate");
  }
  if (error.code === "P0001" && error.message.includes("signed_agreement_immutable")) return new DbConflict("immutable");
  return null;
}

export function supabaseJourneyDb(sb: SupabaseClient): JourneyDb {
  return {
    async insertBooking(row) {
      const { data, error } = await sb.from("bookings").insert(row).select(BOOKING_COLUMNS).single();
      const c = conflictFrom(error);
      if (c) throw c.code === "duplicate" ? new DbConflict("date_taken") : c;
      if (error || !data) fail("insertBooking", error);
      return data as unknown as BookingRow;
    },
    async getBooking(id) {
      const { data, error } = await sb.from("bookings").select(BOOKING_COLUMNS).eq("id", id).maybeSingle();
      if (error) fail("getBooking", error);
      return (data as unknown as BookingRow) ?? null;
    },
    async updateBooking(id, patch, where) {
      let q = sb.from("bookings").update(patch).eq("id", id);
      if (where?.status) q = q.in("status", [...where.status]);
      for (const col of where?.isNull ?? []) q = q.is(col as string, null);
      const { data, error } = await q.select(BOOKING_COLUMNS).maybeSingle();
      const c = conflictFrom(error);
      if (c) throw c.code === "duplicate" ? new DbConflict("date_taken") : c;
      if (error) fail("updateBooking", error);
      return (data as unknown as BookingRow) ?? null;
    },
    async listBookings(q = {}) {
      let r = sb.from("bookings").select(BOOKING_COLUMNS);
      if (q.statuses) r = r.in("status", [...q.statuses]);
      if (q.email) r = r.eq("email", q.email.toLowerCase());
      if (q.ids) r = r.in("id", q.ids);
      if (q.expiresBefore) r = r.lt("expires_at", q.expiresBefore);
      if (q.eventFrom) r = r.gte("event_date", q.eventFrom);
      if (q.eventTo) r = r.lte("event_date", q.eventTo);
      const { data, error } = await r.order("created_at", { ascending: false }).limit(q.limit ?? 1000);
      if (error) fail("listBookings", error);
      return (data ?? []) as unknown as BookingRow[];
    },

    async insertAccessToken(row) {
      const { error } = await sb.from("booking_access_tokens").insert(row);
      if (error) fail("insertAccessToken", error);
    },
    async findAccessToken(hash) {
      const { data, error } = await sb
        .from("booking_access_tokens")
        .select(TOKEN_COLUMNS)
        .eq("token_hash", hash)
        .maybeSingle();
      if (error) fail("findAccessToken", error);
      return (data as AccessTokenRow) ?? null;
    },
    async touchAccessToken(hash, at) {
      await sb.from("booking_access_tokens").update({ last_used_at: at }).eq("token_hash", hash);
    },

    async insertEvent(e) {
      const { error } = await sb.from("booking_events").insert(e);
      if (error) fail("insertEvent", error);
    },
    async listEvents(bookingId) {
      const { data, error } = await sb
        .from("booking_events")
        .select(EVENT_COLUMNS)
        .eq("booking_id", bookingId)
        .order("at", { ascending: true });
      if (error) fail("listEvents", error);
      return (data ?? []) as BookingEventRow[];
    },

    async insertPayment(p) {
      const { data, error } = await sb.from("booking_payments").insert(p).select(PAYMENT_COLUMNS).single();
      if (error?.code === "23505") {
        const key = p.stripe_refund_id ? "stripe_refund_id" : "stripe_checkout_session_id";
        const val = p.stripe_refund_id ?? p.stripe_checkout_session_id;
        const { data: existing, error: e2 } = await sb
          .from("booking_payments")
          .select(PAYMENT_COLUMNS)
          .eq(key, val as string)
          .single();
        if (e2 || !existing) fail("insertPayment(existing)", e2);
        return { inserted: false, row: existing as PaymentRow };
      }
      if (error || !data) fail("insertPayment", error);
      return { inserted: true, row: data as PaymentRow };
    },
    async listPayments(bookingId) {
      const { data, error } = await sb
        .from("booking_payments")
        .select(PAYMENT_COLUMNS)
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });
      if (error) fail("listPayments", error);
      return (data ?? []) as PaymentRow[];
    },
    async listPaymentsFor(ids) {
      if (!ids.length) return [];
      const out: PaymentRow[] = [];
      for (let i = 0; i < ids.length; i += 200) {
        const { data, error } = await sb.from("booking_payments").select(PAYMENT_COLUMNS).in("booking_id", ids.slice(i, i + 200));
        if (error) fail("listPaymentsFor", error);
        out.push(...((data ?? []) as PaymentRow[]));
      }
      return out;
    },
    async findPaymentByIntent(pi) {
      const { data, error } = await sb
        .from("booking_payments")
        .select(PAYMENT_COLUMNS)
        .eq("stripe_payment_intent_id", pi)
        .neq("kind", "refund")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) fail("findPaymentByIntent", error);
      return (data as PaymentRow) ?? null;
    },

    async insertSession(s) {
      const { error } = await sb.from("booking_checkout_sessions").insert(s);
      if (error) fail("insertSession", error);
    },
    async getSession(id) {
      const { data, error } = await sb.from("booking_checkout_sessions").select(SESSION_COLUMNS).eq("id", id).maybeSingle();
      if (error) fail("getSession", error);
      return (data as CheckoutSessionRow) ?? null;
    },
    async listSessions(bookingId, opts) {
      let q = sb.from("booking_checkout_sessions").select(SESSION_COLUMNS).eq("booking_id", bookingId);
      if (opts?.kind) q = q.eq("kind", opts.kind);
      if (opts?.status) q = q.in("status", opts.status);
      const { data, error } = await q.order("created_at", { ascending: true });
      if (error) fail("listSessions", error);
      return (data ?? []) as CheckoutSessionRow[];
    },
    async updateSession(id, patch, whereStatus) {
      let q = sb.from("booking_checkout_sessions").update(patch).eq("id", id);
      if (whereStatus) q = q.in("status", whereStatus);
      const { data, error } = await q.select("id");
      if (error) fail("updateSession", error);
      return (data ?? []).length > 0;
    },

    async claimReminder(bookingId, kind) {
      const { error } = await sb.from("booking_reminders").insert({ booking_id: bookingId, kind });
      if (!error) return true;
      if (error.code === "23505") return false;
      fail("claimReminder", error);
    },
    async releaseReminder(bookingId, kind) {
      await sb.from("booking_reminders").delete().eq("booking_id", bookingId).eq("kind", kind);
    },
    async listReminders(bookingId) {
      const { data, error } = await sb
        .from("booking_reminders")
        .select("booking_id, kind, sent_at")
        .eq("booking_id", bookingId);
      if (error) fail("listReminders", error);
      return (data ?? []) as ReminderRow[];
    },

    async insertMessage(m) {
      const { data, error } = await sb.from("booking_messages").insert(m).select(MESSAGE_COLUMNS).single();
      if (error || !data) fail("insertMessage", error);
      return data as MessageRow;
    },
    async listMessages(bookingId) {
      const { data, error } = await sb
        .from("booking_messages")
        .select(MESSAGE_COLUMNS)
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });
      if (error) fail("listMessages", error);
      return (data ?? []) as MessageRow[];
    },
    async markFamilyMessagesRead(bookingId, at) {
      const { error } = await sb
        .from("booking_messages")
        .update({ read_at: at })
        .eq("booking_id", bookingId)
        .eq("author", "family")
        .is("read_at", null);
      if (error) fail("markFamilyMessagesRead", error);
    },
    async unreadCounts() {
      const { data, error } = await sb
        .from("booking_messages")
        .select("booking_id")
        .eq("author", "family")
        .is("read_at", null)
        .limit(5000);
      if (error) fail("unreadCounts", error);
      const out: Record<string, number> = {};
      for (const r of (data ?? []) as { booking_id: string }[]) out[r.booking_id] = (out[r.booking_id] ?? 0) + 1;
      return out;
    },

    async insertNote(n) {
      const { data, error } = await sb
        .from("booking_notes")
        .insert(n)
        .select("id, booking_id, created_at, author_email, body")
        .single();
      if (error || !data) fail("insertNote", error);
      return data as NoteRow;
    },
    async listNotes(bookingId) {
      const { data, error } = await sb
        .from("booking_notes")
        .select("id, booking_id, created_at, author_email, body")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });
      if (error) fail("listNotes", error);
      return (data ?? []) as NoteRow[];
    },

    async latestTemplate() {
      const { data, error } = await sb
        .from("contract_templates")
        .select("version, created_at, created_by, en, es, note")
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) fail("latestTemplate", error);
      return (data as ContractTemplateRow) ?? null;
    },
    async insertTemplate(t) {
      const { data, error } = await sb
        .from("contract_templates")
        .insert(t)
        .select("version, created_at, created_by, en, es, note")
        .single();
      if (error || !data) fail("insertTemplate", error);
      return data as ContractTemplateRow;
    },
  };
}
