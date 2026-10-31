/**
 * stripe.ts — minimal, dependency-free Stripe REST client (server-only).
 *
 * We talk to the Stripe API directly over fetch with form-encoded bodies, so
 * there's no `stripe` npm package to install or keep in sync. Only two calls are
 * needed for the deposit flow:
 *   - createStripeCheckoutSession() — one-time payment, price built INLINE via
 *     price_data (no Product/Price objects to manage).
 *   - retrieveStripeCheckoutSession() — read back the session on the success page.
 *
 * SECURITY LAW: STRIPE_SECRET_KEY is server-only. This module is imported only by
 * API routes / server components.
 *
 * Local testing: STRIPE_API_BASE points at a local mock, and is honored ONLY
 * outside production with an sk_test_ key, so it can never redirect a live key.
 */
import "server-only";

const DEFAULT_STRIPE_API_BASE = "https://api.stripe.com/v1";

function stripeApiBase(): string {
  const override = process.env.STRIPE_API_BASE;
  if (override && process.env.NODE_ENV !== "production" && getStripeSecretKey().startsWith("sk_test_")) {
    return override.replace(/\/+$/, "");
  }
  return DEFAULT_STRIPE_API_BASE;
}

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
}

type StripeMetadata = Record<string, string | number | boolean | null | undefined>;

interface StripeErrorResponse {
  error?: { message?: string };
}

interface CreateCheckoutSessionInput {
  amountCents: number;
  currency: string;
  productName: string;
  productDescription?: string;
  clientReferenceId: string;
  /** Prefills Checkout and the receipt. Omit and Stripe Checkout asks for it. */
  customerEmail?: string | null;
  successUrl: string;
  cancelUrl: string;
  expiresAt: Date;
  metadata?: StripeMetadata;
  /** Checkout UI language, e.g. "es" for Spanish-preferring families. */
  locale?: string;
  /** Statement/receipt line for the PaymentIntent. */
  paymentDescription?: string;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  return key;
}

function isStripeErrorResponse(value: unknown): value is StripeErrorResponse {
  return Boolean(value && typeof value === "object" && "error" in value);
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
  init: { method: "GET" | "POST"; params?: URLSearchParams },
): Promise<T> {
  const response = await fetch(`${stripeApiBase()}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      ...(init.method === "POST"
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
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
    const message =
      isStripeErrorResponse(json) && json.error?.message
        ? json.error.message
        : "Stripe request failed.";
    throw new Error(message);
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
  if (input.customerEmail) {
    params.set("customer_email", input.customerEmail);
    params.set("payment_intent_data[receipt_email]", input.customerEmail);
  }
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
