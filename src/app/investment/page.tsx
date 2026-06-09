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
    "Fixed-price quinceañera photography & film collections from $2,500. Most families choose Signature ($3,900): two storytellers, the full day, film + gallery.",
  alternates: { canonical: "/investment" },
  openGraph: {
    title: "Investment — Quinceañera Collections · TX Quince",
    description:
      "Fixed-price collections from $2,500. Most families choose Signature ($3,900).",
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
      {/* Intro + hook */}
      <section className="mx-auto max-w-4xl px-5 pt-section text-center md:px-8 md:pt-section-lg">
        <Reveal>
          <p className="eyebrow mb-5">{investmentIntro.eyebrow}</p>
          <h1 className="mx-auto max-w-3xl display-2 text-ink text-balance">
            {investmentIntro.heading}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            {investmentIntro.subhead}
          </p>
          <p className="mx-auto mt-6 inline-block border-y border-line py-3 text-sm tracking-wide text-wine">
            {investmentIntro.hook}
          </p>
          <SocialProofStrip className="mt-10" />
        </Reveal>
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg">
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {packages.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 90}
              className={`flex h-full flex-col p-8 md:p-10 ${
                p.highlight
                  ? "bg-ink text-cream shadow-xl lg:-my-4 lg:py-14"
                  : "border border-line bg-ivory text-ink"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2
                  className={`font-display text-3xl ${p.highlight ? "text-cream" : "text-ink"}`}
                >
                  {p.name}
                </h2>
                {p.badge ? (
                  <span className="bg-wine px-3 py-1 text-[0.66rem] uppercase tracking-[0.18em] text-cream">
                    {p.badge}
                  </span>
                ) : null}
              </div>

              <p
                className={`mt-4 text-sm leading-relaxed ${p.highlight ? "text-cream/70" : "text-ink-soft"}`}
              >
                {p.tagline}
              </p>

              <p
                className={`mt-8 font-display text-5xl ${p.highlight ? "text-cream" : "text-ink"}`}
              >
                {p.priceLabel}
              </p>

              <ul className="mt-8 flex flex-1 flex-col gap-3.5">
                {p.includes.map((item) => (
                  <li
                    key={item}
                    className={`flex gap-3 text-sm leading-relaxed ${p.highlight ? "text-cream/85" : "text-ink-soft"}`}
                  >
                    <span
                      className={`mt-2 h-1 w-1 shrink-0 rounded-full ${p.highlight ? "bg-cream/60" : "bg-wine"}`}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <CTAButton
                  href={`/reserve?collection=${p.id}`}
                  variant={p.highlight ? "onDark" : "ink"}
                  className="w-full"
                >
                  Reserve {p.name}
                </CTAButton>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-ink-faint">
          Payment plans available — reserve with a deposit and split the balance in
          installments before your date.
        </p>
      </section>

      {/* FAQ */}
      <section className="bg-greige">
        <div className="mx-auto max-w-3xl px-5 py-section md:px-8 md:py-section-lg">
          <h2 className="display-2 text-ink">Questions, answered.</h2>
          <dl className="mt-10 divide-y divide-line border-y border-line">
            {investmentFaqs.map((f) => (
              <div key={f.q} className="py-7">
                <dt className="font-display text-xl text-ink">{f.q}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Reviews on the pricing page — 56% want proof before they inquire.
          Renders only when release-cleared testimonials exist. */}
      <Testimonials className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg" />

      <FinalCTA />
    </>
  );
}
