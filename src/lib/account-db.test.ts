import { beforeEach, describe, expect, it, vi } from "vitest";
import { createD1Client } from "@/lib/db/d1-query";
import { sqliteD1 } from "@/lib/db/sqlite-d1.test-helper";

let raw: ReturnType<typeof sqliteD1>;
vi.mock("server-only", () => ({}));
vi.mock("@/lib/d1", () => ({ getD1: async () => raw }));
vi.mock("@/lib/db", () => ({ releaseExpiredHolds: async () => void (await createD1Client(async () => raw).rpc("release_expired_booking_holds")) }));
import { getAccountBookings, ownsBooking } from "./account-db";

const agreement = { lang: "en", title: "x", intro: "x", sections: [], totalUsd: 3000, depositUsd: 750, balanceUsd: 2250, signedName: "A", signature: "x", signedAt: "2026-01-01", ip: "x", userAgent: "x", version: "x", payToken: "abcdefghijklmnopqrstuvwx" };
const add = (email: string, over: Record<string, unknown> = {}) =>
  createD1Client(async () => raw).from("bookings").insert({ name: "Ana P", email, event_date: "2027-05-15", package: "both", status: "paid", deposit_amount_cents: 75000, expires_at: "2099-01-01T00:00:00.000Z", metadata: { tier: "trio", agreement }, ...over }).select("id").single();

beforeEach(() => {
  raw = sqliteD1();
});

describe("getAccountBookings", () => {
  it("returns only bookings whose email is one of the verified emails (case-insensitive)", async () => {
    const mine = (await add("Mom@Example.com")).data.id;
    await add("other@example.com", { event_date: "2027-06-01" });
    const out = await getAccountBookings(["mom@example.com"]);
    expect(out.map((b) => b.id)).toEqual([mine]);
    expect(await ownsBooking(["mom@example.com"], mine)).toBe(true);
    expect(await ownsBooking(["stranger@example.com"], mine)).toBe(false);
  });
  it("no verified email → nothing (never 'all bookings')", async () => {
    await add("mom@example.com");
    expect(await getAccountBookings([])).toEqual([]);
    expect(await getAccountBookings(["", "  "])).toEqual([]);
  });
  it("a request whose hold ran out shows as closed, so she can book again", async () => {
    await add("mom@example.com", { status: "requested", expires_at: "2020-01-01T00:00:00.000Z" });
    expect((await getAccountBookings(["mom@example.com"]))[0].state).toBe("closed");
  });
  it("counts settled balance payments", async () => {
    const id = (await add("mom@example.com")).data.id;
    await createD1Client(async () => raw).from("booking_payments").insert({ booking_id: id, amount_cents: 50000, status: "paid" });
    expect((await getAccountBookings(["mom@example.com"]))[0]).toMatchObject({ paidCents: 125000, leftCents: 175000 });
  });
});
