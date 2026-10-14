/** → family: an APPROVED hold ran out with nothing paid. */
import { familyEmail, firstName, prettyDate, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function holdExpiredEmail(c: FamilyCtx): Built {
  const es = c.lang === "es";
  const date = prettyDate(c.eventDate, c.lang);
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: es ? `Tu fecha del ${date} ya no está apartada` : `Your hold on ${date} has ended`,
    title: es ? "Tu fecha ya no está apartada" : "Your hold has ended",
    paragraphs: es
      ? [
          `Hola ${firstName(c.name)}, el plazo para firmar y pagar el depósito del ${date} se venció, así que liberamos la fecha. No se te cobró nada.`,
          "Si todavía la quieres, escríbenos desde tu página. Si la fecha sigue libre, con gusto la apartamos otra vez.",
        ]
      : [
          `Hi ${firstName(c.name)}, the time to sign and pay the deposit for ${date} ran out, so we released the date. Nothing was charged.`,
          "If you still want it, write to us from your page. If the date is still free, we'll gladly hold it again.",
        ],
  });
}
