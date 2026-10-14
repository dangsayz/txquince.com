import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { commissionsFromLabel as FROM_TOKEN } from "@/content/commissions";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep, fillPrices } from "@/lib/price-text";
import { locations } from "@/content/locations";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { site } from "@/content/site";
import { getFeaturedImages, getImagesByCity, getPageHero, type PortfolioImage } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import "@/components/txq/pages/places.css";

export const revalidate = 3600;

// Carries a price token (FROM_TOKEN); filled from the live book below.
const META: Metadata = {
  title: "Fotógrafo de Quinceañeras — Dallas–Fort Worth",
  description: `Fotos y video de quinceañera de lujo en todo Dallas–Fort Worth — Dallas, Fort Worth, Frisco, Plano, McKinney, Arlington y más. Paquetes publicados desde ${FROM_TOKEN}.`,
  alternates: {
    canonical: "/es/fotografo-de-quinceaneras",
    languages: {
      "en-US": site.url + "/quinceanera-photographer",
      "es-MX": site.url + "/es/fotografo-de-quinceaneras",
      "x-default": site.url + "/quinceanera-photographer",
    },
  },
  openGraph: {
    title: "Fotógrafo de Quinceañeras — Dallas–Fort Worth · " + site.brand,
    description: `Fotos y video de quinceañera en todo el metroplex de DFW. Paquetes publicados desde ${FROM_TOKEN}.`,
    url: site.url + "/es/fotografo-de-quinceaneras",
    locale: "es_MX",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return fillDeep(META, await getPriceBook());
}

/** Una fotografía, normalizada desde la base de datos o el portafolio incluido. */
type Shot = { url: string; alt: string; focus: string; local: boolean };

const pad = (n: number) => String(n).padStart(2, "0");

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.32) * 100)}%`;
}

const fromDb = (image: PortfolioImage): Shot => ({
  url: image.url,
  alt: publicPhotoCopy(image, "Retrato de quinceañera").alt,
  focus: focal(image.focus_x, image.focus_y),
  local: false,
});

const fromFallback = (photo: (typeof portfolioFallback)[number]): Shot => ({
  url: photo.url,
  alt: photo.alt,
  focus: "50% 35%",
  local: true,
});

export default async function LocationsHubEs() {
  const commissionsFromLabel = fillPrices(FROM_TOKEN, await getPriceBook());
  const [imgs, assignedHero, cityPhotoSets] = await Promise.all([
    getFeaturedImages(24),
    getPageHero("areas"),
    Promise.all(locations.map((location) => getImagesByCity(location.slug, 2))),
  ]);

  const heroImage =
    assignedHero ?? imgs.find((image) => (image.width ?? 0) >= (image.height ?? 0)) ?? imgs[0] ?? null;
  const fallbackHero = portfolioFallback.find((p) => p.url === "/portfolio/kimberly-reception.webp") ?? portfolioFallback[0];
  const hero: Shot | null = heroImage ? fromDb(heroImage) : fallbackHero ? { ...fromFallback(fallbackHero), focus: "50% 60%" } : null;

  // Cada tarjeta lleva una fotografía real: primero las fotos de la ciudad,
  // luego una del portafolio tomada ahí, luego la siguiente destacada sin usar.
  // Nunca se muestra un <img> vacío; sin fotos, la tarjeta queda solo en texto.
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
        <nav className="tq-place-crumbs tq-mono" aria-label="Ruta de navegación">
          <ol>
            <li><Link href="/es">Inicio</Link></li>
            <li><span aria-current="page">Áreas</span></li>
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
              <span className="tq-tag tq-tag--tl tq-mono">[Áreas / DFW]</span>
              <span className="tq-tag tq-tag--bl tq-mono">{pad(locations.length)} ciudades</span>
            </figcaption>
          </figure>
        </div>
      ) : null}

      <div className="tq-wrap">
        <div className="tq-ledger tq-place-ledger">
          <div className="tq-ledger__head">
            <p className="tq-mono tq-place-eyebrow">TX Quince / Dónde trabajamos</p>
            <h1 className="tq-display">
              Por todo Dallas–Fort Worth. <em>De la iglesia al último baile.</em>
            </h1>
            <p className="tq-ledger__dek">
              Capturamos quinceañeras en fotos y video por todo Dallas–Fort Worth. Descubre las ciudades donde
              trabajamos y las celebraciones reales detrás de las imágenes.
            </p>
          </div>
          <div className="tq-ledger__meta">
            <dl className="tq-meta tq-mono">
              <div>
                <dt>Ciudades</dt>
                <dd className="tq-nums">{pad(locations.length)}</dd>
              </div>
              <div>
                <dt>Traslado</dt>
                <dd>Sin cargo en DFW</dd>
              </div>
              <div>
                <dt>Idioma</dt>
                <dd>Español · English</dd>
              </div>
            </dl>
          </div>
          <div className="tq-action">
            <a href="#ciudades" className="tq-mono tq-place-note">Encuentra tu ciudad ↓</a>
            <div style={{ display: "grid", gap: 12 }}>
              <Link href="/es#intake" className="tq-action__link">
                <span>Consultar tu fecha</span>
                <span className="tq-arrow" aria-hidden>→</span>
              </Link>
              <span className="tq-mono tq-muted">Paquetes desde {commissionsFromLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <section id="ciudades" className="tq-section" aria-labelledby="ciudades-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[01 / Ciudades]</p>
            <h2 id="ciudades-title" className="tq-display tq-head__title">
              Cada ciudad tiene <em>su propia historia.</em>
            </h2>
            <p className="tq-head__dek">
              Elige tu ciudad para ver ideas de retratos, lugares y detalles de la cobertura. La planeación está
              disponible en español e inglés.
            </p>
          </header>

          <ol className="tq-place-cards tq-place-cards--four">
            {cards.map(({ location, shot, n }) => (
              <li key={location.slug} className="tq-place-card">
                <Link
                  href={`/es/fotografo-de-quinceaneras/${location.slug}`}
                  className="tq-place-card__link"
                  aria-label={`Ver fotografía de quinceañera en ${location.city}`}
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

      <section className="tq-section" aria-labelledby="cobertura-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[02 / Cobertura]</p>
            <h2 id="cobertura-title" className="tq-display tq-head__title">
              Más allá del mapa.
            </h2>
            <p className="tq-head__dek">
              Planeamos alrededor de tu iglesia, el lugar de retratos y el salón, para que las fotos se sientan como
              tu familia y tu ciudad.
            </p>
          </header>
          <ol className="tq-principles">
            <li>
              <span className="tq-mono tq-muted">[01]</span>
              <h3 className="tq-display">Iglesia, retratos, salón</h3>
              <p>Todo el día se planea alrededor de donde sucede, de la misa al salón de la recepción.</p>
            </li>
            <li>
              <span className="tq-mono tq-muted">[02]</span>
              <h3 className="tq-display">En español o en inglés</h3>
              <p>La planeación está disponible en español e inglés, del primer mensaje al itinerario.</p>
            </li>
            <li>
              <span className="tq-mono tq-muted">[03]</span>
              <h3 className="tq-display">Sin cargo por traslado</h3>
              <p>Todas las ciudades de esta página están dentro de nuestra área de Dallas–Fort Worth.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="siguiente-title">
        <div className="tq-wrap">
          <div className="tq-place-cta">
            <div>
              <p className="tq-mono tq-muted" style={{ margin: "0 0 20px" }}>[03 / Siguiente]</p>
              <h2 id="siguiente-title" className="tq-display">
                Del primer retrato al último baile.
              </h2>
            </div>
            <div className="tq-place-cta__side">
              <p>Explora el trabajo y los cuatro paquetes; luego dinos qué fecha tienes en mente.</p>
              <div className="tq-place-actions">
                <Link href="/es#intake" className="tq-btn tq-btn--lg">
                  Consultar tu fecha <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
                <Link href="/portfolio" className="tq-btn tq-btn--ghost">Ver fotografías</Link>
                <Link href="/es#commissions" className="tq-btn tq-btn--ghost">Ver paquetes</Link>
                <Link href="/es/salones" className="tq-btn tq-btn--ghost">Salones</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
