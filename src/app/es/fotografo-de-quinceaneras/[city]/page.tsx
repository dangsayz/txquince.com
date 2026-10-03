import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { locations, getLocation, nearbyLocations, cityGeo } from "@/content/locations";
import { getCityContent } from "@/content/city-content";
import { getEsPost } from "@/content/blog";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { getFeaturedImages, getImagesByCity } from "@/lib/content-db";
import { venuesByCity } from "@/content/venues";
import { Reveal } from "@/components/Reveal";

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

  const title = `Fotógrafo de Quinceañeras en ${loc.city}, TX`;
  const description = `Fotografía y video de quinceañeras en ${loc.city}. Cuatro colecciones a precio fijo desde $1,800; sesión Save-the-Date incluida desde Essential.`;
  const esUrl = `${site.url}/es/fotografo-de-quinceaneras/${loc.slug}`;
  const enUrl = `${site.url}/quinceanera-photographer/${loc.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/es/fotografo-de-quinceaneras/${loc.slug}`,
      languages: { "en-US": enUrl, "es-MX": esUrl, "x-default": enUrl },
    },
    openGraph: {
      title: `${title} · ${site.brand}`,
      description,
      url: esUrl,
      locale: "es_MX",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${site.brand}`,
      description,
    },
  };
}

/** Spanish collection blurbs (packages.ts copy is English-only). */
const TIER_ES: Record<string, string> = {
  moments: "Foto o video, un artista, cinco horas enfocadas en los momentos clave.",
  essential: "Foto o video, un artista, los momentos clave del día.",
  signature:
    "Foto + video, dos narradores, tu día completo con un adelanto la misma semana.",
  legacy:
    "Todo lo de Signature, más video de larga duración, dron y un álbum premium.",
};

/** Spanish top-4 inclusions per tier (packages.includes is English-only; hand-authored, not auto-translated). */
const INCLUDES_ES: Record<string, string[]> = {
  moments: [
    "Foto O video — un servicio, un artista",
    "5 horas de cobertura — de la misa a la recepción temprana",
    "Galería editada O un video de momentos",
  ],
  essential: [
    "Foto O video — un servicio, un artista",
    "Hasta 6 horas de cobertura (iglesia + recepción)",
    "Galería editada O un video de momentos",
    "Sesión Save-the-Date sin costo",
  ],
  signature: [
    "Foto + video — dos narradores, todo el día",
    "Hasta 7 horas de cobertura del día completo",
    "Video de momentos + galería completa editada",
    "Adelanto la misma semana",
  ],
  legacy: [
    "Todo lo de Signature",
    "Video cinematográfico de larga duración (1–3 horas)",
    "Cobertura con dron / aérea",
    "Hasta 8 horas de cobertura y una segunda sesión de retratos",
  ],
};

function sharedFaqsEs(city: string) {
  return [
    {
      q: `¿Cuánto cuesta un fotógrafo de quinceañera en ${city}?`,
      a: `Las cuatro colecciones de foto y video para ${city} tienen precios publicados de $1,800 a $5,500. La sesión Save-the-Date está incluida desde Essential; Moments ofrece cinco horas de foto o video. Puedes consultar tu fecha sin pagar.`,
    },
    {
      q: "¿También ofreces video, o solo fotografía?",
      a: "Los dos — soy fotógrafo y videógrafo de quinceañeras. Las colecciones Signature y Legacy cubren el día con foto y video juntos, un solo equipo, para que la misa, el vals y la recepción queden en fotos y en video cinematográfico sin que dos proveedores se estorben.",
    },
    {
      q: "¿Cobras por traslado?",
      a: `No — ${city} está dentro de mi área de Dallas–Fort Worth, así que no hay cargo por traslado. Las horas de cobertura son las mismas, esté tu iglesia y salón cerca o al otro lado de la ciudad.`,
    },
    {
      q: "¿Tienen planes de pago?",
      a: "Sí. Podemos revisar un plan de pagos contigo. Primero confirmamos la fecha y la cobertura; después enviamos el enlace seguro para el depósito, que se aplica al saldo de la colección.",
    },
  ];
}

export default async function CityPageEs({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) notFound();

  const content = getCityContent(loc.slug);
  const faqs = sharedFaqsEs(loc.city);
  const nearby = nearbyLocations(loc.slug);
  const cityVenues = venuesByCity(loc.slug);
  const guides = ES_CITY_GUIDES.map(getEsPost).filter((p) => p !== undefined);
  const esUrl = `${site.url}/es/fotografo-de-quinceaneras/${loc.slug}`;
  const prices = packages.map((p) => p.price);
  // Las fotos propias de esta ciudad primero; si no hay, se usan las destacadas.
  const cityShots = await getImagesByCity(loc.slug, 6);
  const featured = cityShots.length ? cityShots : await getFeaturedImages(6);
  const isCityWork = cityShots.length > 0;
  // El opener recibe su propio cuadro cinematográfico; el resto llena la cuadrícula.
  const fallbackHero = portfolioFallback.find((image) => image.city === loc.city) ?? portfolioFallback[0];
  const hero = featured[0] ?? (fallbackHero ? { url: fallbackHero.url, alt: fallbackHero.alt, focus_x: null, focus_y: null } : null);
  const recentWork = featured.slice(1);

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
        ...(site.contact.phoneE164 ? { telephone: site.contact.phoneE164 } : {}),
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
        priceRange: `$${Math.min(...prices)}–$${Math.max(...prices)}`,
        knowsLanguage: ["es", "en"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Colecciones de Quinceañera",
          itemListElement: packages.map((p) => ({
            "@type": "Offer",
            name: p.name,
            description: TIER_ES[p.id],
            price: String(p.price),
            priceCurrency: "USD",
            url: `${site.url}/es/consulta`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="relative isolate min-h-[70svh] overflow-hidden bg-ink text-white sm:min-h-[80svh]" aria-labelledby="city-title">
        <Image src={hero?.url ?? "/portfolio/kimberly-reception.webp"} alt={isCityWork ? `Fotografía de quinceañera en ${loc.city}, TX` : "Celebración de quinceañera en Dallas–Fort Worth"} fill priority sizes="100vw" unoptimized={(hero?.url ?? "").startsWith("/portfolio/")} className="object-cover" style={{ objectPosition: `${hero?.focus_x != null ? Math.round(hero.focus_x * 100) : 50}% ${hero?.focus_y != null ? Math.round(hero.focus_y * 100) : 38}%` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[70svh] max-w-[90rem] flex-col justify-between px-5 pb-12 pt-5 sm:min-h-[80svh] sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-white/85">
            <Link href="/es" className="inline-flex min-h-11 items-center underline underline-offset-4">Inicio</Link><span aria-hidden="true">/</span>
            <Link href="/es/fotografo-de-quinceaneras" className="inline-flex min-h-11 items-center underline underline-offset-4">Áreas</Link><span aria-hidden="true">/</span>
            <span>{loc.city}</span>
          </nav>
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-white/85">Fotografía y video de quinceañeras / {loc.city}, TX</p>
            <h1 id="city-title" className="mt-5 max-w-[22ch] font-display text-[clamp(2.15rem,4vw,4rem)] font-light leading-[1.14]">Fotografía de quinceañeras en {loc.city}</h1>
          </div>
        </div>
      </header>

      <section className="bg-ivory px-5 py-20 sm:px-10 sm:py-28" aria-labelledby="city-story-title">
        <div className="mx-auto grid max-w-[78rem] gap-8 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:gap-20">
        <div><p className="text-xs uppercase tracking-[0.2em] text-ink-soft">En {loc.city}</p><h2 id="city-story-title" className="mt-5 max-w-[19ch] font-display text-[clamp(1.85rem,3vw,3rem)] font-light leading-[1.2] text-ink">Un lugar para su historia.</h2></div>
        <div className="max-w-2xl space-y-6 text-base leading-8 text-ink-soft">
          <p>{loc.leadEs}</p>
          {(content?.introEs.slice(0, 2) ?? loc.introEs.slice(0, 1)).map((para) => <p key={para.slice(0, 24)}>{para}</p>)}
          <p>Cubrimos {loc.areas.slice(0, -1).join(", ")}{loc.areas.length > 1 ? ` y ${loc.areas[loc.areas.length - 1]}` : loc.areas[0]}.</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3"><Link href="/es/consulta" className="inline-flex min-h-12 items-center gap-4 border-b border-ink text-xs uppercase tracking-[0.15em] text-ink">Consultar su fecha <span aria-hidden="true">↗</span></Link><Link href={`/quinceanera-photographer/${loc.slug}`} hrefLang="en" className="inline-flex min-h-12 items-center border-b border-ink text-xs uppercase tracking-[0.15em] text-ink">Read in English ↗</Link></div>
        </div>
        </div>
      </section>

      {/* Dónde tomar las fotos — lugares reales (único por ciudad) */}
      {content?.photoSpots?.length ? (
        <section className="mx-auto max-w-5xl px-5 pb-section md:px-10 lg:px-16 md:pb-section-lg">
          <Reveal className="mb-8 max-w-xl md:mb-10">
            <p className="eyebrow">Dónde tomar las fotos en {loc.city}</p>
            <h2 className="mt-4 font-display text-[clamp(1.875rem,2.8vw,2.625rem)] leading-tight text-ink">
              Los lugares de {loc.city} que se ven increíbles en cámara.
            </h2>
          </Reveal>
          <div className="border-t border-ink/10">
            {content.photoSpots.map((s) => (
              <Reveal
                key={s.name}
                className="grid gap-1.5 border-b border-ink/10 py-6 md:grid-cols-12 md:gap-x-8"
              >
                <h3 className="font-display text-xl text-ink md:col-span-4">{s.name}</h3>
                <p className="text-base leading-7 text-ink-soft md:col-span-8">{s.whyEs}</p>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Colecciones */}
      <section className="bg-ivory" aria-labelledby="city-collections-title">
        <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="grid gap-5 border-b border-line pb-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:items-end">
            <div><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Foto y video / {loc.city}</p><h2 id="city-collections-title" className="mt-3 font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">Colecciones desde {packages[0].priceLabel}.</h2></div>
            <p className="max-w-md text-base leading-7 text-ink-soft">Cuatro opciones con precios publicados. Moments cubre cinco horas; Signature reúne foto y video. Confirmamos disponibilidad antes de pedir un depósito.</p>
          </div>
          <div className="divide-y divide-line">
            {packages.map((p, i) => <article key={p.id} className="grid gap-5 py-8 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] md:gap-10">
              <div><p className="text-xs uppercase tracking-[0.16em] text-ink-soft">0{i + 1} / 04</p><h3 className="mt-3 font-display text-[clamp(1.55rem,2.3vw,2.1rem)] font-normal text-ink">{p.name}</h3><p className="mt-2 max-w-sm text-base leading-7 text-ink-soft">{TIER_ES[p.id]}</p></div>
              <div><div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-line pb-4"><p className="font-display text-2xl font-normal text-ink">{p.priceLabel}</p><p className="text-base text-ink-soft">Depósito: {p.depositLabel}</p></div><ul className="mt-4 grid gap-x-6 gap-y-2 text-base leading-7 text-ink-soft sm:grid-cols-2">{(INCLUDES_ES[p.id] ?? p.includes).map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">—</span><span>{item}</span></li>)}</ul><Link href="/es/consulta" className="mt-5 inline-flex min-h-12 items-center gap-5 border-b border-ink text-base text-ink">Consultar {p.name} <span aria-hidden="true">↗</span></Link></div>
            </article>)}
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-6 text-base"><Link href="/es/paquetes" className="inline-flex min-h-11 items-center text-ink underline underline-offset-4">Comparar todas las colecciones ↗</Link><Link href="/es/save-the-date-quinceanera" className="inline-flex min-h-11 items-center text-ink underline underline-offset-4">Sobre la sesión Save-the-Date ↗</Link></div>
        </div>
      </section>

      {/* Cómo funciona la reserva */}
      <section className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12" aria-labelledby="city-booking-title">
        <div className="grid gap-5 border-b border-line pb-8 md:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]"><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Del primer mensaje al día</p><h2 id="city-booking-title" className="font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">Cómo funciona la consulta.</h2></div>
        <ol className="divide-y divide-line">
          {[
            {
              t: "Cuéntanos tus planes",
              b: "Comparte la fecha, la ciudad y la cobertura que tienes en mente. Consultar no requiere pago.",
            },
            {
              t: "Confirmamos la disponibilidad",
              b: "Revisamos los detalles contigo antes de enviarte un enlace para el depósito de la colección elegida.",
            },
            {
              t: "Planeamos la cobertura",
              b: "Organizamos la fotografía y el video alrededor de la ceremonia, los retratos y la recepción.",
            },
          ].map((step, i) => (
            <li key={step.t} className="grid gap-3 py-6 md:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] md:gap-8">
              <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">0{i + 1}</span>
              <div><h3 className="font-display text-xl font-normal text-ink">{step.t}</h3><p className="mt-2 max-w-xl text-base leading-7 text-ink-soft">{step.b}</p></div>
            </li>
          ))}
        </ol>
      </section>

      {/* Trabajo reciente — fotos destacadas reales (no renderiza nada si no hay) */}
      {recentWork.length ? (
        <section className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <Reveal>
            <p className="eyebrow mb-5">
              {isCityWork ? `Trabajo reciente en ${loc.city}` : "Trabajo seleccionado"}
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentWork.map((img, i) => (
              <Reveal
                key={img.slug ?? i}
                delay={i * 70}
                className={i === 0 ? "sm:col-span-2" : ""}
              >
                <Link href="/portfolio" className="group block">
                  <div className={`relative overflow-hidden bg-greige ${i === 0 ? "aspect-[16/10]" : "aspect-[4/5]"}`}>
                    <Image
                      src={img.url}
                      alt={isCityWork ? `Fotografía de quinceañera en ${loc.city}, TX` : "Fotografía de quinceañera en Dallas–Fort Worth"}
                      fill
                      sizes={i === 0 ? "(max-width: 768px) 100vw, 64rem" : "(max-width: 768px) 100vw, 32rem"}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
                      style={{
                        objectPosition: `${img.focus_x != null ? Math.round(img.focus_x * 100) : 50}% ${img.focus_y != null ? Math.round(img.focus_y * 100) : 35}%`,
                      }}
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            {isCityWork
              ? `Fotografía de quinceañera en ${loc.city}`
              : "Fotografía de quinceañera en Dallas–Fort Worth"}
          </p>
        </section>
      ) : null}

      <section className="border-y border-line bg-ivory" aria-labelledby="city-work-title">
        <div className="mx-auto grid max-w-[88rem] gap-6 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:items-end lg:px-12">
          <div><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">El trabajo</p><h2 id="city-work-title" className="mt-3 max-w-2xl font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">Mira los retratos y las celebraciones.</h2></div>
          <div><p className="max-w-xl text-base leading-7 text-ink-soft">Explora fotografías y videos de quinceañeras de Dallas–Fort Worth antes de elegir tu cobertura.</p><Link href="/portfolio" className="mt-5 inline-flex min-h-12 items-center gap-5 border-b border-ink text-base text-ink">Ver las galerías <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>

      {/* Preguntas */}
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <h2 className="display-2 text-ink">
          Fotografía de quinceañeras en {loc.city} — preguntas, respondidas.
        </h2>
        <dl className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <div key={f.q} className="py-7">
              <dt className="font-display text-xl text-ink">{f.q}</dt>
              <dd className="mt-3 text-base leading-7 text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Guías para planear (cierra el círculo ciudad ↔ blog) */}
      {guides.length ? (
        <section className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <p className="eyebrow mb-5">Para planear su quinceañera en {loc.city}</p>
          <div className="divide-y divide-line border-t border-line">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/es/blog/${g.slug}`}
                className="group block py-6"
              >
                <h3 className="font-display text-lg font-normal leading-tight text-ink group-hover:underline group-hover:underline-offset-4">
                  {g.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-ink-soft">{g.excerpt}</p>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-base">
            <Link href="/es/blog" className="inline-flex min-h-11 items-center text-ink underline underline-offset-4 hover:text-accent-strong">
              Ver toda la guía de quinceañera →
            </Link>
          </p>
        </section>
      ) : null}

      {/* Sedes que fotografiamos en esta ciudad — enlaces al clúster de sedes */}
      {cityVenues.length ? (
        <section className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <p className="eyebrow mb-5">Sedes de quinceañera en {loc.city}</p>
          <div className="flex flex-wrap gap-3">
            {cityVenues.map((v) => (
              <Link
                key={v.slug}
                href={`/venues/${v.slug}`}
                className="inline-flex min-h-11 items-center border-b border-line text-base text-ink transition-colors hover:border-ink"
              >
                {v.venue}
              </Link>
            ))}
            <Link
              href="/venues"
              className="inline-flex min-h-11 items-center border-b border-line text-base text-ink transition-colors hover:border-ink"
            >
              Todas las sedes →
            </Link>
          </div>
        </section>
      ) : null}

      {/* Ciudades cercanas */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <p className="eyebrow mb-5">También en todo DFW</p>
          <div className="flex flex-wrap gap-3">
            {nearby.map((n) => (
              <Link
                key={n.slug}
                href={`/es/fotografo-de-quinceaneras/${n.slug}`}
                className="inline-flex min-h-11 items-center border-b border-line text-base text-ink transition-colors hover:border-ink"
              >
                Fotógrafo de quinceañeras en {n.city}
              </Link>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
