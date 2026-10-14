/**
 * webhook.ts — Stripe → us. Records money; never moves it.
 *
 *  - Signature: HMAC-SHA256 over `${t}.${body}`, constant-time compare, and a
 *    5-minute timestamp tolerance (older or future-dated → rejected).
 *  - Idempotent: payments are keyed by Stripe's own ids (session id, refund
 *    id) with unique indexes, so the same event twice — or a replay of an old
 *    valid one inside the window — records nothing new and sends no email.
 *  - Late payments: matched by booking id + session id even if a newer session
 *    replaced it (audit H2). Money for a booking that is no longer active
 *    (declined / expired / cancelled) lands in payment_review for the owner —
 *    never auto-confirmed, never auto-refunded (audit M5).
 *  - Errors THROW → the route answers 500 → Stripe retries (audit H1).
 */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { paymentReceivedEmail } from "@/lib/emails/payment-received";
import { ownerPaymentEmail } from "@/lib/emails/owner-payment";
import type { StripeCheckoutSession } from "@/lib/stripe";
import { familyCtx, logEvent, mailFamily, mailOwner, ownerCtx, settle, transition } from "./core";
import type { JourneyDeps } from "./deps";
import { ledgerFor } from "./ledger";
import { STATUS_LABEL } from "./state";
import type { BookingRow, PaymentKind, SessionKind } from "./types";

export const WEBHOOK_TOLERANCE_SECONDS = 300;

export function verifyStripeSignature(rawBody: string, header: string | null, secret: string | null, nowMs: number): boolean {
  if (!secret || !header) return false;
  const parts = header.split(",").map((p) => p.split("="));
  const t = parts.find(([k]) => k === "t")?.[1];
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v ?? "");
  const ts = Number(t);
  if (!t || !Number.isFinite(ts) || !sigs.length) return false;
  if (Math.abs(nowMs / 1000 - ts) > WEBHOOK_TOLERANCE_SECONDS) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${t}.${rawBody}`, "utf8").digest("hex"), "hex");
  return sigs.some((s) => {
    const got = Buffer.from(s, "hex");
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

/** Signs a payload like Stripe does (tests + the local fake Stripe). */
export function signStripePayload(rawBody: string, secret: string, tSeconds: number): string {
  const sig = createHmac("sha256", secret).update(`${tSeconds}.${rawBody}`, "utf8").digest("hex");
  return `t=${tSeconds},v1=${sig}`;
}

type StripeEvent = { id: string; type: string; data: { object: Record<string, unknown> } };

export function parseStripeEvent(raw: string): StripeEvent | null {
  try {
    const e = JSON.parse(raw) as StripeEvent;
    if (typeof e?.id !== "string" || typeof e?.type !== "string" || !e.data || typeof e.data.object !== "object") return null;
    return e;
  } catch {
    return null;
  }
}

/** Checkouts this site created. The Stripe account is shared with another site. */
const OUR_SOURCES = new Set(["txquince-journey", "commission", "txquince", "txquince-admin"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function asSession(o: Record<string, unknown>): StripeCheckoutSession {
  const md = (o.metadata && typeof o.metadata === "object" ? o.metadata : {}) as Record<string, unknown>;
  return {
    id: String(o.id ?? ""),
    url: typeof o.url === "string" ? o.url : null,
    payment_status: typeof o.payment_status === "string" ? o.payment_status : null,
    payment_intent: typeof o.payment_intent === "string" ? o.payment_intent : null,
    client_reference_id: typeof o.client_reference_id === "string" ? o.client_reference_id : null,
    amount_total: typeof o.amount_total === "number" ? o.amount_total : null,
    currency: typeof o.currency === "string" ? o.currency : null,
    metadata: Object.fromEntries(Object.entries(md).filter((e): e is [string, string] => typeof e[1] === "string")),
    customer_details: null,
    status: typeof o.status === "string" ? o.status : null,
  };
}

export type WebhookOutcome =
  | "ignored"
  | "recorded"
  | "duplicate"
  | "processing"
  | "review"
  | "session_expired"
  | "refund_recorded"
  | "unknown_booking";

export async function handleStripeEvent(deps: JourneyDeps, event: StripeEvent): Promise<WebhookOutcome> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return recordCheckout(deps, asSession(event.data.object), event.id);
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const s = asSession(event.data.object);
      if (!OUR_SOURCES.has(s.metadata?.source ?? "")) return "ignored";
      // A hold is governed by its own expiry (daily cron), not by an abandoned checkout.
      await deps.db.updateSession(s.id, { status: "expired" }, ["open", "processing"]);
      return "session_expired";
    }
    case "refund.created":
    case "refund.updated":
      return recordRefund(deps, event.data.object, event.id);
    case "charge.refunded": {
      const refunds = (event.data.object.refunds as { data?: Record<string, unknown>[] } | undefined)?.data ?? [];
      let any: WebhookOutcome = "ignored";
      for (const r of refunds) if ((await recordRefund(deps, { payment_intent: event.data.object.payment_intent, ...r }, event.id)) === "refund_recorded") any = "refund_recorded";
      return any;
    }
    default:
      return "ignored";
  }
}

async function recordCheckout(deps: JourneyDeps, s: StripeCheckoutSession, eventId: string): Promise<WebhookOutcome> {
  if (!OUR_SOURCES.has(s.metadata?.source ?? "")) return "ignored";
  const bookingId = s.metadata?.booking_id ?? s.client_reference_id ?? "";
  if (!UUID.test(bookingId) || (s.client_reference_id && s.client_reference_id !== bookingId)) {
    console.error("[webhook] session without a usable booking id:", s.id);
    return "unknown_booking";
  }
  const b = await deps.db.getBooking(bookingId);
  if (!b) {
    console.error("[webhook] no booking", bookingId, "for session", s.id);
    return "unknown_booking";
  }
  const ours = await deps.db.getSession(s.id);
  if (ours && ours.booking_id !== b.id) {
    // Never credit one family's booking with another's session.
    await alertReview(deps, b, s.amount_total ?? 0, "deposit", "the checkout session belongs to a different booking");
    return "review";
  }

  if (s.payment_status !== "paid") {
    // Async methods (bank debit, BNPL): completed but not yet paid. Block new sessions until it settles.
    if (ours) await deps.db.updateSession(s.id, { status: "processing" }, ["open"]);
    await logEvent(deps, b.id, "payment_processing", "system", { detail: s.id });
    return "processing";
  }

  const kind: SessionKind = ours?.kind ?? (s.metadata?.kind === "balance" ? "balance" : "deposit");
  const amount = s.amount_total ?? 0;
  if (amount <= 0) return "ignored";

  const { inserted } = await deps.db.insertPayment({
    booking_id: b.id,
    kind: kind as PaymentKind,
    method: "stripe",
    amount_cents: amount,
    currency: (s.currency ?? b.currency ?? "usd").toLowerCase(),
    refund_of: null,
    stripe_checkout_session_id: s.id,
    stripe_payment_intent_id: s.payment_intent,
    stripe_refund_id: null,
    stripe_event_id: eventId,
    recorded_by: "stripe",
    note: null,
  });
  if (ours) await deps.db.updateSession(s.id, { status: "complete", completed_at: deps.now().toISOString() }, ["open", "processing", "expired"]);
  if (!inserted) {
    // Replay or retry: already recorded. Re-run the (idempotent) settle in case
    // a previous attempt died between the insert and the status change.
    if (b.status === "approved" || b.status === "confirmed") await settle(deps, b.id, "system");
    return "duplicate";
  }
  await logEvent(deps, b.id, `paid:${kind}`, "system", { detail: `${amount} cents · ${s.id}` });

  const currencyOk = (s.currency ?? "usd").toLowerCase() === (b.currency ?? "usd").toLowerCase();
  const amountOk = !ours || ours.amount_cents === amount;
  if (!currencyOk || !amountOk) {
    await toReview(deps, b, amount, kind, `Stripe collected ${amount} ${s.currency}; expected ${ours?.amount_cents ?? "?"} ${b.currency}`);
    return "review";
  }
  if (b.status !== "approved" && b.status !== "confirmed" && b.status !== "payment_review") {
    await toReview(deps, b, amount, kind, `the booking was ${STATUS_LABEL[b.status].toLowerCase()} when the money arrived`);
    return "review";
  }
  if (b.status === "payment_review") {
    await alertReview(deps, b, amount, kind, "the booking was already waiting for your review");
    return "review";
  }

  const { booking } = await settle(deps, b.id, "system");
  const l = ledgerFor(booking, await deps.db.listPayments(b.id));
  const outcome =
    booking.status === "paid_in_full"
      ? "paid_in_full"
      : booking.status === "confirmed" && b.status === "approved"
        ? "confirmed"
        : booking.status === "approved" && l.depositPaid && !booking.signed_at
          ? "deposit_waiting_signature"
          : "partial";
  await Promise.all([
    mailFamily(
      deps,
      booking,
      paymentReceivedEmail({ ...(await familyCtx(deps, booking)), amountCents: amount, outcome, remainingCents: l.remainingCents, balanceDueDate: booking.balance_due_date }),
      `payment-received-${kind}`,
    ),
    mailOwner(deps, b.id, ownerPaymentEmail({ ...ownerCtx(deps, booking), amountCents: amount, kind, status: STATUS_LABEL[booking.status] }), "owner-payment"),
  ]);
  return "recorded";
}

async function toReview(deps: JourneyDeps, b: BookingRow, amount: number, kind: string, why: string) {
  const r = await transition(deps, b.id, "any", "payment_review", {});
  await logEvent(deps, b.id, "payment_review", "system", { detail: why });
  await alertReview(deps, r.ok ? r.booking : b, amount, kind, why);
}

async function alertReview(deps: JourneyDeps, b: BookingRow, amount: number, kind: string, why: string) {
  await mailOwner(deps, b.id, ownerPaymentEmail({ ...ownerCtx(deps, b), amountCents: amount, kind, status: STATUS_LABEL[b.status], review: why }), "owner-payment-review");
}

async function recordRefund(deps: JourneyDeps, o: Record<string, unknown>, eventId: string): Promise<WebhookOutcome> {
  const id = typeof o.id === "string" ? o.id : null;
  const pi = typeof o.payment_intent === "string" ? o.payment_intent : null;
  const amount = typeof o.amount === "number" ? o.amount : 0;
  const status = typeof o.status === "string" ? o.status : "succeeded";
  if (!id || !pi || amount <= 0 || (status !== "succeeded" && status !== "pending")) return "ignored";
  const charge = await deps.db.findPaymentByIntent(pi);
  if (!charge) return "ignored"; // not one of ours
  const { inserted } = await deps.db.insertPayment({
    booking_id: charge.booking_id,
    kind: "refund",
    method: "stripe",
    amount_cents: amount,
    currency: typeof o.currency === "string" ? o.currency : charge.currency,
    refund_of: charge.id,
    stripe_checkout_session_id: null,
    stripe_payment_intent_id: pi,
    stripe_refund_id: id,
    stripe_event_id: eventId,
    recorded_by: "stripe",
    note: "Recorded from Stripe",
  });
  if (!inserted) return "duplicate";
  await logEvent(deps, charge.booking_id, "refund_recorded", "system", { detail: `${amount} cents · ${id} (made outside the admin)` });
  return "refund_recorded";
}
