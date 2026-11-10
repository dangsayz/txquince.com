import { describe, expect, it } from "vitest";
import { createD1Client } from "./db/d1-query";
import { sqliteD1 } from "./db/sqlite-d1.test-helper";

const row = (o: object) => ({ name: "Ana Prueba", email: "a@example.com", event_date: "2027-05-15", package: "both", status: "expired", deposit_amount_cents: 75000, expires_at: "2027-01-01T00:00:00.000Z", ...o });

describe("removing a booking (same filters as DELETE /api/admin/bookings)", () => {
  it("deletes a never-paid closed booking and leaves a paid one", async () => {
    const db = sqliteD1();
    const c = createD1Client(async () => db);
    const { data: dead } = await c.from("bookings").insert(row({})).select("id").single();
    const { data: paid } = await c.from("bookings").insert(row({ status: "paid", paid_at: "2026-11-01T00:00:00Z" })).select("id").single();
    for (const id of [dead.id, paid.id]) {
      await c.from("bookings").delete().eq("id", id).in("status", ["expired", "cancelled"]).is("paid_at", null);
    }
    expect((await c.from("bookings").select("id")).data).toEqual([{ id: paid.id }]);
  });
});
