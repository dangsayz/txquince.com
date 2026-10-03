/**
 * /venues — the venue index. Lists every venue we photograph quinceañeras at,
 * grouped by city, each linking to its keyword-targeted landing page. Internal-
 * linking hub for the venue cluster + a real "quinceañera venues in DFW" asset.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { venues } from "@/content/venues";
import { getImagesByVenue } from "@/lib/content-db";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Quinceañera Venues We Photograph in Dallas–Fort Worth",
  description:
    "Quinceañera venues across Dallas–Fort Worth we've photographed — ballrooms, gardens, and event centers. See real quinceañeras at each, and reserve your date.",
  alternates: { canonical: "/venues" },
  openGraph: {
    title: `Quinceañera Venues · ${site.brand}`,
    description:
      "Quinceañera venues across Dallas–Fort Worth we've photographed — see real work at each.",
    url: `${site.url}/venues`,
  },
};

export default async function VenuesPage() {
  const counts = await Promise.all(venues.map((v) => getImagesByVenue(v.slug)));
  const withCounts = venues.map((v, i) => ({ ...v, count: counts[i].length, image: counts[i][0] ?? null }));
  const heroPhoto = withCounts.find((venue) => venue.image?.url)?.image ?? null;

  // Group by city, cities ordered by total photos (busiest first).
  const byCity = new Map<string, typeof withCounts>();
  for (const v of withCounts) {
    const list = byCity.get(v.city) ?? [];
    list.push(v);
    byCity.set(v.city, list);
  }
  const cities = [...byCity.entries()]
    .map(([city, list]) => ({
      city,
      list: list.sort((a, b) => b.count - a.count || a.venue.localeCompare(b.venue)),
      total: list.reduce((n, v) => n + v.count, 0),
    }))
    .sort((a, b) => b.total - a.total || a.city.localeCompare(b.city));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Quinceañera venues · ${site.brand}`,
    itemListElement: withCounts.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${v.venue}, ${v.city}`,
      url: `${site.url}/venues/${v.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }} />
      <header className="bg-white px-4 pt-5 sm:px-6 md:px-10 md:pt-8">
        <div className="relative mx-auto min-h-[50svh] max-w-[92rem] overflow-hidden bg-ink sm:min-h-[65svh]">
          <Image src={heroPhoto?.url ?? "/portfolio/kimberly-reception.webp"} alt={heroPhoto ? publicPhotoCopy(heroPhoto, altPhraseFor(heroPhoto.section)).alt : "Quinceañera celebration in Dallas–Fort Worth"} fill priority unoptimized={!heroPhoto} sizes="(max-width: 1472px) 100vw, 1472px" className="object-cover" style={heroPhoto ? { objectPosition: `${Math.round((heroPhoto.focus_x ?? 0.5) * 100)}% ${Math.round((heroPhoto.focus_y ?? 0.4) * 100)}%` } : undefined} />
          <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative flex min-h-[50svh] flex-col items-center justify-center px-6 py-20 text-center text-white sm:min-h-[65svh]">
            <p className="text-[0.6875rem] uppercase tracking-[0.28em]">TX Quince / Places</p>
            <h1 className="mt-5 max-w-[18ch] font-body text-[clamp(2.25rem,4.4vw,4rem)] font-light leading-[1.14] tracking-[-0.035em]">The places where her day unfolds.</h1>
            <a href="#venues-list" className="mt-8 inline-flex min-h-11 items-center border-b border-white/80 text-xs uppercase tracking-[0.18em]">Browse by city <span className="ml-3" aria-hidden="true">↓</span></a>
          </div>
        </div>
        <p className="mx-auto max-w-[92rem] px-2 py-9 text-center font-serif text-lg leading-relaxed text-ink-soft sm:py-12 sm:text-xl">Explore venues across Dallas–Fort Worth through the celebrations photographed there.</p>
      </header>

      <div id="venues-list" className="scroll-mt-24 bg-white">
        {cities.map(({ city, list }, cityIndex) => (
          <section key={city} className="border-t border-line" aria-labelledby={`venue-city-${cityIndex}`}>
            <div className="mx-auto max-w-[92rem] px-4 py-16 sm:px-6 md:px-10 md:py-24 lg:px-14">
              <div>
                <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-ink-soft">0{cityIndex + 1} / Dallas–Fort Worth</p>
                <h2 id={`venue-city-${cityIndex}`} className="mt-3 font-body text-[clamp(1.75rem,2.7vw,2.5rem)] font-light leading-tight text-ink">{city}, TX</h2>
              </div>
              <ul className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7">
                {list.map((venue) => <li key={venue.slug}>
                  <Link href={`/venues/${venue.slug}`} className="group block text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                    <span className="relative block aspect-[4/5] overflow-hidden bg-cream sm:aspect-[4/3]">
                      {venue.image?.url ? <Image src={venue.image.url} alt={publicPhotoCopy(venue.image, altPhraseFor(venue.image.section)).alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none" /> : <span className="absolute inset-0 flex items-end p-6 font-serif text-lg italic text-ink-soft">Photographs coming soon</span>}
                    </span>
                    <span className="mt-4 flex items-start justify-between gap-3 border-b border-line pb-4">
                      <span className="font-body text-xl font-light leading-tight sm:text-2xl">{venue.venue}</span>
                      <span className="shrink-0 text-sm text-ink-soft" aria-hidden="true">↗</span>
                    </span>
                    <span className="mt-2 block text-xs uppercase tracking-[0.15em] text-ink-soft">{venue.count > 0 ? `${venue.count} ${venue.count === 1 ? "photograph" : "photographs"}` : "Explore venue"}</span>
                  </Link>
                </li>)}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
