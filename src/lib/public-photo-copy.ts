import { CATEGORIES } from "@/content/portfolio-taxonomy";

type PhotoCopyInput = {
  title?: string | null;
  alt?: string | null;
  caption?: string | null;
  city?: string | null;
};

function writtenCopy(value: string | null | undefined): string | null {
  const text = value?.trim();
  if (!text) return null;

  const filenameToken = /(?:^|[\s._-])(?:12img|jpe?g|png|webp|heic|avif)(?=$|[\s._-])/i;
  const cameraName = /(?:^|[\s._-])(?:img|image|dsc|dscf|pxl|pict)[\s._-]?\d{3,}(?=$|[\s._-])/i;
  const numberedPhoto = /(?:^|[\s._-])(?:photo|quince)[\s._-]+\d{3,}(?=$|[\s._-])/i;
  const fileExtension = /\.(?:jpe?g|png|webp|heic|avif)(?=$|[\s._-])/i;
  const numberedQuince = /\bquincea(?:ñ|n|\s)?era[\s._-]*\d{2,3}\b/i;
  const opaqueId = /^(?:[a-f0-9]{8}[-\s][a-f0-9]{4}[-\s][a-f0-9]{4}[-\s][a-f0-9]{4}[-\s][a-f0-9]{12}|[a-f0-9]{32})$/i;

  return filenameToken.test(text) || cameraName.test(text) || numberedPhoto.test(text) || fileExtension.test(text) || numberedQuince.test(text) || opaqueId.test(text)
    ? null
    : text;
}

export function publicPhotoCopy(image: PhotoCopyInput, categoryDescription: string) {
  const city = image.city?.trim().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  const fallback = city ? `${categoryDescription} in ${city}` : categoryDescription;
  const alt = writtenCopy(image.alt) || fallback;
  return {
    title: writtenCopy(image.title) || fallback,
    alt,
    description: writtenCopy(image.caption) || alt,
  };
}

/** Why a photo's alt text is not a real description yet. */
export type DescriptionGap = "blank" | "filename" | "stock";

type DescribedPhoto = { id: string; alt?: string | null; location?: string | null };

const STOCK_PHRASES = new Set(CATEGORIES.map((c) => c.altPhrase.toLowerCase()));
/** The line the venue import stamps on every photo of one venue. */
const VENUE_IMPORT_LINE = /^quinceañera (?:portraits|celebration) at .+, texas$/i;

/**
 * Photos whose alt text does not describe the photo: empty, a leftover file
 * name, or the stock line an upload starts with ("Quinceañera cake at <place>").
 * A line shared word for word by three or more photos counts as stock too:
 * three different photos cannot have one true description.
 */
export function photosNeedingDescription(photos: DescribedPhoto[]): Map<string, DescriptionGap> {
  const key = (p: DescribedPhoto) => (p.alt ?? "").trim().toLowerCase();
  const uses = new Map<string, number>();
  for (const p of photos) uses.set(key(p), (uses.get(key(p)) ?? 0) + 1);

  const out = new Map<string, DescriptionGap>();
  for (const p of photos) {
    const alt = key(p);
    if (!alt) {
      out.set(p.id, "blank");
      continue;
    }
    if (!writtenCopy(alt)) {
      out.set(p.id, "filename");
      continue;
    }
    const place = (p.location ?? "").trim().toLowerCase();
    const withoutPlace = place && alt.endsWith(` at ${place}`) ? alt.slice(0, -` at ${place}`.length) : alt;
    if (STOCK_PHRASES.has(withoutPlace) || VENUE_IMPORT_LINE.test(alt) || (uses.get(alt) ?? 0) >= 3) out.set(p.id, "stock");
  }
  return out;
}
