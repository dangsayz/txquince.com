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
      <header aria-labelledby="investment-heading" className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-ink text-white sm:min-h-[80svh]">
        <Image src={hero?.url ?? "/portfolio/red-garden.webp"} alt={hero?.alt || "Quinceañera portrait in Dallas–Fort Worth"} fill priority unoptimized={!hero} sizes="100vw" className="object-cover" style={{ objectPosition: hero ? `${Math.round((hero.focus_x ?? 0.5) * 100)}% ${Math.round((hero.focus_y ?? 0.5) * 100)}%` : "center 36%" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-white/85">{investmentIntro.eyebrow}</p>
          <h1 id="investment-heading" className="mt-5 max-w-[24ch] font-display text-[clamp(2.15rem,4vw,4rem)] font-light leading-[1.14]">Services &amp; investment</h1>
        </div>
      </header>

      <section className="bg-ivory px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-[78rem] gap-9 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:gap-20">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">The collections</p>
          <div><p className="max-w-[27ch] font-display text-[clamp(1.8rem,3vw,3rem)] font-light leading-[1.25] text-ink">Her quinceañera, told in photo &amp; film.</p><p className="mt-6 max-w-xl text-base leading-8 text-ink-soft">Four ways to remember the portraits, the traditions, and everyone who came to celebrate. Every price is here, so you can choose what feels right before getting in touch.</p><Link href="#collections" className="mt-7 inline-flex min-h-12 items-center gap-4 border-b border-ink text-xs uppercase tracking-[0.16em] text-ink">Explore the collections <span aria-hidden="true">↓</span></Link></div>
        </div>
      </section>

      <section id="collections" aria-label="Photography and film collections" className="scroll-mt-20 bg-white px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-[84rem] space-y-24 lg:space-y-36">
        {packages.map((collection, index) => {
          const photo = photographs[index];
          const reversed = index % 2 === 1;
          const src = photo.src;
          const alt = photo.alt;
          const position = photo.position;
          return (
            <article key={collection.id} id={collection.id} className="scroll-mt-20 grid gap-9 lg:grid-cols-[minmax(0,0.47fr)_minmax(0,0.53fr)] lg:items-center lg:gap-[clamp(3rem,8vw,9rem)]">
              <div className={"relative aspect-[4/5] overflow-hidden bg-greige " + (reversed ? "lg:order-2" : "")}>
                <Image src={src} alt={alt} fill unoptimized={src.startsWith("/portfolio/")} sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" style={{ objectPosition: position }} priority={index === 0} />
              </div>
              <div className={"flex min-w-0 flex-col justify-center " + (reversed ? "lg:order-1" : "")}>
                <p className="text-xs uppercase tracking-[0.24em] text-ink-soft">Collection 0{index + 1} / 04</p>
                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2"><h2 className="font-display text-[clamp(2rem,3vw,3rem)] font-light leading-[1.15] text-ink">{collection.name}</h2><p className="text-xl text-ink">{collection.priceLabel}</p></div>
                <p className="mt-6 max-w-xl text-base leading-8 text-ink-soft">{descriptions[collection.id]}</p>
                <div className="mt-9 grid gap-8 border-t border-line pt-7 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Includes</p>
                    <ul className="mt-5 space-y-3">{collection.includes.map((item) => <li key={item} className="text-sm leading-6 text-ink">{item}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Deposit</p>
                    <p className="mt-5 text-sm leading-6 text-ink-soft">{collection.depositLabel} deposit after we confirm her date. It applies to the total.</p>
                  </div>
                </div>
                <Link href={"/reserve?collection=" + collection.id} className="mt-9 inline-flex min-h-12 w-fit items-center gap-6 border-b border-ink text-xs uppercase tracking-[0.17em] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Ask about {collection.name} <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          );
        })}
        </div>
      </section>

      <section aria-labelledby="process-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="text-center"><p className="text-xs uppercase tracking-[0.24em] text-ink-soft">After you choose</p><h2 id="process-heading" className="mt-5 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light text-ink">How to proceed</h2></div>
        <ol className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-12">{process.map((step, index) => <li key={step.title}><span className="font-display text-3xl font-light text-ink-soft">0{index + 1}</span><h3 className="mt-6 text-lg font-normal text-ink">{step.title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-ink-soft">{step.body}</p></li>)}</ol>
        <p className="mt-14 border-t border-line pt-6 text-base leading-7 text-ink-soft">{investmentIntro.hook} Payment plans are available for every collection. <Link href="/payment-plans" className="text-ink underline underline-offset-4">See payment options ↗</Link></p>
      </section>

      <section aria-labelledby="faq-heading" className="bg-ivory px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-5xl"><div className="text-center"><p className="text-xs uppercase tracking-[0.24em] text-ink-soft">The details</p><h2 id="faq-heading" className="mt-5 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light text-ink">Before you choose</h2></div><dl className="mt-12 divide-y divide-line border-t border-line">{investmentFaqs.map((faq) => <div key={faq.q} className="grid gap-3 py-7 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-12"><dt className="text-base font-normal leading-7 text-ink">{faq.q}</dt><dd className="text-base leading-7 text-ink-soft">{faq.a}</dd></div>)}</dl></div>
      </section>

    </>
  );
}
