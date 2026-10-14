/** → family, when the owner approves: sign + pay the deposit on your page. */
import { familyEmail, firstName, money, prettyDate, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function approvedEmail(c: FamilyCtx & { depositCents: number; depositPercent: number; holdUntil: string }): Built {
  const es = c.lang === "es";
  const date = prettyDate(c.eventDate, c.lang);
  const until = prettyDate(c.holdUntil, c.lang);
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: es ? `¡Aprobado! Tu fecha del ${date}` : `Approved! Your date, ${date}`,
    title: es ? "Tu fecha fue aprobada" : "Your date is approved",
    paragraphs: es
      ? [
          `¡Buenas noticias, ${firstName(c.name)}! Aprobamos tu reservación para el ${date}.`,
          `Faltan dos pasos en tu página: firma tu contrato y paga tu depósito del ${c.depositPercent}% (${money(c.depositCents)}). Tu reservación queda confirmada cuando hayas hecho las dos cosas.`,
          `Tu fecha sigue apartada hasta el ${until}.`,
        ]
      : [
          `Great news, ${firstName(c.name)}! We approved your booking for ${date}.`,
          `Two steps are left on your page: sign your agreement, then pay your ${c.depositPercent}% deposit (${money(c.depositCents)}). Your booking is final once both are done.`,
          `Your date stays held until ${until}.`,
        ],
    cta: { url: c.link, label: es ? "Firmar y pagar" : "Sign and pay" },
  });
}
