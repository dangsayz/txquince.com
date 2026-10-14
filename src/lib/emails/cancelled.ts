/** → family, when the owner cancels a booking. Says what happens to money. */
import { familyEmail, firstName, prettyDate, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function cancelledEmail(c: FamilyCtx & { note?: string }): Built {
  const es = c.lang === "es";
  const date = prettyDate(c.eventDate, c.lang);
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: es ? `Tu reservación del ${date} fue cancelada` : `Your booking for ${date} is cancelled`,
    title: es ? "Reservación cancelada" : "Booking cancelled",
    paragraphs: [
      es
        ? `Hola ${firstName(c.name)}, cancelamos tu reservación para el ${date}, como lo hablamos. Si corresponde un reembolso, te escribiremos cuando lo enviemos.`
        : `Hi ${firstName(c.name)}, we've cancelled your booking for ${date}, as we discussed. If a refund applies, we'll write again when we send it.`,
      ...(c.note ? [c.note] : []),
    ],
  });
}
