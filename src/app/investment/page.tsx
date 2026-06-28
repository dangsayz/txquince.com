import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { packages, investmentIntro, investmentFaqs } from "@/content/packages";
import { site } from "@/content/site";
import { getFeaturedImages } from "@/lib/content-db";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCTA } from "@/components/FinalCTA";
import { Testimonials } from "@/components/Testimonials";

export const revalidate = 3600;

export const metadata: Metadata = {
  // Title leads with the harvested search phrase (prices/packages), not the
  // brand word "Investment" nobody searches. Renders "… · TX Quince" (~53 chars).
  title: "Quinceañera Photography Prices & Packages",
  description:
    "Quinceañera photography prices in Dallas–Fort Worth — fixed collections from $1,800, with Signature at $3,900. Every price stated plainly, no hidden costs.",
  alternates: { canonical: "/investment" },
  openGraph: {
    title: "Quinceañera Photography Prices & Packages — Dallas–Fort Worth",
    description:
      "Fixed-price quinceañera collections from $1,800. Most families choose Signature at $3,900 — prices stated plainly.",
    url: `${site.url}/investment`,
  },
};

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.32) * 100)}%`;
}

export default async function InvestmentPage() {
  // A landscape frame crops cleanest for the wide cinematic hero.
  const imgs = await getFeaturedImages(12);
  const hero = imgs.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ?? imgs[0] ?? null;

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
      {/* Cover — cinematic image hero, type low-left in cream (was text-on-cream). */}
      <section className="relative overflow-hidden bg-ink">
        <div className="relative h-[66svh] min-h-[440px] w-full md:h-[76svh]">
          {hero?.url ? (
            <Image
              src={hero.url}
              alt={hero.alt || "Quinceañera photography in Dallas–Fort Worth"}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: focal(hero.focus_x, hero.focus_y) }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/45 to-ink/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-[90rem] px-5 pb-12 md:px-10 lg:px-16 md:pb-16">
              <Reveal>
                <p className="text-[0.62rem] uppercase tracking-[0.32em] text-cream/85">
                  {investmentIntro.eyebrow}
                </p>
                <h1
                  className="mt-4 max-w-3xl font-display text-cream text-balance"
                  style={{ fontSize: "clamp(2.4rem,5.8vw,5rem)", lineHeight: 1.0, letterSpacing: "-0.026em" }}
                >
                  {investmentIntro.heading}
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/80 md:text-base">
                  {investmentIntro.subhead}
                </p>
                <p className="mt-6 text-[0.7rem] uppercase tracking-[0.22em] text-wine-tint">
                  {investmentIntro.hook}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Collections — tiered cards. The target tier (Signature) carries the
          dark "contrast engine" so it dominates; the rest are light ivory cards
          on a warm cream band. Structure + supporting color, not a flat ledger. */}
      <section className="border-y border-ink/10 bg-cream">
        <div className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 lg:px-16 md:py-24">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
            {packages.map((p, i) => {
              const featured = Boolean(p.highlight);
              return (
                <Reveal key={p.id} delay={i * 60} className="h-full">
                  <div
                    className={`flex h-full flex-col rounded-[1.5rem] p-7 md:p-8 ${
                      featured
                        ? "bg-ink text-cream shadow-[0_36px_80px_-30px_rgba(28,26,23,0.45)]"
                        : "border border-line bg-ivory shadow-[0_24px_60px_-32px_rgba(28,26,23,0.16)]"
                    }`}
                  >
                    {featured ? (
                      <span className="mb-5 inline-flex w-fit rounded-full bg-wine px-3 py-1 text-[0.58rem] font-medium uppercase tracking-[0.22em] text-cream">
                        {p.badge ?? "Most reserved"}
                      </span>
                    ) : null}
                    <h2
                      className={`font-display ${featured ? "text-cream" : "text-ink"}`}
                      style={{ fontSize: "clamp(1.8rem,2.6vw,2.4rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
                    >
                      {p.name}
                    </h2>
                    <p className={`mt-3 text-sm leading-relaxed ${featured ? "text-cream/75" : "text-ink-soft"}`}>
                      {p.tagline}
                    </p>
                    <p
                      className={`mt-6 font-display ${featured ? "text-cream" : "text-ink"}`}
                      style={{ fontSize: "clamp(2.2rem,3.4vw,3rem)", lineHeight: 1 }}
                    >
                      {p.priceLabel}
                    </p>
                    <p className={`mt-1.5 text-xs ${featured ? "text-cream/60" : "text-ink-faint"}`}>
                      {p.depositLabel} reserves your date
                    </p>

                    <p
                      className={`mt-7 text-[0.62rem] uppercase tracking-[0.24em] ${
                        featured ? "text-wine-tint" : "text-ink-faint"
                      }`}
                    >
                      Included
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {p.includes.map((item) => (
                        <li
                          key={item}
                          className={`flex gap-2.5 text-sm leading-relaxed ${
                            featured ? "text-cream/85" : "text-ink-soft"
                          }`}
                        >
                          <span aria-hidden className={featured ? "text-wine-tint" : "text-wine-deep"}>
                            &middot;
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-8">
                      <CTAButton
                        href={`/reserve?collection=${p.id}`}
                        variant={featured ? "onDark" : "text"}
                      >
                        Reserve {p.name}
                      </CTAButton>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-14 grid gap-x-12 gap-y-8 border-t border-ink/10 pt-10 md:grid-cols-2">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">Add-ons</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
                <li>
                  <span className="text-ink">Save-the-date / dress session — $500.</span>{" "}
                  Complimentary from the Essential collection up; a standalone add-on with
                  Moments.{" "}
                  <Link
                    href="/blog/best-quinceanera-photo-locations-dfw"
                    className="text-wine-deep underline underline-offset-4 hover:text-wine"
                  >
                    See our DFW locations
                  </Link>
                  .
                </li>
                <li>
                  <span className="text-ink">Additional coverage hours — $350 each.</span>{" "}
                  Arrange them at least a week before your date so we can plan the day around
                  them.
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">Payment</p>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                Reserve with a deposit and split the balance into interest-free installments
                before your date. Serving{" "}
                <Link
                  href="/quinceanera-photographer"
                  className="text-wine-deep underline underline-offset-4 hover:text-wine"
                >
                  quinceañera photography across Dallas–Fort Worth
                </Link>
                .
              </p>
            </div>
          </div>
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
