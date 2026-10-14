/** → family, when the owner clicks "Send balance link". */
import { familyEmail, firstName, money, prettyDate, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function balanceLinkEmail(c: FamilyCtx & { remainingCents: number; dueDate: string | null }): Built {
  const es = c.lang === "es";
  const date = prettyDate(c.eventDate, c.lang);
  const due = c.dueDate ? prettyDate(c.dueDate, c.lang) : null;
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: es ? `Tu saldo para el ${date}` : `Your balance for ${date}`,
    title: es ? "Paga tu saldo" : "Pay your balance",
    paragraphs: es
      ? [
          `Hola ${firstName(c.name)}, aquí está tu enlace para pagar el resto de tu reservación: ${money(c.remainingCents)}${due ? `, antes del ${due}` : ""}.`,
          "Abre tu página y toca el botón para pagar con tarjeta.",
        ]
      : [
          `Hi ${firstName(c.name)}, here's your link to pay the rest of your booking: ${money(c.remainingCents)}${due ? `, due by ${due}` : ""}.`,
          "Open your page and tap the button to pay by card.",
        ],
    cta: { url: c.link, label: es ? `Pagar saldo de ${money(c.remainingCents)}` : `Pay balance ${money(c.remainingCents)}` },
  });
}
