/**
 * /api/booking/balance — opens Stripe Checkout for the REST of a booking's
 * total, after the deposit is paid. All at once, in parts, or with Klarna /
 * Afterpay / Affirm (Stripe shows those at checkout when the family and the
 * amount are eligible).
 *
 * Threat model, and what stops each one:
 *   - Guessing someone else's booking → the id AND the 24-char random pay token
 *     from their email must both match (constant-time compare); else 404.
 *   - Changing the price → the balance comes from the SIGNED agreement and the
 *     paid ledger on the server; the client can only pick an amount inside
 *     [min part, what's left]. Webhook re-checks what Stripe collected.
 *   - Paying twice / overpaying (double tap, two tabs, scripted race) → one
 *     live checkout per booking, enforced by a unique index in the database; a
 *     new amount first EXPIRES the old Stripe session, and refuses if it was
 *     already paid. Stripe Idempotency-Key = our row id.
 *   - Card testing (bots trying stolen cards) → per-IP and per-booking rate
 *     limits, a $50 floor on part payments, a valid booking+token required.
 *   - Cross-site requests → JSON-only body and an Origin check.
 *   - Open redirect → success/cancel URLs are built here from the site URL.
 *   - Leaking data → errors say nothing about whether a booking exists.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { createStripeCheckoutSession, expireStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { isSignedAgreement, tokenMatches } from "@/lib/agreement";
import { balanceCentsFrom, checkAmount, LIVE_STATUSES, remainingCents, type BalancePaymentRow } from "@/lib/balance";
import { TIER_NAME_EN, type TierId } from "@/lib/commission";
import { formatEventDate } from "@/lib/booking";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z
  .object({
    id: z.string().uuid(),
    t: z.string().regex(/^[A-Za-z0-9_-]{10,80}$/),
    amountCents: z.number().int().positive().max(10_000_000).optional(),
  })
  .strict();

const SESSION_MS = 60 * 60 * 1000; // Stripe allows 30 min – 24 h
const STALE_OPENING_MS = 2 * 60 * 1000;
const REUSE_MIN_LEFT_MS = 10 * 60 * 1000;

const rateLimited = rateLimiter("pay");

const fail = (status: number, error: string, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ error, ...extra }, { status, headers: { "Cache-Control": "no-store" } });

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers may omit it
  try {
    return origin === new URL(getSiteUrl()).origin || origin === req.nextUrl.origin;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, "Not allowed.");
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return fail(415, "Invalid request.");
  if (await rateLimited(clientIp(req))) return fail(429, "Too many tries. Please wait a minute.");

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(400, "Invalid request.");
  const { id, t, amountCents } = parsed.data;
  if (await rateLimited(`booking:${id}`)) return fail(429, "Too many tries. Please wait a minute.");

  if (!isSupabaseConfigured() || !isStripeConfigured()) {
    return fail(503, "Payments are briefly unavailable. Please try again soon.");
  }

  const supabase = getServiceSupabase();
  const { data: b } = await supabase
    .from("bookings")
    .select("id, email, event_date, status, currency, metadata")
    .eq("id", id)
    .maybeSingle();
  const meta = (b?.metadata ?? {}) as Record<string, unknown>;
  const agreement = meta.agreement;
  if (!b || !isSignedAgreement(agreement) || !tokenMatches(agreement.payToken, t)) {
    return fail(404, "This link isn't valid.");
  }
  // Only a booked date (deposit in) has a balance to pay.
  if (b.status !== "paid") return fail(409, "Your deposit needs to be paid first.");

  const balance = balanceCentsFrom(agreement.balanceUsd);
  if (balance === null) return fail(409, "Please contact us to pay your balance.");

  const { data: rowsData, error: rowsError } = await supabase
    .from("booking_payments")
    .select("id, amount_cents, currency, status, checkout_url, checkout_expires_at, stripe_checkout_session_id, created_at")
    .eq("booking_id", b.id)
    .eq("kind", "balance");
  if (rowsError) {
    console.error("[booking/balance] ledger read:", rowsError.message);
    return fail(503, "Payments are briefly unavailable. Please try again soon.");
  }
  const rows = (rowsData ?? []) as BalancePaymentRow[];
  const remaining = remainingCents(balance, rows);
  if (remaining <= 0) return fail(409, "Your balance is paid in full.", { paidInFull: true });

  const amount = checkAmount(amountCents, remaining);
  if (!amount.ok) {
    const msg = {
      tooSmall: "That amount is below the minimum.",
      tooBig: "That's more than what's left.",
      invalid: "Please enter a valid amount.",
      nothingDue: "Your balance is paid in full.",
    }[amount.error];
    return fail(400, msg, { reason: amount.error });
  }

  // Deal with a checkout that's already in flight for this booking.
  const live = rows.find((r) => (LIVE_STATUSES as readonly string[]).includes(r.status));
  if (live) {
    if (live.status === "processing") {
      return fail(409, "Your last payment is still processing. Please check back soon.");
    }
    if (live.status === "opening") {
      if (Date.now() - new Date(live.created_at).getTime() < STALE_OPENING_MS) {
        return fail(409, "Checkout is opening. Please try again in a moment.");
      }
      await supabase.from("booking_payments").update({ status: "failed" }).eq("id", live.id).eq("status", "opening");
    } else {
      const left = live.checkout_expires_at ? new Date(live.checkout_expires_at).getTime() - Date.now() : 0;
      if (live.amount_cents === amount.cents && live.checkout_url && left > REUSE_MIN_LEFT_MS) {
        return NextResponse.json({ ok: true, url: live.checkout_url }, { headers: { "Cache-Control": "no-store" } });
      }
      // Different amount (or nearly dead): close the old session FIRST so only one can ever be paid.
      if (live.stripe_checkout_session_id) {
        let state: "expired" | "complete" | "open";
        try {
          state = await expireStripeCheckoutSession(live.stripe_checkout_session_id);
        } catch (err) {
          console.error("[booking/balance] expire:", err);
          return fail(502, "We couldn't open secure checkout. Please try again.");
        }
        if (state === "complete") {
          await supabase.from("booking_payments").update({ status: "processing" }).eq("id", live.id).eq("status", "open");
          return fail(409, "Your last payment is still processing. Please check back soon.");
        }
        if (state === "open") return fail(502, "We couldn't open secure checkout. Please try again.");
      }
      await supabase.from("booking_payments").update({ status: "expired" }).eq("id", live.id).eq("status", "open");
    }
  }

  // Reserve the one live slot. A racing request loses here (unique index).
  const currency = (b.currency || "usd").toLowerCase();
  const { data: row, error: insertError } = await supabase
    .from("booking_payments")
    .insert({ booking_id: b.id, kind: "balance", amount_cents: amount.cents, currency, status: "opening" })
    .select("id")
    .single();
  if (insertError || !row) {
    if (insertError?.code === "23505") return fail(409, "Checkout is opening. Please try again in a moment.");
    console.error("[booking/balance] reserve:", insertError?.message);
    return fail(503, "Payments are briefly unavailable. Please try again soon.");
  }

  const back = `${getSiteUrl()}/booking/${b.id}?t=${encodeURIComponent(t)}`;
  const expiresAt = new Date(Date.now() + SESSION_MS);
  const tier = typeof meta.tier === "string" && meta.tier in TIER_NAME_EN ? TIER_NAME_EN[meta.tier as TierId] : "Package";
  const date = formatEventDate(b.event_date);
  const isAll = amount.cents === remaining;

  let sessionId: string | null = null;
  try {
    const session = await createStripeCheckoutSession({
      amountCents: amount.cents,
      currency,
      productName: `${site.brand} — ${isAll ? "balance" : "balance payment"} · ${tier}`,
      productDescription: `For ${date}. Goes toward your total of $${Number(meta.total_usd ?? agreement.totalUsd).toLocaleString("en-US")}.`,
      paymentDescription: `TX Quince balance — ${date}`,
      clientReferenceId: b.id,
      customerEmail: b.email,
      locale: agreement.lang === "es" ? "es" : "en",
      successUrl: `${back}&balance=1`,
      cancelUrl: back,
      expiresAt,
      idempotencyKey: `txq-balance-${row.id}`,
      metadata: {
        source: "txquince",
        flow: "balance",
        booking_id: b.id,
        payment_id: row.id,
        event_date: b.event_date,
      },
    });
    sessionId = session.id;
    if (!session.url) throw new Error("no checkout url");
    const { error } = await supabase
      .from("booking_payments")
      .update({
        status: "open",
        stripe_checkout_session_id: session.id,
        checkout_url: session.url,
        checkout_expires_at: expiresAt.toISOString(),
      })
      .eq("id", row.id)
      .eq("status", "opening");
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[booking/balance] checkout:", err);
    // Never leave a payable session at Stripe that our ledger doesn't track.
    if (sessionId) await expireStripeCheckoutSession(sessionId).catch(() => null);
    await supabase.from("booking_payments").update({ status: "failed" }).eq("id", row.id).eq("status", "opening");
    return fail(502, "We couldn't open secure checkout. Please try again.");
  }
}
