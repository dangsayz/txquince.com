import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { commissionsFromLabel as FROM_TOKEN } from "@/content/commissions";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep, fillPrices } from "@/lib/price-text";
import { locations } from "@/content/locations";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { site } from "@/content/site";
import { getFeaturedImages, getImagesByCity, getPageHero, type PortfolioImage } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import "@/components/txq/pages/places.css";

export const revalidate = 3600;

// Carries a price token (FROM_TOKEN); filled from the live book below.
const META: Metadata = {
  title: "Quinceañera Photographer — Dallas–Fort Worth",
  description:
    `Luxury quinceañera photos & video across Dallas–Fort Worth — Dallas, Fort Worth, Frisco, Plano, McKinney, Arlington and beyond. Published commissions from ${FROM_TOKEN}.`,
  alternates: {
    canonical: "/quinceanera-photographer",
    languages: {
      "en-US": site.url + "/quinceanera-photographer",
      "es-MX": site.url + "/es/fotografo-de-quinceaneras",
      "x-default": site.url + "/quinceanera-photographer",
    },
  },
  openGraph: {
    title: `Quinceañera Photographer — Dallas–Fort Worth · ${site.brand}`,
    description:
      `Quinceañera photos & video across the DFW metroplex. Published packages from ${FROM_TOKEN}.`,
    url: `${site.url}/quinceanera-photographer`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return fillDeep(META, await getPriceBook());
}

/** One photograph, normalized from the DB or the bundled portfolio fallback. */
type Shot = { url: string; alt: string; focus: string; local: boolean };

const pad = (n: number) => String(n).padStart(2, "0");

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.32) * 100)}%`;
}

const fromDb = (image: PortfolioImage): Shot => ({
  url: image.url,
  alt: publicPhotoCopy(image, altPhraseFor(image.section)).alt,
  focus: focal(image.focus_x, image.focus_y),
  local: false,
});

const fromFallback = (photo: (typeof portfolioFallback)[number]): Shot => ({
  url: photo.url,
  alt: photo.alt,
  focus: "50% 35%",
  local: true,
});

export default async function LocationsHub() {
  const commissionsFromLabel = fillPrices(FROM_TOKEN, await getPriceBook());
  const [imgs, assignedHero, cityPhotoSets] = await Promise.all([
    getFeaturedImages(24),
    getPageHero("areas"),
    Promise.all(locations.map((location) => getImagesByCity(location.slug, 2))),
  ]);

  const heroImage =
    assignedHero ?? imgs.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ?? imgs[0] ?? null;
  const fallbackHero = portfolioFallback.find((p) => p.url === "/portfolio/kimberly-reception.webp") ?? portfolioFallback[0];
  const hero: Shot | null = heroImage ? fromDb(heroImage) : fallbackHero ? { ...fromFallback(fallbackHero), focus: "50% 60%" } : null;

  // Every card gets a real photograph: the city's own tagged work, then a
  // portfolio photo from that city, then the next unused featured/portfolio
  // image. Cities without tagged work (Frisco, Plano, McKinney…) never render
  // an empty <img>; with no photos at all the card falls back to text only.
  const pool: Shot[] = [...imgs.map(fromDb), ...portfolioFallback.map(fromFallback)];
  const used = new Set<string>(hero ? [hero.url] : []);
  const cards = locations.map((location, index) => {
    const own = cityPhotoSets[index].map(fromDb).find((s) => !used.has(s.url));
    const sameCity = portfolioFallback
      .filter((p) => p.city === location.city)
      .map(fromFallback)
      .find((s) => !used.has(s.url));
    const next = pool.find((s) => !used.has(s.url));
    const shot = own ?? sameCity ?? next ?? (pool.length ? pool[index % pool.length] : null);
    if (shot) used.add(shot.url);
    return { location, shot, n: pad(index + 1) };
  });

  return (
    <>
      <div className="tq-wrap">
        <nav className="tq-place-crumbs tq-mono" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><span aria-current="page">Areas served</span></li>
          </ol>
        </nav>
      </div>

      {hero ? (
        <div className="tq-place-stage">
          <figure className="tq-plate" style={{ margin: 0 }}>
            <div className="tq-plate__loop">
              <Image
                src={hero.url}
                alt={hero.alt}
                fill
                preload
                unoptimized={hero.local}
                sizes="100vw"
                style={{ objectPosition: hero.focus }}
              />
            </div>
            <figcaption>
              <span className="tq-tag tq-tag--tl tq-mono">[Areas / DFW]</span>
              <span className="tq-tag tq-tag--bl tq-mono">{pad(locations.length)} cities</span>
            </figcaption>
          </figure>
        </div>
      ) : null}

      <div className="tq-wrap">
        <div className="tq-ledger tq-place-ledger">
          <div className="tq-ledger__head">
            <p className="tq-mono tq-place-eyebrow">TX Quince / Where we work</p>
            <h1 className="tq-display">
              Across Dallas–Fort Worth. <em>From the church to the last dance.</em>
            </h1>
            <p className="tq-ledger__dek">
              We capture quinceañeras in photos and video across Dallas–Fort Worth. Explore the cities where we work and
              the real celebrations behind the photographs.
            </p>
          </div>
          <div className="tq-ledger__meta">
            <dl className="tq-meta tq-mono">
              <div>
                <dt>Cities</dt>
                <dd className="tq-nums">{pad(locations.length)}</dd>
              </div>
              <div>
                <dt>Travel</dt>
                <dd>No fee in DFW</dd>
              </div>
              <div>
                <dt>Planning</dt>
                <dd>English · Español</dd>
              </div>
            </dl>
          </div>
          <div className="tq-action">
            <a href="#cities" className="tq-mono tq-place-note">Find your city ↓</a>
            <div style={{ display: "grid", gap: 12 }}>
              <Link href="/#intake" className="tq-action__link">
                <span>Request a date</span>
                <span className="tq-arrow" aria-hidden>→</span>
              </Link>
              <span className="tq-mono tq-muted">Packages from {commissionsFromLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <section id="cities" className="tq-section" aria-labelledby="cities-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[01 / Cities]</p>
            <h2 id="cities-title" className="tq-display tq-head__title">
              {locations.length} cities. <em>One attentive team.</em>
            </h2>
            <p className="tq-head__dek">
              Find your city for local portrait ideas and coverage details. Planning is available in English or
              Spanish, and there is no travel fee within our Dallas–Fort Worth service area.
            </p>
          </header>

          <ol className="tq-place-cards tq-place-cards--four">
            {cards.map(({ location, shot, n }) => (
              <li key={location.slug} className="tq-place-card">
                <Link
                  href={`/quinceanera-photographer/${location.slug}`}
                  className="tq-place-card__link"
                  aria-label={`Explore quinceañera photography in ${location.city}`}
                >
                  <span className="tq-place-card__media">
                    {shot ? (
                      <Image
                        src={shot.url}
                        alt={shot.alt}
                        fill
                        unoptimized={shot.local}
                        sizes="(min-width: 1280px) 25vw, (min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw"
                        style={{ objectPosition: shot.focus }}
                      />
                    ) : (
                      <span className="tq-place-card__blank">
                        <span className="tq-mono tq-muted">[{n} / DFW]</span>
                        <span className="tq-display">{location.city}</span>
                      </span>
                    )}
                  </span>
                  <span className="tq-place-card__row">
                    <span className="tq-display tq-place-card__name">{location.city}</span>
                    <span className="tq-mono tq-place-card__idx">
                      [{n}] <span className="tq-arrow" aria-hidden>↗</span>
                    </span>
                  </span>
                  <span className="tq-mono tq-place-card__sub">{location.county}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="coverage-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[02 / Coverage]</p>
            <h2 id="coverage-title" className="tq-display tq-head__title">
              Beyond the map.
            </h2>
            <p className="tq-head__dek">
              We plan around your church, portrait location and venue so the photographs feel like your family and
              your city.
            </p>
          </header>
          <ol className="tq-principles">
            <li>
              <span className="tq-mono tq-muted">[01]</span>
              <h3 className="tq-display">Church, portraits, venue</h3>
              <p>The whole day is planned around where it actually happens, from la misa to the reception hall.</p>
            </li>
            <li>
              <span className="tq-mono tq-muted">[02]</span>
              <h3 className="tq-display">English or Spanish</h3>
              <p>Planning is available in English or Spanish, from the first message to the timeline.</p>
            </li>
            <li>
              <span className="tq-mono tq-muted">[03]</span>
              <h3 className="tq-display">No travel fee</h3>
              <p>Every city on this page sits inside our Dallas–Fort Worth service area, so there is no travel fee.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="next-title">
        <div className="tq-wrap">
          <div className="tq-place-cta">
            <div>
              <p className="tq-mono tq-muted" style={{ margin: "0 0 20px" }}>[03 / Next]</p>
              <h2 id="next-title" className="tq-display">
                From the first portrait to the last dance.
              </h2>
            </div>
            <div className="tq-place-cta__side">
              <p>Choose the coverage that fits the day, then tell us the date you have in mind.</p>
              <div className="tq-place-actions">
                <Link href={site.cta.href} className="tq-btn tq-btn--lg">
                  Request a date <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
                <Link href="/portfolio" className="tq-btn tq-btn--ghost">See the work</Link>
                <Link href="/#commissions" className="tq-btn tq-btn--ghost">See packages & prices</Link>
                <Link href="/venues" className="tq-btn tq-btn--ghost">Venues</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
