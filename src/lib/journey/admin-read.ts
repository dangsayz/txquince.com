/**
 * admin-read.ts — what the admin pages read. Each function re-checks the admin
 * itself (pages don't rely on the layout or middleware alone).
 */
import "server-only";
import type { JourneyDeps } from "./deps";
import { ledgerFor, refundableCents, type Ledger } from "./ledger";
import { todayInDallas, addDays } from "./policy";
import { STATUSES, type Status } from "./state";
import type { BookingEventRow, BookingRow, MessageRow, NoteRow, PaymentRow, ReminderRow, CheckoutSessionRow } from "./types";

export const LIST_VIEWS = ["all", "requests", "upcoming", "balance", "unread", "review", "closed"] as const;
export type ListView = (typeof LIST_VIEWS)[number];

export type AdminListRow = { b: BookingRow; ledger: Ledger; unread: number };

export async function adminList(deps: JourneyDeps, view: ListView, status: Status | null): Promise<AdminListRow[] | null> {
  if (!(await deps.adminEmail())) return null;
  const today = todayInDallas(deps.now());
  const [rows, unread] = await Promise.all([deps.db.listBookings({ limit: 1000 }), deps.db.unreadCounts()]);
  const payments = await deps.db.listPaymentsFor(rows.map((r) => r.id));
  const byBooking = new Map<string, PaymentRow[]>();
  for (const p of payments) byBooking.set(p.booking_id, [...(byBooking.get(p.booking_id) ?? []), p]);
  let out = rows.map((b) => ({ b, ledger: ledgerFor(b, byBooking.get(b.id) ?? []), unread: unread[b.id] ?? 0 }));
  if (status) out = out.filter((r) => r.b.status === status);
  switch (view) {
    case "requests":
      out = out.filter((r) => r.b.status === "requested");
      break;
    case "upcoming":
      out = out
        .filter((r) => ["approved", "confirmed", "paid_in_full"].includes(r.b.status) && r.b.event_date >= today)
        .sort((a, z) => a.b.event_date.localeCompare(z.b.event_date));
      break;
    case "balance":
      out = out
        .filter((r) => r.b.status === "confirmed" && r.ledger.remainingCents > 0 && (r.b.balance_due_date ?? "9999") <= addDays(today, 30))
        .sort((a, z) => (a.b.balance_due_date ?? "").localeCompare(z.b.balance_due_date ?? ""));
      break;
    case "unread":
      out = out.filter((r) => r.unread > 0);
      break;
    case "review":
      out = out.filter((r) => r.b.status === "payment_review");
      break;
    case "closed":
      out = out.filter((r) => ["declined", "expired", "cancelled", "refunded", "completed"].includes(r.b.status));
      break;
  }
  return out;
}

export type AdminRecord = {
  b: BookingRow;
  ledger: Ledger;
  payments: (PaymentRow & { refundable: number })[];
  events: BookingEventRow[];
  messages: MessageRow[];
  notes: NoteRow[];
  reminders: ReminderRow[];
  sessions: CheckoutSessionRow[];
};

export async function adminRecord(deps: JourneyDeps, id: string): Promise<AdminRecord | null | "unauthorized"> {
  if (!(await deps.adminEmail())) return "unauthorized";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const b = await deps.db.getBooking(id);
  if (!b) return null;
  const [payments, events, messages, notes, reminders, sessions] = await Promise.all([
    deps.db.listPayments(id),
    deps.db.listEvents(id),
    deps.db.listMessages(id),
    deps.db.listNotes(id),
    deps.db.listReminders(id),
    deps.db.listSessions(id),
  ]);
  return {
    b,
    ledger: ledgerFor(b, payments),
    payments: payments.map((p) => ({ ...p, refundable: refundableCents(p, payments) })),
    events,
    messages,
    notes,
    reminders,
    sessions,
  };
}

export const isStatusParam = (v: unknown): v is Status => typeof v === "string" && (STATUSES as readonly string[]).includes(v);
