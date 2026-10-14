/** → family, after they sign: their signed agreement (PDF attached). */
import { agreementHtml, familyEmail, firstName, money, prettyDate, type Built } from "./layout";
import type { FamilyCtx } from "./context";
import type { Agreement } from "@/lib/agreement";

export function contractSignedEmail(
  c: FamilyCtx & { agreement: Pick<Agreement, "title" | "intro" | "sections">; depositCents: number; depositPaid: boolean },
): Built {
  const es = c.lang === "es";
  const date = prettyDate(c.eventDate, c.lang);
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: es ? `Tu contrato firmado — ${date}` : `Your signed agreement — ${date}`,
    title: es ? "Firmaste tu contrato" : "You signed your agreement",
    paragraphs: es
      ? [
          `Gracias, ${firstName(c.name)}. Adjuntamos una copia en PDF de tu contrato firmado para el ${date}.`,
          c.depositPaid
            ? "Tu depósito ya está pagado, así que tu reservación está confirmada."
            : `Último paso: paga tu depósito (${money(c.depositCents)}) en tu página para confirmar tu reservación.`,
        ]
      : [
          `Thank you, ${firstName(c.name)}. A PDF copy of your signed agreement for ${date} is attached.`,
          c.depositPaid
            ? "Your deposit is already paid, so your booking is confirmed."
            : `Last step: pay your deposit (${money(c.depositCents)}) on your page to make your booking final.`,
        ],
    cta: c.depositPaid ? undefined : { url: c.link, label: es ? "Pagar mi depósito" : "Pay my deposit" },
    extraHtml: agreementHtml(c.agreement),
  });
}
