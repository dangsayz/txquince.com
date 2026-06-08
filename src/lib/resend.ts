/**
 * resend.ts — TWO transactional emails on a successful inquiry (server-only).
 *   #1 → operator: every field + a "reply within 24h" reminder (structured).
 *   #2 → inquirer: branded, warm auto-acknowledgment. Scarcity-aware: it does
 *        NOT promise the date is open — it promises a personal reply. Bilingual P.S.
 *
 * DELIVERABILITY (LAW — silently fails without this): Resend needs a VERIFIED
 * SENDING DOMAIN (SPF/DKIM) to send from hello@txquince.com. Until then, set
 * RESEND_FROM to "onboarding@resend.dev" for local testing only. See README.
 *
 * Clients are created lazily; missing env never crashes the build.
 */
import "server-only";
import { Resend } from "resend";
import { site } from "@/content/site";
import { getSiteUrl } from "@/lib/site-url";
import type { InquiryInput } from "@/lib/inquiry";
import {
  type BookingRecord,
  formatEventDate,
  formatMoney,
  packageLabel,
} from "@/lib/booking";

let cached: Resend | null = null;

function getResend(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM ?? `${site.brand} <hello@${site.domain}>`;
const WINE = "#6b2230";
const CREAM = "#faf7f2";
const INK = "#1a1a1a";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function field(label: string, value?: string): string {
  return `${label}: ${value && value.trim() ? value.trim() : "—"}`;
}

/** Email #1 → operator. Structured, everything visible, reply reminder. */
export async function sendOperatorEmail(
  data: InquiryInput,
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  const to = process.env.OPERATOR_NOTIFY_EMAIL;
  if (!resend) return { ok: false, error: "resend-not-configured" };
  if (!to) return { ok: false, error: "operator-email-not-set" };

  const lines = [
    "NEW INQUIRY — reply within 24 hours.",
    "",
    field("Name", data.name),
    field("Email", data.email),
    field("Phone", data.phone),
    field("Event date", data.event_date),
    field("Venue / city", data.venue),
    field("Services", data.services),
    field("Budget range", data.budget_range),
    field("How they heard", data.referral),
    "",
    "Message:",
    data.message?.trim() ? data.message.trim() : "—",
  ].join("\n");

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,Arial,sans-serif;color:${INK};max-width:560px">
    <p style="font-weight:600;color:${WINE};margin:0 0 4px">New inquiry — reply within 24 hours.</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      ${[
        ["Name", data.name],
        ["Email", `<a href="mailto:${esc(data.email)}">${esc(data.email)}</a>`],
        ["Phone", data.phone ? `<a href="tel:${esc(data.phone)}">${esc(data.phone)}</a>` : "—"],
        ["Event date", data.event_date || "—"],
        ["Venue / city", data.venue || "—"],
        ["Services", data.services],
        ["Budget range", data.budget_range],
        ["How they heard", data.referral || "—"],
      ]
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 12px 6px 0;color:#8a837b;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0">${v}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="font-size:14px;color:#8a837b;margin:16px 0 4px">Message</p>
    <p style="font-size:14px;white-space:pre-wrap;margin:0">${data.message?.trim() ? esc(data.message.trim()) : "—"}</p>
  </div>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: data.email,
      subject: `New quince inquiry — ${data.name} (${data.budget_range})`,
      text: lines,
      html,
    });
    if (error) return { ok: false, error: String(error.message ?? error) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/** Email #2 → inquirer. Branded acknowledgment. Does NOT promise availability. */
export async function sendInquirerEmail(
  data: InquiryInput,
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, error: "resend-not-configured" };

  const subject = `Thank you — I'll personally reach out within 24 hours · ${site.brand}`;

  const text = [
    `Hi ${data.name.split(" ")[0]},`,
    "",
    "Thank you for reaching out about your daughter's quinceañera.",
    "",
    "I'll personally reply within 24 hours to confirm whether your date is open. I take a limited number of celebrations each season, so if your date is already reserved I'll let you know honestly and add you to the cancellation waitlist.",
    "",
    "Talk soon,",
    site.brand,
    `${site.url}`,
    "",
    "— — —",
    "P.D. (Español): Gracias por escribir. Te responderé personalmente dentro de 24 horas para confirmar si tu fecha está disponible.",
  ].join("\n");

  const html = `
  <div style="background:${CREAM};padding:32px 0;font-family:ui-sans-serif,system-ui,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#fffdf9;border:1px solid #e6ddd1;border-radius:6px;overflow:hidden">
      <div style="padding:28px 32px;border-bottom:1px solid #e6ddd1">
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:-0.01em;color:${INK}">${site.brand}</span>
      </div>
      <div style="padding:32px">
        <p style="margin:0 0 16px;font-size:16px;color:${INK}">Hi ${esc(data.name.split(" ")[0])},</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#56504a">Thank you for reaching out about your daughter's quinceañera.</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#56504a">
          I'll personally reply <strong style="color:${INK}">within 24 hours</strong> to confirm whether your date is open. I take a limited number of celebrations each season — so if your date is already reserved, I'll tell you honestly and add you to the cancellation waitlist.
        </p>
        <p style="margin:24px 0 4px;font-size:15px;color:${INK}">Talk soon,</p>
        <p style="margin:0;font-size:15px;color:${INK}">${site.brand}</p>
        <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #e6ddd1;font-size:13px;line-height:1.6;color:#8a837b">
          <em>P.D. (Español):</em> Gracias por escribir. Te responderé personalmente dentro de 24 horas para confirmar si tu fecha está disponible.
        </p>
      </div>
    </div>
    <p style="max-width:520px;margin:16px auto 0;text-align:center;font-size:12px;color:#8a837b">${site.serviceArea} · <a href="${site.url}" style="color:${WINE}">${site.domain}</a></p>
  </div>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: data.email,
      subject,
      text,
      html,
    });
    if (error) return { ok: false, error: String(error.message ?? error) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ============================================================================
// BOOKING emails — sent from the Stripe webhook AFTER a deposit is paid.
//   #1 → operator: the date is locked, here's who + what + how much.
//   #2 → client: confirmation that their date is reserved (only when 'paid').
// ============================================================================

/** Email #1 → operator. Fires on every paid deposit (and review cases). */
export async function sendBookingOperatorEmail(
  booking: BookingRecord,
  opts: { review?: boolean } = {},
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  const to = process.env.OPERATOR_NOTIFY_EMAIL;
  if (!resend) return { ok: false, error: "resend-not-configured" };
  if (!to) return { ok: false, error: "operator-email-not-set" };

  const dateStr = formatEventDate(booking.event_date);
  const deposit = formatMoney(booking.deposit_amount_cents, booking.currency);
  const headline = opts.review
    ? "DEPOSIT PAID — needs review (possible date conflict)."
    : `DATE RESERVED — ${deposit} deposit paid.`;

  const lines = [
    headline,
    "",
    field("Name", booking.name),
    field("Email", booking.email),
    field("Phone", booking.phone ?? ""),
    field("Event date", dateStr),
    field("Package", packageLabel(booking.package)),
    field("Deposit paid", deposit),
    "",
    "Notes:",
    booking.notes?.trim() ? booking.notes.trim() : "—",
  ].join("\n");

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,Arial,sans-serif;color:${INK};max-width:560px">
    <p style="font-weight:600;color:${WINE};margin:0 0 4px">${esc(headline)}</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      ${[
        ["Name", esc(booking.name)],
        ["Email", `<a href="mailto:${esc(booking.email)}">${esc(booking.email)}</a>`],
        ["Phone", booking.phone ? `<a href="tel:${esc(booking.phone)}">${esc(booking.phone)}</a>` : "—"],
        ["Event date", esc(dateStr)],
        ["Package", esc(packageLabel(booking.package))],
        ["Deposit paid", esc(deposit)],
      ]
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 12px 6px 0;color:#8a837b;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0">${v}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="font-size:14px;color:#8a837b;margin:16px 0 4px">Notes</p>
    <p style="font-size:14px;white-space:pre-wrap;margin:0">${booking.notes?.trim() ? esc(booking.notes.trim()) : "—"}</p>
  </div>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: booking.email,
      subject: opts.review
        ? `⚠ Booking needs review — ${booking.name} (${dateStr})`
        : `Date reserved — ${booking.name} · ${dateStr}`,
      text: lines,
      html,
    });
    if (error) return { ok: false, error: String(error.message ?? error) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/** Email #2 → client. Their date is locked in. Only sent for 'paid' bookings. */
export async function sendBookingClientEmail(
  booking: BookingRecord,
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, error: "resend-not-configured" };

  const firstName = booking.name.split(" ")[0];
  const dateStr = formatEventDate(booking.event_date);
  const deposit = formatMoney(booking.deposit_amount_cents, booking.currency);
  const subject = `Your date is reserved — ${dateStr} · ${site.brand}`;

  const text = [
    `Hi ${firstName},`,
    "",
    `Your date is officially reserved: ${dateStr}.`,
    "",
    `I've received your ${deposit} deposit, and it's applied to your final balance. Your day is held just for you — I won't take another celebration on this date.`,
    "",
    "I'll be in touch personally over the next day or two to start planning the details — timeline, locations, and what matters most to your family.",
    "",
    "Can't wait to capture her day.",
    site.brand,
    `${site.url}`,
    "",
    "— — —",
    `P.D. (Español): ¡Tu fecha está reservada! Recibí tu depósito de ${deposit}, aplicado a tu balance final. Me pondré en contacto personalmente para planear los detalles.`,
  ].join("\n");

  const html = `
  <div style="background:${CREAM};padding:32px 0;font-family:ui-sans-serif,system-ui,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#fffdf9;border:1px solid #e6ddd1;border-radius:6px;overflow:hidden">
      <div style="padding:28px 32px;border-bottom:1px solid #e6ddd1">
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:-0.01em;color:${INK}">${site.brand}</span>
      </div>
      <div style="padding:32px">
        <p style="margin:0 0 16px;font-size:16px;color:${INK}">Hi ${esc(firstName)},</p>
        <p style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.12em;color:${WINE}">Your date is reserved</p>
        <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.2;color:${INK}">${esc(dateStr)}</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#56504a">
          I've received your <strong style="color:${INK}">${esc(deposit)} deposit</strong> — it's applied to your final balance. Your day is held just for you; I won't take another celebration on this date.
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#56504a">
          I'll reach out personally over the next day or two to start planning the details — timeline, locations, and what matters most to your family.
        </p>
        <p style="margin:24px 0 4px;font-size:15px;color:${INK}">Can't wait to capture her day,</p>
        <p style="margin:0;font-size:15px;color:${INK}">${site.brand}</p>
        <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #e6ddd1;font-size:13px;line-height:1.6;color:#8a837b">
          <em>P.D. (Español):</em> ¡Tu fecha está reservada! Recibí tu depósito de ${esc(deposit)}, aplicado a tu balance final. Me pondré en contacto para planear los detalles.
        </p>
      </div>
    </div>
    <p style="max-width:520px;margin:16px auto 0;text-align:center;font-size:12px;color:#8a837b">${site.serviceArea} · <a href="${site.url}" style="color:${WINE}">${site.domain}</a></p>
  </div>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: booking.email,
      subject,
      text,
      html,
    });
    if (error) return { ok: false, error: String(error.message ?? error) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ============================================================================
// FOLLOW-UP SEQUENCE — sent by /api/cron/followups to leads that haven't booked.
// 3 value-add touches (galleries → payment plans → soft scarcity). Each carries a
// one-click unsubscribe (CAN-SPAM). The instant acknowledgment is "touch 0".
// ============================================================================

export type FollowupRecipient = {
  id: string; // inquiry id — doubles as the unsubscribe token
  name: string;
  email: string;
};

/** Branded email shell shared by every follow-up touch. */
function followupHtml(opts: {
  firstName: string;
  bodyHtml: string;
  ctaUrl: string;
  ctaLabel: string;
  unsubscribeUrl: string;
}): string {
  return `
  <div style="background:${CREAM};padding:32px 0;font-family:ui-sans-serif,system-ui,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#fffdf9;border:1px solid #e6ddd1;border-radius:6px;overflow:hidden">
      <div style="padding:24px 32px;border-bottom:1px solid #e6ddd1">
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${INK}">${site.brand}</span>
      </div>
      <div style="padding:32px">
        <p style="margin:0 0 16px;font-size:16px;color:${INK}">Hi ${esc(opts.firstName)},</p>
        ${opts.bodyHtml}
        <p style="margin:28px 0 0">
          <a href="${opts.ctaUrl}" style="display:inline-block;background:${WINE};color:${CREAM};text-decoration:none;padding:13px 28px;border-radius:999px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase">${esc(opts.ctaLabel)}</a>
        </p>
      </div>
    </div>
    <p style="max-width:520px;margin:16px auto 0;text-align:center;font-size:12px;color:#8a837b">
      ${site.brand} · ${site.serviceArea}<br/>
      Not planning a quinceañera anymore? <a href="${opts.unsubscribeUrl}" style="color:#8a837b">Unsubscribe</a> and I won't reach out again.
    </p>
  </div>`;
}

/**
 * Send follow-up touch `step` (1, 2, or 3) to a lead. Returns {ok:false} for any
 * out-of-range step so the cron never advances past the sequence.
 */
export async function sendFollowupEmail(
  recipient: FollowupRecipient,
  step: number,
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, error: "resend-not-configured" };

  const firstName = recipient.name.split(" ")[0] || "there";
  const siteUrl = getSiteUrl();
  const reserveUrl = `${siteUrl}${site.cta.href}`;
  const galleryUrl = `${siteUrl}/portfolio`;
  const investmentUrl = `${siteUrl}/investment`;
  const unsubscribeUrl = `${siteUrl}/api/unsubscribe?id=${encodeURIComponent(recipient.id)}`;

  let subject: string;
  let text: string;
  let bodyHtml: string;
  let ctaUrl = reserveUrl;
  let ctaLabel = "Reserve your date";

  if (step === 1) {
    subject = `Did you get a chance to look, ${firstName}?`;
    ctaUrl = galleryUrl;
    ctaLabel = "See the galleries";
    text = [
      `Hi ${firstName},`,
      "",
      "Just circling back on your daughter's quinceañera. No pressure at all — I know there's a lot to plan.",
      "",
      `If it helps, here are full galleries and films from real DFW celebrations (not just highlights): ${galleryUrl}`,
      "",
      `Pricing is fixed and on the site — collections from $2,500, and most families choose Signature at $3,900: ${investmentUrl}`,
      "",
      "Whenever you're ready, just reply here and I'll confirm whether your date is open.",
      "",
      site.brand,
    ].join("\n");
    bodyHtml = `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#56504a">Just circling back on your daughter&apos;s quinceañera — no pressure at all, I know there&apos;s a lot to plan.</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#56504a">If it helps, here are <a href="${galleryUrl}" style="color:${WINE}">full galleries and films</a> from real DFW celebrations — not just highlights, so you see exactly what you&apos;d be getting. Pricing is <a href="${investmentUrl}" style="color:${WINE}">fixed and right on the site</a>: collections from $2,500, and most families choose Signature at $3,900.</p>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#56504a">Whenever you&apos;re ready, just reply and I&apos;ll confirm whether your date is open.</p>`;
  } else if (step === 2) {
    subject = "The part most families ask about: paying for it";
    text = [
      `Hi ${firstName},`,
      "",
      "One thing I want to make easy: you don't pay it all at once.",
      "",
      "You reserve your date with a deposit, and split the balance into interest-free installments before the day — pay in full or in payments, your choice at checkout.",
      "",
      `Reserving takes about two minutes and locks your date instantly (I only book one quinceañera per day): ${reserveUrl}`,
      "",
      "If you have any questions about the collections or the timeline, just reply — I read every message.",
      "",
      site.brand,
    ].join("\n");
    bodyHtml = `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#56504a">One thing I want to make easy: <strong style="color:${INK}">you don&apos;t pay it all at once.</strong></p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#56504a">You reserve your date with a deposit and split the balance into interest-free installments before the day — pay in full or in payments, your choice at checkout.</p>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#56504a">Reserving takes about two minutes and locks your date instantly — I only book one quinceañera per day. Questions about the collections or timeline? Just reply; I read every message.</p>`;
  } else if (step === 3) {
    subject = "Last check on your date";
    text = [
      `Hi ${firstName},`,
      "",
      "I don't want to keep filling your inbox, so this is my last note unless I hear from you.",
      "",
      "I book a limited number of quinceañeras each season, and I'm still holding a window near your date — but those go to whoever reserves first.",
      "",
      `If you'd like me to hold your day, you can reserve it here: ${reserveUrl}`,
      "",
      "And if the timing changed or you've booked elsewhere, no hard feelings at all — just let me know and I'll close out your file.",
      "",
      site.brand,
    ].join("\n");
    bodyHtml = `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#56504a">I don&apos;t want to keep filling your inbox, so this is my last note unless I hear from you.</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#56504a">I book a limited number of quinceañeras each season, and I&apos;m still holding a window near your date — but those go to whoever reserves first.</p>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#56504a">If the timing changed or you&apos;ve booked elsewhere, no hard feelings at all — just reply and I&apos;ll close out your file.</p>`;
  } else {
    return { ok: false, error: "step-out-of-range" };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: recipient.email,
      subject,
      text: `${text}\n\n— — —\nUnsubscribe: ${unsubscribeUrl}`,
      html: followupHtml({ firstName, bodyHtml, ctaUrl, ctaLabel, unsubscribeUrl }),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (error) return { ok: false, error: String(error.message ?? error) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
