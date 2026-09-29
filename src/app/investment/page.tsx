import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { packages, investmentIntro, investmentFaqs } from "@/content/packages";
import { site } from "@/content/site";
import { getPageHero } from "@/lib/content-db";

export const metadata: Metadata = {
  title: "Investment — Quinceañera Collections",
  description:
    "Fixed-price quinceañera photography and film collections from $1,800. Compare Moments, Essential, Signature, and Legacy coverage for your celebration.",
  alternates: { canonical: "/investment" },
  openGraph: {
    title: "Investment — Quinceañera Collections · TX Quince",
    description: "Fixed-price quinceañera photography and film collections from $1,800.",
    url: `${site.url}/investment`,
  },
};

const visibleFaqs = investmentFaqs;

export default async function InvestmentPage() {
  const hero = await getPageHero("investment");
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

      <section className="border-b border-line bg-ivory" aria-labelledby="investment-heading">
        <div className="mx-auto grid max-w-[88rem] gap-8 px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.82fr)] lg:items-center lg:gap-16 lg:px-12 lg:py-20">
          <div>
            <p className="text-xs font-semibold text-accent-strong">{investmentIntro.eyebrow}</p>
            <h1 id="investment-heading" className="mt-5 max-w-[16ch] font-display text-[clamp(2rem,3.5vw,3.25rem)] leading-[1.12] text-ink">
              {investmentIntro.heading}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink-soft">{investmentIntro.subhead}</p>
            <p className="mt-5 max-w-xl border-l-2 border-accent pl-4 text-sm leading-6 text-ink-soft">{investmentIntro.hook}</p>
            <Link href="#collections-heading" className="mt-8 inline-flex min-h-11 items-center border-b border-accent pb-1 text-sm font-semibold text-accent-strong transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Explore the collections <span aria-hidden="true" className="ml-3">↘</span>
            </Link>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-greige sm:aspect-[16/10] lg:aspect-[4/5]">
            <Image
              src={hero?.url ?? "/portfolio/reception.webp"}
              alt={hero?.alt || "Quinceañera portrait in a pink gown"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
              style={hero ? { objectPosition: `${Math.round((hero.focus_x ?? 0.5) * 100)}% ${Math.round((hero.focus_y ?? 0.5) * 100)}%` } : { objectPosition: "center 35%" }}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="collections-heading" className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mb-10 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)] md:items-end">
          <div>
            <p className="text-xs font-semibold text-accent-strong">Photo &amp; film collections</p>
            <h2 id="collections-heading" className="mt-3 font-display text-[clamp(1.875rem,3vw,2.75rem)] leading-tight text-ink">Find the coverage that fits her day.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-ink-soft md:justify-self-end">Four clear options. Every price is in USD, and the collection deposit is applied to your balance.</p>
        </div>

        <div className="border-t border-line">
          {packages.map((collection, index) => (
            <article key={collection.id} id={collection.id} className={`scroll-mt-24 border-b border-line px-1 py-8 sm:py-10 lg:px-8 ${collection.highlight ? "-mx-3 border-l-[3px] border-l-accent bg-accent-soft px-4 sm:-mx-4 sm:px-5 lg:mx-0 lg:px-8" : ""}`}>
              <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
                <div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-xs font-semibold tabular-nums text-accent-strong">0{index + 1} / 0{packages.length}</span>
                    {collection.badge ? <span className="text-xs font-semibold text-accent-strong">{collection.badge}</span> : null}
                  </div>
                  <h3 className="mt-4 font-display text-[clamp(1.625rem,2.4vw,2.125rem)] leading-tight text-ink">{collection.name}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">{collection.tagline}</p>
                  <div className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-1">
                    <p className="font-display text-[clamp(2rem,2.6vw,2.5rem)] leading-none text-ink">{collection.priceLabel}</p>
                    <p className="text-sm text-ink-soft">{collection.depositLabel} deposit to reserve</p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-ink-faint">What&apos;s included</p>
                  <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    {collection.includes.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-ink-soft"><span aria-hidden="true" className="text-accent-strong">✓</span><span>{item}</span></li>
                    ))}
                  </ul>
                  <Link href={`/reserve?collection=${collection.id}`} className={`mt-7 inline-flex min-h-11 w-full items-center justify-between rounded-full border px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto sm:self-start ${collection.highlight ? "border-accent bg-accent text-white hover:bg-accent-strong" : "border-ink text-ink hover:bg-ink hover:text-white"}`}>
                    Request {collection.name} <span aria-hidden="true" className="ml-5">↗</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-7 max-w-2xl text-sm leading-6 text-ink-soft">Payment plans are available. After your date and coverage are confirmed, a collection deposit holds the date and applies to the balance.</p>
      </section>

      <section className="border-t border-line bg-ivory" aria-labelledby="faq-heading">
        <div className="mx-auto grid max-w-[88rem] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(12rem,0.45fr)_minmax(0,1fr)] lg:gap-20 lg:px-12 lg:py-24">
          <div>
            <p className="text-xs font-semibold text-accent-strong">Good to know</p>
            <h2 id="faq-heading" className="mt-3 font-display text-[clamp(1.875rem,3vw,2.75rem)] leading-tight text-ink">Collection questions.</h2>
          </div>
          <dl className="border-t border-line">
            {visibleFaqs.map((faq) => (
              <div key={faq.q} className="border-b border-line py-6 sm:py-7">
                <dt className="text-base font-medium leading-6 text-ink">{faq.q}</dt>
                <dd className="mt-3 max-w-3xl text-sm leading-7 text-ink-soft">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-accent-soft" aria-labelledby="investment-next-heading">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-5 py-14 sm:px-8 sm:py-16 md:flex-row md:items-end md:justify-between lg:px-12">
          <div>
            <p className="text-xs font-semibold text-accent-strong">The next step</p>
            <h2 id="investment-next-heading" className="mt-3 max-w-2xl font-display text-[clamp(1.875rem,3vw,2.75rem)] leading-tight text-ink">Let&apos;s see if her date is open.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-ink-soft">Share the date and the collection you have in mind. We&apos;ll confirm the details with you personally.</p>
          </div>
          <Link href="/check-your-date" className="inline-flex min-h-12 shrink-0 items-center justify-between rounded-full bg-accent px-7 text-sm font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            Check her date <span aria-hidden="true" className="ml-6">↗</span>
          </Link>
        </div>
      </section>
    </>
  );
}
