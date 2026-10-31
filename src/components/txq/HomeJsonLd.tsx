import { COPY } from "./copy";
import { PUBLIC_TIER_IDS, TIER_NAME_EN, type PriceBook } from "@/lib/commission";
import { fillDeep } from "@/lib/price-text";
import { site } from "@/content/site";
import { jsonLdString } from "@/lib/json-ld";
import { businessContactJsonLd } from "@/lib/contact";
import { HREFLANG } from "@/lib/hreflang";

/** Page-level structured data: the FAQ shown on the page, plus the service catalog — both from the live book. */
export function HomeJsonLd({ lang, book }: { lang: "en" | "es"; book: PriceBook }) {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: HREFLANG[lang],
    mainEntity: fillDeep(COPY[lang].faq.items, book).map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Quinceañera photography and videography",
    // The site-wide ProfessionalService (JsonLd.tsx), restated with its phone so
    // this block stands on its own: telephone + bilingual ContactPoint.
    provider: {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#business`,
      name: site.brand,
      url: site.url,
      ...businessContactJsonLd(),
      sameAs: [site.social.instagram, site.social.youtube, site.social.facebook].filter(Boolean),
    },
    areaServed: { "@type": "AdministrativeArea", name: "Dallas–Fort Worth, TX" },
    availableLanguage: ["English", "Spanish"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Commissions",
      itemListElement: PUBLIC_TIER_IDS.map((id) => ({
        "@type": "Offer",
        name: TIER_NAME_EN[id],
        price: String(book.packages[id].price),
        priceCurrency: "USD",
        url: `${site.url}${lang === "es" ? "/es" : "/"}#commissions`,
      })),
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(service) }} />
    </>
  );
}

