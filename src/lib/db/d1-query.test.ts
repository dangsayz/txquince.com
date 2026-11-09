import { beforeEach, describe, expect, it } from "vitest";
import { createD1Client } from "./d1-query";
import { sqliteD1 } from "./sqlite-d1.test-helper";

let db: ReturnType<typeof sqliteD1>;
let c: ReturnType<typeof createD1Client>;

beforeEach(() => {
  db = sqliteD1();
  c = createD1Client(async () => db);
});

const booking = (over: Record<string, unknown> = {}) => ({
  name: "Ana Prueba",
  email: "ana@example.com",
  event_date: "2027-05-15",
  package: "both",
  status: "paid",
  deposit_amount_cents: 75000,
  expires_at: "2027-01-01T00:00:00.000Z",
  metadata: { tier: "trio", agreement: { lang: "es" } },
  ...over,
});

describe("CRUD in supabase-js shape", () => {
  it("insert().select().single() fills id, returns parsed JSON", async () => {
    const { data, error } = await c.from("bookings").insert(booking()).select("id, metadata").single();
    expect(error).toBeNull();
    expect(data.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(data.metadata).toEqual({ tier: "trio", agreement: { lang: "es" } });
  });

  it("select with filters, order, limit; maybeSingle → null when none", async () => {
    await c.from("bookings").insert([booking({ event_date: "2027-01-01" }), booking({ event_date: "2027-03-01", status: "expired" })]);
    const { data } = await c.from("bookings").select("event_date").in("status", ["paid"]).gte("event_date", "2026-12-01").order("event_date", { ascending: false }).limit(5);
    expect(data).toEqual([{ event_date: "2027-01-01" }]);
    const none = await c.from("bookings").select("*").eq("id", "nope").maybeSingle();
    expect(none).toEqual({ data: null, error: null });
    const single = await c.from("bookings").select("*").eq("id", "nope").single();
    expect(single.error?.code).toBe("PGRST116");
  });

  it("update().eq().in().select() is a conditional write (compare-and-set)", async () => {
    const { data: b } = await c.from("bookings").insert(booking({ status: "pending_payment" })).select("id, updated_at").single();
    const moved = await c.from("bookings").update({ status: "paid" }).eq("id", b.id).in("status", ["pending_payment"]).select("id");
    expect(moved.data).toHaveLength(1);
    const again = await c.from("bookings").update({ status: "paid" }).eq("id", b.id).in("status", ["pending_payment"]).select("id");
    expect(again.data).toHaveLength(0);
  });

  it("is(null), like, count head", async () => {
    await c.from("inquiries").insert([{ name: "A", email: "a@x.com" }, { name: "B", email: "b@x.com", unsubscribed_at: "2026-01-01T00:00:00Z" }]);
    const { data } = await c.from("inquiries").select("name").is("unsubscribed_at", null);
    expect(data).toEqual([{ name: "A" }]);
    const { count, data: headData } = await c.from("inquiries").select("id", { count: "exact", head: true });
    expect(count).toBe(2);
    expect(headData).toBeNull();
    await c.from("site_settings").insert([{ key: "slot:a", value: { x: 1 } }, { key: "other", value: {} }]);
    expect((await c.from("site_settings").select("key").like("key", "slot:%")).data).toEqual([{ key: "slot:a" }]);
  });

  it("upsert on the primary key or onConflict column", async () => {
    await c.from("site_settings").upsert({ key: "k", value: { v: 1 } });
    await c.from("site_settings").upsert({ key: "k", value: { v: 2 } });
    expect((await c.from("site_settings").select("value").eq("key", "k").single()).data.value).toEqual({ v: 2 });
    await c.from("date_availability").upsert({ event_date: "2027-01-01", status: "limited" }, { onConflict: "event_date" });
    await c.from("date_availability").upsert({ event_date: "2027-01-01", status: "booked" }, { onConflict: "event_date" });
    expect((await c.from("date_availability").select("status")).data).toEqual([{ status: "booked" }]);
  });

  it("booleans and arrays round-trip", async () => {
    await c.from("portfolio_images").insert({ storage_path: "a.jpg", is_feature: true, colors: ["rosa", "oro"] });
    const { data } = await c.from("portfolio_images").select("is_feature, colors").eq("is_feature", true).single();
    expect(data).toEqual({ is_feature: true, colors: ["rosa", "oro"] });
  });

  it("delete with filter", async () => {
    await c.from("videos").insert([{ url: "a" }, { url: "b" }]);
    await c.from("videos").delete().eq("url", "a");
    expect((await c.from("videos").select("url")).data).toEqual([{ url: "b" }]);
  });

  it("constraint errors map to Postgres codes the app checks", async () => {
    const r = await c.from("bookings").insert(booking({ package: "drone" }));
    expect(r.error?.code).toBe("23514");
    await c.from("vendors").insert({ name: "x", slug: "dup" });
    expect((await c.from("vendors").insert({ name: "y", slug: "dup" })).error?.code).toBe("23505");
  });

  it("refuses unsafe identifiers (no SQL through column names)", () => {
    expect(() => c.from("bookings").select("id; drop table bookings")).toThrow();
    expect(() => c.from("bookings").eq("id = id or 1", 1)).toThrow();
    expect(() => c.from("users; --")).toThrow();
  });
});

describe("booking capacity (3 per date) — enforced by the database", () => {
  it("4th active booking on a date is refused with date_unavailable/23505", async () => {
    for (let i = 0; i < 3; i++) expect((await c.from("bookings").insert(booking())).error).toBeNull();
    const r = await c.from("bookings").insert(booking());
    expect(r.error).toEqual({ message: "date_unavailable", code: "23505" });
    // inactive rows don't count
    expect((await c.from("bookings").insert(booking({ status: "expired" }))).error).toBeNull();
  });

  it("re-activating into a full date is refused; staying active on the same date is fine", async () => {
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) ids.push((await c.from("bookings").insert(booking()).select("id").single()).data.id);
    const { data: x } = await c.from("bookings").insert(booking({ status: "expired" })).select("id").single();
    expect((await c.from("bookings").update({ status: "paid" }).eq("id", x.id)).error?.message).toBe("date_unavailable");
    expect((await c.from("bookings").update({ status: "paid", notes: "n" }).eq("id", ids[0])).error).toBeNull();
  });
});

describe("rpc", () => {
  const holdArgs = {
    p_name: " Ana ",
    p_email: " ANA@Example.com ",
    p_phone: "",
    p_event_date: "2027-06-01",
    p_package: "both",
    p_notes: "",
    p_deposit_cents: 20000,
    p_currency: "USD",
    p_hold_minutes: 35,
  };

  it("create_booking_hold returns a row array; full date → date_unavailable", async () => {
    const r = await c.rpc("create_booking_hold", holdArgs);
    expect(r.error).toBeNull();
    expect(r.data[0]).toMatchObject({ event_date: "2027-06-01", deposit_amount_cents: 20000, currency: "usd" });
    const row = (await c.from("bookings").select("name, email, phone, status").eq("id", r.data[0].booking_id).single()).data;
    expect(row).toEqual({ name: "Ana", email: "ana@example.com", phone: null, status: "pending_payment" });
    await c.rpc("create_booking_hold", holdArgs);
    await c.rpc("create_booking_hold", holdArgs);
    const full = await c.rpc("create_booking_hold", holdArgs);
    expect(full.error?.message).toContain("date_unavailable");
  });

  it("expired holds are released before a new hold", async () => {
    for (let i = 0; i < 3; i++) await c.from("bookings").insert(booking({ event_date: "2027-06-01", status: "pending_payment", expires_at: "2020-01-01T00:00:00.000Z" }));
    expect((await c.rpc("create_booking_hold", holdArgs)).error).toBeNull();
  });

  it("confirm_booking_payment: paid once, idempotent, payment_review when the date filled", async () => {
    const { data: b } = await c.from("bookings").insert(booking({ status: "pending_payment", stripe_checkout_session_id: "cs_1" })).select("id").single();
    expect((await c.rpc("confirm_booking_payment", { p_checkout_session_id: "cs_1", p_payment_intent_id: "pi_1" })).data).toBe(b.id);
    expect((await c.rpc("confirm_booking_payment", { p_checkout_session_id: "cs_1" })).data).toBe(b.id);
    expect((await c.from("bookings").select("status, stripe_payment_intent_id").eq("id", b.id).single()).data).toEqual({ status: "paid", stripe_payment_intent_id: "pi_1" });

    // A late payer whose hold lapsed while 3 others filled the date.
    const { data: late } = await c.from("bookings").insert(booking({ event_date: "2027-09-09", status: "expired", stripe_checkout_session_id: "cs_late" })).select("id").single();
    for (let i = 0; i < 3; i++) await c.from("bookings").insert(booking({ event_date: "2027-09-09" }));
    await c.from("bookings").update({ status: "pending_payment" }).eq("id", late.id); // refused (full) → stays expired
    await c.rpc("confirm_booking_payment", { p_checkout_session_id: "cs_late" });
    expect((await c.from("bookings").select("status").eq("id", late.id).single()).data.status).toBe("payment_review");
  });

  it("booking_payments allows one live checkout per booking", async () => {
    const { data: b } = await c.from("bookings").insert(booking()).select("id").single();
    expect((await c.from("booking_payments").insert({ booking_id: b.id, amount_cents: 100, status: "open" })).error).toBeNull();
    expect((await c.from("booking_payments").insert({ booking_id: b.id, amount_cents: 100, status: "opening" })).error?.code).toBe("23505");
    expect((await c.from("booking_payments").insert({ booking_id: b.id, amount_cents: 100, status: "paid" })).error).toBeNull();
  });
});
