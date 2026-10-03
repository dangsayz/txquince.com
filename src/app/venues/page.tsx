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
import { FinalCTA } from "@/components/FinalCTA";
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
      <header className="bg-[#f4f2ee]">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] lg:gap-14 lg:px-16 lg:py-24">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">TX Quince / Places</p>
          <div>
            <h1 className="max-w-[20ch] font-display text-[clamp(2.125rem,3.6vw,3.5rem)] font-normal leading-[1.1] tracking-[-0.03em] text-ink">The places where her day unfolds.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft">Explore venues across Dallas–Fort Worth through the celebrations photographed there.</p>
            <a href="#venues-list" className="mt-7 inline-flex min-h-11 items-center gap-4 border-b border-ink text-sm font-medium text-ink">Browse by city <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </header>

      <div id="venues-list" className="scroll-mt-24 bg-white">
        {cities.map(({ city, list }, cityIndex) => (
          <section key={city} className="border-t border-line" aria-labelledby={`venue-city-${cityIndex}`}>
            <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-14 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)] lg:gap-14 lg:px-16">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">0{cityIndex + 1} / Dallas–Fort Worth</p>
                <h2 id={`venue-city-${cityIndex}`} className="mt-3 font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">{city}, TX</h2>
              </div>
              <ul className="border-t border-line">
                {list.map((venue) => <li key={venue.slug} className="border-b border-line">
                  <Link href={`/venues/${venue.slug}`} className="group grid min-h-28 grid-cols-[minmax(0,1fr)_6rem] items-center gap-5 py-4 text-ink sm:grid-cols-[minmax(0,1fr)_8rem]">
                    <span>
                      <span className="block font-display text-[clamp(1.25rem,2vw,1.75rem)] font-normal leading-tight group-hover:underline group-hover:underline-offset-4">{venue.venue}</span>
                      <span className="mt-2 block text-sm text-ink-soft">{venue.count > 0 ? `${venue.count} ${venue.count === 1 ? "photograph" : "photographs"}` : "Explore venue"} <span aria-hidden="true">↗</span></span>
                    </span>
                    <span className="relative block aspect-[4/3] overflow-hidden bg-greige">
                      {venue.image?.url && <Image src={venue.image.url} alt={publicPhotoCopy(venue.image, altPhraseFor(venue.image.section)).alt} fill sizes="(max-width: 639px) 96px, 128px" className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none" />}
                    </span>
                  </Link>
                </li>)}
              </ul>
            </div>
          </section>
        ))}
      </div>
      <FinalCTA />
    </>
  );
}
