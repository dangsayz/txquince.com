/**
 * hreflang.ts — the one definition of the site's language/region tags.
 *
 * The Spanish pages are written for Spanish speakers in the United States
 * (Dallas–Fort Worth families), so they are `es-US`, not `es-MX`. Every page
 * that has a translation declares both languages plus `x-default` pointing at
 * the English page, and the pair must be reciprocal (each side lists the other).
 *
 * Use `languageAlternates()` for page metadata and sitemap entries instead of
 * spelling the tags inline, so the tags cannot drift apart again.
 */

export type SiteLang = "en" | "es";

/** hreflang / BCP-47 tags (`<link rel="alternate" hreflang>`, JSON-LD inLanguage). */
export const HREFLANG = { en: "en-US", es: "es-US" } as const satisfies Record<SiteLang, string>;

/** Open Graph locales (underscore form). */
export const OG_LOCALE = { en: "en_US", es: "es_US" } as const satisfies Record<SiteLang, string>;

/**
 * `alternates.languages` for an EN ↔ ES page pair. Paths may be relative
 * (resolved against `metadataBase`) or absolute; `x-default` is the English page.
 */
export function languageAlternates(en: string, es: string): Record<string, string> {
  return { [HREFLANG.en]: en, [HREFLANG.es]: es, "x-default": en };
}
