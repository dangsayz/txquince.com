import type { Metadata } from "next";
import { packages, investmentIntro, investmentFaqs } from "@/content/packages";
import { site } from "@/content/site";
import { FinalCTA } from "@/components/FinalCTA";
import { Badge, ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Investment — Quinceañera Collections",
  description:
    "Fixed-price quinceañera photography & film collections from $2,500. Compare Essential, Signature, and Legacy coverage for your celebration.",
  alternates: { canonical: "/investment" },
  openGraph: {
    title: "Investment — Quinceañera Collections · TX Quince",
    description: "Fixed-price quinceañera photography and film collections from $2,500.",
    url: `${site.url}/investment`,
  },
};

const visibleFaqs = investmentFaqs.filter((faq) =>
  faq.q === "Do you cover both the church and the reception?" || faq.q === "Do you offer payment plans?",
);

export default function InvestmentPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${site.url}/investment#service`,
        name: "Quinceañera Photography & Film",
        serviceType: "Quinceañera Photography & Film",
        provider: { "@type": "Organization", name: site.brand, "@id": `${site.url}/#business` },
        areaServed: { "@type": "City", name: "Dallas–Fort Worth, TX" },
        url: `${site.url}/investment`,
        offers: packages.map((collection) => ({
          "@type": "Offer",
          price: String(collection.price),
          priceCurrency: "USD",
          url: `${site.url}/reserve?collection=${collection.id}`,
          itemOffered: {
            "@type": "Service",
            name: `${collection.name} Collection`,
            description: collection.teaser,
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/investment#faq`,
        mainEntity: visibleFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${site.url}/investment#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Investment", item: `${site.url}/investment` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-line bg-ivory">
        <div className="mx-auto max-w-[96rem] px-5 py-14 sm:px-6 md:py-20 lg:px-8">
          <Badge>{investmentIntro.eyebrow}</Badge>
          <h1 className="mt-6 max-w-5xl font-display text-[clamp(2.75rem,5.5vw,5.5rem)] leading-[1.04] text-ink">Photo and film <span className="text-accent">collections.</span></h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-ink-soft">Choose photo, film, or both. Each collection shows its coverage and price up front.</p>
          <p className="mt-5 text-sm font-medium text-accent-strong">{investmentIntro.hook}</p>
        </div>
      </section>

      <section aria-labelledby="collections-heading" className="mx-auto max-w-[96rem] px-5 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-accent-strong">Compare collections</p>
            <h2 id="collections-heading" className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">Coverage and pricing</h2>
          </div>
          <span className="text-sm text-ink-soft">All prices in USD</span>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {packages.map((collection) => (
            <article key={collection.id} className={`flex h-full flex-col rounded-xl border bg-white p-6 sm:p-7 ${collection.highlight ? "border-accent shadow-[0_12px_36px_-28px_rgba(0,87,255,.35)]" : "border-line"}`}>
              <div className="flex min-h-7 items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-ink-faint">{collection.name} collection</span>
                {collection.highlight ? <Badge>Photo + film</Badge> : null}
              </div>
              <h3 className="mt-5 font-display text-3xl leading-tight text-ink">{collection.name}</h3>
              <p className="mt-3 min-h-12 text-sm leading-6 text-ink-soft">{collection.teaser}</p>
              <p className="mt-7 border-b border-line pb-6 font-display text-4xl leading-tight text-ink">{collection.priceLabel}</p>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-ink-faint">Included</p>
              <ul className="mt-4 flex-1 space-y-3">
                {collection.includes.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-ink-soft"><span aria-hidden="true" className="mt-1 text-accent">✓</span><span>{item}</span></li>
                ))}
              </ul>
              <div className="mt-8 border-t border-line pt-6">
                <p className="mb-4 text-xs text-ink-soft">Reserve with a {collection.depositLabel} deposit applied to your collection.</p>
                <ButtonLink href={`/reserve?collection=${collection.id}`} tone={collection.highlight ? "primary" : "secondary"} className="w-full">Choose {collection.name}</ButtonLink>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-soft">Payment plans are available. Reserve with a deposit and arrange the balance before your date.</p>
      </section>

      <section className="border-t border-line bg-ivory">
        <div className="mx-auto grid max-w-[96rem] gap-10 px-5 py-16 sm:px-6 md:grid-cols-[minmax(180px,.35fr)_minmax(0,1fr)] md:gap-14 md:py-20 lg:px-8">
          <div>
            <p className="text-xs font-semibold text-accent-strong">Questions</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Collection FAQs</h2>
          </div>
          <dl className="grid gap-4">
            {visibleFaqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-line bg-white p-6">
                <dt className="text-base font-semibold text-ink">{faq.q}</dt>
                <dd className="mt-3 text-sm leading-7 text-ink-soft">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <FinalCTA accent="Ready to plan?" headline="Tell us about your celebration." sub="Share your date and preferred collection. We'll follow up personally." />
    </>
  );
}
