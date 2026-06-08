/**
 * booking.ts — SHARED booking contract (client + server).
 *
 * One zod schema is the single source of truth for the "Reserve your date" flow.
 * The client uses it for instant validation + the package options; the server
 * (/api/booking) re-validates EVERY field before touching Stripe or the DB
 * (never trust the client — VALIDATION LAW).
 *
 * Unlike the inquiry form, here the EVENT DATE is required and the PACKAGE is the
 * commitment — there's no budget field, because they're reserving with a deposit.
 */
import { z } from "zod";
import { site } from "@/content/site";

/** What they're reserving. Mirrors the `package` column + the inquiry services. */
export const PACKAGE_OPTIONS = [
  { value: "photo", label: "Photography" },
  { value: "video", label: "Film / Video" },
  { value: "both", label: "Both — photo + film" },
] as const;

const packageValues = PACKAGE_OPTIONS.map((p) => p.value) as [
  "photo",
  "video",
  "both",
];

/** Deposit config (operator-editable in src/content/site.ts). */
export const DEPOSIT_CENTS = site.booking.depositCents;
export const DEPOSIT_CURRENCY = site.booking.currency;
export const DEPOSIT_LABEL = site.booking.depositLabel;
export const HOLD_MINUTES = site.booking.holdMinutes;

/** Max booking window: ~3 years out (matches the inquiry form). */
const MAX_YEARS_OUT = 3;

function isFutureWithinRange(dateStr: string): boolean {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const max = new Date(
    today.getFullYear() + MAX_YEARS_OUT,
    today.getMonth(),
    today.getDate(),
  );
  return d >= today && d <= max;
}

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  event_date: z
    .string()
    .trim()
    .min(1, "Please choose your event date.")
    .refine((v) => isFutureWithinRange(v), {
      message: "Choose a future date within the next three years.",
    }),
  package: z.enum(packageValues, {
    message: "Please choose photo, film, or both.",
  }),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof bookingSchema>;

/** Shape of a `bookings` row as read back for confirmation emails. */
export interface BookingRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_date: string;
  package: "photo" | "video" | "both";
  notes: string | null;
  status: string;
  deposit_amount_cents: number;
  currency: string;
}

/** "YYYY-MM-DD" → "Saturday, May 9, 2026" (UTC-safe; no off-by-one). */
export function formatEventDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Cents → "$500" / "$1,250". */
export function formatMoney(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function packageLabel(value: string): string {
  return PACKAGE_OPTIONS.find((p) => p.value === value)?.label ?? value;
}

/** Reused from the inquiry contract — same anti-abuse fields. */
export const HONEYPOT_FIELD = "fax_number";
export const TURNSTILE_FIELD = "cf-turnstile-response";
