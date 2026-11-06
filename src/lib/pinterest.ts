/**
 * pinterest.ts — "Save to Pinterest" links (pure; server, client and tests).
 *
 * Every pin points back at the photo's OWN page on txquince.com
 * (/photos/<section>/<slug>), not the homepage: a pinner who taps through
 * lands on that frame with a "check your date" CTA. The pin's image is a
 * capped 1440px derivative from /api/img (never the original), and its
 * description carries the city + service phrase Pinterest search ranks on.
 *
 * Pinterest outbound links are nofollow, so the win is referral traffic,
 * image discovery and brand searches, not raw link equity.
 */
import { site } from "@/content/site";

/** Width of the image Pinterest copies (matches the lightbox cap). */
export const PIN_WIDTH = 1440;
/** Pinterest truncates descriptions at 500 characters. */
const MAX_DESCRIPTION = 500;

const absolute = (path: string): string => (/^https?:\/\//.test(path) ? path : `${site.url}${path.startsWith("/") ? "" : "/"}${path}`);

/** Absolute, capped image URL for a pin (branded /api/img sources get ?w=). */
export function pinMedia(src: string): string {
  const sized = src.startsWith("/api/img/") ? `${src}${src.includes("?") ? "&" : "?"}w=${PIN_WIDTH}` : src;
  return absolute(sized);
}

/** Pin description: the photo's alt text plus who/where, in the page language. */
export function pinDescription(alt: string, lang: "en" | "es" = "en"): string {
  const tail =
    lang === "es"
      ? `Fotografía de quinceañera por ${site.brand}, Dallas–Fort Worth.`
      : `Quinceañera photography by ${site.brand}, Dallas–Fort Worth.`;
  const head = alt.trim().replace(/[.\s]+$/, "");
  return (head ? `${head}. ${tail}` : tail).slice(0, MAX_DESCRIPTION);
}

/** Pinterest's create-pin URL (opens the "Save" picker; no SDK script needed). */
export function pinCreateUrl({ page, image, description }: { page: string; image: string; description: string }): string {
  const q = new URLSearchParams({ url: absolute(page), media: absolute(image), description: description.slice(0, MAX_DESCRIPTION) });
  return `https://www.pinterest.com/pin/create/button/?${q.toString()}`;
}

/** Referrer hosts that may load our images (Pinterest's pin picker previews). */
export function isPinterestHost(host: string): boolean {
  return /(^|\.)pinterest\.[a-z.]{2,6}$/.test(host) || host === "pin.it";
}
