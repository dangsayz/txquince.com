#!/usr/bin/env node
/**
 * stripe-setup.mjs — one-time Stripe wiring for the commission checkout.
 *
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs [https://txquince.com]
 *
 * Idempotent: creates the webhook endpoint for /api/stripe/webhook, or updates
 * the existing one at that URL so it listens to exactly the events the app
 * handles. On creation Stripe returns the signing secret ONCE — the script
 * prints it so you can store it with `npx wrangler secret put STRIPE_WEBHOOK_SECRET`.
 * Run it once with a test key and once with the live key (separate endpoints).
 *
 * No products or prices are needed: checkout prices each retainer inline from
 * the price book in src/lib/commission.ts.
 */

const KEY = process.env.STRIPE_SECRET_KEY;
const SITE = (process.argv[2] || "https://txquince.com").replace(/\/+$/, "");
const URL = `${SITE}/api/stripe/webhook`;

// Must match the cases in src/app/api/stripe/webhook/route.ts.
const EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
];

if (!KEY || !/^sk_(test|live)_/.test(KEY)) {
  console.error("Set STRIPE_SECRET_KEY to a secret key (sk_test_… or sk_live_…).");
  process.exit(1);
}

async function stripe(path, { method = "GET", params } = {}) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params?.toString(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || `Stripe ${res.status}`);
  return json;
}

const form = () => {
  const p = new URLSearchParams();
  EVENTS.forEach((e, i) => p.set(`enabled_events[${i}]`, e));
  p.set("description", "TX Quince — commission retainers (homepage intake)");
  return p;
};

const mode = KEY.startsWith("sk_live_") ? "LIVE" : "TEST";
console.log(`Stripe ${mode} mode · endpoint ${URL}`);

const existing = (await stripe("/webhook_endpoints?limit=100")).data.find((w) => w.url === URL);

if (existing) {
  await stripe(`/webhook_endpoints/${existing.id}`, { method: "POST", params: form() });
  console.log(`Updated ${existing.id} with ${EVENTS.length} events.`);
  console.log("The signing secret is unchanged (Stripe only shows it at creation —");
  console.log("Dashboard → Developers → Webhooks → this endpoint → Reveal secret).");
} else {
  const p = form();
  p.set("url", URL);
  const created = await stripe("/webhook_endpoints", { method: "POST", params: p });
  console.log(`Created ${created.id}.`);
  console.log("\nSigning secret (store it now, it is not shown again):\n");
  console.log(`  ${created.secret}\n`);
  console.log("  npx wrangler secret put STRIPE_WEBHOOK_SECRET");
}

console.log("\nAlso set the API key on the Worker:  npx wrangler secret put STRIPE_SECRET_KEY");
console.log("Then enable ACH Direct Debit + Affirm/Klarna in Dashboard → Settings → Payment methods.");
