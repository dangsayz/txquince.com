/**
 * /api/admin/test-payment — the owner's $1 payment test (admin only).
 *   POST            open a $1 Stripe Checkout
 *   POST {refund}   refund a finished test
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminEmail } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { createStripeCheckoutSession, isStripeConfigured, refundStripePayment } from "@/lib/stripe";
import { getPaymentTest, savePaymentTest, TEST_AMOUNT_CENTS } from "@/lib/payment-test";
import { isDbConfigured } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({ refund: z.string().uuid().optional() }).strict();

export async function POST(req: NextRequest) {
  const admin = await getAdminEmail();
  if (!admin) return unauthorizedAdminResponse();
  const parsed = Schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (!isStripeConfigured() || !isDbConfigured()) return NextResponse.json({ error: "Payments are not set up on this site." }, { status: 503 });

  if (parsed.data.refund) {
    const t = await getPaymentTest(parsed.data.refund);
    if (!t?.paymentIntent) return NextResponse.json({ error: "That test has no payment to refund yet." }, { status: 409 });
    if (t.refundedAt) return NextResponse.json({ ok: true });
    const r = await refundStripePayment(t.paymentIntent);
    if (!r.ok) return NextResponse.json({ error: r.error ?? "Stripe refused the refund." }, { status: 502 });
    await savePaymentTest({ ...t, refundedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  }

  const id = crypto.randomUUID();
  const back = `${getSiteUrl()}/admin/test-payment`;
  try {
    await savePaymentTest({ id, createdAt: new Date().toISOString(), by: admin, sessionId: null, receivedAt: null, paymentIntent: null, amountOk: null, refundedAt: null });
    const session = await createStripeCheckoutSession({
      amountCents: TEST_AMOUNT_CENTS,
      currency: "usd",
      productName: `${site.brand} — $1 payment test`,
      productDescription: "Owner test. Refund it from the Studio after it goes through.",
      paymentDescription: "TX Quince payment test",
      clientReferenceId: id,
      customerEmail: admin,
      successUrl: `${back}?test=${id}`,
      cancelUrl: back,
      expiresAt: new Date(Date.now() + 31 * 60 * 1000),
      idempotencyKey: `txq-test-${id}`,
      metadata: { source: "txquince-admin", flow: "test", test_id: id },
    });
    if (!session.url) throw new Error("no checkout url");
    const t = await getPaymentTest(id);
    await savePaymentTest({ ...t!, sessionId: session.id });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[test-payment]", err);
    return NextResponse.json({ error: "Could not open checkout. Check the Stripe key on the site." }, { status: 502 });
  }
}
