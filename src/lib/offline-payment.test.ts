import { describe, expect, it } from "vitest";
import { createD1Client } from "./db/d1-query";
import { sqliteD1 } from "./db/sqlite-d1.test-helper";
import { paidCents } from "./balance";
import { balanceOf, checkOffline, isOffline, OFFLINE_METHODS } from "./offline-payment";

const today = "2026-11-09";

describe("offline payment rules", () => {
  it("accepts a sane amount up to the balance still due", () => {
    expect(checkOffline(25000, today, 210000, today)).toEqual({ ok: true });
    expect(checkOffline(210000, "2026-11-01", 210000, today)).toEqual({ ok: true });
    expect(checkOffline(5000, today, null, today)).toEqual({ ok: true });
  });

  it("refuses too little, too much, a bad day and a future day", () => {
    expect(checkOffline(50, today, 1000, today).ok).toBe(false);
    expect(checkOffline(210001, today, 210000, today).ok).toBe(false);
    expect(checkOffline(1000, "2026-13-40", 5000, today).ok).toBe(false);
    expect(checkOffline(1000, "2026-11-10", 5000, today).ok).toBe(false);
    expect(checkOffline(1.5, today, 5000, today).ok).toBe(false);
    expect(checkOffline(20_000_000, today, null, today).ok).toBe(false);
  });

  it("balance comes from the signed agreement, else total minus deposit", () => {
    expect(balanceOf({ deposit_amount_cents: 70000, metadata: { agreement: { balanceUsd: 2100 }, total_usd: 9999 } })).toBe(210000);
    expect(balanceOf({ deposit_amount_cents: 70000, metadata: { total_usd: 2800 } })).toBe(210000);
    expect(balanceOf({ deposit_amount_cents: 70000, metadata: {} })).toBeNull();
  });

  it("stripe is never an offline method", () => {
    expect(isOffline("stripe")).toBe(false);
    for (const m of OFFLINE_METHODS) expect(isOffline(m)).toBe(true);
  });
});

describe("offline payments in the database (migration 0010)", () => {
  const booking = { name: "Ana Prueba", email: "a@example.com", event_date: "2027-05-15", package: "both", status: "paid", deposit_amount_cents: 70000, expires_at: "2027-01-01T00:00:00.000Z" };

  it("a recorded payment counts toward the balance; only offline rows can be removed", async () => {
    const db = sqliteD1();
    const c = createD1Client(async () => db);
    const { data: b } = await c.from("bookings").insert(booking).select("id").single();
    const card = await c.from("booking_payments").insert({ booking_id: b.id, amount_cents: 50000, status: "paid", stripe_payment_intent_id: "pi_1" }).select("id, method").single();
    expect(card.data.method).toBe("stripe");
    const zelle = await c.from("booking_payments").insert({ booking_id: b.id, amount_cents: 25000, status: "paid", method: "zelle", recorded_by: "o@x.com", paid_at: "2026-11-09T18:00:00.000Z" }).select("id").single();
    expect(zelle.error).toBeNull();

    const rows = (await c.from("booking_payments").select("status, amount_cents").eq("booking_id", b.id)).data;
    expect(paidCents(rows)).toBe(75000);

    // The DELETE route's filter: a Stripe row survives, the Zelle row goes.
    for (const id of [card.data.id, zelle.data.id]) await c.from("booking_payments").delete().eq("id", id).in("method", [...OFFLINE_METHODS]);
    expect((await c.from("booking_payments").select("method").eq("booking_id", b.id)).data).toEqual([{ method: "stripe" }]);
  });

  it("refuses an unknown method", async () => {
    const db = sqliteD1();
    const c = createD1Client(async () => db);
    const { data: b } = await c.from("bookings").insert(booking).select("id").single();
    expect((await c.from("booking_payments").insert({ booking_id: b.id, amount_cents: 100, status: "paid", method: "venmo" })).error?.code).toBe("23514");
  });
});
