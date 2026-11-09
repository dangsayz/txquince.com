import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = { bookings: [], booking_payments: [] };
const emails: Row[] = [];

function query(table: string) {
  const filters: ((r: Row) => boolean)[] = [];
  let patch: Row | null = null;
  const run = () => {
    const hits = db[table].filter((r) => filters.every((f) => f(r)));
    if (patch) for (const r of hits) Object.assign(r, patch);
    return { data: hits, error: null };
  };
  const q = {
    select: () => q,
    eq: (k: string, v: unknown) => (filters.push((r) => r[k] === v), q),
    in: (k: string, vs: unknown[]) => (filters.push((r) => vs.includes(r[k])), q),
    update: (p: Row) => ((patch = p), q),
    maybeSingle: async () => ({ data: run().data[0] ?? null, error: null }),
    then: (res: (v: unknown) => unknown) => Promise.resolve(run()).then(res),
  };
  return q;
}

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase-server", () => ({ getServiceSupabase: () => ({ from: query }) }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: async (e: Row) => (emails.push(e), { error: null }) };
  },
}));

import { fulfillBalanceSession } from "./balance-fulfillment";

const BOOKING = "b1";
const session = (over: Row = {}) =>
  ({
    id: "cs_1",
    url: null,
    payment_status: "paid",
    payment_intent: "pi_1",
    client_reference_id: BOOKING,
    amount_total: 50000,
    currency: "usd",
    metadata: { source: "txquince", flow: "balance", booking_id: BOOKING, payment_id: "p1" },
    customer_details: null,
    ...over,
  }) as Parameters<typeof fulfillBalanceSession>[0];

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("OPERATOR_NOTIFY_EMAIL", "owner@example.com");
  emails.length = 0;
  db.bookings = [
    { id: BOOKING, name: "Ana Prueba", email: "mom@example.com", event_date: "2027-05-15", metadata: { agreement: {
      lang: "en", title: "x", intro: "x", sections: [], totalUsd: 3000, depositUsd: 750, balanceUsd: 2250,
      signedName: "Ana", signature: "x", signedAt: "2026-01-01", ip: "x", userAgent: "x", version: "x" } } },
  ];
  db.booking_payments = [
    { id: "p1", booking_id: BOOKING, kind: "balance", amount_cents: 50000, currency: "usd", status: "open", stripe_checkout_session_id: "cs_1" },
  ];
});

describe("fulfillBalanceSession", () => {
  it("marks the row paid and sends one receipt + one owner note", async () => {
    await fulfillBalanceSession(session());
    expect(db.booking_payments[0].status).toBe("paid");
    expect(db.booking_payments[0].stripe_payment_intent_id).toBe("pi_1");
    expect(emails.map((e) => e.to)).toEqual(["owner@example.com", "mom@example.com"]);
    expect(String(emails[1].text)).toContain("Left to pay: $1,750");
  });

  it("a replayed webhook does nothing the second time", async () => {
    await fulfillBalanceSession(session());
    await fulfillBalanceSession(session());
    expect(emails).toHaveLength(2);
  });

  it("wrong amount → 'review', owner warned, no receipt to the family", async () => {
    await fulfillBalanceSession(session({ amount_total: 100 }));
    expect(db.booking_payments[0].status).toBe("review");
    expect(emails).toHaveLength(1);
    expect(String(emails[0].subject)).toContain("Check");
  });

  it("a session whose metadata doesn't match our row is ignored", async () => {
    await fulfillBalanceSession(session({ metadata: { source: "txquince", flow: "balance", booking_id: "other", payment_id: "p1" } }));
    expect(db.booking_payments[0].status).toBe("open");
    expect(emails).toHaveLength(0);
  });

  it("not-yet-settled payment → processing, no emails", async () => {
    await fulfillBalanceSession(session({ payment_status: "unpaid" }));
    expect(db.booking_payments[0].status).toBe("processing");
    expect(emails).toHaveLength(0);
  });

  it("overpaid → owner told to refund the difference", async () => {
    db.booking_payments.push({ id: "p0", booking_id: BOOKING, kind: "balance", amount_cents: 200000, currency: "usd", status: "paid" });
    await fulfillBalanceSession(session());
    expect(String(emails[0].text)).toContain("OVERPAID by $250");
  });
});
