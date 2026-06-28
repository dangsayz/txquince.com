/**
 * /venues — the venue index. Lists every venue we photograph quinceañeras at,
 * grouped by city, each linking to its keyword-targeted landing page. Internal-
 * linking hub for the venue cluster + a real "quinceañera venues in DFW" asset.
 */
import type { Metadata } from "next";
import Link from "next/link";
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
  const withCounts = venues.map((v, i) => ({ ...v, count: counts[i].length }));

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

      <section className="mx-auto max-w-[90rem] px-5 pb-10 pt-20 md:px-10 lg:px-16 md:pb-14 md:pt-32">
        <Reveal>
          <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">Venues</p>
          <h1
            className="mt-5 max-w-4xl font-display text-ink"
            style={{ fontSize: "clamp(2.6rem,6.5vw,5.2rem)", lineHeight: 0.98, letterSpacing: "-0.028em" }}
          >
            Quinceañera venues across DFW.
          </h1>
          <p className="mt-7 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
            Ballrooms, gardens, and event centers we&apos;ve photographed quinceañeras at
            across Dallas–Fort Worth. Tap a venue to see real work there — and if your
            daughter&apos;s day is booked at one, we already know the room.
          </p>
        </Reveal>
      </section>

      {cities.map(({ city, list }) => (
        <section key={city} className="mt-12 border-t border-ink/10 bg-white">
          <div className="mx-auto max-w-[90rem] px-5 py-12 md:px-10 lg:px-16 md:py-16">
            <Reveal>
              <h2
                className="font-display text-ink"
                style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", lineHeight: 1.05, letterSpacing: "-0.015em" }}
              >
                {city}, TX
              </h2>
            </Reveal>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((v) => (
                <li key={v.slug}>
                  <Link
                    href={`/venues/${v.slug}`}
                    className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-line bg-ivory px-4 py-3 transition-colors hover:border-wine"
                  >
                    <span className="min-w-0 truncate text-ink">{v.venue}</span>
                    <span className="shrink-0 text-xs text-ink-faint">
                      {v.count} photo{v.count === 1 ? "" : "s"}
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
