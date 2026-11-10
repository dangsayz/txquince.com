/**
 * Global next/image loader — routes every branded image through /api/img with
 * an explicit width, so the browser gets a real responsive srcset (crisp on
 * retina full-bleeds, tiny on thumbnails) while ALL bytes still flow through
 * the protected route (cap + hotlink check).
 *
 * `cap=<px>` on the src is a ceiling for that one image: no srcset entry asks
 * for a wider file (blog photos use it so a post never hands out a large copy).
 * The param is consumed here and never reaches the route.
 *
 * Non-branded sources (YouTube posters, etc.) pass through untouched.
 */
const CAP_RE = /([?&])cap=(\d+)(&|$)/;

export default function brandedImageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith("/api/img/")) {
    let w = width;
    let url = src;
    const m = CAP_RE.exec(src);
    if (m) {
      w = Math.min(width, Number(m[2]));
      // Drop the param, keeping whichever separator the rest of the query needs.
      url = src.replace(CAP_RE, (_all, lead: string, _n: string, tail: string) => (tail ? lead : ""));
    }
    return `${url}${url.includes("?") ? "&" : "?"}w=${w}`;
  }
  return src;
}
