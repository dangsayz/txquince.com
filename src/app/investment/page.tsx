import type { Metadata } from "next";
import { packages, investmentIntro, investmentFaqs } from "@/content/packages";
import { site } from "@/content/site";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCTA } from "@/components/FinalCTA";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { Testimonials } from "@/components/Testimonials";

export const metadata: Metadata = {
  title: "Investment — Quinceañera Collections",
  description:
    "Fixed-price quinceañera photography & film collections from $1,800. Most families choose Signature ($3,900): two storytellers, the full day, film + gallery.",
  alternates: { canonical: "/investment" },
  openGraph: {
    title: "Investment — Quinceañera Collections · TX Quince",
    description:
      "Fixed-price collections from $1,800. Most families choose Signature ($3,900).",
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

      {/* Collections — four DISTINCT cards with real separation (the old flat
          ledger blended into the page). Each tier is its own panel; Signature is
          inverted to ink so it reads as the obvious choice, and every card wears
          its hours of coverage as a chip. */}
      <section className="mx-auto mt-16 max-w-[90rem] px-5 md:mt-24 md:px-10 lg:px-16">
        <div className="flex flex-col gap-6">
          {packages.map((p, i) => {
            const dark = Boolean(p.highlight);
            return (
              <Reveal
                key={p.id}
                delay={i * 60}
                className={`relative grid gap-y-8 rounded-[1.75rem] border p-7 md:grid-cols-12 md:gap-x-8 md:p-12 ${
                  dark
                    ? "border-wine bg-ink text-cream shadow-2xl shadow-ink/20"
                    : "border-ink/15 bg-white text-ink"
                }`}
              >
                {/* Name · hours · tagline · price */}
                <div className="md:col-span-4">
                  {dark ? (
                    <span className="mb-4 inline-block rounded-full bg-wine px-3 py-1 text-[0.58rem] uppercase tracking-[0.24em] text-cream">
                      Most reserved
                    </span>
                  ) : null}
                  <h2
                    className="font-display"
                    style={{
                      fontSize: p.highlight ? "clamp(2.2rem,4vw,3.4rem)" : "clamp(1.9rem,3.2vw,2.7rem)",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {p.name}
                  </h2>
                  <p
                    className={`mt-4 inline-flex items-center rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] ${
                      dark ? "border-cream/30 text-cream/80" : "border-ink/20 text-ink-soft"
                    }`}
                  >
                    {p.hours} hours of coverage
                  </p>
                  <p className={`mt-5 max-w-xs text-sm leading-relaxed ${dark ? "text-cream/75" : "text-ink-soft"}`}>
                    {p.tagline}
                  </p>
                  <p className="mt-7 font-display" style={{ fontSize: "clamp(2.6rem,4.6vw,3.9rem)", lineHeight: 1 }}>
                    {p.priceLabel}
                  </p>
                </div>

                {/* Includes — two quiet columns */}
                <div className="md:col-span-7 md:col-start-6">
                  <p className={`text-[0.62rem] uppercase tracking-[0.24em] ${dark ? "text-cream/55" : "text-ink-faint"}`}>
                    Included
                  </p>
                  <ul className="mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                    {p.includes.map((item) => (
                      <li
                        key={item}
                        className={`border-b pb-3 text-sm leading-relaxed ${
                          dark ? "border-cream/15 text-cream/85" : "border-ink/[0.08] text-ink-soft"
                        }`}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-7">
                    <CTAButton href={`/reserve?collection=${p.id}`} variant={dark ? "onDark" : "ink"}>
                      Reserve {p.name}
                    </CTAButton>
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-ink-faint">
          Payment plans available — reserve with a deposit and split the balance into
          interest-free installments before your date.
        </p>
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
