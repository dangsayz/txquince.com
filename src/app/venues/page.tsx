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
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-[90rem] px-5 pb-14 pt-14 text-center md:px-10 md:pb-20 md:pt-20 lg:px-16">
        <Reveal className="mx-auto max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Venues</p>
          <h1 className="mt-5 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink">Quinceañera venues across DFW.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
            Ballrooms, gardens, and event centers we&apos;ve photographed quinceañeras at
            across Dallas–Fort Worth. Tap a venue to see real work there — and if your
            daughter&apos;s day is booked at one, we already know the room.
          </p>
        </Reveal>
      </section>

      {cities.map(({ city, list }) => (
        <section key={city} className="border-t border-line bg-white">
          <div className="mx-auto max-w-[90rem] px-5 py-12 md:px-10 lg:px-16 md:py-16">
            <Reveal>
              <h2 className="font-display text-[clamp(1.5rem,2.6vw,2.2rem)] text-ink">{city}, TX</h2>
            </Reveal>
            <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((v) => (
                <li key={v.slug}>
                  <Link
                    href={`/venues/${v.slug}`}
                    className="group block h-full overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    <span className="relative block aspect-[16/10] overflow-hidden bg-greige">
                      {v.image?.url ? <Image src={v.image.url} alt={v.image.alt || `Quinceañera celebration at ${v.venue}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.025]" /> : null}
                    </span>
                    <span className="flex min-h-16 items-center justify-between gap-3 px-5 py-4">
                      <span className="min-w-0 text-base font-medium text-ink">{v.venue}</span>
                      <span className="shrink-0 text-sm text-ink-soft">{v.count} photo{v.count === 1 ? "" : "s"} ↗</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <FinalCTA />
    </>
  );
}
