/**
 * image-slug.ts — how a photo's public address is made.
 *
 * The slug is in every URL of the photo (/api/img/<slug>, /photos/<section>/<slug>)
 * and in the image sitemap, so it must describe the picture and nothing else:
 * no client name, no upload filename, no camera file number.
 */

/** Text that came from a file name, not from a person describing the photo. */
const FILENAME =
  /(?:^|[\s._-])(?:12img|jpe?g|png|webp|heic|avif|img|image|dsc|dscf|pxl|pict)(?:[\s._-]?\d+)?(?=$|[\s._-])/i;

export function looksLikeFilename(text: string): boolean {
  return FILENAME.test(text);
}

/** Lowercase, accents folded, kebab-case, at most `max` characters. */
function kebab(text: string, max: number): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/, "");
}

/**
 * Slug stem for a new photo: the alt text when a person wrote one, else the
 * section. The caller appends a short random suffix to keep slugs unique.
 */
export function imageSlugBase(alt: string | null | undefined, section: string): string {
  const fallback = `${section} quinceanera dfw`;
  const text = alt?.trim();
  return kebab(text && !looksLikeFilename(text) ? text : fallback, 64) || kebab(fallback, 64);
}
