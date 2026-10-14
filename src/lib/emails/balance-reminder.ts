/** → family: the balance is coming due (30/14/7/1 days) or is overdue. */
import { familyEmail, firstName, money, prettyDate, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function balanceReminderEmail(c: FamilyCtx & { remainingCents: number; dueDate: string; daysLeft: number }): Built {
  const es = c.lang === "es";
  const due = prettyDate(c.dueDate, c.lang);
  const date = prettyDate(c.eventDate, c.lang);
  const overdue = c.daysLeft < 0;
  const when = overdue
    ? es ? `venció el ${due}` : `was due on ${due}`
    : c.daysLeft === 0
      ? es ? "se vence hoy" : "is due today"
      : es
        ? `se vence en ${c.daysLeft} ${c.daysLeft === 1 ? "día" : "días"}, el ${due}`
        : `is due in ${c.daysLeft} ${c.daysLeft === 1 ? "day" : "days"}, on ${due}`;
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: overdue
      ? es ? `Tu saldo está pendiente — ${date}` : `Your balance is past due — ${date}`
      : es ? `Recordatorio: tu saldo ${when}` : `Reminder: your balance ${when}`,
    title: overdue ? (es ? "Tu saldo está pendiente" : "Your balance is past due") : es ? "Recordatorio de saldo" : "Balance reminder",
    paragraphs: es
      ? [
          `Hola ${firstName(c.name)}, el resto de tu reservación para el ${date} (${money(c.remainingCents)}) ${when}.`,
          "Puedes pagarlo con tarjeta en tu página. Si ya pagaste por Zelle o en efectivo, avísanos y lo anotamos.",
        ]
      : [
          `Hi ${firstName(c.name)}, the rest of your booking for ${date} (${money(c.remainingCents)}) ${when}.`,
          "You can pay it by card on your page. If you already paid by Zelle or cash, just let us know and we'll mark it.",
        ],
    cta: { url: c.link, label: es ? `Pagar saldo de ${money(c.remainingCents)}` : `Pay balance ${money(c.remainingCents)}` },
  });
}
