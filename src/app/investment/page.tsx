import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { packages, investmentIntro, investmentFaqs } from "@/content/packages";
import { site } from "@/content/site";
import { getFeaturedImages, getPageHero } from "@/lib/content-db";
import { Reveal } from "@/components/Reveal";
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
  // A landscape frame crops cleanest for the wide cinematic hero — unless the
  // operator picked a specific one in /admin/hero.
  const imgs = await getFeaturedImages(12);
  const hero =
    (await getPageHero("investment")) ??
    imgs.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ??
    imgs[0] ??
    null;

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
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-[90rem] lg:grid-cols-12">
          <div className="flex flex-col justify-center px-5 py-16 md:px-10 md:py-24 lg:col-span-7 lg:px-16 lg:py-28">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">
              Quinceañera photography &amp; film · Dallas–Fort Worth
            </p>
            <h1 className="mt-6 max-w-[11ch] font-serif text-[clamp(3.8rem,7vw,6.8rem)] leading-[0.92] tracking-[-0.04em] text-ink">
              Prices, stated plainly.
            </h1>
            <p className="mt-7 max-w-[52ch] text-lg leading-8 text-ink-soft">
              {investmentIntro.subhead}
            </p>
            <p className="mt-5 max-w-[52ch] text-base leading-7 text-ink-soft">
              {investmentIntro.hook}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/check-your-date" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-ink px-6 text-base font-semibold text-white hover:bg-ink/85">
                Check her date <span aria-hidden className="ml-2">→</span>
              </Link>
              <span className="text-sm text-ink-soft">No payment to ask · from $1,800</span>
            </div>
          </div>
          <div className="relative min-h-[340px] sm:min-h-[520px] lg:col-span-5 lg:min-h-[640px]">
            {hero?.url ? (
              <Image
                src={hero.url}
                alt={hero.alt || "Quinceañera photography in Dallas–Fort Worth"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
                style={{ objectPosition: focal(hero.focus_x, hero.focus_y) }}
              />
            ) : <div className="absolute inset-0 bg-greige" />}
          </div>
        </div>
      </section>

      <section className="bg-greige">
        <div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">The collections</p>
              <h2 className="mt-3 font-serif text-[clamp(2.8rem,5vw,4.5rem)] leading-none text-ink">Choose how to remember it.</h2>
            </div>
            <p className="max-w-sm text-base leading-7 text-ink-soft">Every price and inclusion is here. Ask about a date before you decide.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:gap-7">
            {packages.map((p, i) => {
              const featured = Boolean(p.highlight);
              return (
                <Reveal key={p.id} delay={i * 60} className="h-full">
                  <div
                    className={`flex h-full flex-col border p-7 sm:p-9 lg:p-11 ${
                      featured
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-white"
                    }`}
                  >
                    {featured ? (
                      <span className="mb-5 inline-flex w-fit border border-white/40 px-3 py-1.5 text-xs font-medium text-white">
                        {p.badge ?? "Most reserved"}
                      </span>
                    ) : null}
                    <h3
                      className={`font-serif text-[clamp(2.4rem,4vw,3.5rem)] leading-none ${featured ? "text-white" : "text-ink"}`}
                    >
                      {p.name}
                    </h3>
                    <p className={`mt-4 text-base leading-7 ${featured ? "text-white/80" : "text-ink-soft"}`}>
                      {p.tagline}
                    </p>
                    <p
                      className={`mt-7 font-serif text-[clamp(3rem,5vw,4rem)] leading-none ${featured ? "text-white" : "text-ink"}`}
                    >
                      {p.priceLabel}
                    </p>
                    <p className={`mt-2 text-sm ${featured ? "text-white/80" : "text-ink-soft"}`}>
                      {p.depositLabel} reserves your date
                    </p>

                    <p
                      className={`mt-8 border-t pt-6 text-sm font-semibold ${
                        featured ? "border-white/25 text-white" : "border-line text-ink"
                      }`}
                    >
                      Included
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {p.includes.map((item) => (
                        <li
                          key={item}
                          className={`flex gap-2.5 text-base leading-7 ${
                            featured ? "text-white/85" : "text-ink-soft"
                          }`}
                        >
                          <span aria-hidden className={featured ? "text-wine-tint" : "text-wine-deep"}>
                            &middot;
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-9">
                      <Link href={`/reserve?collection=${p.id}`} className={`inline-flex min-h-12 items-center justify-center px-6 text-base font-semibold ${featured ? "bg-white text-ink hover:bg-cream" : "bg-ink text-white hover:bg-ink/85"}`}>
                        Request {p.name} <span aria-hidden className="ml-2">→</span>
                      </Link>
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
