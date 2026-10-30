import type { Metadata } from "next";
import Image from "next/image";
import { SlotImage } from "@/components/SlotImage";
import Link from "next/link";
import { venues } from "@/content/venues";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { getImagesByVenue } from "@/lib/content-db";
import "@/components/txq/pages/places.css";
import { languageAlternates, OG_LOCALE } from "@/lib/hreflang";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Salones de Quinceañera en Dallas–Fort Worth",
  description: "Explora salones de quinceañera en Dallas–Fort Worth donde hemos fotografiado celebraciones reales. Encuentra tu lugar y consulta tu fecha.",
  alternates: { canonical: "/es/salones", languages: languageAlternates("/venues", "/es/salones") },
  openGraph: { locale: OG_LOCALE.es },
};

const pad = (n: number) => String(n).padStart(2, "0");

type Salon = {
  venue: string;
  slug: string;
  count: number;
  image: string | null;
  alt: string | null;
  focus: string;
};

export default async function SalonesPage() {
  const photos = await Promise.all(venues.map((venue) => getImagesByVenue(venue.slug)));
  const heroPhoto = photos.flat().find((photo) => Boolean(photo.url)) ?? null;
  const fallbackHero = portfolioFallback.find((p) => p.url === "/portfolio/canal.webp") ?? portfolioFallback[0];
  const groups = new Map<string, Salon[]>();
  venues.forEach((venue, index) => {
    const first = photos[index][0];
    groups.set(venue.city, [
      ...(groups.get(venue.city) ?? []),
      {
        venue: venue.venue,
        slug: venue.slug,
        count: photos[index].length,
        image: first?.url ?? null,
        alt: first?.alt ?? null,
        focus: `${Math.round((first?.focus_x ?? 0.5) * 100)}% ${Math.round((first?.focus_y ?? 0.4) * 100)}%`,
      },
    ]);
  });
  const cities = [...groups.entries()];
  const total = photos.reduce((n, list) => n + list.length, 0);

  return (
    <>
      <div className="tq-wrap">
        <nav className="tq-place-crumbs tq-mono" aria-label="Ruta de navegación">
          <ol>
            <li><Link href="/es">Inicio</Link></li>
            <li><span aria-current="page">Salones</span></li>
          </ol>
        </nav>
      </div>

      {heroPhoto || fallbackHero ? (
        <div className="tq-place-stage">
          <figure className="tq-plate" style={{ margin: 0 }}>
            <div className="tq-plate__loop">
              <SlotImage
                slot="venues.hero"
                lang="es"
                fill
                priority
                sizes="100vw"
                fallback={
                  heroPhoto
                    ? { src: heroPhoto.url, alt: heroPhoto.alt || "Retrato de quinceañera en Dallas–Fort Worth", width: heroPhoto.width, height: heroPhoto.height, focus: `${Math.round((heroPhoto.focus_x ?? 0.5) * 100)}% ${Math.round((heroPhoto.focus_y ?? 0.4) * 100)}%` }
                    : { src: fallbackHero.url, alt: "Retrato de quinceañera en Dallas–Fort Worth", focus: "50% 40%" }
                }
              />
            </div>
            <figcaption>
              <span className="tq-tag tq-tag--tl tq-mono">[Salones / DFW]</span>
              <span className="tq-tag tq-tag--bl tq-mono">{pad(venues.length)} lugares</span>
            </figcaption>
          </figure>
        </div>
      ) : null}

      <div className="tq-wrap">
        <div className="tq-ledger tq-place-ledger">
          <div className="tq-ledger__head">
            <p className="tq-mono tq-place-eyebrow">Salones / Dallas–Fort Worth</p>
            <h1 className="tq-display">
              El lugar también <em>cuenta su historia.</em>
            </h1>
            <p className="tq-ledger__dek">
              Explora salones, jardines y espacios de celebración. Mira las fotografías disponibles de cada lugar y
              encuentra ideas para su día.
            </p>
          </div>
          <div className="tq-ledger__meta">
            <dl className="tq-meta tq-mono">
              <div>
                <dt>Lugares</dt>
                <dd className="tq-nums">{pad(venues.length)}</dd>
              </div>
              <div>
                <dt>Ciudades</dt>
                <dd className="tq-nums">{pad(cities.length)}</dd>
              </div>
              <div>
                <dt>Fotos</dt>
                <dd className="tq-nums">{total}</dd>
              </div>
            </dl>
          </div>
          <div className="tq-action">
            <a href="#lugares" className="tq-mono tq-place-note">Explorar lugares ↓</a>
            <div style={{ display: "grid", gap: 12 }}>
              <Link href="/es#intake" className="tq-action__link">
                <span>Consultar tu fecha</span>
                <span className="tq-arrow" aria-hidden>→</span>
              </Link>
              <Link href="/venues" hrefLang="en" lang="en" className="tq-mono tq-place-note">View in English ↗</Link>
            </div>
          </div>
        </div>
      </div>

      <section id="lugares" className="tq-section" aria-labelledby="lugares-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[01 / Galerías por ciudad]</p>
            <h2 id="lugares-title" className="tq-display tq-head__title">
              Salones, jardines <em>y espacios de celebración.</em>
            </h2>
            <p className="tq-head__dek">
              Cada lugar abre las quinceañeras que hemos fotografiado ahí. Las páginas de cada salón están en inglés.
            </p>
          </header>

          {cities.map(([city, list], cityIndex) => (
            <section key={city} className="tq-section" aria-labelledby={`salon-city-${cityIndex}`}>
              <div className="tq-place-group">
                <h3 id={`salon-city-${cityIndex}`} className="tq-display">{city}, TX</h3>
                <span className="tq-mono">
                  [{pad(cityIndex + 1)} / {pad(cities.length)}] · {list.length} {list.length === 1 ? "lugar" : "lugares"}
                </span>
              </div>
              <ul className="tq-place-cards tq-place-cards--wide">
                {list.map((venue) => (
                  <li key={venue.slug} className="tq-place-card">
                    <Link href={`/venues/${venue.slug}`} hrefLang="en" className="tq-place-card__link">
                      <span className="tq-place-card__media">
                        {venue.image ? (
                          <Image
                            src={venue.image}
                            alt={venue.alt || `Quinceañera en ${venue.venue}`}
                            fill
                            sizes="(min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw"
                            style={{ objectPosition: venue.focus }}
                          />
                        ) : (
                          <span className="tq-place-card__blank">
                            <span className="tq-mono tq-muted">[Fotografías próximamente]</span>
                            <span className="tq-display">{venue.venue}</span>
                          </span>
                        )}
                      </span>
                      <span className="tq-place-card__row">
                        <span className="tq-display tq-place-card__name">{venue.venue}</span>
                        <span className="tq-mono tq-place-card__idx">
                          EN <span className="tq-arrow" aria-hidden>↗</span>
                        </span>
                      </span>
                      <span className="tq-mono tq-place-card__sub">
                        {venue.count ? `${venue.count} fotos` : "Ver lugar"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="tq-section" aria-labelledby="salones-next-title">
        <div className="tq-wrap">
          <div className="tq-place-cta">
            <div>
              <p className="tq-mono tq-muted" style={{ margin: "0 0 20px" }}>[02 / Siguiente]</p>
              <h2 id="salones-next-title" className="tq-display">
                Su salón, <em>su fecha.</em>
              </h2>
            </div>
            <div className="tq-place-cta__side">
              <p>Cuéntanos dónde será la celebración y qué fecha tienes en mente. Consultar no requiere pago.</p>
              <div className="tq-place-actions">
                <Link href="/es#intake" className="tq-btn tq-btn--lg">
                  Consultar tu fecha <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
                <Link href="/es/fotografo-de-quinceaneras" className="tq-btn tq-btn--ghost">Áreas</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
