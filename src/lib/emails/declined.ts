/** → family, when the owner declines a request. */
import { familyEmail, firstName, prettyDate, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function declinedEmail(c: FamilyCtx & { reason?: string }): Built {
  const es = c.lang === "es";
  const date = prettyDate(c.eventDate, c.lang);
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: es ? `Sobre tu fecha del ${date}` : `About your date, ${date}`,
    title: es ? "Sobre tu fecha" : "About your date",
    paragraphs: [
      ...(es
        ? [
            `Hola ${firstName(c.name)}, lo sentimos mucho — no podemos tomar el ${date}. No se te cobró nada.`,
            "Si otra fecha te funciona, responde a este correo o escríbenos desde tu página y con gusto te ayudamos.",
          ]
        : [
            `Hi ${firstName(c.name)}, we're so sorry — we can't take ${date}. You haven't been charged anything.`,
            "If another date could work, reply to this email or write to us from your page and we'll gladly help.",
          ]),
      ...(c.reason ? [c.reason] : []),
    ],
  });
}
