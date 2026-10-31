/**
 * plan.ts — the personalized quince plan contract (client + server, pure).
 *
 * A family arrives from a Facebook reply on /plan?date=…&colors=…&src=…,
 * fills six light fields, and gets a private page at /plan/<slug> with work
 * in their colors, the date's status, the packages and a date-hold button.
 *
 * PRIVACY LAW: nothing personal ever goes in a URL. The intake link carries
 * only a date, colors, a language and a source tag; the plan page is keyed by
 * a random slug; the plan page itself never shows the family's name or
 * contact details (the link may be re-shared in public threads).
 */
import { z } from "zod";
import { isColorId, MAX_PLAN_COLORS, parseColors, type ColorId } from "@/lib/quince-colors";

import type { PlanLang } from "@/lib/plan-lang";
export type { PlanLang } from "@/lib/plan-lang";
export { detectPlanLang } from "@/lib/plan-lang";
export const PLAN_STATUSES = ["new", "replied", "booked", "lost"] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];
export const DATE_STATUSES = ["available", "limited", "booked"] as const;
export type DateStatus = (typeof DATE_STATUSES)[number];

export const PLAN_HONEYPOT_FIELD = "fax_number";

const MAX_YEARS_OUT = 3;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** "YYYY-MM-DD" of today in Dallas (event dates are local calendar days). */
export function todayInDallas(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(now);
}

/** A real calendar date: "2026-02-30" is rejected. */
export function isRealIsoDate(v: string): boolean {
  if (!ISO_DATE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** Today or later (Dallas time), and no more than three years out. */
export function isPlannableDate(v: string, now: Date = new Date()): boolean {
  if (!isRealIsoDate(v)) return false;
  const today = todayInDallas(now);
  const [y, m, d] = today.split("-").map(Number);
  const max = `${y + MAX_YEARS_OUT}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return v >= today && v <= max;
}

/** A `date` query param worth prefilling (shape + plannable), else "". */
export function prefillDate(v: unknown, now: Date = new Date()): string {
  return typeof v === "string" && isPlannableDate(v, now) ? v : "";
}

/**
 * The `src` tag (e.g. "fb-group", "fb-quince-dallas") → a safe slug, or null.
 * Lowercase letters, digits, dash and underscore, up to 40 characters.
 */
export function sanitizeSource(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  return s.length >= 2 ? s : null;
}

export type PlanContact = { email: string | null; phone: string | null };

const emailSchema = z.string().email();

/**
 * One "phone or email" box → which one it is. Phone numbers keep the digits
 * (US numbers formatted as (214) 555-0100); WhatsApp numbers from abroad
 * (8–15 digits with a leading +) are kept as typed. Returns null when it is
 * neither a valid email nor a plausible phone number.
 */
export function parseContact(raw: unknown): PlanContact | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  if (!v || v.length > 160) return null;
  if (v.includes("@")) {
    const email = v.toLowerCase();
    return emailSchema.safeParse(email).success ? { email, phone: null } : null;
  }
  if (/[a-z]/i.test(v)) return null;
  const digits = v.replace(/\D/g, "");
  const plus = v.startsWith("+");
  const usDigits =
    (!plus && digits.length === 10) ? digits
    : digits.length === 11 && digits.startsWith("1") ? digits.slice(1)
    : null;
  if (usDigits) {
    return { email: null, phone: `(${usDigits.slice(0, 3)}) ${usDigits.slice(3, 6)}-${usDigits.slice(6)}` };
  }
  if (plus && digits.length >= 8 && digits.length <= 15) {
    return { email: null, phone: `+${digits}` };
  }
  return null;
}

/** What the intake form sends (server re-validates every field). */
export const planInputSchema = z.object({
  event_date: z.string().trim().refine((v) => isPlannableDate(v), { message: "date" }),
  city: z.string().trim().min(2, { message: "city" }).max(80, { message: "city" }),
  colors: z
    .array(z.string())
    .max(12)
    .default([])
    .transform((list) => parseColors(list, MAX_PLAN_COLORS))
    .refine((list) => list.every(isColorId)),
  theme: z.string().trim().max(120).optional().default(""),
  name: z.string().trim().min(2, { message: "name" }).max(120, { message: "name" }),
  contact: z.string().trim().min(3, { message: "contact" }).max(160, { message: "contact" }),
  language: z.enum(["en", "es"]),
  src: z.string().max(80).optional().nullable(),
});

export type PlanInput = z.infer<typeof planInputSchema>;

/** Which form field a validation issue belongs to (messages are field keys). */
export type PlanField = "event_date" | "city" | "name" | "contact";

/** The stored plan, as server code reads it back. */
export type PlanRecord = {
  id: string;
  slug: string;
  created_at: string;
  event_date: string;
  city: string;
  colors: ColorId[];
  theme: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  language: PlanLang;
  source: string | null;
  attribution: Record<string, string> | null;
  status: PlanStatus;
  booking_id: string | null;
  notes: string | null;
};

/** The public-safe slice the plan page renders: no name, email or phone. */
export type PublicPlan = Pick<PlanRecord, "slug" | "event_date" | "city" | "colors" | "theme" | "language" | "status">;

export function toPublicPlan(p: PlanRecord): PublicPlan {
  return { slug: p.slug, event_date: p.event_date, city: p.city, colors: p.colors, theme: p.theme, language: p.language, status: p.status };
}

/**
 * The status a family sees for their date.
 *   - A live hold or paid booking on the date always reads Booked (the
 *     bookings table's one-event-per-day guard is the real lock).
 *   - Otherwise the owner's entry in date_availability, if any.
 *   - Otherwise Available. Past dates read Booked (nothing to hold).
 */
export function resolveDateStatus(input: {
  date: string;
  override?: DateStatus | null;
  taken?: boolean;
  today?: string;
}): DateStatus {
  if (input.taken) return "booked";
  if (input.today && input.date < input.today) return "booked";
  return input.override ?? "available";
}

/** "2026-11-21" → "Saturday, November 21, 2026" / "sábado, 21 de noviembre de 2026". */
export function formatPlanDate(date: string, lang: PlanLang, opts: { weekday?: boolean } = {}): string {
  const d = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
    weekday: opts.weekday === false ? undefined : "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** The plan page path in a language: /plan/<slug> or /es/plan/<slug>. */
export function planPath(slug: string, lang: PlanLang): string {
  return `${lang === "es" ? "/es" : ""}/plan/${slug}`;
}

/** The timeline page path: /plan/<slug>/timeline or /es/plan/<slug>/cronograma. */
export function timelinePath(slug: string, lang: PlanLang): string {
  return lang === "es" ? `/es/plan/${slug}/cronograma` : `/plan/${slug}/timeline`;
}
