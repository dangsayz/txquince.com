/**
 * inquiry.ts — SHARED inquiry contract (client + server)
 *
 * One zod schema is the single source of truth for validation. The client uses
 * the field options for the form; the server (/api/inquiry) re-validates EVERY
 * field (never trust the client — VALIDATION LAW).
 */
import { z } from "zod";

/** Services offered (req). Mirrors the data model `services` column. */
export const SERVICE_OPTIONS = [
  { value: "photo", label: "Photography" },
  { value: "video", label: "Film / Video" },
  { value: "both", label: "Both — photo + film" },
] as const;

/**
 * Budget ranges (req). The LOWEST option ($1,800–$2,500) mirrors the Moments
 * entry collection, so budget families have a bracket that fits instead of
 * bouncing. The ladder still climbs to the Legacy ceiling for anchoring.
 */
export const BUDGET_OPTIONS = [
  { value: "$1,800–$2,500", label: "$1,800 – $2,500" },
  { value: "$2,500–$3,500", label: "$2,500 – $3,500" },
  { value: "$3,500–$4,500", label: "$3,500 – $4,500" },
  { value: "$4,500–$5,500+", label: "$4,500 – $5,500+" },
] as const;

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
    message: "Please choose photo, film, or both.",
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
