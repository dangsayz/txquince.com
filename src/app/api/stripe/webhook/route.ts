/**
 * /api/stripe/webhook — Stripe → us. The source of truth for "money arrived".
 *
 * Verifies the HMAC signature and a 5-minute timestamp window ourselves (no
 * `stripe` package), then hands off to src/lib/journey/webhook.ts, which
 * records payments idempotently by Stripe id and NEVER charges or refunds.
 *
 * Any failure while recording → 500, so Stripe retries (audit H1); retries
 * and replays are no-ops because every write is keyed by Stripe's ids.
 *
 * Events: checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, checkout.session.expired,
 * refund.created, refund.updated, charge.refunded.
 * Local: stripe listen --forward-to localhost:3210/api/stripe/webhook
 */
import { NextResponse, type NextRequest } from "next/server";
import { journeyDeps } from "@/lib/journey/deps";
import { handleStripeEvent, parseStripeEvent, verifyStripeSignature } from "@/lib/journey/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const deps = journeyDeps();
  if (!verifyStripeSignature(rawBody, request.headers.get("stripe-signature"), deps.webhookSecret(), deps.now().getTime())) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }
  const event = parseStripeEvent(rawBody);
  if (!event) return NextResponse.json({ error: "Invalid Stripe event." }, { status: 400 });

  try {
    const outcome = await handleStripeEvent(deps, event);
    return NextResponse.json({ received: true, outcome });
  } catch (err) {
    console.error("[stripe-webhook] handler error:", event.type, event.id, err);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}
