/**
 * agreement-email.ts — emails for the sign → approve → pay booking flow.
 *
 *   signed   → operator: a new signed agreement is waiting for approval.
 *   signed   → family:   a copy of what they signed + what happens next.
 *   approved → family:   their pay link for the deposit (percent from the signed agreement).
 *   declined → family:   we can't take the date; nothing was charged.
 *
 * Bilingual by the family's chosen language. Missing Resend env never throws.
 */
import "server-only";
import { Resend } from "resend";
import { site } from "@/content/site";
import { agreementToText, signedDepositPercent, type SignedAgreement } from "@/lib/agreement";
import { usd } from "@/lib/commission";

type Result = { ok: boolean; error?: string };
type Lang = "en" | "es";

let cached: Resend | null = null;
function resend(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

const FROM = process.env.RESEND_FROM ?? `${site.brand} <hello@${site.domain}>`;
const INK = "#111110";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function shell(title: string, body: string, cta?: { url: string; label: string }) {
  return `<!doctype html><html><body style="margin:0;background:#faf8f5;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:${INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5"><tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e2da">
      <tr><td style="padding:28px 28px 8px;font-size:13px;letter-spacing:.18em;text-transform:uppercase">${esc(site.brand)}</td></tr>
      <tr><td style="padding:8px 28px 0;font-size:24px;line-height:1.25;font-weight:600">${esc(title)}</td></tr>
      <tr><td style="padding:16px 28px 8px;font-size:16px;line-height:1.6">${body}</td></tr>
      ${
        cta
          ? `<tr><td style="padding:12px 28px 28px"><a href="${esc(cta.url)}" style="display:inline-block;background:${INK};color:#faf8f5;text-decoration:none;padding:14px 22px;font-size:16px;font-weight:600">${esc(cta.label)}</a></td></tr>`
          : `<tr><td style="padding:0 28px 20px"></td></tr>`
      }
    </table>
  </td></tr></table></body></html>`;
}

function agreementHtml(a: SignedAgreement) {
  const sections = a.sections
    .map(
      (s) =>
        `<p style="margin:18px 0 6px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;font-weight:600">${esc(s.title)}</p>` +
        `<ul style="margin:0;padding-left:18px">${s.lines.map((l) => `<li style="margin:2px 0">${esc(l)}</li>`).join("")}</ul>`,
    )
    .join("");
  return `<div style="margin-top:16px;padding:16px;border:1px solid #e7e2da;font-size:15px;line-height:1.55">
    <p style="margin:0 0 8px;font-weight:600">${esc(a.title)}</p>
    <p style="margin:0">${esc(a.intro)}</p>${sections}
    <p style="margin:18px 0 0">${a.lang === "es" ? "Firmado por" : "Signed by"} <strong>${esc(a.signedName)}</strong> · ${esc(new Date(a.signedAt).toUTCString())}</p>
  </div>`;
}

async function send(to: string, subject: string, text: string, html: string): Promise<Result> {
  const r = resend();
  if (!r) return { ok: false, error: "resend-not-configured" };
  try {
    const { error } = await r.emails.send({
      from: FROM,
      to,
      replyTo: process.env.OPERATOR_NOTIFY_EMAIL || undefined,
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

type BookingLite = { id: string; name: string; email: string; event_date: string };

const first = (name: string) => name.trim().split(/\s+/)[0] || "";

function prettyDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

/** → operator: a signed agreement is waiting for approval. */
export async function sendAgreementSignedOperator(
  b: BookingLite,
  a: SignedAgreement,
  adminUrl: string,
  summary: string,
): Promise<Result> {
  const to = process.env.OPERATOR_NOTIFY_EMAIL;
  if (!to) return { ok: false, error: "no-operator-email" };
  const date = prettyDate(b.event_date, "en");
  const subject = `New signed agreement — ${b.name}, ${date}`;
  const text = [
    `${b.name} signed the booking agreement for ${date}.`,
    `The date is held while you review. Approve it to email them their deposit link:`,
    adminUrl,
    "",
    summary,
    "",
    agreementToText(a),
  ].join("\n");
  const html = shell(
    "New signed agreement",
    `<p style="margin:0 0 12px"><strong>${esc(b.name)}</strong> signed for <strong>${esc(date)}</strong>. The date is held while you review. Approve it and they'll get their deposit link by email.</p>
     <pre style="white-space:pre-wrap;font:14px/1.5 ui-monospace,Menlo,monospace;margin:0 0 8px">${esc(summary)}</pre>${agreementHtml(a)}`,
    { url: adminUrl, label: "Review & approve" },
  );
  return send(to, subject, text, html);
}

/** → family: copy of what they signed + what happens next. */
export async function sendAgreementSignedClient(b: BookingLite, a: SignedAgreement): Promise<Result> {
  const es = a.lang === "es";
  const name = first(b.name);
  const date = prettyDate(b.event_date, a.lang);
  const subject = es ? `Recibimos tu contrato firmado — ${date}` : `We got your signed agreement — ${date}`;
  const lead = es
    ? `¡Gracias, ${name}! Recibimos tu contrato firmado. Apartamos el ${date} para ti mientras lo revisamos — te escribimos en un día. Cuando lo aprobemos, te llegará un enlace para pagar tu depósito del ${signedDepositPercent(a)}% (${usd(a.depositUsd)}).`
    : `Thank you, ${name}! We got your signed agreement. ${date} is held for you while we review it — we'll write within one day. Once we approve it, you'll get a link to pay your ${signedDepositPercent(a)}% deposit (${usd(a.depositUsd)}).`;
  const text = [lead, "", agreementToText(a)].join("\n");
  const html = shell(es ? "Recibimos tu contrato" : "We got your agreement", `<p style="margin:0">${esc(lead)}</p>${agreementHtml(a)}`);
  return send(b.email, subject, text, html);
}

/** → operator: a new booking REQUEST (unsigned) is waiting for confirmation. */
export async function sendBookingRequestOperator(b: BookingLite, adminUrl: string, summary: string): Promise<Result> {
  const to = process.env.OPERATOR_NOTIFY_EMAIL;
  if (!to) return { ok: false, error: "no-operator-email" };
  const date = prettyDate(b.event_date, "en");
  const subject = `New booking request — ${b.name}, ${date}`;
  const lead = `${b.name} asked to book ${date}. The date is held while you confirm. Nothing is signed or paid yet: the family signs the agreement and pays the deposit after you confirm.`;
  const text = [lead, adminUrl, "", summary].join("\n");
  const html = shell(
    "New booking request",
    `<p style="margin:0 0 12px">${esc(lead)}</p>
     <pre style="white-space:pre-wrap;font:14px/1.5 ui-monospace,Menlo,monospace;margin:0 0 8px">${esc(summary)}</pre>`,
    { url: adminUrl, label: "Review request" },
  );
  return send(to, subject, text, html);
}

/** → family: we got your request; what happens next. Numbers come from the server's own quote. */
export async function sendBookingRequestClient(
  b: BookingLite,
  r: { lang: Lang; holdDays: number; depositPercent: number; depositUsd: number; totalUsd: number },
): Promise<Result> {
  const es = r.lang === "es";
  const name = first(b.name);
  const date = prettyDate(b.event_date, r.lang);
  const subject = es ? `Recibimos tu solicitud — ${date}` : `We got your request — ${date}`;
  const lead = es
    ? `¡Gracias, ${name}! Recibimos tu solicitud para el ${date}. Tu fecha queda apartada ${r.holdDays} días mientras la confirmamos — te escribimos en un día. Luego firmas el contrato y pagas tu depósito del ${r.depositPercent}% (${usd(r.depositUsd)}) en tu página privada. Total: ${usd(r.totalUsd)}. Hoy no se cobró nada.`
    : `Thank you, ${name}! We got your request for ${date}. Your date is held for ${r.holdDays} days while we confirm — we'll write within one day. Then you sign the agreement and pay your ${r.depositPercent}% deposit (${usd(r.depositUsd)}) on your private page. Total: ${usd(r.totalUsd)}. Nothing was charged today.`;
  return send(b.email, subject, lead, shell(es ? "Recibimos tu solicitud" : "We got your request", `<p style="margin:0">${esc(lead)}</p>`));
}

/** → family: approved; here's the deposit link. */
export async function sendAgreementApprovedClient(
  b: BookingLite,
  lang: Lang,
  payUrl: string,
  depositUsd: number,
  /** The percent in the SIGNED agreement (not the current price book). */
  depositPercent: number,
): Promise<Result> {
  const es = lang === "es";
  const name = first(b.name);
  const date = prettyDate(b.event_date, lang);
  const subject = es ? `¡Aprobado! Aparta el ${date} con tu depósito` : `Approved! Lock in ${date} with your deposit`;
  const lead = es
    ? `¡Buenas noticias, ${name}! Aprobamos tu reservación para el ${date}. Paga tu depósito del ${depositPercent}% (${usd(depositUsd)}) para confirmarla. Tu fecha sigue apartada mientras tanto.`
    : `Great news, ${name}! We approved your booking for ${date}. Pay your ${depositPercent}% deposit (${usd(depositUsd)}) to make it final. Your date stays held until then.`;
  const text = [lead, "", payUrl].join("\n");
  const html = shell(es ? "Tu reservación fue aprobada" : "Your booking is approved", `<p style="margin:0">${esc(lead)}</p>`, {
    url: payUrl,
    label: es ? `Pagar depósito de ${usd(depositUsd)}` : `Pay ${usd(depositUsd)} deposit`,
  });
  return send(b.email, subject, text, html);
}

/** → family: we can't take the date. */
export async function sendAgreementDeclinedClient(b: BookingLite, lang: Lang): Promise<Result> {
  const es = lang === "es";
  const name = first(b.name);
  const date = prettyDate(b.event_date, lang);
  const subject = es ? `Sobre tu fecha del ${date}` : `About your date, ${date}`;
  const lead = es
    ? `Hola ${name}, lo sentimos mucho — no podemos tomar el ${date}. No se te cobró nada. Si tienes otra fecha en mente, responde a este correo y con gusto te ayudamos.`
    : `Hi ${name}, we're so sorry — we can't take ${date}. You haven't been charged anything. If another date could work, just reply to this email and we'll gladly help.`;
  return send(b.email, subject, lead, shell(es ? "Sobre tu fecha" : "About your date", `<p style="margin:0">${esc(lead)}</p>`));
}
