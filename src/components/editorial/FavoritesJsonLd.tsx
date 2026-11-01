import { JsonLdScript } from "@/components/plan/JsonLdScript";
import { site } from "@/content/site";
import { HREFLANG } from "@/lib/hreflang";
import { sizedSrc, type Favorite } from "@/lib/favorites";

/**
 * ImageGallery structured data for the homepage favorites: each photo names
 * TX Quince as creator with a credit line and copyright notice, which Google
 * Images shows next to the photo (credit that travels if a copy is found).
 */
export function FavoritesJsonLd({ favorites, lang }: { favorites: Favorite[]; lang: "en" | "es" }) {
  const photos = favorites.filter((f) => f.href);
  if (!photos.length) return null;
  const pageUrl = lang === "es" ? `${site.url}/es` : site.url;
  const data = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${pageUrl}#favorites`,
    name: lang === "es" ? "Fotos favoritas de quinceañera — TX Quince" : "Favorite quinceañera photos — TX Quince",
    inLanguage: HREFLANG[lang],
    url: pageUrl,
    author: { "@id": `${site.url}/#business` },
    image: photos.map((f) => ({
      "@type": "ImageObject",
      contentUrl: `${site.url}${sizedSrc(f.src, 1440)}`,
      url: `${site.url}${f.href}`,
      width: f.width,
      height: f.height,
      caption: f.alt || undefined,
      creator: { "@type": "Organization", "@id": `${site.url}/#business`, name: site.brand },
      creditText: site.brand,
      copyrightHolder: { "@id": `${site.url}/#business` },
      copyrightNotice: `© ${site.brand}`,
    })),
  };
  return <JsonLdScript data={data} />;
}
