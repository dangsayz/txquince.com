/**
 * /api/booking/pay — opens Stripe Checkout for an APPROVED agreement's
 * deposit. It charges the STORED deposit (bookings.deposit_amount_cents, set
 * when the family signed) — never a re-quote from the current price book, so
 * a price change at /admin/prices can't move what an existing family pays. Called from the family's pay page (/booking/[id]?t=…); the token
 * from the approval email is the only key. Re-uses an open checkout when one
 * exists so a family can't end up with two live sessions, and otherwise opens
 * a fresh one (Stripe sessions last at most 24h; the date hold is longer).
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb, isDbConfigured } from "@/lib/db";
import { createStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { isSignedAgreement, signedDepositPercent, tokenMatches } from "@/lib/agreement";
import { TIER_NAME_EN, type TierId } from "@/lib/commission";
import { getPriceBook } from "@/lib/pricing";
import { tierName } from "@/lib/price-text";
import { formatEventDate } from "@/lib/booking";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/content/site";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({ id: z.string().uuid(), t: z.string().min(10).max(80) });
const MIN_SESSION_MS = 31 * 60 * 1000; // Stripe's floor is 30 minutes
const MAX_SESSION_MS = 23 * 3600 * 1000;
const rateLimited = rateLimiter("pay");

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(getSiteUrl()).origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  if (await rateLimited(clientIp(request))) {
    return NextResponse.json({ error: "Too many tries. Please wait a minute." }, { status: 429 });
  }
  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid link." }, { status: 400 });
  if (await rateLimited(`booking:${parsed.data.id}`)) {
    return NextResponse.json({ error: "Too many tries. Please wait a minute." }, { status: 429 });
  }
  if (!isDbConfigured() || !isStripeConfigured()) {
    return NextResponse.json({ error: "Payments are briefly unavailable. Please try again soon." }, { status: 503 });
  }

  const db = getDb();
  const { data: b } = await db
    .from("bookings")
    .select("id, email, event_date, status, deposit_amount_cents, currency, expires_at, metadata")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const meta = (b?.metadata ?? {}) as Record<string, unknown>;
  const agreement = meta.agreement;
  if (!b || !isSignedAgreement(agreement) || !tokenMatches(agreement.payToken, parsed.data.t)) {
    return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });
  }
  if (b.status === "paid") return NextResponse.json({ error: "Already paid.", paid: true }, { status: 409 });
  if (b.status !== "pending_payment" || new Date(b.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This link has expired. Please contact us." }, { status: 410 });
  }

  // Re-use an open checkout that still has a little life left.
  const open = meta.checkout as { id?: string; url?: string; expiresAt?: string } | undefined;
  if (open?.url && open.expiresAt && new Date(open.expiresAt).getTime() - Date.now() > 10 * 60 * 1000) {
    return NextResponse.json({ ok: true, url: open.url });
  }

  const siteUrl = getSiteUrl();
  const back = `${siteUrl}/booking/${b.id}?t=${encodeURIComponent(parsed.data.t)}`;
  const holdLeft = new Date(b.expires_at).getTime() - Date.now();
  const expiresAt = new Date(Date.now() + Math.max(MIN_SESSION_MS, Math.min(MAX_SESSION_MS, holdLeft)));
  const tier = typeof meta.tier === "string" && meta.tier in TIER_NAME_EN ? tierName(await getPriceBook(), meta.tier as TierId) : "Package";
  const date = formatEventDate(b.event_date);

  try {
    const session = await createStripeCheckoutSession({
      amountCents: b.deposit_amount_cents,
      currency: b.currency || "usd",
      productName: `${site.brand} — ${signedDepositPercent(agreement)}% deposit · ${tier}`,
      productDescription: `Locks in ${date}. Goes toward your total of $${Number(meta.total_usd ?? 0).toLocaleString("en-US")}.`,
      paymentDescription: `TX Quince deposit — ${date}`,
      clientReferenceId: b.id,
      customerEmail: b.email,
      locale: meta.language === "es" ? "es" : "en",
      successUrl: `${back}&paid=1`,
      cancelUrl: back,
      expiresAt,
      metadata: {
        source: "commission",
        flow: "agreement",
        booking_id: b.id,
        event_date: b.event_date,
        tier: String(meta.tier ?? ""),
        total_usd: String(meta.total_usd ?? ""),
      },
    });
    if (!session.url) throw new Error("no checkout url");
    const { error } = await db
      .from("bookings")
      .update({
        stripe_checkout_session_id: session.id,
        metadata: { ...meta, checkout: { id: session.id, url: session.url, expiresAt: expiresAt.toISOString() } },
      })
      .eq("id", b.id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[booking/pay] checkout:", err);
    return NextResponse.json({ error: "We couldn't open secure checkout. Please try again." }, { status: 502 });
  }
}
