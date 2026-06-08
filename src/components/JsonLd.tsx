import { site } from "@/content/site";
import { packages } from "@/content/packages";

/**
 * LocalBusiness structured data (SEO BASELINE — hygiene only). Driven from
 * content so it stays in sync with brand, area, and pricing.
 */
export function JsonLd() {
  const prices = packages.map((p) => p.price);
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}/#business`,
    name: site.brand,
    description: site.tagline,
    url: site.url,
    image: `${site.url}/opengraph-image`,
    email: site.contact.email,
    ...(site.contact.phoneE164 ? { telephone: site.contact.phoneE164 } : {}),
    areaServed: {
      "@type": "City",
      name: "Dallas–Fort Worth",
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: "TX",
      addressCountry: "US",
    },
    priceRange: `$${Math.min(...prices)}–$${Math.max(...prices)}`,
    knowsLanguage: ["en", "es"],
    sameAs: [site.social.instagram, site.social.facebook].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
