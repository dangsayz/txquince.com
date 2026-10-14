/**
 * memory-db.ts — TEST ONLY. An in-memory JourneyDb that enforces the same
 * rules the database does (migration 0023): one active booking per date and
 * per email+date, unique Stripe session / refund ids on payments, unique
 * (booking, kind) reminders, and an immutable signed agreement. Guarded
 * updates honor the same `where` the PostgREST implementation splices in.
 */
import { randomUUID } from "node:crypto";
import { DbConflict, type JourneyDb } from "../db";
import { HOLDS_DATE } from "../state";
import type {
  AccessTokenRow,
  BookingEventRow,
  BookingRow,
  CheckoutSessionRow,
  ContractTemplateRow,
  MessageRow,
  NoteRow,
  PaymentRow,
  ReminderRow,
} from "../types";

export type MemoryDb = JourneyDb & {
  bookings: Map<string, BookingRow>;
  tokens: Map<string, AccessTokenRow>;
  events: BookingEventRow[];
  payments: PaymentRow[];
  sessions: Map<string, CheckoutSessionRow>;
  reminders: ReminderRow[];
  messages: MessageRow[];
  notes: NoteRow[];
  templates: ContractTemplateRow[];
  /** Make the next call to `method` throw (simulates a database error). */
  failNext: (method: keyof JourneyDb) => void;
};

const clone = <T,>(v: T): T => (v == null ? v : (JSON.parse(JSON.stringify(v)) as T));

export function memoryDb(now: () => Date = () => new Date()): MemoryDb {
  const bookings = new Map<string, BookingRow>();
  const tokens = new Map<string, AccessTokenRow>();
  const events: BookingEventRow[] = [];
  const payments: PaymentRow[] = [];
  const sessions = new Map<string, CheckoutSessionRow>();
  const reminders: ReminderRow[] = [];
  const messages: MessageRow[] = [];
  const notes: NoteRow[] = [];
  const templates: ContractTemplateRow[] = [];
  const failing = new Set<string>();
  const iso = () => now().toISOString();
  const tick = (() => {
    let n = 0;
    return () => new Date(now().getTime() + n++).toISOString();
  })();
  const maybeFail = (m: string) => {
    if (failing.has(m)) {
      failing.delete(m);
      throw new Error(`[memory-db] simulated failure in ${m}`);
    }
  };

  function checkUnique(row: BookingRow) {
    if (!HOLDS_DATE.includes(row.status)) return;
    for (const other of bookings.values()) {
      if (other.id === row.id || !HOLDS_DATE.includes(other.status)) continue;
      if (other.event_date === row.event_date) {
        throw new DbConflict(other.email.toLowerCase() === row.email.toLowerCase() ? "already_requested" : "date_taken");
      }
    }
  }

  const db: MemoryDb = {
    bookings,
    tokens,
    events,
    payments,
    sessions,
    reminders,
    messages,
    notes,
    templates,
    failNext: (m) => void failing.add(m as string),

    async insertBooking(row) {
      maybeFail("insertBooking");
      const b: BookingRow = {
        id: randomUUID(),
        created_at: iso(),
        updated_at: iso(),
        paid_at: null,
        cancelled_at: null,
        approved_at: null,
        declined_at: null,
        signed_at: null,
        agreement: null,
        contract_sha256: null,
        contract_pdf_key: null,
        confirmed_at: null,
        paid_in_full_at: null,
        completed_at: null,
        gallery_url: null,
        video_url: null,
        album_status: "not_started",
        review_url: null,
        delivery_note: null,
        delivery_updated_at: null,
        ...clone(row),
        email: row.email.toLowerCase(),
      } as BookingRow;
      delete (b as Record<string, unknown>).attribution;
      checkUnique(b);
      bookings.set(b.id, b);
      return clone(b);
    },
    async getBooking(id) {
      maybeFail("getBooking");
      return clone(bookings.get(id) ?? null);
    },
    async updateBooking(id, patch, where) {
      maybeFail("updateBooking");
      const cur = bookings.get(id);
      if (!cur) return null;
      if (where?.status && !where.status.includes(cur.status)) return null;
      for (const col of where?.isNull ?? []) if (cur[col] !== null && cur[col] !== undefined) return null;
      const next = { ...cur, ...clone(patch), updated_at: iso() } as BookingRow;
      // bookings_signed_is_immutable
      if (
        cur.signed_at &&
        (next.signed_at !== cur.signed_at ||
          JSON.stringify(next.agreement) !== JSON.stringify(cur.agreement) ||
          next.contract_sha256 !== cur.contract_sha256 ||
          next.total_cents !== cur.total_cents ||
          next.deposit_amount_cents !== cur.deposit_amount_cents ||
          next.balance_cents !== cur.balance_cents)
      ) {
        throw new DbConflict("immutable");
      }
      checkUnique(next);
      bookings.set(id, next);
      return clone(next);
    },
    async listBookings(q = {}) {
      maybeFail("listBookings");
      let rows = [...bookings.values()];
      if (q.statuses) rows = rows.filter((b) => q.statuses!.includes(b.status));
      if (q.email) rows = rows.filter((b) => b.email === q.email!.toLowerCase());
      if (q.ids) rows = rows.filter((b) => q.ids!.includes(b.id));
      if (q.expiresBefore) rows = rows.filter((b) => b.expires_at < q.expiresBefore!);
      if (q.eventFrom) rows = rows.filter((b) => b.event_date >= q.eventFrom!);
      if (q.eventTo) rows = rows.filter((b) => b.event_date <= q.eventTo!);
      return clone(rows.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, q.limit ?? 1000));
    },

    async insertAccessToken(row) {
      if (tokens.has(row.token_hash)) throw new DbConflict("duplicate");
      tokens.set(row.token_hash, { ...row, created_at: iso(), revoked_at: null, last_used_at: null });
    },
    async findAccessToken(hash) {
      maybeFail("findAccessToken");
      return clone(tokens.get(hash) ?? null);
    },
    async touchAccessToken(hash, at) {
      const t = tokens.get(hash);
      if (t) t.last_used_at = at;
    },

    async insertEvent(e) {
      events.push({
        id: randomUUID(),
        ...e,
        at: e.at ?? tick(),
        actor_email: e.actor_email ?? null,
        ip: e.ip ?? null,
        user_agent: e.user_agent ?? null,
        detail: e.detail ?? null,
      });
    },
    async listEvents(bookingId) {
      return clone(events.filter((e) => e.booking_id === bookingId));
    },

    async insertPayment(p) {
      maybeFail("insertPayment");
      const dup = payments.find(
        (x) =>
          (p.stripe_checkout_session_id && x.stripe_checkout_session_id === p.stripe_checkout_session_id) ||
          (p.stripe_refund_id && x.stripe_refund_id === p.stripe_refund_id),
      );
      if (dup) return { inserted: false, row: clone(dup) };
      const row: PaymentRow = { id: randomUUID(), created_at: tick(), ...clone(p) };
      payments.push(row);
      return { inserted: true, row: clone(row) };
    },
    async listPayments(bookingId) {
      maybeFail("listPayments");
      return clone(payments.filter((p) => p.booking_id === bookingId));
    },
    async listPaymentsFor(ids) {
      return clone(payments.filter((p) => ids.includes(p.booking_id)));
    },
    async findPaymentByIntent(pi) {
      return clone(payments.find((p) => p.stripe_payment_intent_id === pi && p.kind !== "refund") ?? null);
    },

    async insertSession(s) {
      if (sessions.has(s.id)) throw new DbConflict("duplicate");
      sessions.set(s.id, { status: "open", created_at: iso(), completed_at: null, ...clone(s) } as CheckoutSessionRow);
    },
    async getSession(id) {
      return clone(sessions.get(id) ?? null);
    },
    async listSessions(bookingId, opts) {
      return clone(
        [...sessions.values()].filter(
          (s) => s.booking_id === bookingId && (!opts?.kind || s.kind === opts.kind) && (!opts?.status || opts.status.includes(s.status)),
        ),
      );
    },
    async updateSession(id, patch, whereStatus) {
      const s = sessions.get(id);
      if (!s || (whereStatus && !whereStatus.includes(s.status))) return false;
      sessions.set(id, { ...s, ...clone(patch) });
      return true;
    },

    async claimReminder(bookingId, kind) {
      if (reminders.some((r) => r.booking_id === bookingId && r.kind === kind)) return false;
      reminders.push({ booking_id: bookingId, kind, sent_at: iso() });
      return true;
    },
    async releaseReminder(bookingId, kind) {
      const i = reminders.findIndex((r) => r.booking_id === bookingId && r.kind === kind);
      if (i >= 0) reminders.splice(i, 1);
    },
    async listReminders(bookingId) {
      return clone(reminders.filter((r) => r.booking_id === bookingId));
    },

    async insertMessage(m) {
      const row: MessageRow = { id: randomUUID(), created_at: tick(), read_at: null, ...clone(m) };
      messages.push(row);
      return clone(row);
    },
    async listMessages(bookingId) {
      return clone(messages.filter((m) => m.booking_id === bookingId));
    },
    async markFamilyMessagesRead(bookingId, at) {
      for (const m of messages) if (m.booking_id === bookingId && m.author === "family" && !m.read_at) m.read_at = at;
    },
    async unreadCounts() {
      const out: Record<string, number> = {};
      for (const m of messages) if (m.author === "family" && !m.read_at) out[m.booking_id] = (out[m.booking_id] ?? 0) + 1;
      return out;
    },

    async insertNote(n) {
      const row: NoteRow = { id: randomUUID(), created_at: tick(), ...clone(n) };
      notes.push(row);
      return clone(row);
    },
    async listNotes(bookingId) {
      return clone(notes.filter((n) => n.booking_id === bookingId));
    },

    async latestTemplate() {
      return clone(templates[templates.length - 1] ?? null);
    },
    async insertTemplate(t) {
      const row: ContractTemplateRow = { version: templates.length + 1, created_at: iso(), ...clone(t) };
      templates.push(row);
      return clone(row);
    },
  };
  return db;
}
