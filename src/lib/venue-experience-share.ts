/**
 * venue-experience-share.ts — the share page and link-preview card for "Our
 * experience at this venue". Pure helpers (no server imports), so the page, the
 * card route and tests agree on the same text and addresses.
 */
import type { VenueExperience } from "@/lib/venue-experience";

export const VERDICT_LABEL = {
  great: "We love working here",
  mixed: "Good, with a few things to know",
  poor: "A hard place to work",
} as const;

export const experienceTitle = (venueName: string) => `Our experience at ${venueName} and its staff`;

/** One line for previews: whole words, at most `max` characters, "…" when cut. */
export function excerpt(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.]+$/, "")}…`;
}

export const sharePath = (slug: string) => `/venues/${slug}/experience`;

/**
 * The card's address changes whenever the text is saved (v = the save time),
 * so Facebook and WhatsApp fetch the new picture instead of an old cached one.
 */
export function cardPath(slug: string, x: Pick<VenueExperience, "updated_at"> | null): string {
  const v = x ? x.updated_at.replace(/\D/g, "").slice(0, 14) : "0";
  return `${sharePath(slug)}/card?v=${v}`;
}
