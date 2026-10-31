/**
 * POST /api/plan/<slug>/hold — "Hold my date": open Stripe Checkout for the
 * date-hold deposit on a family's plan.
 *
 * Reuses the existing booking machinery end to end:
 *   - create_booking_hold() atomically claims the date (one active booking per
 *     date, enforced by a unique index), so two families can't both pay;
 *   - the existing Stripe webhook confirms payment (confirm_booking_payment),
 *     releases the date if checkout expires, and sends the booking emails;
 *   - fulfillment marks the plan Booked (metadata.plan_id).
 * The amount is the site's flat date-hold deposit (site.booking.depositCents),
 * priced here on the server; nothing in the request can change it.
 *
 * PRIVACY: success/cancel URLs carry only the random slug.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { createStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { getDateStatus, getPlanBySlug } from "@/lib/plan-db";
import { isPlanSlug } from "@/lib/plan-slug";
import { formatPlanDate, planPath, type PlanLang } from "@/lib/plan";
import { colorLabel } from "@/lib/quince-colors";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rateLimited = rateLimiter("plan");
/** Stripe's floor for expires_at is 30 minutes; the DB hold outlives the session. */
const SESSION_MS = 31 * 60 * 1000;
const HOLD_MINUTES = 35;

type Checkout = { id?: string; url?: string; expiresAt?: string };

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  // The page's language (the family may be reading the other-language link).
  const body = (await req.json().catch(() => ({}))) as { lang?: unknown };
  const pageLang: PlanLang | null = body.lang === "es" || body.lang === "en" ? body.lang : null;
  if (!isPlanSlug(slug)) return NextResponse.json({ ok: false, error: "notFound" }, { status: 404 });
  if (await rateLimited(clientIp(req))) return NextResponse.json({ ok: false, error: "rateLimited" }, { status: 429 });
  if (!isSupabaseConfigured() || !isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "notLive" }, { status: 503 });
  }

  const plan = await getPlanBySlug(slug);
  if (!plan) return NextResponse.json({ ok: false, error: "notFound" }, { status: 404 });
  if (plan.status === "booked") return NextResponse.json({ ok: false, error: "yours" }, { status: 409 });

  const supabase = getServiceSupabase();

  // Re-use this plan's own open checkout (a second tap, or back from Stripe).
  if (plan.booking_id) {
    const { data: b } = await supabase
      .from("bookings")
      .select("id, status, metadata")
      .eq("id", plan.booking_id)
      .maybeSingle();
    if (b?.status === "paid" || b?.status === "payment_review") {
      return NextResponse.json({ ok: false, error: "yours" }, { status: 409 });
    }
    const open = (b?.metadata as { checkout?: Checkout } | null)?.checkout;
    if (b?.status === "pending_payment" && open?.url && open.expiresAt && new Date(open.expiresAt).getTime() - Date.now() > 5 * 60 * 1000) {
      return NextResponse.json({ ok: true, url: open.url });
    }
  }

  if ((await getDateStatus(plan.event_date)) === "booked") {
    return NextResponse.json({ ok: false, error: "taken" }, { status: 409 });
  }

  const colors = plan.colors.map((c) => colorLabel(c, "en")).join(", ");
  const { data: hold, error: holdErr } = await supabase.rpc("create_booking_hold", {
    p_name: plan.name,
    p_email: plan.email ?? "",
    p_phone: plan.phone ?? "",
    p_event_date: plan.event_date,
    p_package: "both",
    p_notes: [
      `Date hold from quince plan ${plan.slug} (package to choose).`,
      `City: ${plan.city}`,
      colors ? `Colors: ${colors}` : "",
      plan.theme ? `Theme: ${plan.theme}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    p_deposit_cents: site.booking.depositCents,
    p_currency: site.booking.currency,
    p_hold_minutes: HOLD_MINUTES,
  });
  if (holdErr || !hold?.[0]?.booking_id) {
    if (holdErr?.message?.includes("date_unavailable")) {
      return NextResponse.json({ ok: false, error: "taken" }, { status: 409 });
    }
    console.error("[plan/hold] create_booking_hold failed:", holdErr?.message);
    return NextResponse.json({ ok: false, error: "error" }, { status: 500 });
  }
  const bookingId = hold[0].booking_id as string;

  const siteUrl = getSiteUrl();
  const lang = pageLang ?? plan.language;
  const back = `${siteUrl}${planPath(plan.slug, lang)}`;
  const expiresAt = new Date(Date.now() + SESSION_MS);
  const date = formatPlanDate(plan.event_date, lang);
  const es = lang === "es";

  let session;
  try {
    session = await createStripeCheckoutSession({
      amountCents: site.booking.depositCents,
      currency: site.booking.currency,
      productName: es ? `${site.brand} — Apartado de fecha · ${date}` : `${site.brand} — Date hold · ${date}`,
      productDescription: es ? "Se abona al total de tu paquete." : "Goes toward your package total.",
      paymentDescription: `TX Quince date hold — ${plan.event_date}`,
      clientReferenceId: bookingId,
      customerEmail: plan.email,
      locale: es ? "es" : "en",
      successUrl: `${back}?paid=1`,
      cancelUrl: back,
      expiresAt,
      metadata: {
        source: "txquince-plan",
        flow: "plan",
        booking_id: bookingId,
        plan_id: plan.id,
        plan_slug: plan.slug,
        event_date: plan.event_date,
        src: plan.source ?? "",
      },
    });
    if (!session.url) throw new Error("no checkout url");
  } catch (err) {
    console.error("[plan/hold] checkout:", err);
    // Give the date back right away rather than waiting for the hold to lapse.
    await supabase.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", bookingId);
    return NextResponse.json({ ok: false, error: "error" }, { status: 502 });
  }

  // The webhook finds the booking by this session id, so if it can't be saved
  // the family must not reach a checkout we could never match to their date.
  const { error: bErr } = await supabase
    .from("bookings")
    .update({
      stripe_checkout_session_id: session.id,
      attribution: plan.source ? { ...(plan.attribution ?? {}), source: plan.source, medium: "plan" } : plan.attribution,
      metadata: {
        flow: "plan",
        plan_id: plan.id,
        plan_slug: plan.slug,
        language: plan.language,
        source: plan.source,
        city: plan.city,
        colors: plan.colors,
        checkout: { id: session.id, url: session.url, expiresAt: expiresAt.toISOString() },
      },
    })
    .eq("id", bookingId);
  if (bErr) {
    console.error("[plan/hold] booking update:", bErr.message);
    await supabase.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", bookingId);
    return NextResponse.json({ ok: false, error: "error" }, { status: 500 });
  }
  const { error: pErr } = await supabase.from("quince_plans").update({ booking_id: bookingId }).eq("id", plan.id);
  if (pErr) console.error("[plan/hold] plan update:", pErr.message);

  return NextResponse.json({ ok: true, url: session.url });
}
