import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ getDb: () => ({}), isDbConfigured: () => false }));
import { buildMoney } from "./money-db";

const now = new Date("2026-11-10T03:00:00Z"); // Nov 9, 9 PM in Dallas
const dep = (o: object) => ({ id: "b1", name: "Ana", event_date: "2027-05-15", status: "paid", deposit_amount_cents: 50000, paid_at: "2026-11-05T18:00:00Z", ...o });

describe("buildMoney", () => {
  it("merges deposits, balance payments and tests, newest first", () => {
    const m = buildMoney(
      [dep({}), dep({ id: "b2", name: "Unpaid", paid_at: null, status: "requested" })],
      [{ id: "p1", booking_id: "b1", amount_cents: 20000, status: "paid", paid_at: "2026-11-08T18:00:00Z" }],
      [{ id: "t1", receivedAt: "2026-11-10T02:46:00Z", refundedAt: null, by: "o@x.com" }],
      now,
      10,
    );
    expect(m.rows.map((r) => [r.kind, r.name, r.amountCents])).toEqual([["test", "You (test)", 100], ["balance", "Ana", 20000], ["deposit", "Ana", 50000]]);
    expect(m).toMatchObject({ monthCents: 70000, monthCount: 2 });
  });

  it("month total leaves out refunds, tests and other months (Dallas time)", () => {
    const m = buildMoney(
      [dep({ status: "refunded" }), dep({ id: "b3", paid_at: "2026-11-01T04:30:00Z" }), dep({ id: "b4", status: "payment_review" })],
      [],
      [{ id: "t1", receivedAt: "2026-11-09T00:00:00Z", refundedAt: "2026-11-09T01:00:00Z", by: "o" }],
      now,
      10,
    );
    // b3 was paid Oct 31, 11:30 PM in Dallas: not November.
    expect(m).toMatchObject({ monthCents: 50000, monthCount: 1 });
    expect(m.rows.map((r) => r.state).sort()).toEqual(["paid", "refunded", "refunded", "review"]);
  });

  it("respects the limit", () => {
    expect(buildMoney([dep({}), dep({ id: "b2" })], [], [], now, 1).rows).toHaveLength(1);
  });
});
