import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SlotImage } from "@/components/SlotImage";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import {
  bookingFlow,
  bookingSteps,
  commissionsFor,
  commissionsFromLabel as FROM_TOKEN,
  commissionLinks,
  retainerPercentLabel as PCT_TOKEN,
} from "@/content/commissions";
import { priceCeiling, priceFloor, usd } from "@/lib/commission";
import { getPriceBook } from "@/lib/pricing";
import { PT, fillDeep, fillPrices } from "@/lib/price-text";
import { locations, getLocation, nearbyLocations, cityGeo } from "@/content/locations";
import { getCityContent } from "@/content/city-content";
import { getEsPost } from "@/content/blog";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { getFeaturedImages, getImagesByCity } from "@/lib/content-db";
import { venuesByCity } from "@/content/venues";
import "@/components/txq/pages/places.css";
import { ContactButtons, ContactLine } from "@/components/ContactButtons";
import { businessContactJsonLd } from "@/lib/contact";
import { jsonLdString } from "@/lib/json-ld";
import { languageAlternates, OG_LOCALE } from "@/lib/hreflang";

/** Curated ES guides surfaced on each city page (closes the city↔blog loop). */
const ES_CITY_GUIDES = [
  "mejores-lugares-para-fotos-de-quinceanera-dfw",
  "salones-para-quinceaneras-dfw",
  "cuanto-cuesta-fotografo-quinceanera-dallas-fort-worth",
  "cuando-reservar-fotografo-quinceanera-dfw",
];

// ISR: regenerate hourly so newly city-tagged photos surface without a redeploy.
export const revalidate = 3600;

export function generateStaticParams() {
  return locations.map((l) => ({ city: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) return {};
  const commissionsFromLabel = fillPrices(FROM_TOKEN, await getPriceBook());

  const title = `Fotógrafo de Quinceañeras en ${loc.city}, TX`;
  const description = `Fotógrafo y videógrafo de quinceañeras de lujo en ${loc.city}. Paquetes publicados desde ${commissionsFromLabel}, en español, de la misa al último baile. Consulta tu fecha en vivo.`;
  const esUrl = `${site.url}/es/fotografo-de-quinceaneras/${loc.slug}`;
  const enUrl = `${site.url}/quinceanera-photographer/${loc.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/es/fotografo-de-quinceaneras/${loc.slug}`,
      languages: languageAlternates(enUrl, esUrl),
    },
    openGraph: {
      title: `${title} · ${site.brand}`,
      description,
      url: esUrl,
      locale: OG_LOCALE.es,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${site.brand}`,
      description,
    },
  };
}

function sharedFaqsEs(city: string) {
  return [
    {
      q: `¿Cuánto cuesta un fotógrafo de quinceañera en ${city}?`,
      a: `Todos los paquetes están publicados: la Sesión de retratos cuesta ${PT.price.study}, fotos y video juntos desde ${PT.price.cinema}, y la Celebración completa, el paquete que recomendamos para la mayoría de las celebraciones en ${city}, cuesta ${PT.price.production}. La Celebración de dos días cuesta ${PT.price.archive}. Puedes consultar tu fecha sin pagar.`,
    },
    {
      q: "¿También ofreces video, o solo fotografía?",
      a: "Los dos. Desde Foto + Video, un fotógrafo y un videógrafo cubren el día como un solo equipo, para que la misa, el vals y la recepción queden en fotos y en un video completo en 4K sin que dos proveedores se estorben.",
    },
    {
      q: "¿Cobras por traslado?",
      a: `No — ${city} está dentro de mi área de Dallas–Fort Worth, así que no hay cargo por traslado. Tus horas son las mismas, esté tu iglesia y salón cerca o al otro lado de la ciudad.`,
    },
    {
      q: "¿Cómo apartamos la fecha?",
      a: bookingFlow.es,
    },
  ];
}

/** Una fotografía, normalizada desde la base de datos o el portafolio incluido. */
type Shot = { key: string; url: string; alt: string; focus: string; local: boolean };

const pad = (n: number) => String(n).padStart(2, "0");

function focal(fx?: number | null, fy?: number | null, dy = 0.35): string {
  return `${fx != null ? Math.round(fx * 100) : 50}% ${fy != null ? Math.round(fy * 100) : Math.round(dy * 100)}%`;
}

/** Del primer mensaje al día. */

export default async function CityPageEs({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const rawLoc = getLocation(city);
  if (!rawLoc) notFound();

  // Copy carries price tokens; fill everything from the live price book here,
  // once, so the page body, FAQ and JSON-LD all read the same current prices.
  const book = await getPriceBook();
  const loc = fillDeep(rawLoc, book);
  const commissions = commissionsFor(book);
  const commissionsFromLabel = fillPrices(FROM_TOKEN, book);
  const retainerPercentLabel = fillPrices(PCT_TOKEN, book);
  const PASOS = fillDeep(bookingSteps.es, book).map((p) => ({ t: p.title, b: p.body }));

  const content = fillDeep(getCityContent(loc.slug), book);
  const faqs = content?.faqsEs ?? fillDeep([...loc.faqsEs, ...sharedFaqsEs(loc.city)], book);
  const nearby = nearbyLocations(loc.slug);
  const cityVenues = venuesByCity(loc.slug);
  const guides = fillDeep(ES_CITY_GUIDES.map(getEsPost).filter((p) => p !== undefined), book);
  const esUrl = `${site.url}/es/fotografo-de-quinceaneras/${loc.slug}`;
  // Las fotos propias de esta ciudad primero; si no hay, las destacadas; si
  // tampoco hay, el portafolio incluido (primero las de esta ciudad). Así nunca
  // se muestra un cuadro vacío — Frisco, Plano y McKinney aún no tienen fotos.
  const cityShots = await getImagesByCity(loc.slug, 6);
  const featured = cityShots.length ? cityShots : await getFeaturedImages(6);
  const isCityWork = cityShots.length > 0;
  const cityAlt = `Fotografía de quinceañera en ${loc.city}, TX`;
  const dfwAlt = "Fotografía de quinceañera en Dallas–Fort Worth";
  const shots: Shot[] = featured.length
    ? featured.map((img) => ({
        key: img.slug ?? img.id,
        url: img.url,
        alt: isCityWork ? cityAlt : dfwAlt,
        focus: focal(img.focus_x, img.focus_y),
        local: false,
      }))
    : [...portfolioFallback]
        .sort((a, b) => Number(b.city === loc.city) - Number(a.city === loc.city))
        .slice(0, 6)
        .map((p) => ({
          key: p.slug,
          url: p.url,
          alt: p.city === loc.city ? cityAlt : dfwAlt,
          focus: "50% 35%",
          local: true,
        }));
  // El opener recibe su propio cuadro cinematográfico; el resto llena la cuadrícula.
  const hero = shots[0] ?? null;
  const recentWork = shots.slice(1);

  // Los índices de sección siguen a las secciones que realmente se muestran.
  const order = [
    "intro",
    content?.photoSpots?.length ? "spots" : null,
    "commissions",
    "booking",
    "work",
    "faq",
    guides.length ? "guides" : null,
    cityVenues.length ? "venues" : null,
    "nearby",
    "next",
  ].filter((s): s is string => s !== null);
  const idx = (key: string, label: string) => `[${pad(order.indexOf(key) + 1)} / ${label}]`;

  const areasLine =
    loc.areas.length > 1
      ? `${loc.areas.slice(0, -1).join(", ")} y ${loc.areas[loc.areas.length - 1]}`
      : (loc.areas[0] ?? loc.city);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${esUrl}#business`,
        name: `${site.brand} — Fotografía de Quinceañeras en ${loc.city}`,
        description: `Fotografía y video de quinceañera en ${loc.city}, ${loc.county}.`,
        url: esUrl,
        image: `${site.url}/opengraph-image`,
        email: site.contact.email,
        ...businessContactJsonLd(),
        areaServed: [
          { "@type": "City", name: `${loc.city}, TX` },
          { "@type": "AdministrativeArea", name: "Dallas–Fort Worth, TX" },
        ],
        ...(cityGeo[loc.slug]
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: cityGeo[loc.slug].lat,
                longitude: cityGeo[loc.slug].lon,
              },
            }
          : {}),
        address: {
          "@type": "PostalAddress",
          addressLocality: loc.city,
          addressRegion: "TX",
          addressCountry: "US",
        },
        priceRange: `${usd(priceFloor(book))}–${usd(priceCeiling(book))}`,
        knowsLanguage: ["es", "en"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Paquetes de quinceañera",
          itemListElement: commissions.map((c) => ({
            "@type": "Offer",
            name: `${c.numeral} ${c.name.es}`,
            description: c.summary.es,
            price: String(c.price),
            priceCurrency: "USD",
            url: `${site.url}${commissionLinks.es.compare}`,
          })),
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${esUrl}#faq`,
        inLanguage: "es",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${esUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Fotógrafo de Quinceañeras",
            item: `${site.url}/es/fotografo-de-quinceaneras`,
          },
          { "@type": "ListItem", position: 3, name: `${loc.city}, TX`, item: esUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      <div className="tq-wrap">
        <nav className="tq-place-crumbs tq-mono" aria-label="Ruta de navegación">
          <ol>
            <li><Link href="/es">Inicio</Link></li>
            <li><Link href="/es/fotografo-de-quinceaneras">Áreas</Link></li>
            <li><span aria-current="page">{loc.city}</span></li>
          </ol>
        </nav>
      </div>

      {hero ? (
        <div className="tq-place-stage">
          <figure className="tq-plate" style={{ margin: 0 }}>
            <div className="tq-plate__loop">
              <SlotImage
                slot={`city.${loc.slug}.hero`}
                lang="es"
                fill
                priority
                sizes="100vw"
                fallback={{ src: hero.url, alt: hero.alt, focus: hero.focus }}
              />
            </div>
            <figcaption>
              <span className="tq-tag tq-tag--tl tq-mono">[{loc.city}, TX]</span>
              <span className="tq-tag tq-tag--bl tq-mono">{isCityWork ? `Trabajo en ${loc.city}` : "Dallas–Fort Worth"}</span>
            </figcaption>
          </figure>
        </div>
      ) : null}

      <div className="tq-wrap">
        <div className="tq-ledger tq-place-ledger">
          <div className="tq-ledger__head">
            <p className="tq-mono tq-place-eyebrow">Fotografía y video de quinceañeras / {loc.city}, TX</p>
            <h1 className="tq-display">
              Fotografía de quinceañeras en {loc.city}. <em>De la misa al último baile.</em>
            </h1>
            <p className="tq-ledger__dek">{loc.leadEs}</p>
          </div>
          <div className="tq-ledger__meta">
            <dl className="tq-meta tq-mono">
              <div>
                <dt>Condado</dt>
                <dd>{loc.county}</dd>
              </div>
              <div>
                <dt>Cobertura</dt>
                <dd>Foto y video</dd>
              </div>
              <div>
                <dt>Traslado</dt>
                <dd>Sin cargo</dd>
              </div>
            </dl>
          </div>
          <div className="tq-action">
            <Link href={`/quinceanera-photographer/${loc.slug}`} hrefLang="en" lang="en" className="tq-mono tq-place-note">
              Read in English ↗
            </Link>
            <div style={{ display: "grid", gap: 12 }}>
              <Link href={commissionLinks.es.book} className="tq-action__link">
                <span>Consultar su fecha</span>
                <span className="tq-arrow" aria-hidden>→</span>
              </Link>
              <span className="tq-mono tq-muted">Paquetes desde {commissionsFromLabel}</span>
              <ContactLine lang="es" placement="city-hero" />
            </div>
          </div>
        </div>
      </div>

      <section className="tq-section" aria-labelledby="city-story-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("intro", `En ${loc.city}`)}</p>
            <h2 id="city-story-title" className="tq-display tq-head__title">
              Un lugar para <em>su historia.</em>
            </h2>
          </header>
          <div className="tq-place-prose">
            {(content?.introEs.slice(0, 2) ?? loc.introEs.slice(0, 1)).map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
            <p>Cubrimos {areasLine}.</p>
          </div>
        </div>
      </section>

      {/* Dónde tomar las fotos — lugares reales (único por ciudad) */}
      {content?.photoSpots?.length ? (
        <section className="tq-section" aria-labelledby="city-spots-title">
          <div className="tq-wrap">
            <header className="tq-head tq-place-head--long">
              <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("spots", "Dónde tomar las fotos")}</p>
              <h2 id="city-spots-title" className="tq-display tq-head__title">
                Los lugares de {loc.city} que se ven increíbles en cámara.
              </h2>
            </header>
            <ol className="tq-place-rows">
              {content.photoSpots.map((s, i) => (
                <li key={s.name} className="tq-place-row">
                  <span className="tq-mono tq-place-row__k">[{pad(i + 1)}]</span>
                  <h3 className="tq-display tq-place-row__t">{s.name}</h3>
                  <p className="tq-place-row__b">{s.whyEs}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Paquetes */}
      <section className="tq-section" aria-labelledby="city-collections-title">
        <div className="tq-wrap">
          <header className="tq-head tq-place-head--long">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("commissions", `Foto y video / ${loc.city}`)}</p>
            <h2 id="city-collections-title" className="tq-display tq-head__title">
              Paquetes desde {commissionsFromLabel}.
            </h2>
            <p className="tq-head__dek">
              Cuatro paquetes con precios publicados. Un depósito del {retainerPercentLabel} aparta la fecha y se
              abona a tu total; la Celebración completa reúne fotos, video y un álbum de fotos impreso.
            </p>
          </header>
          <ol className="tq-place-tiers">
            {commissions.map((c, i) => (
              <li key={c.id} className="tq-place-tier" data-rec={c.recommended ? "true" : undefined}>
                <div className="tq-place-tier__top tq-mono">
                  <span>[{pad(i + 1)} / {pad(commissions.length)}]</span>
                  {c.recommended ? <span>Recomendado</span> : null}
                </div>
                <h3 className="tq-display tq-place-tier__name">
                  {c.numeral} {c.name.es}
                </h3>
                <p className="tq-place-tier__sum">{c.summary.es}</p>
                <p className="tq-display tq-nums tq-place-tier__price">
                  {c.priceLabel}
                  <small>Depósito: {c.retainerLabel}</small>
                </p>
                <ul>
                  {c.highlights.es.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link href={commissionLinks.es.book} className="tq-btn tq-btn--lg tq-btn--ghost tq-btn--block">
                  Consultar tu fecha <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="tq-place-after">
            <Link href={commissionLinks.es.compare} className="tq-btn tq-btn--ghost">
              Comparar todos los paquetes <span className="tq-arrow" aria-hidden>→</span>
            </Link>
            <Link href="/es/sesion-de-fotos-quinceanera" className="tq-btn tq-btn--ghost">
              Sesión de fotos pre-quince <span className="tq-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Cómo funciona reservar */}
      <section className="tq-section" aria-labelledby="city-booking-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("booking", "Del primer mensaje al día")}</p>
            <h2 id="city-booking-title" className="tq-display tq-head__title">
              Cómo <em>reservar.</em>
            </h2>
          </header>
          <ol className="tq-place-rows">
            {PASOS.map((step, i) => (
              <li key={step.t} className="tq-place-row">
                <span className="tq-mono tq-place-row__k">[{pad(i + 1)}]</span>
                <h3 className="tq-display tq-place-row__t">{step.t}</h3>
                <p className="tq-place-row__b">{step.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* El trabajo — fotos reales (de la ciudad, destacadas o del portafolio) */}
      <section className="tq-section" aria-labelledby="city-work-title">
        <div className="tq-wrap">
          <header className="tq-head tq-place-head--long">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
              {idx("work", isCityWork ? `Trabajo reciente en ${loc.city}` : "Trabajo seleccionado")}
            </p>
            <h2 id="city-work-title" className="tq-display tq-head__title">
              Mira los retratos y las celebraciones.
            </h2>
            <p className="tq-head__dek">
              Explora fotografías y videos de quinceañeras de Dallas–Fort Worth antes de elegir tu cobertura.
            </p>
          </header>
          {recentWork.length ? (
            <ul className="tq-place-work">
              {recentWork.map((img, i) => (
                <li key={img.key}>
                  <Link href="/portfolio">
                    <figure className="tq-place-frame">
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        unoptimized={img.local}
                        sizes={i === 0 ? "(min-width: 960px) 66vw, 100vw" : "(min-width: 960px) 33vw, 50vw"}
                        style={{ objectPosition: img.focus }}
                      />
                    </figure>
                    <span className="tq-cap tq-mono">
                      <span>[{pad(i + 1)}]</span>
                      <span className="tq-cap__mid">
                        {isCityWork ? `Quinceañera en ${loc.city}` : "Quinceañera en Dallas–Fort Worth"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="tq-place-after">
            <Link href="/portfolio" className="tq-btn tq-btn--ghost">
              Ver las galerías <span className="tq-arrow" aria-hidden>↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Preguntas — el patrón de preguntas de la portada; refleja el FAQPage. */}
      <section className="tq-section" aria-labelledby="city-faq-title">
        <div className="tq-wrap">
          <header className="tq-head tq-place-head--long">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("faq", "Preguntas")}</p>
            <h2 id="city-faq-title" className="tq-display tq-head__title">
              Fotografía de quinceañeras en {loc.city} — preguntas, respondidas.
            </h2>
          </header>
          <div className="tq-faq">
            {faqs.map((f, i) => (
              <details key={f.q} className="tq-faq__item" open={i === 0}>
                <summary>
                  <span className="tq-mono tq-muted">{pad(i + 1)}</span>
                  <h3 className="tq-faq__q">{f.q}</h3>
                  <span className="tq-faq__icon" aria-hidden />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Guías para planear (cierra el círculo ciudad ↔ blog) */}
      {guides.length ? (
        <section className="tq-section" aria-labelledby="city-guides-title">
          <div className="tq-wrap tq-place-block">
            <header className="tq-head tq-place-head--long">
              <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("guides", "Guías")}</p>
              <h2 id="city-guides-title" className="tq-display tq-head__title">
                Para planear su quinceañera en {loc.city}.
              </h2>
            </header>
            <ol className="tq-place-guides">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/es/blog/${g.slug}`}>
                    <span className="tq-mono tq-place-guides__cat">Guía</span>
                    <span className="tq-display tq-place-guides__title"><span>{g.title}</span></span>
                    <span className="tq-mono tq-muted tq-place-guides__read">{g.readMinutes} min ↗</span>
                    <span className="tq-place-guides__ex">{g.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="tq-place-after" style={{ borderTop: 0, paddingBottom: 0 }}>
              <Link href="/es/blog" className="tq-btn tq-btn--ghost">
                Guía completa de quinceañera <span className="tq-arrow" aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Sedes que fotografiamos en esta ciudad — enlaces al clúster de sedes */}
      {cityVenues.length ? (
        <section className="tq-section" aria-labelledby="city-venues-title">
          <div className="tq-wrap tq-place-block">
            <header className="tq-head tq-place-head--long">
              <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("venues", "Sedes")}</p>
              <h2 id="city-venues-title" className="tq-display tq-head__title">
                Sedes de quinceañera en {loc.city}.
              </h2>
            </header>
            <ul className="tq-place-links">
              {cityVenues.map((v) => (
                <li key={v.slug}>
                  <Link href={`/venues/${v.slug}`} hrefLang="en">
                    <span>{v.venue}</span>
                    <span className="tq-arrow" aria-hidden>↗</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/es/salones">
                  <span>Todas las sedes</span>
                  <span className="tq-arrow" aria-hidden>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </section>
      ) : null}

      {/* Ciudades cercanas */}
      <section className="tq-section" aria-labelledby="city-nearby-title">
        <div className="tq-wrap tq-place-block">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("nearby", "Todo DFW")}</p>
            <h2 id="city-nearby-title" className="tq-display tq-head__title">
              También en <em>todo DFW.</em>
            </h2>
          </header>
          <ul className="tq-place-links">
            {nearby.map((n) => (
              <li key={n.slug}>
                <Link href={`/es/fotografo-de-quinceaneras/${n.slug}`}>
                  <span>Fotógrafo de quinceañeras en {n.city}</span>
                  <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="city-next-title">
        <div className="tq-wrap">
          <div className="tq-place-cta">
            <div>
              <p className="tq-mono tq-muted" style={{ margin: "0 0 20px" }}>{idx("next", "Siguiente")}</p>
              <h2 id="city-next-title" className="tq-display">
                Cuéntanos de su día en {loc.city}.
              </h2>
            </div>
            <div className="tq-place-cta__side">
              <p>Consultar tu fecha no cuesta nada. Si prefieres, mándanos un texto o un WhatsApp, o hacemos una llamada rápida.</p>
              <div className="tq-place-actions">
                <Link href={commissionLinks.es.book} className="tq-btn tq-btn--lg">
                  Consultar tu fecha <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
                <Link href="/es/fotografo-de-quinceaneras" className="tq-btn tq-btn--ghost">Todas las áreas</Link>
              </div>
              <ContactButtons lang="es" placement="city-cta" primary={false} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
