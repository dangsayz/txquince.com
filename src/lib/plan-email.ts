/**
 * plan-email.ts — the two emails a new quince plan sends (server-only).
 *
 *   family   → their private plan link, in their language (only when they
 *              gave an email; phone-only families get the link on screen and
 *              a text from the owner).
 *   operator → every lead detail, the source tag, and links to the plan and
 *              the admin list, so the owner can reply in the Facebook thread
 *              or by text within minutes.
 *
 * Missing Resend env never throws: the plan is already saved.
 */
import "server-only";
import { Resend } from "resend";
import { site } from "@/content/site";
import { escapeHtml as esc } from "@/lib/html-escape";
import { colorLabel } from "@/lib/quince-colors";
import { formatPlanDate, type DateStatus, type PlanRecord } from "@/lib/plan";

type Result = { ok: boolean; error?: string };

let cached: Resend | null = null;
function resend(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

const FROM = process.env.RESEND_FROM ?? `${site.brand} <hello@${site.domain}>`;
const WINE = "#8a6f43";
const CREAM = "#faf7f2";
const INK = "#1a1a1a";
const MUTED = "#56504a";

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

function shell(inner: string): string {
  return `
  <div style="background:${CREAM};padding:32px 0;font-family:ui-sans-serif,system-ui,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#fffdf9;border:1px solid #e6ddd1;border-radius:6px;overflow:hidden">
      <div style="padding:28px 32px;border-bottom:1px solid #e6ddd1">
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:-0.01em;color:${INK}">${site.brand}</span>
      </div>
      <div style="padding:32px">${inner}</div>
    </div>
    <p style="max-width:520px;margin:16px auto 0;text-align:center;font-size:12px;color:#8a837b">${site.serviceArea} · <a href="${site.url}" style="color:${WINE}">${site.domain}</a></p>
  </div>`;
}

/** Family → their plan link. Skipped (ok:true, skipped) for phone-only plans. */
export async function sendPlanFamilyEmail(plan: PlanRecord, planUrl: string): Promise<Result & { skipped?: boolean }> {
  if (!plan.email) return { ok: true, skipped: true };
  const client = resend();
  if (!client) return { ok: false, error: "resend-not-configured" };

  const es = plan.language === "es";
  const date = formatPlanDate(plan.event_date, plan.language);
  const name = firstName(plan.name);
  const t = es
    ? {
        subject: `Tu plan de quince para el ${date} · ${site.brand}`,
        hi: `Hola ${name},`,
        lead: `Aquí está el plan de quince de tu familia para el ${date}. Lo puedes abrir cuando quieras:`,
        button: "Ver mi plan",
        inside: "Adentro encuentras fotos de nuestro trabajo en tus colores, la disponibilidad de tu fecha, nuestros paquetes con precio y un cronograma gratis del día.",
        reply: `¿Preguntas? Contesta este correo o mándanos un mensaje al ${site.contact.phone}. Contestamos en español o inglés.`,
        bye: "Con cariño,",
      }
    : {
        subject: `Your quince plan for ${date} · ${site.brand}`,
        hi: `Hi ${name},`,
        lead: `Here is your family's quince plan for ${date}. Open it anytime:`,
        button: "See my plan",
        inside: "Inside: photos of our work in your colors, your date's availability, our packages with prices, and a free quince-day timeline.",
        reply: `Questions? Reply to this email or text us at ${site.contact.phone}. We answer in English or Spanish.`,
        bye: "Warmly,",
      };

  const text = [t.hi, "", t.lead, planUrl, "", t.inside, "", t.reply, "", t.bye, site.brand].join("\n");
  const html = shell(`
        <p style="margin:0 0 16px;font-size:16px;color:${INK}">${esc(t.hi)}</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${MUTED}">${esc(t.lead)}</p>
        <p style="margin:0 0 24px"><a href="${esc(planUrl)}" style="display:inline-block;background:${INK};color:#faf8f5;text-decoration:none;padding:14px 22px;font-size:15px;border-radius:2px">${esc(t.button)}</a></p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${MUTED}">${esc(t.inside)}</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${MUTED}">${esc(t.reply)}</p>
        <p style="margin:24px 0 4px;font-size:15px;color:${INK}">${esc(t.bye)}</p>
        <p style="margin:0;font-size:15px;color:${INK}">${site.brand}</p>`);

  try {
    const { error } = await client.emails.send({ from: FROM, to: plan.email, subject: t.subject, text, html });
    if (error) return { ok: false, error: String(error.message ?? error) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/** Operator → the lead, with the source tag and quick-reply links. */
export async function sendPlanOperatorEmail(
  plan: PlanRecord,
  links: { planUrl: string; adminUrl: string },
  dateStatus: DateStatus,
): Promise<Result> {
  const client = resend();
  const to = process.env.OPERATOR_NOTIFY_EMAIL;
  if (!client) return { ok: false, error: "resend-not-configured" };
  if (!to) return { ok: false, error: "operator-email-not-set" };

  const date = formatPlanDate(plan.event_date, "en");
  const colors = plan.colors.map((c) => colorLabel(c, "en")).join(", ") || "—";
  const source = plan.source ?? plan.attribution?.source ?? "—";
  const rows: [string, string][] = [
    ["Name", esc(plan.name)],
    ["Phone", plan.phone ? `<a href="tel:${esc(plan.phone)}">${esc(plan.phone)}</a> · <a href="sms:${esc(plan.phone)}">text</a>` : "—"],
    ["Email", plan.email ? `<a href="mailto:${esc(plan.email)}">${esc(plan.email)}</a>` : "—"],
    ["Date", `${esc(date)} (${dateStatus})`],
    ["City", esc(plan.city)],
    ["Colors", esc(colors)],
    ["Theme", plan.theme ? esc(plan.theme) : "—"],
    ["Language", plan.language === "es" ? "Español" : "English"],
    ["Source", esc(source)],
  ];
  const text = [
    "NEW QUINCE PLAN — reply in the thread or text within the hour.",
    "",
    `Name: ${plan.name}`,
    `Phone: ${plan.phone ?? "—"}`,
    `Email: ${plan.email ?? "—"}`,
    `Date: ${date} (${dateStatus})`,
    `City: ${plan.city}`,
    `Colors: ${colors}`,
    `Theme: ${plan.theme ?? "—"}`,
    `Language: ${plan.language === "es" ? "Español" : "English"}`,
    `Source: ${source}`,
    "",
    `Their plan: ${links.planUrl}`,
    `All plans: ${links.adminUrl}`,
  ].join("\n");

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,Arial,sans-serif;color:${INK};max-width:560px">
    <p style="font-weight:600;color:${WINE};margin:0 0 4px">New quince plan — reply within the hour.</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 12px 6px 0;color:#8a837b;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0">${v}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="font-size:14px;margin:16px 0 4px"><a href="${esc(links.planUrl)}">Open their plan</a> · <a href="${esc(links.adminUrl)}">All plans</a></p>
  </div>`;

  try {
    const { error } = await client.emails.send({
      from: FROM,
      to,
      ...(plan.email ? { replyTo: plan.email } : {}),
      subject: `New quince plan — ${plan.name} · ${date} · ${source}`,
      text,
      html,
    });
    if (error) return { ok: false, error: String(error.message ?? error) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
