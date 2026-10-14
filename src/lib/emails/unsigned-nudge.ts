/** → family, once: approved, but they haven't signed yet. */
import { familyEmail, firstName, prettyDate, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function unsignedNudgeEmail(c: FamilyCtx & { holdUntil: string }): Built {
  const es = c.lang === "es";
  const date = prettyDate(c.eventDate, c.lang);
  const until = prettyDate(c.holdUntil, c.lang);
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: es ? `Tu fecha del ${date} te espera` : `Your date, ${date}, is waiting for you`,
    title: es ? "Solo faltan dos pasos" : "Just two steps left",
    paragraphs: es
      ? [
          `Hola ${firstName(c.name)}, tu fecha está aprobada y apartada hasta el ${until}.`,
          "Para confirmarla, firma tu contrato y paga tu depósito en tu página. Toma unos minutos desde tu teléfono.",
          "¿Tienes preguntas? Escríbenos desde tu página.",
        ]
      : [
          `Hi ${firstName(c.name)}, your date is approved and held until ${until}.`,
          "To make it final, sign your agreement and pay your deposit on your page. It takes a few minutes on your phone.",
          "Questions? Write to us from your page.",
        ],
    cta: { url: c.link, label: es ? "Firmar y pagar" : "Sign and pay" },
  });
}
