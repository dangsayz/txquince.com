import { z } from "zod";

const revision = z.string().datetime({ offset: true });
const focus = { focusX: z.number().min(0).max(1), focusY: z.number().min(0).max(1) };

export const HeroPublishSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("image"),
    source: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("portfolio"), slug: z.string().regex(/^[a-z0-9-]{1,80}$/, "Choose a portfolio photograph.") }).strict(),
      z.object({ kind: z.literal("upload"), storagePath: z.string().regex(/^portfolio\/\d{11,16}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|jpeg|png|webp|avif)$/, "Upload a JPEG, PNG, WebP, or AVIF photograph.") }).strict(),
    ]),
    imageAlt: z.string().trim().min(1, "Describe the photograph before publishing.").max(200),
    ...focus,
    expectedUpdatedAt: revision.nullable(),
  }).strict(),
  z.object({ kind: z.literal("video"), videoUrl: z.string().url("Paste a valid video link."), expectedUpdatedAt: revision.nullable() }).strict(),
]);

export const HeroFocusSchema = z.object({ ...focus, imageAlt: z.string().trim().min(1).max(200).optional(), expectedUpdatedAt: revision }).strict();
export const HeroResetSchema = z.object({ expectedUpdatedAt: revision }).strict();
export const HeroImageInfoSchema = z.object({
  format: z.string().transform((format) => format.toLowerCase().replace(/^image\//, "")).pipe(z.enum(["jpeg", "jpg", "png", "webp", "avif"])),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const HeroStoredSchema = z.object({
  kind: z.enum(["image", "video"]),
  storage_path: z.string().optional(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  videoUrl: z.string().optional(),
  provider: z.enum(["youtube", "vimeo", "file", "link"]).nullable().optional(),
  videoId: z.string().nullable().optional(),
  posterUrl: z.string().nullable().optional(),
  focusX: z.number().nullable().optional(),
  focusY: z.number().nullable().optional(),
});

export const HeroPublicSchema = z.object({
  kind: z.enum(["image", "video"]),
  imageUrl: z.string().nullable(),
  imageAlt: z.string(),
  videoUrl: z.string().nullable(),
  provider: z.enum(["youtube", "vimeo", "file", "link"]).nullable(),
  videoId: z.string().nullable(),
  posterUrl: z.string().nullable(),
  ...focus,
  updatedAt: revision,
});

export const HeroResponseSchema = z.object({ value: HeroPublicSchema.nullable() });

export type HeroLibraryPhoto = {
  slug: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  focusX: number | null;
  focusY: number | null;
};

export function heroImageSource(value: unknown): string | null {
  if (!value || typeof value !== "object" || !("kind" in value) || value.kind !== "image") return null;
  if ("storage_path" in value && typeof value.storage_path === "string" && value.storage_path) return value.storage_path;
  if ("imageUrl" in value && typeof value.imageUrl === "string" && value.imageUrl) return value.imageUrl;
  return null;
}
