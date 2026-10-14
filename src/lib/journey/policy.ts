/**
 * policy.ts — the rules families are shown and the timing constants every
 * step shares. Pure and isomorphic.
 *
 * ⚠ OWNER REVIEW NEEDED: CANCELLATION_POLICY is a first draft in plain words.
 * It is shown on every family page and copied into the agreement. Please read
 * both languages and change anything that isn't how you actually work (or
 * override it per-version at /admin/bookings/contract).
 */
import type { Lang } from "@/components/txq/data";

export const CANCELLATION_POLICY_NEEDS_OWNER_REVIEW = true;

export const CANCELLATION_POLICY: Record<Lang, { title: string; lines: string[] }> = {
  en: {
    title: "Changes and cancellations",
    lines: [
      "Your deposit is not refundable. It holds your date, and we turn other families away for it.",
      "You can move your date once, at no cost, if we're free on the new date. Ask at least 60 days before your event.",
      "Want more hours or an extra? Ask any time — if we're free, we add it and update your total.",
      "If you cancel, we keep the deposit and refund anything you paid beyond it.",
      "If we ever have to cancel, we refund everything you've paid.",
      "Nothing changes until we write back to confirm it.",
    ],
  },
  es: {
    title: "Cambios y cancelaciones",
    lines: [
      "Tu depósito no es reembolsable. Aparta tu fecha y por él rechazamos a otras familias.",
      "Puedes cambiar tu fecha una vez, sin costo, si estamos libres en la nueva fecha. Pídelo al menos 60 días antes de tu evento.",
      "¿Quieres más horas o un extra? Pídelo cuando quieras — si estamos libres, lo añadimos y actualizamos tu total.",
      "Si cancelas, nos quedamos con el depósito y te devolvemos lo que hayas pagado de más.",
      "Si nosotros tuviéramos que cancelar, te devolvemos todo lo que hayas pagado.",
      "Nada cambia hasta que te escribamos para confirmarlo.",
    ],
  },
};

/** Shortest notice we take a request with (audit M1, "tomorrow is bookable"). */
export const MIN_LEAD_DAYS = 7;
/** After approval, the family has this long to sign and pay before the hold lapses. */
export const APPROVAL_HOLD_DAYS = 7;
/** Unapproved requests one email address may have open at once (audit M1). */
export const MAX_OPEN_REQUESTS_PER_EMAIL = 2;
/** A family's private link keeps working this long after the event (delivery). */
export const LINK_DAYS_AFTER_EVENT = 365;
/** …and never less than this from when it was made. */
export const LINK_MIN_DAYS = 30;
/** Legacy /booking/{id}?t= pay tokens stop working this long after approval. */
export const LEGACY_PAY_TOKEN_DAYS = 30;
/** Owner nudge thresholds (daily cron). */
export const OWNER_UNAPPROVED_HOURS = 24;
export const OWNER_UNPAID_HOURS = 48;
export const FAMILY_UNSIGNED_HOURS = 48;
/** Balance reminders: days before the balance due date (plus one overdue notice). */
export const BALANCE_REMINDER_DAYS = [30, 14, 7, 1] as const;

export const DAY_MS = 86_400_000;

/** Calendar-day arithmetic on YYYY-MM-DD strings (UTC, no DST surprises). */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / DAY_MS);
}
/** Today in Dallas (the studio's calendar day), as YYYY-MM-DD. */
export function todayInDallas(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Is this event date far enough out to request? (one rule: request API + UI) */
export function meetsLeadTime(eventDate: string, now: Date): boolean {
  return daysBetween(todayInDallas(now), eventDate) >= MIN_LEAD_DAYS;
}

/** When the balance is due, from the booking's own snapshot. */
export function balanceDueDate(eventDate: string, balanceDueDays: number): string {
  return addDays(eventDate, -balanceDueDays);
}

/** Has the event happened? (the family page turns into the delivery page) */
export function eventHasPassed(eventDate: string, now: Date): boolean {
  return eventDate < todayInDallas(now);
}
