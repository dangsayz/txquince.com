import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { packages, investmentFaqs, investmentIntro, type CollectionId } from "@/content/packages";
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

const photographs = [
  { src: "/portfolio/reception.webp", alt: "Quinceañera portrait in a pale pink gown", position: "center 35%" },
  { src: "/portfolio/lilac-arch.webp", alt: "Quinceañera in a lilac gown outside her venue", position: "center 55%" },
  { src: "/portfolio/kimberly-reception.webp", alt: "Quinceañera sharing a dance with her father", position: "center 55%" },
  { src: "/portfolio/dance.webp", alt: "Quinceañera celebration with traditional dancers", position: "center 52%" },
] as const;

const descriptions: Record<CollectionId, string> = {
  moments: "The essential chapters of her day, with one artist devoted to photography or film.",
  essential: "More time for the church, portraits, and reception, with a save-the-date session before the celebration.",
  signature: "Photography and film together: two storytellers, the full day, and a sneak peek that same week.",
  legacy: "The whole story in stills and motion, with more time, a long-form film, aerial coverage, and an album.",
};

const process = [
  { title: "Tell us her date", body: "Choose the collection you love and share the day you have in mind." },
  { title: "We confirm the details", body: "We review availability and coverage with you personally before anything is due." },
  { title: "Reserve the day", body: "Once confirmed, use the secure deposit link to place her day on the calendar." },
] as const;

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
      <section aria-labelledby="investment-heading" className="bg-white px-5 pb-20 pt-20 text-center sm:px-8 sm:pb-28 sm:pt-28 lg:pb-36 lg:pt-36">
        <p className="text-xs uppercase tracking-[0.26em] text-ink-soft">{investmentIntro.eyebrow}</p>
        <h1 id="investment-heading" className="mx-auto mt-7 max-w-[20ch] font-display text-[clamp(2.25rem,4vw,3.75rem)] font-light leading-[1.13] text-ink">Her quinceañera, told in photo &amp; film.</h1>
        <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-ink-soft">Four ways to remember the portraits, the traditions, and everyone who came to celebrate. Every price is here, so you can choose what feels right before getting in touch.</p>
        <Link href="#collections" className="mt-9 inline-flex min-h-12 items-center justify-center gap-4 whitespace-nowrap border-b border-ink px-1 text-sm uppercase tracking-[0.15em] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Explore the collections <span aria-hidden="true">↓</span></Link>
      </section>

      <section id="collections" aria-label="Photography and film collections" className="scroll-mt-20">
        {packages.map((collection, index) => {
          const photo = photographs[index];
          const reversed = index % 2 === 1;
          const src = index === 0 ? (hero?.url ?? photo.src) : photo.src;
          const alt = index === 0 ? (hero?.alt || photo.alt) : photo.alt;
          const position = index === 0 && hero
            ? String(Math.round((hero.focus_x ?? 0.5) * 100)) + "% " + String(Math.round((hero.focus_y ?? 0.5) * 100)) + "%"
            : photo.position;
          return (
            <article key={collection.id} id={collection.id} className="scroll-mt-20 grid bg-ivory lg:min-h-[42rem] lg:grid-cols-2">
              <div className={"relative min-h-0 aspect-[4/5] overflow-hidden bg-greige sm:aspect-[6/5] lg:aspect-auto " + (reversed ? "lg:order-2" : "")}>
                <Image src={src} alt={alt} fill unoptimized={src.startsWith("/portfolio/")} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" style={{ objectPosition: position }} priority={index === 0} />
              </div>
              <div className={"flex min-w-0 flex-col justify-center px-6 py-14 sm:px-12 sm:py-20 lg:px-[clamp(3rem,6vw,7rem)] " + (reversed ? "lg:order-1" : "")}>
                <p className="text-xs uppercase tracking-[0.24em] text-ink-soft">Collection 0{index + 1} / 04</p>
                <h2 className="mt-6 font-display text-[clamp(2.25rem,3.4vw,3.5rem)] font-light leading-[1.1] text-ink">{collection.name}</h2>
                <p className="mt-6 max-w-xl text-base leading-8 text-ink-soft">{descriptions[collection.id]}</p>
                <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Includes</p>
                    <ul className="mt-5 space-y-3">{collection.includes.map((item) => <li key={item} className="text-sm leading-6 text-ink">{item}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Collection price</p>
                    <p className="mt-5 font-display text-[clamp(1.75rem,2.2vw,2.5rem)] font-light leading-none text-ink">{collection.priceLabel}</p>
                    <p className="mt-4 text-sm leading-6 text-ink-soft">{collection.depositLabel} deposit after we confirm her date. It applies to the total.</p>
                  </div>
                </div>
                <Link href={"/reserve?collection=" + collection.id} className="mt-10 inline-flex min-h-12 w-fit items-center justify-center gap-6 whitespace-nowrap bg-ink px-6 text-xs uppercase tracking-[0.17em] text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Ask about {collection.name} <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          );
        })}
      </section>

      <section aria-labelledby="process-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="text-center"><p className="text-xs uppercase tracking-[0.24em] text-ink-soft">After you choose</p><h2 id="process-heading" className="mt-5 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light text-ink">How to proceed</h2></div>
        <ol className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-12">{process.map((step, index) => <li key={step.title}><span className="font-display text-3xl font-light text-ink-soft">0{index + 1}</span><h3 className="mt-6 text-lg font-normal text-ink">{step.title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-ink-soft">{step.body}</p></li>)}</ol>
        <p className="mt-14 border-t border-line pt-6 text-base leading-7 text-ink-soft">{investmentIntro.hook} Payment plans are available for every collection. <Link href="/payment-plans" className="text-ink underline underline-offset-4">See payment options ↗</Link></p>
      </section>

      <section aria-labelledby="faq-heading" className="bg-ivory px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-5xl"><div className="text-center"><p className="text-xs uppercase tracking-[0.24em] text-ink-soft">The details</p><h2 id="faq-heading" className="mt-5 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light text-ink">Before you choose</h2></div><dl className="mt-12 divide-y divide-line border-t border-line">{investmentFaqs.map((faq) => <div key={faq.q} className="grid gap-3 py-7 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-12"><dt className="text-base font-normal leading-7 text-ink">{faq.q}</dt><dd className="text-base leading-7 text-ink-soft">{faq.a}</dd></div>)}</dl></div>
      </section>

      <section aria-labelledby="investment-next-heading" className="bg-ink px-5 py-20 text-center text-white sm:px-8 sm:py-28">
        <p className="text-xs uppercase tracking-[0.24em] text-white/70">The next step</p>
        <h2 id="investment-next-heading" className="mx-auto mt-5 max-w-3xl font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light leading-tight">A day worth remembering begins here.</h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/80">Tell us when and where she will celebrate. We confirm availability before a deposit is due.</p>
        <Link href="/check-your-date" className="mt-8 inline-flex min-h-12 items-center justify-center gap-6 whitespace-nowrap border border-white px-6 text-xs uppercase tracking-[0.17em] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Check her date <span aria-hidden="true">↗</span></Link>
      </section>
    </>
  );
}
