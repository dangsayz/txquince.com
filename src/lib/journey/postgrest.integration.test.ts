/**
 * Runs the journey against a REAL Postgres + PostgREST (scripts/local), through
 * the production data-access layer (supabaseJourneyDb). Skipped unless
 *   JOURNEY_IT_URL, JOURNEY_IT_SERVICE_KEY, JOURNEY_IT_ANON_KEY
 * are set (see docs/DEMO-SCRIPT.md). Uses unique fictional emails/dates.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { supabaseJourneyDb } from "./db";
import { makeHarness, type Harness } from "./testing/harness";
import { adminAction, completeCheckout, pay, postRequest, sign } from "./testing/flow";
import { loadFamilyView } from "./family";
import type { JourneyDeps } from "./deps";

const URL_ = process.env.JOURNEY_IT_URL;
const SERVICE = process.env.JOURNEY_IT_SERVICE_KEY;
const ANON = process.env.JOURNEY_IT_ANON_KEY;
const run = Boolean(URL_ && SERVICE && ANON);

describe.skipIf(!run)("journey on real PostgREST + Postgres 16 (migrations 0001→latest)", () => {
  let h: Harness;
  const sb = () => createClient(URL_!, SERVICE!, { auth: { persistSession: false, autoRefreshToken: false } });
  const day = 10 + Math.floor(Math.random() * 18);
  const date = `2028-0${1 + Math.floor(Math.random() * 8)}-${day}`;
  const email = `it-${Date.now()}@example.com`;

  beforeAll(() => {
    h = makeHarness();
    h.deps.db = supabaseJourneyDb(sb());
  });
  afterAll(() => h.cleanup());

  it("request → approve → sign → deposit → confirmed, idempotent webhook, immutable signature", async () => {
    const req = await postRequest({ email, event_date: date });
    expect(req.res.status).toBe(200);
    const rows = await h.deps.db!.listBookings({ email });
    const b0 = rows.find((x) => x.event_date === date)!;
    expect(b0.status).toBe("requested");
    expect(b0.total_cents).toBe(560_000);
    const link = String(req.json.link).split("/").pop()!;

    expect((await adminAction(h, b0.id, "approve")).status).toBe(200);
    expect((await sign(link)).status).toBe(200);
    expect((await sign(link, { signedName: "Other" })).json.code).toBe("already_signed");

    // The trigger refuses even a direct service-role write to the signed agreement.
    const direct = await sb().from("bookings").update({ agreement: null }).eq("id", b0.id);
    expect(direct.error?.message).toContain("signed_agreement_immutable");

    const p = await pay(link, "deposit");
    const sid = String(p.json.url).split("/").pop()!;
    const first = await completeCheckout(h, sid, { eventId: "evt_it_1" });
    const again = await completeCheckout(h, sid, { eventId: "evt_it_1" });
    expect(first.json.outcome).toBe("recorded");
    expect(again.json.outcome).toBe("duplicate");
    const pays = await h.deps.db!.listPayments(b0.id);
    expect(pays).toHaveLength(1);
    const v = await loadFamilyView(h.deps as JourneyDeps, link);
    expect(v?.status).toBe("confirmed");

    // reminders are unique per (booking, kind) in the database itself
    expect(await h.deps.db!.claimReminder(b0.id, "balance_30")).toBe(true);
    expect(await h.deps.db!.claimReminder(b0.id, "balance_30")).toBe(false);

    // one active booking per date, enforced by the database
    const clash = await sb().from("bookings").insert({
      name: "Clash Fictional",
      email: "clash@example.com",
      event_date: date,
      package: "both",
      status: "requested",
      deposit_amount_cents: 100,
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(clash.error?.code).toBe("23505");
  });

  it("anon (the public PostgREST role) can't read or write any journey table", async () => {
    const anon = createClient(URL_!, ANON!, { auth: { persistSession: false } });
    for (const t of ["bookings", "booking_access_tokens", "booking_payments", "booking_messages", "booking_notes", "booking_events", "booking_reminders", "booking_checkout_sessions", "contract_templates"]) {
      const r = await anon.from(t).select("*").limit(1);
      expect(r.error?.code, t).toBe("42501");
      const w = await anon.from(t).insert({});
      expect(w.error, t).toBeTruthy();
    }
  });
});
