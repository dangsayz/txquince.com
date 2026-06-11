/**
 * Global next/image loader — routes every branded image through /api/img with
 * an explicit width, so the browser gets a real responsive srcset (crisp on
 * retina full-bleeds, tiny on thumbnails) while ALL bytes still flow through
 * the protected route (cap + hotlink check).
 *
 * Non-branded sources (YouTube posters, etc.) pass through untouched.
 */
export default function brandedImageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith("/api/img/")) {
    return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  }
  return src;
}
