/**
 * money-db.ts — every payment the site received, newest first, for the Studio.
 *
 * Three sources, one list:
 *   - deposits        bookings.paid_at (the booking's first payment)
 *   - later payments  booking_payments (balance payments)
 *   - owner tests     site_settings "payment_test:*" ($1 tests)
 * Read-only. Amounts are what Stripe confirmed through the webhook.
 */
import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { latestPaymentTests } from "@/lib/payment-test";

export type MoneyRow = {
  id: string;
  /** Who paid. */
  name: string;
  kind: "deposit" | "balance" | "test";
  amountCents: number;
  paidAt: string;
  /** refunded = money went back; review = paid, but the date needs the owner's check. */
  state: "paid" | "refunded" | "review";
  /** How the money came in: "stripe" (card, Klarna…) or cash / zelle / check / other. */
  method: string;
  /** The celebration date (YYYY-MM-DD), when the payment belongs to a booking. */
  eventDate: string | null;
};

export type MoneySummary = {
  rows: MoneyRow[];
  /** Kept money this calendar month (America/Chicago): no refunds, no tests. */
  monthCents: number;
  monthCount: number;
};

const TZ = "America/Chicago";
const monthOf = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" }).format(new Date(iso));

type Deposit = { id: string; name: string; event_date: string; status: string; deposit_amount_cents: number; paid_at: string | null };
type Later = { id: string; booking_id: string; amount_cents: number; status: string; paid_at: string | null; method?: string | null };

/** Pure: merge the three sources into one list and the month total. */
export function buildMoney(deposits: Deposit[], later: Later[], tests: { id: string; receivedAt: string | null; refundedAt: string | null; by: string }[], now: Date, limit: number): MoneySummary {
  const byId = new Map(deposits.map((b) => [b.id, b]));
  const state = (s: string): MoneyRow["state"] => (s === "refunded" ? "refunded" : s === "payment_review" || s === "review" ? "review" : "paid");
  const rows: MoneyRow[] = [
    ...deposits
      .filter((b) => b.paid_at)
      .map((b) => ({ id: `d:${b.id}`, name: b.name, kind: "deposit" as const, amountCents: b.deposit_amount_cents, paidAt: b.paid_at!, state: state(b.status), method: "stripe", eventDate: b.event_date })),
    ...later
      .filter((p) => p.paid_at)
      .map((p) => ({ id: `b:${p.id}`, name: byId.get(p.booking_id)?.name ?? "A family", kind: "balance" as const, amountCents: p.amount_cents, paidAt: p.paid_at!, state: state(p.status), method: p.method ?? "stripe", eventDate: byId.get(p.booking_id)?.event_date ?? null })),
    ...tests
      .filter((t) => t.receivedAt)
      .map((t) => ({ id: `t:${t.id}`, name: "You (test)", kind: "test" as const, amountCents: 100, paidAt: t.receivedAt!, state: t.refundedAt ? ("refunded" as const) : ("paid" as const), method: "stripe", eventDate: null })),
  ].sort((a, b) => b.paidAt.localeCompare(a.paidAt));

  const month = monthOf(now.toISOString());
  const kept = rows.filter((r) => r.kind !== "test" && r.state !== "refunded" && monthOf(r.paidAt) === month);
  return { rows: rows.slice(0, limit), monthCents: kept.reduce((n, r) => n + r.amountCents, 0), monthCount: kept.length };
}

export async function getMoney(limit = 6): Promise<MoneySummary> {
  if (!isDbConfigured()) return { rows: [], monthCents: 0, monthCount: 0 };
  const db = getDb();
  const [dep, bal, tests] = await Promise.all([
    db.from("bookings").select("id, name, event_date, status, deposit_amount_cents, paid_at").order("paid_at", { ascending: false }).limit(500),
    db.from("booking_payments").select("id, booking_id, amount_cents, status, paid_at, method").in("status", ["paid", "refunded", "review"]).order("paid_at", { ascending: false }).limit(500),
    latestPaymentTests(20).catch(() => []),
  ]);
  if (dep.error) console.error("[money] bookings:", dep.error.message);
  if (bal.error) console.error("[money] payments:", bal.error.message);
  return buildMoney((dep.data ?? []) as Deposit[], (bal.data ?? []) as Later[], tests, new Date(), limit);
}
