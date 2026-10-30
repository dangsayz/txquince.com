/**
 * /venues — the venue index. Lists every venue we photograph quinceañeras at,
 * grouped by city, each linking to its keyword-targeted landing page. Internal-
 * linking hub for the venue cluster + a real "quinceañera venues in DFW" asset.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SlotImage } from "@/components/SlotImage";
import { site } from "@/content/site";
import { venues } from "@/content/venues";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { getImagesByVenue } from "@/lib/content-db";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import "@/components/txq/pages/places.css";
import { jsonLdString } from "@/lib/json-ld";
import { languageAlternates } from "@/lib/hreflang";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Quinceañera Venues We Photograph in Dallas–Fort Worth",
  description:
    "Quinceañera venues across Dallas–Fort Worth we've photographed — ballrooms, gardens, and event centers. See real quinceañeras at each, and reserve your date.",
  alternates: {
    canonical: "/venues",
    languages: languageAlternates(`${site.url}/venues`, `${site.url}/es/salones`),
  },
  openGraph: {
    title: `Quinceañera Venues · ${site.brand}`,
    description:
      "Quinceañera venues across Dallas–Fort Worth we've photographed — see real work at each.",
    url: `${site.url}/venues`,
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

export default async function VenuesPage() {
  const counts = await Promise.all(venues.map((v) => getImagesByVenue(v.slug)));
  const withCounts = venues.map((v, i) => ({ ...v, count: counts[i].length, image: counts[i][0] ?? null }));
  const heroPhoto = withCounts.find((venue) => venue.image?.url)?.image ?? null;
  const fallbackHero = portfolioFallback.find((p) => p.url === "/portfolio/kimberly-reception.webp") ?? portfolioFallback[0];
  const totalPhotos = withCounts.reduce((n, v) => n + v.count, 0);

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />

      <div className="tq-wrap">
        <nav className="tq-place-crumbs tq-mono" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><span aria-current="page">Venues</span></li>
          </ol>
        </nav>
      </div>

      {heroPhoto || fallbackHero ? (
        <div className="tq-place-stage">
          <figure className="tq-plate" style={{ margin: 0 }}>
            <div className="tq-plate__loop">
              <SlotImage
                slot="venues.hero"
                lang="en"
                fill
                priority
                sizes="100vw"
                fallback={
                  heroPhoto
                    ? { src: heroPhoto.url, alt: publicPhotoCopy(heroPhoto, altPhraseFor(heroPhoto.section)).alt, width: heroPhoto.width, height: heroPhoto.height, focus: `${Math.round((heroPhoto.focus_x ?? 0.5) * 100)}% ${Math.round((heroPhoto.focus_y ?? 0.4) * 100)}%` }
                    : { src: fallbackHero.url, alt: fallbackHero.alt, focus: "50% 60%" }
                }
              />
            </div>
            <figcaption>
              <span className="tq-tag tq-tag--tl tq-mono">[Places / DFW]</span>
              <span className="tq-tag tq-tag--bl tq-mono">{pad(venues.length)} venues</span>
            </figcaption>
          </figure>
        </div>
      ) : null}

      <div className="tq-wrap">
        <div className="tq-ledger tq-place-ledger">
          <div className="tq-ledger__head">
            <p className="tq-mono tq-place-eyebrow">TX Quince / Places</p>
            <h1 className="tq-display">
              The places where <em>her day unfolds.</em>
            </h1>
            <p className="tq-ledger__dek">
              Explore venues across Dallas–Fort Worth through the celebrations photographed there.
            </p>
          </div>
          <div className="tq-ledger__meta">
            <dl className="tq-meta tq-mono">
              <div>
                <dt>Venues</dt>
                <dd className="tq-nums">{pad(venues.length)}</dd>
              </div>
              <div>
                <dt>Cities</dt>
                <dd className="tq-nums">{pad(cities.length)}</dd>
              </div>
              <div>
                <dt>Frames</dt>
                <dd className="tq-nums">{totalPhotos}</dd>
              </div>
            </dl>
          </div>
          <div className="tq-action">
            <a href="#venues-list" className="tq-mono tq-place-note">Browse by city ↓</a>
            <div style={{ display: "grid", gap: 12 }}>
              <Link href={site.cta.href} className="tq-action__link">
                <span>Request a date</span>
                <span className="tq-arrow" aria-hidden>→</span>
              </Link>
              <Link href="/es/salones" hrefLang="es" lang="es" className="tq-mono tq-place-note">Ver en español ↗</Link>
            </div>
          </div>
        </div>
      </div>

      <section id="venues-list" className="tq-section" aria-labelledby="venues-list-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[01 / Venues]</p>
            <h2 id="venues-list-title" className="tq-display tq-head__title">
              Ballrooms, gardens <em>and event centers.</em>
            </h2>
            <p className="tq-head__dek">
              Each venue opens to the quinceañeras we have photographed there, grouped by city.
            </p>
          </header>

          {cities.map(({ city, list, total }, cityIndex) => (
            <section key={city} className="tq-section" aria-labelledby={`venue-city-${cityIndex}`}>
              <div className="tq-place-group">
                <h3 id={`venue-city-${cityIndex}`} className="tq-display">{city}, TX</h3>
                <span className="tq-mono">
                  [{pad(cityIndex + 1)} / {pad(cities.length)}] · {list.length} {list.length === 1 ? "venue" : "venues"}
                  {total ? ` · ${total} ${total === 1 ? "photograph" : "photographs"}` : ""}
                </span>
              </div>
              <ul className="tq-place-cards tq-place-cards--wide">
                {list.map((venue) => (
                  <li key={venue.slug} className="tq-place-card">
                    <Link href={`/venues/${venue.slug}`} className="tq-place-card__link">
                      <span className="tq-place-card__media">
                        {venue.image?.url ? (
                          <Image
                            src={venue.image.url}
                            alt={publicPhotoCopy(venue.image, altPhraseFor(venue.image.section)).alt}
                            fill
                            sizes="(min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw"
                            style={{ objectPosition: `${Math.round((venue.image.focus_x ?? 0.5) * 100)}% ${Math.round((venue.image.focus_y ?? 0.4) * 100)}%` }}
                          />
                        ) : (
                          <span className="tq-place-card__blank">
                            <span className="tq-mono tq-muted">[Photographs coming soon]</span>
                            <span className="tq-display">{venue.venue}</span>
                          </span>
                        )}
                      </span>
                      <span className="tq-place-card__row">
                        <span className="tq-display tq-place-card__name">{venue.venue}</span>
                        <span className="tq-mono tq-place-card__idx">
                          <span className="tq-arrow" aria-hidden>↗</span>
                        </span>
                      </span>
                      <span className="tq-mono tq-place-card__sub">
                        {venue.count > 0
                          ? `${venue.count} ${venue.count === 1 ? "photograph" : "photographs"}`
                          : "Explore venue"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="tq-section" aria-labelledby="venues-next-title">
        <div className="tq-wrap">
          <div className="tq-place-cta">
            <div>
              <p className="tq-mono tq-muted" style={{ margin: "0 0 20px" }}>[02 / Next]</p>
              <h2 id="venues-next-title" className="tq-display">
                Your venue, <em>your date.</em>
              </h2>
            </div>
            <div className="tq-place-cta__side">
              <p>Tell us where the celebration is and the date you have in mind. There is no travel fee within our Dallas–Fort Worth service area.</p>
              <div className="tq-place-actions">
                <Link href={site.cta.href} className="tq-btn tq-btn--lg">
                  Request a date <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
                <Link href="/quinceanera-photographer" className="tq-btn tq-btn--ghost">Areas served</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
