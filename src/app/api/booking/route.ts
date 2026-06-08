/**
 * /api/booking — self-serve date reservation (deposit). (LAW: owned capture)
 *
 * Flow: parse → honeypot → best-effort rate limit → Turnstile (primary gate) →
 * server-side zod validation → atomic date-hold in Supabase (create_booking_hold,
 * service role, RLS-locked) → Stripe Checkout Session (inline deposit price) →
 * return { checkoutUrl }. The client redirects to Stripe. Payment is confirmed
 * out-of-band by /api/stripe/webhook → confirm_booking_payment().
 *
 * Mirrors /api/inquiry's defenses; never trusts the client. The atomic RPC +
 * partial unique index (0002_bookings.sql) make double-booking a date IMPOSSIBLE
 * even under concurrent checkouts — no check-then-insert race.
 *
 * Payment plans: we do NOT restrict payment_method_types in stripe.ts, so Stripe
 * Checkout auto-surfaces Affirm / Klarna / Afterpay when enabled in the Stripe
 * Dashboard (Settings → Payment methods). The $500 deposit qualifies for BNPL.
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  bookingSchema,
  HONEYPOT_FIELD,
  TURNSTILE_FIELD,
  DEPOSIT_CENTS,
  DEPOSIT_CURRENCY,
  HOLD_MINUTES,
  formatEventDate,
  packageLabel,
} from "@/lib/booking";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  createStripeCheckoutSession,
  isStripeConfigured,
  type StripeCheckoutSession,
} from "@/lib/stripe";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best-effort in-memory rate limit (Turnstile is the real gate — see /api/inquiry).
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
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // 1) Honeypot — silently accept (don't tip off bots).
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true, checkoutUrl: null });
  }

  // 2) Rate limit.
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  // 3) Turnstile (primary abuse gate), before any DB/Stripe work.
  const token =
    (typeof body[TURNSTILE_FIELD] === "string" ? (body[TURNSTILE_FIELD] as string) : undefined) ??
    (typeof body["turnstileToken"] === "string" ? (body["turnstileToken"] as string) : undefined);
  const turnstile = await verifyTurnstile(token, ip);
  if (!turnstile.ok) {
    return NextResponse.json(
      { ok: false, error: "Verification failed. Please refresh and try again." },
      { status: 403 },
    );
  }

  // 4) Server-side validation.
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please check the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // 5) Config guards — fail clearly while Stripe is still being set up.
  if (!isSupabaseConfigured()) {
    console.error("[booking] Supabase not configured.");
    return NextResponse.json(
      { ok: false, error: "Booking is temporarily unavailable. Please try the inquiry form." },
      { status: 503 },
    );
  }
  if (!isStripeConfigured()) {
    console.error("[booking] STRIPE_SECRET_KEY not set — cannot start checkout.");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Online deposits aren't live yet. Please use the inquiry form and I'll reserve your date personally.",
      },
      { status: 503 },
    );
  }

  const supabase = getServiceSupabase();

  // 6) Atomic date-hold. Raises 'date_unavailable' if the date is taken.
  let hold: BookingHold;
  try {
    const { data: holdData, error: holdError } = await supabase.rpc("create_booking_hold", {
      p_name: data.name,
      p_email: data.email,
      p_phone: data.phone || null,
      p_event_date: data.event_date,
      p_package: data.package,
      p_notes: data.notes || null,
      p_deposit_cents: DEPOSIT_CENTS,
      p_currency: DEPOSIT_CURRENCY,
      p_hold_minutes: HOLD_MINUTES,
    });

    if (holdError) {
      const taken = holdError.message.includes("date_unavailable");
      return NextResponse.json(
        {
          ok: false,
          error: taken
            ? "That date was just reserved. Please choose another, or use the inquiry form for the waitlist."
            : "We couldn't hold that date. Please try again shortly.",
          fieldErrors: taken ? { event_date: ["This date is no longer available."] } : undefined,
        },
        { status: taken ? 409 : 500 },
      );
    }

    const rows = (holdData || []) as BookingHold[];
    if (!rows[0]) {
      return NextResponse.json(
        { ok: false, error: "We couldn't hold that date. Please try again shortly." },
        { status: 500 },
      );
    }
    hold = rows[0];
  } catch (err) {
    console.error("[booking] hold exception:", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't hold that date. Please try again shortly." },
      { status: 500 },
    );
  }

  // 7) Stripe Checkout. On any failure, release the hold so the date frees up.
  try {
    const siteUrl = getSiteUrl();
    const prettyDate = formatEventDate(hold.event_date);

    let session: StripeCheckoutSession;
    try {
      session = await createStripeCheckoutSession({
        amountCents: hold.deposit_amount_cents,
        currency: hold.currency,
        productName: `${site.brand} — Date Reservation Deposit`,
        productDescription: `Deposit to reserve ${prettyDate} · ${packageLabel(data.package)}`,
        clientReferenceId: hold.booking_id,
        customerEmail: data.email,
        successUrl: `${siteUrl}/reserve/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${siteUrl}/reserve?canceled=1`,
        expiresAt: new Date(hold.expires_at),
        metadata: {
          source: "txquince",
          booking_id: hold.booking_id,
          event_date: hold.event_date,
          package: data.package,
        },
      });
    } catch (stripeErr) {
      await releaseHold(supabase, hold.booking_id);
      console.error("[booking] Stripe error:", stripeErr);
      return NextResponse.json(
        { ok: false, error: "We couldn't start checkout. Please try again." },
        { status: 502 },
      );
    }

    if (!session.url) {
      await releaseHold(supabase, hold.booking_id);
      return NextResponse.json(
        { ok: false, error: "Stripe didn't return a checkout link. Please try again." },
        { status: 502 },
      );
    }

    // Attach the checkout session so the webhook can match it back to the booking.
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", hold.booking_id);

    if (updateError) {
      await releaseHold(supabase, hold.booking_id);
      console.error("[booking] could not attach checkout session:", updateError.message);
      return NextResponse.json(
        { ok: false, error: "We couldn't start checkout. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl: session.url,
      expiresAt: hold.expires_at,
    });
  } catch (err) {
    await releaseHold(supabase, hold.booking_id);
    console.error("[booking] checkout exception:", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't start checkout. Please try again." },
      { status: 500 },
    );
  }
}

/** Free a held date when checkout can't be created. */
async function releaseHold(
  supabase: ReturnType<typeof getServiceSupabase>,
  bookingId: string,
): Promise<void> {
  try {
    await supabase.from("bookings").update({ status: "expired" }).eq("id", bookingId);
  } catch (err) {
    console.error("[booking] releaseHold failed:", err);
  }
}
