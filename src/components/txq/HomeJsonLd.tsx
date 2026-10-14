import { COPY } from "./copy";
import { TIER_IDS, TIER_NAME_EN, TIER_PRICE_USD } from "@/lib/commission";
import { site } from "@/content/site";

/** Page-level structured data: the FAQ shown on the page, plus the service catalog. */
export function HomeJsonLd({ lang }: { lang: "en" | "es" }) {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang === "es" ? "es-MX" : "en-US",
    mainEntity: COPY[lang].faq.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Quinceañera photography and videography",
    provider: { "@id": `${site.url}/#business` },
    areaServed: { "@type": "AdministrativeArea", name: "Dallas–Fort Worth, TX" },
    availableLanguage: ["English", "Spanish"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Commissions",
      itemListElement: TIER_IDS.map((id) => ({
        "@type": "Offer",
        name: TIER_NAME_EN[id],
        price: String(TIER_PRICE_USD[id]),
        priceCurrency: "USD",
        url: `${site.url}${lang === "es" ? "/es" : "/"}#commissions`,
      })),
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
    </>
  );
}

