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
import type { InquiryInput } from "@/lib/inquiry";

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
