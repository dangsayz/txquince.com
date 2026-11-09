/**
 * review.ts — first-party reviews (pure: types, validation, share text).
 *
 * Trust model: there is no public "leave a review" form. The owner makes one
 * link per family he worked with (/admin/reviews), and nothing is public until
 * he approves it. The mom can come back to the same link to update her review:
 * before approval the update replaces it; after approval it waits as a pending
 * update and the live version stays until the owner approves the update.
 * Photos stay in the private bucket and are only served once approved.
 */
import { z } from "zod";
import { SLUG_RE } from "@/lib/plan-slug";
import type { PublicReview } from "@/lib/review-public";

export { reviewPhotoUrl, type PublicReview } from "@/lib/review-public";

export const REVIEW_STATUSES = ["invited", "pending", "approved", "hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type ReviewLang = "en" | "es";

export const REVIEW_BODY_MIN = 10;
export const REVIEW_BODY_MAX = 4000;
export const REVIEW_MAX_PHOTOS = 40;

export type ReviewRecord = {
  id: string;
  slug: string;
  created_at: string;
  status: ReviewStatus;
  invite_name: string;
  daughter_name: string | null;
  event_date: string | null;
  submitted_at: string | null;
  rating: number | null;
  body: string | null;
  display_name: string | null;
  city: string | null;
  language: ReviewLang;
  photo_paths: string[];
  consent_publish: boolean;
  consent_photos: boolean;
  approved_at: string | null;
  featured: boolean;
  show_photos: boolean;
  notes: string | null;
  /** The mom's update to an approved/hidden review, waiting for the owner. */
  edit: ReviewEdit | null;
};

export type ReviewEdit = {
  submitted_at: string;
  rating: number;
  body: string;
  display_name: string;
  daughter_name: string | null;
  city: string | null;
  language: ReviewLang;
  photo_paths: string[];
  consent_photos: boolean;
};

/** Needs the owner: a new review, or an update to one that is live/hidden. */
export const needsOwner = (r: Pick<ReviewRecord, "status" | "edit">) => r.status === "pending" || r.edit !== null;

/** What the mom sees when she reopens her link: her latest version. */
export function latestVersion(r: ReviewRecord) {
  const e = r.edit;
  return {
    rating: e?.rating ?? r.rating ?? 0,
    body: e?.body ?? r.body ?? "",
    display_name: e?.display_name ?? r.display_name ?? shortName(r.invite_name),
    daughter_name: e ? e.daughter_name : r.daughter_name,
    city: e ? e.city : r.city,
    language: e?.language ?? r.language,
    photo_paths: e ? e.photo_paths : r.photo_paths,
  };
}

export const isReviewSlug = (v: unknown): v is string => typeof v === "string" && SLUG_RE.test(v);

/** Photos for an invite live under reviews/<slug>/ — nothing else is accepted on submit. */
export function reviewPhotoPrefix(slug: string): string {
  return `reviews/${slug}/`;
}
const PHOTO_KEY = /^reviews\/[23456789abcdefghjkmnpqrstuvwxyz]{10}\/[0-9a-f-]{36}\.(jpg|png|webp|avif)$/;
export function isOwnPhotoKey(slug: string, key: unknown): key is string {
  return typeof key === "string" && PHOTO_KEY.test(key) && key.startsWith(reviewPhotoPrefix(slug));
}

const trimmed = (max: number) => z.string().trim().max(max);

/** Owner → new invite link. */
export const InviteSchema = z.object({
  invite_name: trimmed(120).min(1),
  daughter_name: trimmed(80).optional().transform((v) => v || null),
  event_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
});
export type InviteInput = z.infer<typeof InviteSchema>;

/** Mom → her review. */
export const SubmitSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    body: trimmed(REVIEW_BODY_MAX).min(REVIEW_BODY_MIN),
    display_name: trimmed(80).min(1),
    daughter_name: trimmed(80).optional().transform((v) => v || null),
    city: trimmed(80).optional().transform((v) => v || null),
    language: z.enum(["en", "es"]).default("en"),
    photos: z.array(z.string()).max(REVIEW_MAX_PHOTOS).default([]),
    consent_publish: z.literal(true),
    consent_photos: z.boolean().default(false),
  })
  .refine((b) => b.photos.length === 0 || b.consent_photos, { path: ["consent_photos"] });
export type SubmitInput = z.infer<typeof SubmitSchema>;

const optionalText = (max: number) =>
  z.string().trim().max(max).nullable().optional().transform((v) => (v === undefined ? undefined : v || null));

/**
 * Owner → moderation and details. The mom's words and stars are never
 * editable here (hide or delete instead): the public page promises they are
 * hers.
 */
export const ModerateSchema = z
  .object({
    id: z.string().uuid(),
    status: z.enum(["pending", "approved", "hidden"]).optional(),
    featured: z.boolean().optional(),
    show_photos: z.boolean().optional(),
    notes: optionalText(4000),
    display_name: z.string().trim().min(1).max(80).optional(),
    daughter_name: optionalText(80),
    city: optionalText(80),
    event_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .or(z.literal(""))
      .nullable()
      .optional()
      .transform((v) => (v === undefined ? undefined : v || null)),
    /** The mom's pending update: put it live, or keep the old version. */
    edit: z.enum(["approve", "reject"]).optional(),
  })
  .refine((b) => Object.keys(b).length > 1);
export type ModerateInput = z.infer<typeof ModerateSchema>;

export function reviewPath(slug: string): string {
  return `/review/${slug}`;
}

/** "yvonne" → "Yvonne" (names are often typed fast on a phone). */
const cap = (w: string) => (w ? w[0].toLocaleUpperCase("es") + w.slice(1) : w);

/** "Maria Garcia" → "Maria G." (the default signature; the mom can change it). */
export function shortName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return cap(parts[0] ?? "");
  return `${cap(parts[0])} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/** The message the owner copies and texts to the mom. Bilingual, short, no pressure. */
export function inviteMessage(r: Pick<ReviewRecord, "invite_name" | "daughter_name">, url: string): string {
  const first = cap(r.invite_name.trim().split(/\s+/)[0] || "");
  const daughter = r.daughter_name ? cap(r.daughter_name.trim()) : "";
  const her = daughter ? `${daughter}’s` : "her";
  const suya = daughter ? `de ${daughter}` : "de su hija";
  return [
    `Hi ${first}! It was an honor to photograph ${her} quinceañera. If you have two minutes, could you leave me a short review? You can add a photo or two from your gallery too. This link is just for you:`,
    url,
    "",
    `¡Hola ${first}! Fue un honor fotografiar la quinceañera ${suya}. Si tiene dos minutos, ¿me deja una reseña corta? También puede agregar una o dos fotos de su galería. Este enlace es solo para usted (el mismo de arriba).`,
  ].join("\n");
}

export function monthYear(iso: string | null, lang: ReviewLang = "en"): string | null {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function toPublicReview(r: ReviewRecord): PublicReview | null {
  if (r.status !== "approved" || !r.consent_publish || !r.body || !r.rating) return null;
  return {
    id: r.id,
    rating: r.rating,
    body: r.body,
    name: r.display_name || shortName(r.invite_name),
    daughterName: r.daughter_name,
    city: r.city,
    when: monthYear(r.event_date ?? r.submitted_at),
    photoCount: r.show_photos && r.consent_photos ? r.photo_paths.length : 0,
    featured: r.featured,
  };
}
