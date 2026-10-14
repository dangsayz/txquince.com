import type { Metadata } from "next";
import { TxqSite } from "@/components/txq/TxqSite";
import { COPY } from "@/components/txq/copy";
import { PRICE_FLOOR_USD, TIER_IDS, TIER_NAME_EN, TIER_PRICE_USD } from "@/lib/commission";
import { site } from "@/content/site";

const from = `$${PRICE_FLOOR_USD.toLocaleString("en-US")}`;

export const metadata: Metadata = {
  // Leads with the highest-intent local phrase families type.
  title: { absolute: "Quinceañera Photographer & Videographer in Dallas–Fort Worth | TX Quince" },
  description: `Luxury quinceañera photography and film across Dallas–Fort Worth, from Highland Park to Southlake. Published commissions from ${from}, bilingual from first call to final film. Check your date live.`,
  alternates: { canonical: "/" },
  openGraph: {
    title: "TX Quince — Quinceañera Photography & Film, Dallas–Fort Worth",
    description: `Editorial portraits and cinema for the quinceañera. Commissions from ${from}.`,
    url: site.url,
  },
};

/** Page-level structured data: the FAQ shown on the page, plus the service catalog. */
function HomeJsonLd() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: COPY.en.faq.items.map((i) => ({
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
        url: `${site.url}/#commissions`,
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

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <TxqSite />
    </>
  );
}
