/** → family, after the owner issues a refund. */
import { familyEmail, firstName, money, prettyDate, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function refundIssuedEmail(c: FamilyCtx & { amountCents: number; note?: string }): Built {
  const es = c.lang === "es";
  const date = prettyDate(c.eventDate, c.lang);
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: es ? `Te enviamos un reembolso de ${money(c.amountCents)}` : `We sent you a refund of ${money(c.amountCents)}`,
    title: es ? "Reembolso enviado" : "Refund sent",
    paragraphs: [
      es
        ? `Hola ${firstName(c.name)}, te enviamos un reembolso de ${money(c.amountCents)} por tu reservación del ${date}. Suele llegar a tu tarjeta en 5 a 10 días hábiles.`
        : `Hi ${firstName(c.name)}, we sent you a refund of ${money(c.amountCents)} for your booking on ${date}. It usually reaches your card in 5 to 10 business days.`,
      ...(c.note ? [c.note] : []),
    ],
  });
}
