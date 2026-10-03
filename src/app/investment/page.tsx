import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { packages, investmentIntro, investmentFaqs } from "@/content/packages";
import { site } from "@/content/site";
import { getPageHero } from "@/lib/content-db";

export const metadata: Metadata = {
  title: "Investment — Quinceañera Collections",
  description: "Fixed-price quinceañera photography and film collections from $1,800. Compare Moments, Essential, Signature, and Legacy coverage for your celebration.",
  alternates: { canonical: "/investment" },
  openGraph: {
    title: "Investment — Quinceañera Collections · TX Quince",
    description: "Fixed-price quinceañera photography and film collections from $1,800.",
    url: site.url + "/investment",
  },
};

export default async function InvestmentPage() {
  const hero = await getPageHero("investment");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": site.url + "/investment#service",
        name: "Quinceañera Photography & Film",
        serviceType: "Quinceañera Photography & Film",
        provider: { "@type": "Organization", name: site.brand, "@id": site.url + "/#business" },
        areaServed: { "@type": "City", name: "Dallas–Fort Worth, TX" },
        url: site.url + "/investment",
        offers: packages.map((collection) => ({
          "@type": "Offer",
          price: String(collection.price),
          priceCurrency: "USD",
          url: site.url + "/reserve?collection=" + collection.id,
          itemOffered: { "@type": "Service", name: collection.name + " Collection", description: collection.teaser },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": site.url + "/investment#faq",
        mainEntity: investmentFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": site.url + "/investment#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Investment", item: site.url + "/investment" },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section aria-labelledby="investment-heading" className="mx-auto grid max-w-[88rem] gap-8 px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16 lg:px-12 lg:py-20">
        <div className="order-2 max-w-xl lg:order-1">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">{investmentIntro.eyebrow}</p>
          <h1 id="investment-heading" className="mt-5 max-w-[18ch] font-display text-[clamp(2rem,3.2vw,3rem)] font-normal leading-[1.14] text-ink">{investmentIntro.heading}</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">Four considered ways to remember her day. Choose the coverage that feels right, then tell us her date.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link href="#collections" className="inline-flex min-h-12 items-center justify-center gap-5 whitespace-nowrap bg-ink px-6 text-base text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Explore collections <span aria-hidden="true">↓</span></Link>
            <Link href="/portfolio" className="inline-flex min-h-12 items-center gap-3 whitespace-nowrap border-b border-ink text-base text-ink">See the work <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <figure className="order-1 lg:order-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-greige sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image src={hero?.url ?? "/portfolio/reception.webp"} alt={hero?.alt || "Quinceañera portrait in a pink gown"} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" style={hero ? { objectPosition: String(Math.round((hero.focus_x ?? 0.5) * 100)) + "% " + String(Math.round((hero.focus_y ?? 0.5) * 100)) + "%" } : { objectPosition: "center 35%" }} />
          </div>
          <figcaption className="mt-3 flex justify-between gap-4 text-xs uppercase tracking-[0.14em] text-ink-soft"><span>The day, in photographs</span><span>TX Quince / DFW</span></figcaption>
        </figure>
      </section>

      <section id="collections" aria-labelledby="collections-heading" className="scroll-mt-24 border-t border-line bg-white">
        <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="grid gap-5 border-b border-line pb-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] md:items-end">
            <div><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Photo &amp; film</p><h2 id="collections-heading" className="mt-3 font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">The collections.</h2></div>
            <p className="max-w-md text-base leading-7 text-ink-soft">All prices are in USD. Your deposit applies to the balance after we confirm the date and coverage.</p>
          </div>
          <div className="divide-y divide-line">
            {packages.map((collection, index) => (
              <article key={collection.id} id={collection.id} className="scroll-mt-24 grid gap-6 py-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10 lg:py-12">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">0{index + 1} / 04{collection.highlight ? " · Most chosen" : ""}</p>
                  <h3 className="mt-3 font-display text-[clamp(1.75rem,2.7vw,2.4rem)] font-normal leading-tight text-ink">{collection.name}</h3>
                  <p className="mt-2 max-w-sm text-base leading-7 text-ink-soft">{collection.tagline}</p>
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-line pb-5">
                    <p className="font-display text-[clamp(1.75rem,2.5vw,2.25rem)] font-normal leading-none text-ink">{collection.priceLabel}</p>
                    <p className="text-base text-ink-soft">{collection.depositLabel} deposit after confirmation</p>
                  </div>
                  <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    {collection.includes.map((item) => <li key={item} className="flex gap-3 text-base leading-6 text-ink-soft"><span aria-hidden="true" className="text-ink">—</span><span>{item}</span></li>)}
                  </ul>
                  <Link href={"/reserve?collection=" + collection.id} className="mt-8 inline-flex min-h-12 items-center gap-8 whitespace-nowrap border-b border-ink text-base font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Request {collection.name} <span aria-hidden="true">↗</span></Link>
                </div>
              </article>
            ))}
          </div>
          <p className="border-t border-line pt-6 text-base leading-7 text-ink-soft">{investmentIntro.hook} Payment plans are available. We confirm availability before sending a secure deposit link.</p>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mx-auto grid max-w-[88rem] gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(12rem,0.45fr)_minmax(0,1fr)] lg:gap-16 lg:px-12">
        <div><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">The details</p><h2 id="faq-heading" className="mt-3 font-display text-[clamp(1.75rem,2.6vw,2.4rem)] font-normal leading-tight text-ink">Before you choose.</h2></div>
        <dl className="border-t border-line">{investmentFaqs.map((faq) => <div key={faq.q} className="border-b border-line py-6"><dt className="text-base font-medium leading-6 text-ink">{faq.q}</dt><dd className="mt-3 max-w-3xl text-base leading-7 text-ink-soft">{faq.a}</dd></div>)}</dl>
      </section>

      <section aria-labelledby="investment-next-heading" className="bg-ink text-white">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
          <div><p className="text-xs uppercase tracking-[0.18em] text-white/70">The next step</p><h2 id="investment-next-heading" className="mt-3 max-w-2xl font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight">Her date is the place to begin.</h2><p className="mt-3 max-w-xl text-base leading-7 text-white/80">Tell us when and where you&apos;re celebrating. We&apos;ll confirm what is possible before a deposit is due.</p></div>
          <Link href="/check-your-date" className="inline-flex min-h-12 shrink-0 items-center justify-between gap-8 self-start whitespace-nowrap border border-white px-6 text-base text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Check her date <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
