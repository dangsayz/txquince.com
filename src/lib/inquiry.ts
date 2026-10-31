/**
 * inquiry.ts — SHARED inquiry contract (client + server)
 *
 * One zod schema is the single source of truth for validation. The client uses
 * the field options for the form; the server (/api/inquiry) re-validates EVERY
 * field (never trust the client — VALIDATION LAW).
 */
import { z } from "zod";
import { PT, fillPrices } from "@/lib/price-text";
import type { PriceBook } from "@/lib/commission";

/** Services offered (req). Mirrors the data model `services` column. */
export const SERVICE_OPTIONS = [
  { value: "photo", label: "Photography" },
  { value: "video", label: "Video" },
  { value: "both", label: "Both — photo + video" },
] as const;

/**
 * Budget ranges (req). Mirror the package ladder in the live price book — the
 * lowest option is the Portrait Session, so budget shoppers self-select away.
 * `value` is a stable key (so a price change never invalidates an open form);
 * labels carry price tokens filled from the live book (client: usePriceBook,
 * server: fillPrices). The server stores `stored`, filled with ITS book, as
 * free text (inquiries.budget_range), so old rows keep their values.
 */
const P = PT.price;
export const BUDGET_OPTIONS = [
  { value: "portrait", stored: `${P.study} portrait session`, label: `${P.study} — Portrait Session`, labelEs: `${P.study} — Sesión de retratos` },
  { value: "solo", stored: `${P.solo} The Solo`, label: `${P.solo} — The Solo (1 shooter, photo + video)`, labelEs: `${P.solo} — El Solo (1 persona, foto + video)` },
  { value: "photo_video", stored: `${P.cinema} The Duo`, label: `${P.cinema} — The Duo (photo + video)`, labelEs: `${P.cinema} — El Dúo (foto + video)` },
  { value: "trio", stored: `${P.trio}+ The Trio`, label: `${P.trio}+ — The Trio`, labelEs: `${P.trio}+ — El Trío` },
] as const;

/** The text saved on the inquiry for a chosen budget key, priced with the server's book. */
export function budgetStoredText(value: string, book: PriceBook): string {
  const o = BUDGET_OPTIONS.find((b) => b.value === value);
  return o ? fillPrices(o.stored, book) : value;
}

/** "How did you hear about us?" — keep light, helps attribution. */
export const REFERRAL_OPTIONS = [
  "Facebook",
  "Instagram",
  "A friend or family member",
  "A past client",
  "Google",
  "A venue or planner",
  "Other",
] as const;

const serviceValues = SERVICE_OPTIONS.map((s) => s.value) as [
  "photo",
  "video",
  "both",
];
const budgetValues = BUDGET_OPTIONS.map((b) => b.value) as [
  string,
  ...string[],
];

/** Max booking window: ~3 years out (sane max). */
const MAX_YEARS_OUT = 3;

function isFutureWithinRange(dateStr: string): boolean {
  // dateStr is YYYY-MM-DD from the date input.
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

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  // Optional, but validated as a future date within range when provided.
  event_date: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || isFutureWithinRange(v), {
      message: "Choose a future date within the next three years.",
    }),
  venue: z.string().trim().max(160).optional().or(z.literal("")),
  services: z.enum(serviceValues, {
    message: "Please choose photo, video, or both.",
  }),
  budget_range: z.enum(budgetValues, {
    message: "Please choose a budget range.",
  }),
  referral: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/** The hidden honeypot field name (obscure on purpose — bots fill common names). */
export const HONEYPOT_FIELD = "fax_number";

/** Turnstile token field name posted with the form. */
export const TURNSTILE_FIELD = "cf-turnstile-response";
