import { describe, expect, it } from "vitest";
import { sortAccountBookings, toAccountBooking } from "./account";

const agreement = { lang: "es", title: "x", intro: "x", sections: [], totalUsd: 3000, depositUsd: 750, balanceUsd: 2250, signedName: "A", signature: "x", signedAt: "2026-01-01", ip: "x", userAgent: "x", version: "x", payToken: "abcdefghijklmnopqrstuvwx" };
const row = (over: Record<string, unknown> = {}) => ({ id: "b1", event_date: "2027-05-15", status: "paid", deposit_amount_cents: 75000, expires_at: "2099-01-01T00:00:00Z", metadata: { tier: "trio", agreement }, ...over });
const NOW = Date.parse("2026-11-09T00:00:00Z");

describe("toAccountBooking", () => {
  it("booked: deposit + settled balance payments, what's left, pay token", () => {
    const b = toAccountBooking(row(), [
      { booking_id: "b1", status: "paid", amount_cents: 50000 },
      { booking_id: "b1", status: "open", amount_cents: 99999 },
      { booking_id: "other", status: "paid", amount_cents: 99999 },
    ], NOW)!;
    expect(b).toMatchObject({ state: "booked", paidCents: 125000, leftCents: 175000, lang: "es", tier: "trio", payToken: agreement.payToken, processing: false });
  });
  it("in review: nothing paid, NO pay token (can't pay before approval)", () => {
    const b = toAccountBooking(row({ status: "requested" }), [], NOW)!;
    expect(b).toMatchObject({ state: "review", paidCents: 0, leftCents: 0, payToken: null });
  });
  it("approved while the hold is live; closed once it lapses (no token)", () => {
    expect(toAccountBooking(row({ status: "pending_payment" }), [], NOW)!.state).toBe("approved");
    const lapsed = toAccountBooking(row({ status: "pending_payment", expires_at: "2026-01-01T00:00:00Z" }), [], NOW)!;
    expect(lapsed).toMatchObject({ state: "closed", payToken: null });
    expect(toAccountBooking(row({ status: "refunded" }), [], NOW)!.state).toBe("closed");
  });
  it("a booking without a signed agreement is not shown", () => {
    expect(toAccountBooking(row({ metadata: {} }), [], NOW)).toBeNull();
  });
  it("processing payment is flagged", () => {
    expect(toAccountBooking(row(), [{ booking_id: "b1", status: "processing", amount_cents: 100 }], NOW)!.processing).toBe(true);
  });
});

describe("sortAccountBookings", () => {
  it("open bookings first by date, closed last", () => {
    const mk = (id: string, state: string, eventDate: string) => ({ ...toAccountBooking(row(), [], NOW)!, id, state, eventDate }) as ReturnType<typeof toAccountBooking> & object;
    const out = sortAccountBookings([mk("c", "closed", "2026-01-01"), mk("b", "booked", "2028-01-01"), mk("a", "review", "2027-01-01")] as never);
    expect(out.map((b) => b.id)).toEqual(["a", "b", "c"]);
  });
});
