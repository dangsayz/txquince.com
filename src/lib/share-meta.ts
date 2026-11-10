/**
 * share-meta.ts — the Open Graph fields every public page needs.
 *
 * Next merges metadata shallowly: a page that sets its own `openGraph` object
 * replaces the root layout's whole object, including the image that
 * `app/opengraph-image.tsx` attached there. Such a page then shares with no
 * photo, no site name and no locale. Spread `ogBase()` first in every page-level
 * `openGraph` so those fields are restated:
 *
 *   openGraph: { ...ogBase("es"), title, description, url }
 *
 * Pass `{ image: false }` on a route that has its own `opengraph-image` file in
 * the same folder: `images` set in page metadata would win over that file.
 */
import { site } from "@/content/site";
import { OG_LOCALE, type SiteLang } from "@/lib/hreflang";

const ALT: Record<SiteLang, string> = {
  en: "TX Quince — Quinceañera photos & video in Dallas–Fort Worth",
  es: "TX Quince — Fotos y video de quinceañera en Dallas–Fort Worth",
};

export function ogBase(lang: SiteLang = "en", opts: { image?: boolean } = {}) {
  return {
    type: "website" as const,
    siteName: site.brand,
    locale: OG_LOCALE[lang],
    ...(opts.image === false
      ? {}
      : { images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: ALT[lang] }] }),
  };
}
