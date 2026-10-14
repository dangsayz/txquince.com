/** TEST ONLY — drive the journey through the real route handlers. */
import { POST as commissionPOST } from "@/app/api/commission/route";
import { POST as adminActionPOST } from "@/app/api/admin/bookings/[id]/route";
import { POST as signPOST } from "@/app/api/my/sign/route";
import { POST as payPOST } from "@/app/api/my/pay/route";
import { POST as webhookPOST } from "@/app/api/stripe/webhook/route";
import { ESIGN_CONSENT } from "@/lib/contract-pdf";
import { NextRequest } from "next/server";
import { jsonRequest, OWNER, PNG, requestBody, signedWebhook, stripeEvent, tokenFrom, type Harness } from "./harness";

export const params = <T extends Record<string, string>>(p: T) => ({ params: Promise.resolve(p) });

export async function postRequest(over: Record<string, unknown> = {}) {
  const res = await commissionPOST(new NextRequest(jsonRequest("/api/commission", requestBody(over))));
  return { res, json: (await res.json()) as Record<string, unknown> };
}

/** Request → returns booking id + private token. */
export async function makeRequest(h: Harness, over: Record<string, unknown> = {}) {
  const { res, json } = await postRequest(over);
  if (res.status !== 200) throw new Error(`request failed ${res.status} ${JSON.stringify(json)}`);
  const email = String(over.email ?? "rosa@example.com");
  const date = String(over.event_date ?? "2027-04-17");
  const b = [...h.db.bookings.values()].find((x) => x.email === email && x.event_date === date)!;
  return { id: b.id, token: tokenFrom(String(json.link)) };
}

export async function adminAction(h: Harness, id: string, action: string, note?: string) {
  const prev = await h.deps.adminEmail!();
  h.setAdmin(OWNER);
  const res = await adminActionPOST(jsonRequest(`/api/admin/bookings/${id}`, { action, note }), params({ id }));
  h.setAdmin(prev);
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

export async function sign(token: string, over: Record<string, unknown> = {}) {
  const res = await signPOST(
    jsonRequest("/api/my/sign", { token, signedName: "Rosa Fictional", signature: PNG, consent: true, consentVersion: ESIGN_CONSENT.version, ...over }),
  );
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

export async function pay(token: string, kind: "deposit" | "balance") {
  const res = await payPOST(jsonRequest("/api/my/pay", { token, kind }));
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

/** Deliver checkout.session.completed for a fake-Stripe session. */
export async function completeCheckout(h: Harness, sessionId: string, opts: { eventId?: string; paymentIntent?: string; amount?: number } = {}) {
  const s = h.stripe.sessions.get(sessionId)!;
  h.stripe.complete(sessionId);
  const event = stripeEvent(
    "checkout.session.completed",
    {
      id: sessionId,
      object: "checkout.session",
      status: "complete",
      payment_status: "paid",
      payment_intent: opts.paymentIntent ?? `pi_${sessionId}`,
      client_reference_id: String(s.metadata.booking_id),
      amount_total: opts.amount ?? s.amount,
      currency: "usd",
      metadata: Object.fromEntries(Object.entries(s.metadata).map(([k, v]) => [k, String(v)])),
    },
    opts.eventId,
  );
  const res = await webhookPOST(new NextRequest(signedWebhook(event, h.now())));
  return { status: res.status, json: (await res.json()) as Record<string, unknown>, event };
}

/** Request → approve → sign → pay deposit → webhook. Returns ids. */
export async function bookThrough(h: Harness, over: Record<string, unknown> = {}) {
  const r = await makeRequest(h, over);
  await adminAction(h, r.id, "approve");
  await sign(r.token);
  const p = await pay(r.token, "deposit");
  const sessionId = String(p.json.url).split("/").pop()!;
  await completeCheckout(h, sessionId);
  return { ...r, sessionId };
}
