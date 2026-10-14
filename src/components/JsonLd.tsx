import { site } from "@/content/site";
import {
  PRICE_CEILING_USD,
  PRICE_FLOOR_USD,
  TIER_IDS,
  TIER_NAME_EN,
  TIER_PRICE_USD,
} from "@/lib/commission";
import { locations } from "@/content/locations";

/**
 * LocalBusiness structured data (SEO BASELINE). Driven from content so it stays
 * in sync with brand, area, and pricing. As a service-area business (no
 * storefront), it declares an enumerated areaServed city list + a GeoCircle
 * footprint + a machine-readable price catalog — the on-site signals that make
 * the site eligible for local "near me" queries across the metroplex (the GBP
 * is what actually wins them; this reinforces relevance).
 */
export function JsonLd() {
  const areaServed = [
    ...locations.map((l) => ({ "@type": "City", name: `${l.city}, TX` })),
    { "@type": "City", name: "Oak Cliff, TX" },
    { "@type": "AdministrativeArea", name: "Dallas–Fort Worth, TX" },
  ];
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
    areaServed,
    // Service-area business footprint (no storefront): metroplex center
    // (Arlington) + 50km covers every served city.
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: { "@type": "GeoCoordinates", latitude: 32.7357, longitude: -97.1081 },
      geoRadius: "50000",
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: "TX",
      addressCountry: "US",
    },
    priceRange: `$${PRICE_FLOOR_USD.toLocaleString("en-US")}–$${PRICE_CEILING_USD.toLocaleString("en-US")}`,
    // Machine-readable price catalog from the commission price book — rivals
    // show "inquire for pricing"; this feeds price queries and AI overviews.
    makesOffer: TIER_IDS.map((id) => ({
      "@type": "Offer",
      name: `${TIER_NAME_EN[id]} — Quinceañera Photos & Video`,
      price: String(TIER_PRICE_USD[id]),
      priceCurrency: "USD",
      url: `${site.url}/#commissions`,
    })),
    knowsLanguage: ["en", "es"],
    sameAs: [site.social.instagram, site.social.youtube, site.social.facebook].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
