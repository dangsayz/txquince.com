/**
 * venue-experience.ts — "Our experience at this venue and its staff": the
 * owner's own account of working at a venue. Shared rules and shapes for the
 * API, the page section and tests. No server imports.
 */
import { z } from "zod";

export const VERDICTS = ["great", "mixed", "poor"] as const;
export type Verdict = (typeof VERDICTS)[number];
export const EXPERIENCE_MAX = 6000;

export type VenueExperience = {
  venue_slug: string;
  verdict: Verdict | null;
  body_en: string;
  body_es: string | null;
  updated_at: string;
};

/** Trim, drop control characters, and keep at most one blank line in a row. */
export function cleanExperience(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const text = z.string().max(EXPERIENCE_MAX * 2).transform(cleanExperience);

export const SaveExperienceSchema = z.object({
  slug: z.string().min(1).max(120),
  verdict: z.enum(VERDICTS).nullable(),
  body_en: text.pipe(z.string().min(1, "Write a few words first.").max(EXPERIENCE_MAX)),
  body_es: text.pipe(z.string().max(EXPERIENCE_MAX)).transform((s) => s || null).nullable().optional(),
});
export type SaveExperienceInput = z.infer<typeof SaveExperienceSchema>;

/** The text to show for a language: Spanish falls back to the English account. */
export function experienceText(x: VenueExperience, lang: "en" | "es"): { text: string; lang: "en" | "es" } {
  if (lang === "es" && x.body_es) return { text: x.body_es, lang: "es" };
  return { text: x.body_en, lang: "en" };
}

export const paragraphs = (body: string) => body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
