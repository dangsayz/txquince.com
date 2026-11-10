/** Keep Cloudflare output widths truthful to the custom Next image loader's srcset. */
export const IMAGE_PIPELINE_EPOCH = "4";

export function imageTransformForWidth(width: number) {
  return { width, fit: "scale-down" } as const;
}

/** Widest file the image route ever makes (homepage hero, gallery viewer). */
export const FULL_MAX_WIDTH = 2400;
/**
 * Widest file handed out when the request does not come from a page that
 * shows photos large: an image address opened on its own (no Referer — this
 * is what "edit the ?w= in the address bar" looks like), a blog post (photos
 * there are shown at a reading size), or another site allowed to load the
 * image (Pinterest's pin preview). Link-preview fetchers and Google Images
 * also land here; 1440px is more than a preview card uses.
 */
export const OPEN_MAX_WIDTH = 1440;

const BLOG_PATH = /^\/(?:es\/)?blog(?:\/|$)/;

/**
 * The widest derivative this request may have. Only a page of this site that
 * is not a blog page gets the full size. A Referer can be forged by someone
 * who writes a script, so this is a raised bar, not a lock: it closes the
 * easy path (change the number in the address), nothing more.
 */
export function maxWidthForReferer(referer: string | null, isSiteHost: (host: string) => boolean): number {
  if (!referer) return OPEN_MAX_WIDTH;
  try {
    const url = new URL(referer);
    if (!isSiteHost(url.hostname)) return OPEN_MAX_WIDTH;
    return BLOG_PATH.test(url.pathname) ? OPEN_MAX_WIDTH : FULL_MAX_WIDTH;
  } catch {
    return OPEN_MAX_WIDTH;
  }
}
