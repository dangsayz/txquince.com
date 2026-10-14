/** → family: the owner replied to their message. */
import { esc, familyEmail, firstName, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function ownerReplyEmail(c: FamilyCtx & { body: string }): Built {
  const es = c.lang === "es";
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: es ? `Respuesta de TX Quince (${c.ref})` : `A reply from TX Quince (${c.ref})`,
    title: es ? "Te respondimos" : "We wrote back",
    paragraphs: [es ? `Hola ${firstName(c.name)},` : `Hi ${firstName(c.name)},`],
    extraHtml: `<div style="margin:0 0 12px;padding:12px 16px;border-left:3px solid #111110;white-space:pre-wrap">${esc(c.body)}</div>`,
    extraText: c.body,
    cta: { url: c.link, label: es ? "Ver y responder" : "See and reply" },
  });
}
