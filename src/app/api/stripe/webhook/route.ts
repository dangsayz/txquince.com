/**
 * /api/stripe/webhook — Stripe → us, the source of truth for "deposit paid".
 *
 * We verify the HMAC signature ourselves (no `stripe` package needed), parse the
 * event, and on `checkout.session.completed` hand off to fulfillCheckoutSession()
 * which confirms the booking and sends the confirmation emails.
 *
 * SETUP: add this URL as a webhook endpoint in the Stripe dashboard
 *   https://YOUR-DOMAIN/api/stripe/webhook   (event: checkout.session.completed)
 * and put the signing secret in STRIPE_WEBHOOK_SECRET. Locally:
 *   stripe listen --forward-to localhost:3210/api/stripe/webhook
 */
import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { fulfillCheckoutSession } from "@/lib/booking-fulfillment";
import { getServiceSupabase } from "@/lib/supabase-server";
import type { StripeCheckoutSession } from "@/lib/stripe";

export const runtime = "nodejs";
// Stripe needs the raw, unparsed body for signature verification.
export const dynamic = "force-dynamic";

interface StripeEvent {
  id: string;
  type: string;
  data: { object: unknown };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function parseStripeSignature(header: string) {
  const entries = header.split(",").map((part) => part.split("="));
  const timestamp = entries.find(([k]) => k === "t")?.[1] || null;
  const signatures = entries
    .filter(([k]) => k === "v1")
    .map(([, v]) => v)
    .filter((v): v is string => Boolean(v));
  return { timestamp, signatures };
}

function secureCompareHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf);
}

function verifyStripeSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return false;

  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  // Reject events older than 5 minutes (replay protection).
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  return signatures.some((sig) => secureCompareHex(expected, sig));
}

function parseEvent(rawBody: string): StripeEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || typeof parsed.id !== "string" || typeof parsed.type !== "string") {
    return null;
  }
  if (!isRecord(parsed.data) || !("object" in parsed.data)) return null;
  return { id: parsed.id, type: parsed.type, data: { object: parsed.data.object } };
}

function checkoutSessionFromEvent(value: unknown): StripeCheckoutSession | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;

  const customerDetails = isRecord(value.customer_details)
    ? {
        email:
          typeof value.customer_details.email === "string"
            ? value.customer_details.email
            : null,
      }
    : null;

  return {
    id: value.id,
    url: typeof value.url === "string" ? value.url : null,
    payment_status:
      typeof value.payment_status === "string" ? value.payment_status : null,
    payment_intent:
      typeof value.payment_intent === "string" ? value.payment_intent : null,
    client_reference_id:
      typeof value.client_reference_id === "string" ? value.client_reference_id : null,
    amount_total: typeof value.amount_total === "number" ? value.amount_total : null,
    currency: typeof value.currency === "string" ? value.currency : null,
    metadata: isRecord(value.metadata)
      ? Object.fromEntries(
          Object.entries(value.metadata).filter(
            (e): e is [string, string] => typeof e[1] === "string",
          ),
        )
      : null,
    customer_details: customerDetails,
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !verifyStripeSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = parseEvent(rawBody);
  if (!event) {
    return NextResponse.json({ error: "Invalid Stripe event." }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Card payments AND async methods (Affirm/BNPL) that settle later —
      // fulfill only acts when payment_status === 'paid', so both are safe here.
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = checkoutSessionFromEvent(event.data.object);
        if (session) await fulfillCheckoutSession(session);
        break;
      }

      // The checkout died (abandoned, or the BNPL loan was declined) —
      // release the date so another family can hold it.
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = checkoutSessionFromEvent(event.data.object);
        if (session?.id) {
          const { error } = await getServiceSupabase()
            .from("bookings")
            .update({ status: "expired" })
            .eq("stripe_checkout_session_id", session.id)
            .eq("status", "pending_payment");
          if (error) console.error("[stripe-webhook] release failed:", error.message);
        }
        break;
      }

      // A refund in Stripe frees the date and corrects the dashboard.
      case "charge.refunded": {
        const charge = event.data.object as { payment_intent?: unknown; refunded?: unknown };
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
        if (pi && charge.refunded === true) {
          const { error } = await getServiceSupabase()
            .from("bookings")
            .update({ status: "refunded" })
            .eq("stripe_payment_intent_id", pi)
            .in("status", ["paid", "payment_review"]);
          if (error) console.error("[stripe-webhook] refund-sync failed:", error.message);
        }
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook] handler error:", err);
    // 500 → Stripe retries; all handlers above are idempotent so retries are safe.
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
