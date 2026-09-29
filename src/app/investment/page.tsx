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

      <section aria-labelledby="investment-heading" className="mx-auto max-w-[88rem] px-5 pb-12 pt-14 text-center sm:px-8 sm:pb-16 sm:pt-20 lg:px-12 lg:pt-24">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">{investmentIntro.eyebrow}</p>
        <h1 id="investment-heading" className="mx-auto mt-5 max-w-[18ch] font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink">{investmentIntro.heading}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">{investmentIntro.subhead}</p>
        <Link href="#collections-heading" className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Explore collections <span aria-hidden="true">↓</span></Link>
        <div className="relative mt-12 aspect-[4/3] overflow-hidden rounded-xl bg-greige sm:mt-16 sm:aspect-[16/8]">
          <Image src={hero?.url ?? "/portfolio/reception.webp"} alt={hero?.alt || "Quinceañera portrait in a pink gown"} fill priority sizes="(max-width: 1408px) 100vw, 1408px" className="object-cover" style={hero ? { objectPosition: `${Math.round((hero.focus_x ?? 0.5) * 100)}% ${Math.round((hero.focus_y ?? 0.5) * 100)}%` } : { objectPosition: "center 35%" }} />
        </div>
      </section>

      <section aria-labelledby="collections-heading" className="border-t border-line bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Photo &amp; film</p>
              <h2 id="collections-heading" className="mt-3 font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">Choose her collection.</h2>
            </div>
            <p className="max-w-sm text-base leading-7 text-ink-soft">Four ways to document the day. Every price is in USD, and the deposit applies to your balance.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {packages.map((collection) => (
              <article key={collection.id} id={collection.id} className={`flex scroll-mt-24 flex-col rounded-xl border p-6 sm:p-7 ${collection.highlight ? "border-ink bg-accent-soft" : "border-line bg-white"}`}>
                <div className="flex min-h-6 items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">Collection</p>
                  {collection.badge ? <p className="text-xs font-medium text-ink">{collection.badge}</p> : null}
                </div>
                <h3 className="mt-5 font-display text-[1.75rem] leading-tight text-ink">{collection.name}</h3>
                <p className="mt-2 min-h-16 text-base leading-6 text-ink-soft">{collection.tagline}</p>
                <p className="mt-8 font-display text-[2rem] leading-none text-ink">{collection.priceLabel}</p>
                <p className="mt-2 text-base text-ink-soft">{collection.depositLabel} deposit to reserve</p>
                <div className="mt-7 border-t border-line pt-6">
                  <p className="text-sm font-medium text-ink">What&apos;s included</p>
                  <ul className="mt-4 space-y-3">
                    {collection.includes.map((item) => <li key={item} className="flex gap-3 text-base leading-6 text-ink-soft"><span aria-hidden="true" className="text-ink">✓</span><span>{item}</span></li>)}
                  </ul>
                </div>
                <Link href={`/reserve?collection=${collection.id}`} className="mt-auto inline-flex min-h-12 items-center justify-between gap-5 rounded-md bg-ink px-5 text-base font-medium text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Request {collection.name}<span aria-hidden="true">↗</span></Link>
              </article>
            ))}
          </div>
          <p className="mt-7 max-w-3xl text-base leading-7 text-ink-soft">{investmentIntro.hook} Payment plans are available. After your date and coverage are confirmed, the collection deposit holds the date and applies to the balance.</p>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mx-auto grid max-w-[88rem] gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(12rem,0.4fr)_minmax(0,1fr)] lg:gap-16 lg:px-12">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Good to know</p>
          <h2 id="faq-heading" className="mt-3 font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">Collection questions.</h2>
        </div>
        <dl className="border-t border-line">
          {visibleFaqs.map((faq) => <div key={faq.q} className="border-b border-line py-6"><dt className="text-base font-medium leading-6 text-ink">{faq.q}</dt><dd className="mt-3 max-w-3xl text-base leading-7 text-ink-soft">{faq.a}</dd></div>)}
        </dl>
      </section>

      <section className="bg-accent-soft" aria-labelledby="investment-next-heading">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-5 py-14 sm:px-8 sm:py-16 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">The next step</p>
            <h2 id="investment-next-heading" className="mt-3 font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">Let&apos;s see if her date is open.</h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-ink-soft">Share the date and the collection you have in mind. We&apos;ll confirm the details with you personally.</p>
          </div>
          <Link href="/check-your-date" className="inline-flex min-h-12 shrink-0 items-center justify-between gap-6 rounded-md bg-ink px-7 text-base font-medium text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Check her date <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
