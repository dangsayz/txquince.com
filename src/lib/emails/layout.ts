/**
 * layout.ts — the shared look for every transactional email (same as the
 * original agreement-email.ts: alabaster page, white card, ink text, one
 * black button). All text is ink #111110 — no grey.
 */
import { site } from "@/content/site";
import type { Agreement } from "@/lib/agreement";
import { escapeHtml } from "@/lib/html-escape";

export type Lang = "en" | "es";
export const INK = "#111110";

/** HTML-escape, including quotes (attribute-safe) — the site-wide helper. */
export const esc = escapeHtml;

export type Built = { subject: string; html: string; text: string };

export function shell(title: string, bodyHtml: string, cta?: { url: string; label: string }, footHtml = "") {
  return `<!doctype html><html><body style="margin:0;background:#faf8f5;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:${INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5"><tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e2da">
      <tr><td style="padding:28px 28px 8px;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:${INK}">${esc(site.brand)}</td></tr>
      <tr><td style="padding:8px 28px 0;font-size:24px;line-height:1.25;font-weight:600;color:${INK}">${esc(title)}</td></tr>
      <tr><td style="padding:16px 28px 8px;font-size:16px;line-height:1.6;color:${INK}">${bodyHtml}</td></tr>
      ${
        cta
          ? `<tr><td style="padding:12px 28px 20px"><a href="${esc(cta.url)}" style="display:inline-block;background:${INK};color:#faf8f5;text-decoration:none;padding:14px 22px;font-size:16px;font-weight:600">${esc(cta.label)}</a></td></tr>`
          : ""
      }
      ${footHtml ? `<tr><td style="padding:0 28px 24px;font-size:14px;line-height:1.55;color:${INK}">${footHtml}</td></tr>` : `<tr><td style="padding:0 28px 12px"></td></tr>`}
    </table>
  </td></tr></table></body></html>`;
}

export const p = (text: string) => `<p style="margin:0 0 12px">${esc(text)}</p>`;

/** The private-link footer every family email carries. */
export function linkFoot(link: string, lang: Lang) {
  const label = lang === "es" ? "Tu página privada de reservación:" : "Your private booking page:";
  const keep =
    lang === "es"
      ? "Guarda este enlace. Es solo para tu familia — no lo compartas."
      : "Keep this link. It's just for your family — please don't share it.";
  return {
    html: `<p style="margin:0 0 4px">${esc(label)}<br><a href="${esc(link)}" style="color:${INK};word-break:break-all">${esc(link)}</a></p><p style="margin:0">${esc(keep)}</p>`,
    text: `${label}\n${link}\n${keep}`,
  };
}

export function prettyDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || "";

export function agreementHtml(a: Pick<Agreement, "title" | "intro" | "sections">) {
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
  </div>`;
}

/** Simple family email: paragraphs + optional button + the private-link footer. */
export function familyEmail(opts: {
  lang: Lang;
  subject: string;
  title: string;
  paragraphs: string[];
  link: string;
  cta?: { url: string; label: string };
  extraHtml?: string;
  extraText?: string;
}): Built {
  const foot = linkFoot(opts.link, opts.lang);
  const html = shell(opts.title, opts.paragraphs.map(p).join("") + (opts.extraHtml ?? ""), opts.cta, foot.html);
  const text = [
    ...opts.paragraphs,
    ...(opts.extraText ? ["", opts.extraText] : []),
    ...(opts.cta ? ["", `${opts.cta.label}: ${opts.cta.url}`] : []),
    "",
    foot.text,
  ].join("\n");
  return { subject: opts.subject, html, text };
}

/** Simple owner email (English). */
export function ownerEmail(opts: {
  subject: string;
  title: string;
  paragraphs: string[];
  adminUrl: string;
  ctaLabel?: string;
  preformatted?: string;
}): Built {
  const pre = opts.preformatted
    ? `<pre style="white-space:pre-wrap;font:14px/1.5 ui-monospace,Menlo,monospace;margin:0 0 8px;color:${INK}">${esc(opts.preformatted)}</pre>`
    : "";
  return {
    subject: opts.subject,
    html: shell(opts.title, opts.paragraphs.map(p).join("") + pre, { url: opts.adminUrl, label: opts.ctaLabel ?? "Open in admin" }),
    text: [...opts.paragraphs, ...(opts.preformatted ? ["", opts.preformatted] : []), "", opts.adminUrl].join("\n"),
  };
}
