/** → family, right after they send a request: "we got your request". */
import { familyEmail, firstName, money, prettyDate, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function requestReceivedEmail(c: FamilyCtx & { holdUntil: string; totalCents: number; depositCents: number; depositPercent: number }): Built {
  const es = c.lang === "es";
  const date = prettyDate(c.eventDate, c.lang);
  const until = prettyDate(c.holdUntil, c.lang);
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: es ? `Recibimos tu solicitud — ${date}` : `We got your request — ${date}`,
    title: es ? "Recibimos tu solicitud" : "We got your request",
    paragraphs: es
      ? [
          `¡Gracias, ${firstName(c.name)}! Recibimos tu solicitud para el ${date} (${c.ref}).`,
          `Apartamos tu fecha hasta el ${until} mientras la revisamos. Te escribimos en un día.`,
          `Tu total es ${money(c.totalCents)}. Cuando aprobemos tu fecha, firmarás tu contrato y pagarás un depósito del ${c.depositPercent}% (${money(c.depositCents)}) desde tu página privada. Todavía no se te ha cobrado nada.`,
        ]
      : [
          `Thank you, ${firstName(c.name)}! We got your request for ${date} (${c.ref}).`,
          `Your date is held until ${until} while we review it. We'll write within one day.`,
          `Your total is ${money(c.totalCents)}. Once we approve your date, you'll sign your agreement and pay a ${c.depositPercent}% deposit (${money(c.depositCents)}) from your private page. Nothing has been charged.`,
        ],
    cta: { url: c.link, label: es ? "Ver mi reservación" : "See my booking" },
  });
}
