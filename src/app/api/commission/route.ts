/**
 * /api/commission — the homepage intake's booking endpoint.
 *
 * Two paths, one contract (src/lib/commission.ts):
 *   • "retainer" → atomic date-hold (create_booking_hold, 30 min) → Stripe
 *     Checkout for the retainer → { checkoutUrl }. The existing webhook
 *     (/api/stripe/webhook → confirm_booking_payment) marks it paid and sends
 *     the confirmation emails.
 *   • "consult"  → a 'requested' booking that courtesy-holds the date for a few
 *     days while the studio and family speak; the retainer link follows.
 *
 * Same defenses as /api/booking: honeypot, rate limit, Turnstile, zod. The
 * price is ALWAYS recomputed server-side from the price book — the client only
 * says which tier and enhancements it wants. The partial unique index on
 * bookings.event_date makes double-booking impossible under concurrency.
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  CHECKOUT_HOLD_MINUTES,
  CONSULT_HOLD_DAYS,
  TIER_NAME_EN,
  TIER_SERVICE,
  ADD_ON_NAME_EN,
  commissionSchema,
  describeCommission,
  addOnAllowed,
  clampCrew,
  quoteCommission,
} from "@/lib/commission";
import { HONEYPOT_FIELD, TURNSTILE_FIELD, formatEventDate, type BookingRecord } from "@/lib/booking";
import { sanitizeAttribution } from "@/lib/attribution";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { verifyTurnstile } from "@/lib/turnstile";
import { createStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import {
  sendReservationRequestClientEmail,
  sendReservationRequestOperatorEmail,
} from "@/lib/resend";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  HITS.set(ip, arr);
  if (HITS.size > 5000) HITS.clear();
  return arr.length > MAX_PER_WINDOW;
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

const fail = (status: number, code: string, error: string) =>
  NextResponse.json({ ok: false, code, error }, { status });

interface BookingHold {
  booking_id: string;
  event_date: string;
  deposit_amount_cents: number;
  currency: string;
  expires_at: string;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "invalid", "Invalid request.");
  }

  // Honeypot — pretend success, don't tip off bots.
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true, path: "consult" });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) return fail(429, "rate_limited", "Too many requests. Please try again in a minute.");

  const token = typeof body[TURNSTILE_FIELD] === "string" ? (body[TURNSTILE_FIELD] as string) : undefined;
  const turnstile = await verifyTurnstile(token, ip);
  if (!turnstile.ok) return fail(403, "verification", "Verification failed. Please refresh and try again.");

  const parsed = commissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid",
        error: "Please check the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }
  const r = parsed.data;

  if (!isSupabaseConfigured()) {
    console.error("[commission] Supabase not configured.");
    return fail(503, "unavailable", "Booking is briefly unavailable. Please write to us directly.");
  }
  if (r.path === "retainer" && !isStripeConfigured()) {
    console.error("[commission] STRIPE_SECRET_KEY not set.");
    return fail(503, "payments_unavailable", "Online retainers aren't live yet. Choose a consultation first and we'll hold your date.");
  }

  const q = quoteCommission(r.tier, r.add_ons, r.extra_crew);
  const crew = clampCrew(r.tier, r.extra_crew);
  const addOns = r.add_ons.filter((a) => addOnAllowed(r.tier, a));
  const retainerCents = q.retainerUsd * 100;
  const service = r.scope === "motion" ? "video" : r.scope === "stills" ? "photo" : TIER_SERVICE[r.tier];
  const summary = describeCommission(r, q);
  const meta = {
    source: "commission",
    tier: r.tier,
    add_ons: addOns,
    extra_crew: crew,
    crew_size: q.crewSize,
    total_usd: q.totalUsd,
    retainer_usd: q.retainerUsd,
    city: r.city,
    venue: r.venue,
    scope: r.scope,
    honoree: r.honoree,
    language: r.language,
    path: r.path,
  };
  const supabase = getServiceSupabase();

  // A family retrying (closed checkout, switched path) shouldn't be blocked by
  // their own unpaid hold on the same date. Paid bookings are never touched.
  await supabase
    .from("bookings")
    .update({ status: "expired" })
    .eq("event_date", r.event_date)
    .eq("email", r.email)
    .in("status", ["pending_payment", "requested"]);

  /* ---------------- Consultation first ---------------- */
  if (r.path === "consult") {
    const expiresAt = new Date(Date.now() + CONSULT_HOLD_DAYS * 24 * 3600 * 1000).toISOString();
    const { data: inserted, error } = await supabase
      .from("bookings")
      .insert({
        name: r.name,
        email: r.email,
        phone: r.phone || null,
        event_date: r.event_date,
        package: service,
        notes: summary,
        status: "requested",
        deposit_amount_cents: retainerCents,
        currency: site.booking.currency,
        expires_at: expiresAt,
        metadata: meta,
        attribution: sanitizeAttribution(body.attribution),
      })
      .select("id, name, email, phone, event_date, package, collection, notes, status, deposit_amount_cents, currency, metadata")
      .single();

    if (error) {
      if (error.code === "23505") return fail(409, "date_taken", "That date was just reserved by another family.");
      console.error("[commission] consult insert:", error.message);
      return fail(500, "save_failed", "We couldn't save your request. Please try again.");
    }

    const record = inserted as BookingRecord;
    const [op, cl] = await Promise.all([
      sendReservationRequestOperatorEmail(record),
      sendReservationRequestClientEmail(record),
    ]);
    if (!op.ok) console.error("[commission] operator email:", op.error);
    if (!cl.ok) console.error("[commission] client email:", cl.error);

    return NextResponse.json({ ok: true, path: "consult", holdDays: CONSULT_HOLD_DAYS, ref: refFor(record.id) });
  }

  /* ---------------- Retainer now (Stripe) ---------------- */
  let hold: BookingHold;
  try {
    const { data, error } = await supabase.rpc("create_booking_hold", {
      p_name: r.name,
      p_email: r.email,
      p_phone: r.phone || null,
      p_event_date: r.event_date,
      p_package: service,
      p_notes: summary,
      p_deposit_cents: retainerCents,
      p_currency: site.booking.currency,
      p_hold_minutes: CHECKOUT_HOLD_MINUTES,
    });
    if (error) {
      if (error.message.includes("date_unavailable")) {
        return fail(409, "date_taken", "That date was just reserved by another family.");
      }
      console.error("[commission] hold:", error.message);
      return fail(500, "hold_failed", "We couldn't hold that date. Please try again shortly.");
    }
    const rows = (data || []) as BookingHold[];
    if (!rows[0]) return fail(500, "hold_failed", "We couldn't hold that date. Please try again shortly.");
    hold = rows[0];
  } catch (err) {
    console.error("[commission] hold exception:", err);
    return fail(500, "hold_failed", "We couldn't hold that date. Please try again shortly.");
  }

  try {
    const siteUrl = getSiteUrl();
    const prettyDate = formatEventDate(hold.event_date);
    const extras = [
      ...(crew.photo ? [`${crew.photo} added photographer${crew.photo > 1 ? "s" : ""}`] : []),
      ...(crew.motion ? [`${crew.motion} added videographer${crew.motion > 1 ? "s" : ""}`] : []),
      ...addOns.map((a) => ADD_ON_NAME_EN[a]),
    ].join(", ");
    const session = await createStripeCheckoutSession({
      amountCents: hold.deposit_amount_cents,
      currency: hold.currency,
      productName: `${site.brand} — Retainer · ${TIER_NAME_EN[r.tier]}`,
      productDescription:
        `Holds ${prettyDate}. Commission total $${q.totalUsd.toLocaleString("en-US")}` +
        (extras ? ` incl. ${extras}` : "") +
        `. Applied in full to your balance.`,
      paymentDescription: `TX Quince retainer — ${prettyDate}`,
      clientReferenceId: hold.booking_id,
      customerEmail: r.email,
      locale: r.language === "es" ? "es" : "en",
      successUrl: `${siteUrl}/?commission=confirmed&session_id={CHECKOUT_SESSION_ID}#intake`,
      cancelUrl: `${siteUrl}/?commission=closed#intake`,
      expiresAt: new Date(hold.expires_at),
      metadata: {
        source: "commission",
        booking_id: hold.booking_id,
        event_date: hold.event_date,
        tier: r.tier,
        add_ons: addOns.join(","),
        crew_size: q.crewSize,
        total_usd: q.totalUsd,
        language: r.language,
      },
    });

    if (!session.url) throw new Error("Stripe returned no checkout URL.");

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        stripe_checkout_session_id: session.id,
        metadata: meta,
        attribution: sanitizeAttribution(body.attribution),
      })
      .eq("id", hold.booking_id);
    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ ok: true, path: "retainer", checkoutUrl: session.url, expiresAt: hold.expires_at });
  } catch (err) {
    // Free the date so another family isn't blocked by a checkout that never opened.
    await supabase.from("bookings").update({ status: "expired" }).eq("id", hold.booking_id);
    console.error("[commission] checkout:", err);
    return fail(502, "checkout_failed", "We couldn't open secure checkout. Please try again.");
  }
}

/** Short, non-guessable-enough display reference derived from the booking id. */
function refFor(id: string) {
  return `TXQ-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}
