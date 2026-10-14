/**
 * stripe.ts — minimal, dependency-free Stripe REST client (server-only).
 *
 * We talk to the Stripe API directly over fetch with form-encoded bodies, so
 * there's no `stripe` npm package to install or keep in sync:
 *   - createStripeCheckoutSession() — one-time payment, price built INLINE via
 *     price_data (no Product/Price objects to manage).
 *   - retrieveStripeCheckoutSession() — read back the session on the success page.
 *   - expireStripeCheckoutSession() — close a superseded / declined session.
 *   - createStripeRefund() — ONLY ever called from the owner's refund button,
 *     always with an Idempotency-Key.
 *
 * SECURITY LAW: STRIPE_SECRET_KEY is server-only. This module is imported only by
 * API routes / server components. Outside production only `sk_test_` keys are
 * accepted, and STRIPE_API_BASE (a local mock, scripts/local/fake-stripe.mjs)
 * is only honored with a test key outside production.
 */
import "server-only";

const DEFAULT_STRIPE_API_BASE = "https://api.stripe.com/v1";

export interface StripeCheckoutSession {
  id: string;
  url: string | null;
  payment_status: string | null;
  payment_intent: string | null;
  client_reference_id: string | null;
  amount_total: number | null;
  currency: string | null;
  metadata: Record<string, string> | null;
  customer_details: { email: string | null } | null;
  /** open | complete | expired (present on API responses and webhook payloads). */
  status?: string | null;
}

type StripeMetadata = Record<string, string | number | boolean | null | undefined>;

interface StripeErrorResponse {
  error?: { message?: string; code?: string };
}

interface CreateCheckoutSessionInput {
  amountCents: number;
  currency: string;
  productName: string;
  productDescription?: string;
  clientReferenceId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  expiresAt: Date;
  metadata?: StripeMetadata;
  /** Checkout UI language, e.g. "es" for Spanish-preferring families. */
  locale?: string;
  /** Statement/receipt line for the PaymentIntent. */
  paymentDescription?: string;
  /** Stripe Idempotency-Key: a retried request returns the same session. */
  idempotencyKey?: string;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  // "Stripe test mode only, locally": a live key never moves money from a dev box.
  if (process.env.NODE_ENV !== "production" && !key.startsWith("sk_test_")) {
    throw new Error("Refusing a non-test Stripe key outside production.");
  }
  return key;
}

function stripeApiBase(): string {
  const override = process.env.STRIPE_API_BASE;
  if (override && process.env.NODE_ENV !== "production" && getStripeSecretKey().startsWith("sk_test_")) {
    return override.replace(/\/+$/, "");
  }
  return DEFAULT_STRIPE_API_BASE;
}

function isStripeErrorResponse(value: unknown): value is StripeErrorResponse {
  return Boolean(value && typeof value === "object" && "error" in value);
}

export class StripeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null,
  ) {
    super(message);
  }
}

function appendMetadata(
  params: URLSearchParams,
  metadata: StripeMetadata | undefined,
  prefix = "metadata",
) {
  if (!metadata) return;
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null) continue;
    params.set(`${prefix}[${key}]`, String(value));
  }
}

async function stripeRequest<T>(
  path: string,
  init: { method: "GET" | "POST"; params?: URLSearchParams; idempotencyKey?: string },
): Promise<T> {
  const response = await fetch(`${stripeApiBase()}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      ...(init.method === "POST"
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
      ...(init.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}),
    },
    body: init.params?.toString(),
    cache: "no-store",
  });

  let json: unknown = null;
  try {
    json = (await response.json()) as unknown;
  } catch {
    json = null;
  }

  if (!response.ok) {
    const err = isStripeErrorResponse(json) ? json.error : undefined;
    throw new StripeApiError(err?.message || "Stripe request failed.", response.status, err?.code ?? null);
  }

  return json as T;
}

export async function createStripeCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<StripeCheckoutSession> {
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("submit_type", "book");
  // Inline price — no pre-created Product/Price needed.
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", input.currency);
  params.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
  params.set("line_items[0][price_data][product_data][name]", input.productName);
  if (input.productDescription) {
    params.set(
      "line_items[0][price_data][product_data][description]",
      input.productDescription,
    );
  }
  params.set("client_reference_id", input.clientReferenceId);
  params.set("customer_email", input.customerEmail);
  params.set("payment_intent_data[receipt_email]", input.customerEmail);
  params.set("success_url", input.successUrl);
  params.set("cancel_url", input.cancelUrl);
  params.set("expires_at", String(Math.floor(input.expiresAt.getTime() / 1000)));
  if (input.locale) params.set("locale", input.locale);
  if (input.paymentDescription) {
    params.set("payment_intent_data[description]", input.paymentDescription);
  }
  appendMetadata(params, input.metadata);
  appendMetadata(params, input.metadata, "payment_intent_data[metadata]");

  return stripeRequest<StripeCheckoutSession>("/checkout/sessions", {
    method: "POST",
    params,
    idempotencyKey: input.idempotencyKey,
  });
}

export async function retrieveStripeCheckoutSession(
  sessionId: string,
): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { method: "GET" },
  );
}

/**
 * Expire an open Checkout session so it can no longer be paid. Returns the
 * session as Stripe now sees it. Callers must read `status`: a session that
 * already completed can't be expired (Stripe answers 400), and that is how we
 * learn a payment is already in flight.
 */
export async function expireStripeCheckoutSession(
  sessionId: string,
): Promise<{ id: string; status: string | null; payment_status: string | null }> {
  try {
    return await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}/expire`, {
      method: "POST",
      params: new URLSearchParams(),
    });
  } catch (err) {
    if (err instanceof StripeApiError && err.status === 400) {
      return stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`, { method: "GET" });
    }
    throw err;
  }
}

export interface StripeRefund {
  id: string;
  amount: number;
  currency: string;
  status: string | null;
  payment_intent: string | null;
}

/**
 * Refund part or all of a PaymentIntent. Called ONLY from the owner's refund
 * action. The Idempotency-Key makes a double click (or a retried request)
 * return the same refund instead of creating a second one.
 */
export async function createStripeRefund(input: {
  paymentIntentId: string;
  amountCents: number;
  idempotencyKey: string;
  metadata?: StripeMetadata;
}): Promise<StripeRefund> {
  const params = new URLSearchParams();
  params.set("payment_intent", input.paymentIntentId);
  params.set("amount", String(input.amountCents));
  params.set("reason", "requested_by_customer");
  appendMetadata(params, input.metadata);
  return stripeRequest<StripeRefund>("/refunds", {
    method: "POST",
    params,
    idempotencyKey: input.idempotencyKey,
  });
}
