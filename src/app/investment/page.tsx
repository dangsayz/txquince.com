import type { Metadata } from "next";
import Link from "next/link";
import { packages, investmentIntro, investmentFaqs } from "@/content/packages";
import { site } from "@/content/site";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCTA } from "@/components/FinalCTA";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { Testimonials } from "@/components/Testimonials";

export const metadata: Metadata = {
  // Title leads with the harvested search phrase (prices/packages), not the
  // brand word "Investment" nobody searches. Renders "… · TX Quince" (~53 chars).
  title: "Quinceañera Photography Prices & Packages",
  description:
    "Quinceañera photography prices in Dallas–Fort Worth — fixed collections from $2,500, with Signature at $3,900. Every price stated plainly, no hidden costs.",
  alternates: { canonical: "/investment" },
  openGraph: {
    title: "Quinceañera Photography Prices & Packages — Dallas–Fort Worth",
    description:
      "Fixed-price quinceañera collections from $2,500. Most families choose Signature at $3,900 — prices stated plainly.",
    url: `${site.url}/investment`,
  },
};

export default function InvestmentPage() {
  // Machine-readable pricing (Service + Offer per collection) so the fixed
  // prices win cost-query SERPs + AI overviews where rivals show "inquire for
  // pricing". Plus FAQPage + breadcrumb. No Review/AggregateRating (no consented
  // reviews — subjects are minors).
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
        offers: packages.map((p) => ({
          "@type": "Offer",
          price: String(p.price),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${site.url}/reserve?collection=${p.id}`,
          itemOffered: {
            "@type": "Service",
            name: `${p.name} Collection`,
            description: p.teaser,
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/investment#faq`,
        mainEntity: investmentFaqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Cover — editorial: overline, oversized statement, narrow standfirst. */}
      <section className="mx-auto max-w-[90rem] px-5 pt-20 md:px-10 lg:px-16 md:pt-32">
        <Reveal>
          <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">
            {investmentIntro.eyebrow}
          </p>
          <h1
            className="mt-5 max-w-5xl font-display text-ink"
            style={{ fontSize: "clamp(2.6rem,6.4vw,5.6rem)", lineHeight: 0.98, letterSpacing: "-0.026em" }}
          >
            {investmentIntro.heading}
          </h1>
          <p className="mt-7 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
            {investmentIntro.subhead}
          </p>
          <p className="mt-6 text-[0.7rem] uppercase tracking-[0.22em] text-wine-deep">
            {investmentIntro.hook}
          </p>
          <SocialProofStrip className="mt-12" />
        </Reveal>
      </section>

      {/* Collections — a lookbook ledger: hairline rows, includes set like an
          index, emphasis through scale (no cards, no dark blocks, no badges). */}
      <section className="mt-20 border-y border-ink/10 bg-white md:mt-28">
        <div className="mx-auto max-w-[90rem] px-5 py-8 md:px-10 lg:px-16 md:py-12">
          {packages.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 60}
              className={`grid gap-y-8 py-12 md:grid-cols-12 md:gap-x-8 md:py-16 ${
                i > 0 ? "border-t border-ink/10" : ""
              }`}
            >
              {/* Name · tagline · price */}
              <div className="md:col-span-4">
                <h2
                  className="font-display text-ink"
                  style={{
                    fontSize: p.highlight ? "clamp(2.2rem,4vw,3.4rem)" : "clamp(1.9rem,3.2vw,2.7rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {p.name}
                </h2>
                {p.highlight ? (
                  <p className="mt-3 text-[0.6rem] uppercase tracking-[0.26em] text-wine-deep">
                    Most reserved
                  </p>
                ) : null}
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{p.tagline}</p>
                <p
                  className="mt-7 font-display text-ink"
                  style={{ fontSize: "clamp(2.4rem,4.4vw,3.6rem)", lineHeight: 1 }}
                >
                  {p.priceLabel}
                </p>
              </div>

              {/* Includes — two quiet columns */}
              <div className="md:col-span-6 md:col-start-6">
                <p className="text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">Included</p>
                <ul className="mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                  {p.includes.map((item) => (
                    <li key={item} className="border-b border-ink/[0.06] pb-3 text-sm leading-relaxed text-ink-soft">
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-7">
                  <CTAButton href={`/reserve?collection=${p.id}`} variant="text">
                    Reserve {p.name}
                  </CTAButton>
                </p>
              </div>
            </Reveal>
          ))}

          <p className="border-t border-ink/10 pt-8 text-xs text-ink-faint">
            Payment plans available — reserve with a deposit and split the balance into
            interest-free installments before your date. Serving{" "}
            <Link
              href="/quinceanera-photographer"
              className="text-wine-deep underline underline-offset-4 hover:text-wine"
            >
              quinceañera photography across Dallas–Fort Worth
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ — offset editorial Q&A */}
      <section className="mx-auto max-w-[90rem] px-5 py-24 md:px-10 lg:px-16 md:py-36">
        <div className="grid md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">Questions</p>
            <h2
              className="mt-4 font-display text-ink"
              style={{ fontSize: "clamp(2rem,3.6vw,3rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
            >
              Answered plainly.
            </h2>
          </div>
          <dl className="mt-10 md:col-span-6 md:col-start-6 md:mt-0">
            {investmentFaqs.map((f, i) => (
              <div key={f.q} className={`py-7 ${i > 0 ? "border-t border-ink/10" : ""}`}>
                <dt className="font-display text-xl text-ink">{f.q}</dt>
                <dd className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Reviews on the pricing page — 56% want proof before they inquire.
          Renders only when release-cleared testimonials exist. */}
      <Testimonials className="mx-auto max-w-7xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg" />

      <FinalCTA />
    </>
  );
}
