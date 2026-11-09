/**
 * balance-fulfillment.ts — Stripe webhook → booking_payments for BALANCE
 * checkouts (metadata.flow === "balance"). Deposits keep their own path
 * (booking-fulfillment.ts); nothing here touches `bookings.status`.
 *
 * Every write is a conditional update keyed on the Stripe session id, so a
 * retried or replayed webhook can't double-count a payment or re-send emails:
 * only the request that moves a row INTO 'paid' sends the receipts.
 */
import "server-only";
import { Resend } from "resend";
import { getServiceSupabase } from "@/lib/supabase-server";
import type { StripeCheckoutSession } from "@/lib/stripe";
import { isSignedAgreement } from "@/lib/agreement";
import { balanceCentsFrom, paidCents } from "@/lib/balance";
import { formatEventDate } from "@/lib/booking";
import { usd } from "@/lib/commission";
import { escapeHtml as esc } from "@/lib/html-escape";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/content/site";

const NOT_SETTLED = ["opening", "open", "processing", "expired", "failed"];

type Row = { id: string; booking_id: string; amount_cents: number; currency: string; status: string };

async function rowForSession(session: StripeCheckoutSession): Promise<Row | null> {
  const { data } = await getServiceSupabase()
    .from("booking_payments")
    .select("id, booking_id, amount_cents, currency, status")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  const row = data as Row | null;
  // The session must be the one we opened for this exact row and booking.
  if (!row || session.metadata?.payment_id !== row.id || session.metadata?.booking_id !== row.booking_id) return null;
  return row;
}

/** checkout.session.completed / async_payment_succeeded for a balance checkout. */
export async function fulfillBalanceSession(session: StripeCheckoutSession): Promise<void> {
  const supabase = getServiceSupabase();
  const row = await rowForSession(session);
  if (!row) {
    console.error(`[balance] no ledger row for session ${session.id}`);
    return;
  }

  // Completed but the money is still settling (bank-type methods).
  if (session.payment_status !== "paid") {
    await supabase.from("booking_payments").update({ status: "processing" }).eq("id", row.id).in("status", ["opening", "open"]);
    return;
  }

  const amountOk =
    session.amount_total === row.amount_cents &&
    (session.currency ?? "").toLowerCase() === row.currency.toLowerCase();

  const { data: moved } = await supabase
    .from("booking_payments")
    .update({
      status: amountOk ? "paid" : "review",
      stripe_payment_intent_id: session.payment_intent,
      paid_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .in("status", NOT_SETTLED)
    .select("id");
  if (!moved || moved.length === 0) return; // already handled (webhook retry/replay)

  const { data: b } = await supabase
    .from("bookings")
    .select("id, name, email, event_date, metadata")
    .eq("id", row.booking_id)
    .maybeSingle();
  if (!b) return;
  const meta = (b.metadata ?? {}) as Record<string, unknown>;
  const agreement = isSignedAgreement(meta.agreement) ? meta.agreement : null;

  const { data: all } = await supabase
    .from("booking_payments")
    .select("status, amount_cents")
    .eq("booking_id", row.booking_id)
    .eq("kind", "balance");
  const balance = balanceCentsFrom(agreement?.balanceUsd) ?? 0;
  const paid = paidCents(all ?? []);
  const left = Math.max(0, balance - paid);
  const over = paid - balance;

  const date = formatEventDate(b.event_date);
  const amount = usd(row.amount_cents / 100);
  const adminUrl = `${getSiteUrl()}/admin/bookings`;

  const flags = [
    !amountOk && `AMOUNT MISMATCH: Stripe collected ${session.amount_total} ${session.currency}, expected ${row.amount_cents} ${row.currency}. Marked for review; check Stripe before doing anything.`,
    over > 0 && `OVERPAID by ${usd(over / 100)}. Refund the difference in Stripe.`,
  ].filter(Boolean) as string[];
  if (flags.length) console.error(`[balance] ${b.id}: ${flags.join(" ")}`);

  await sendOperator(
    `${flags.length ? "⚠️ Check: " : ""}Balance payment ${amount} — ${b.name}, ${date}`,
    [
      `${b.name} paid ${amount} toward the balance for ${date}.`,
      `Balance paid so far: ${usd(paid / 100)} of ${usd(balance / 100)}. Left: ${usd(left / 100)}.`,
      ...flags,
      `Stripe payment: ${session.payment_intent ?? "—"}`,
      adminUrl,
    ],
  );

  if (amountOk && b.email) {
    const es = agreement?.lang === "es";
    await sendClient(
      b.email,
      es ? `Recibimos tu pago de ${amount} — ${site.brand}` : `We got your ${amount} payment — ${site.brand}`,
      es
        ? [
            `Hola ${b.name.split(" ")[0]},`,
            `Recibimos tu pago de ${amount} para el ${date}. ¡Gracias!`,
            left > 0 ? `Te queda por pagar: ${usd(left / 100)}.` : "Tu saldo está pagado por completo.",
          ]
        : [
            `Hi ${b.name.split(" ")[0]},`,
            `We received your ${amount} payment for ${date}. Thank you!`,
            left > 0 ? `Left to pay: ${usd(left / 100)}.` : "Your balance is paid in full.",
          ],
    );
  }
}

/** checkout.session.expired for a balance checkout: just close the row. */
export async function expireBalanceSession(session: StripeCheckoutSession): Promise<void> {
  await getServiceSupabase()
    .from("booking_payments")
    .update({ status: "expired" })
    .eq("stripe_checkout_session_id", session.id)
    .in("status", ["opening", "open"]);
}

/** checkout.session.async_payment_failed for a balance checkout. */
export async function failBalanceSession(session: StripeCheckoutSession): Promise<void> {
  await getServiceSupabase()
    .from("booking_payments")
    .update({ status: "failed" })
    .eq("stripe_checkout_session_id", session.id)
    .in("status", ["opening", "open", "processing"]);
}

/** charge.refunded (full refund) on a balance payment. */
export async function refundBalancePayment(paymentIntentId: string): Promise<void> {
  const { error } = await getServiceSupabase()
    .from("booking_payments")
    .update({ status: "refunded" })
    .eq("stripe_payment_intent_id", paymentIntentId)
    .in("status", ["paid", "review"]);
  if (error) console.error("[balance] refund-sync failed:", error.message);
}

/* ------------------------------ email ------------------------------ */

let cached: Resend | null = null;
function resend(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}
const FROM = process.env.RESEND_FROM ?? `${site.brand} <hello@${site.domain}>`;

async function send(to: string, subject: string, lines: string[]) {
  const r = resend();
  if (!r) return;
  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#111110;max-width:560px">${lines
    .map((l) => `<p style="margin:0 0 12px">${esc(l)}</p>`)
    .join("")}<p style="margin:16px 0 0">${esc(site.brand)}</p></div>`;
  try {
    const { error } = await r.emails.send({
      from: FROM,
      to,
      replyTo: process.env.OPERATOR_NOTIFY_EMAIL || undefined,
      subject,
      text: [...lines, "", site.brand].join("\n"),
      html,
    });
    if (error) console.error("[balance] email:", error.message);
  } catch (err) {
    console.error("[balance] email:", err);
  }
}

async function sendOperator(subject: string, lines: string[]) {
  const to = process.env.OPERATOR_NOTIFY_EMAIL;
  if (to) await send(to, subject, lines);
}

async function sendClient(to: string, subject: string, lines: string[]) {
  await send(to, subject, lines);
}
