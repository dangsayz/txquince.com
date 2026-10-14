/** → family: a payment arrived (deposit, balance, or one the owner recorded). */
import { familyEmail, firstName, money, prettyDate, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function paymentReceivedEmail(
  c: FamilyCtx & {
    amountCents: number;
    /** What the booking is now. */
    outcome: "confirmed" | "paid_in_full" | "partial" | "deposit_waiting_signature";
    remainingCents: number;
    balanceDueDate: string | null;
  },
): Built {
  const es = c.lang === "es";
  const date = prettyDate(c.eventDate, c.lang);
  const due = c.balanceDueDate ? prettyDate(c.balanceDueDate, c.lang) : null;
  const lead = es
    ? `Gracias, ${firstName(c.name)}. Recibimos tu pago de ${money(c.amountCents)}.`
    : `Thank you, ${firstName(c.name)}. We received your payment of ${money(c.amountCents)}.`;
  const next = {
    confirmed: es
      ? `¡Ya estás reservada! El ${date} es oficialmente tuyo. El resto (${money(c.remainingCents)}) se paga${due ? ` antes del ${due}` : ""}; te lo recordaremos por correo.`
      : `You're booked! ${date} is officially yours. The rest (${money(c.remainingCents)}) is due${due ? ` by ${due}` : ""} — we'll remind you by email.`,
    paid_in_full: es
      ? `Tu reservación está pagada por completo. ¡Nos vemos el ${date}!`
      : `Your booking is paid in full. See you on ${date}!`,
    partial: es
      ? `Quedan ${money(c.remainingCents)}${due ? `, antes del ${due}` : ""}.`
      : `${money(c.remainingCents)} is left${due ? `, due by ${due}` : ""}.`,
    deposit_waiting_signature: es
      ? "Tu depósito está pagado. Último paso: firma tu contrato en tu página para confirmar tu reservación."
      : "Your deposit is paid. Last step: sign your agreement on your page to make your booking final.",
  }[c.outcome];
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject:
      c.outcome === "paid_in_full"
        ? es ? `Pagado por completo — ${date}` : `Paid in full — ${date}`
        : c.outcome === "confirmed"
          ? es ? `¡Reservación confirmada! ${date}` : `You're booked! ${date}`
          : es ? `Recibimos tu pago — ${date}` : `Payment received — ${date}`,
    title: es ? "Recibimos tu pago" : "Payment received",
    paragraphs: [lead, next],
    cta: { url: c.link, label: es ? "Ver mi reservación" : "See my booking" },
  });
}
