import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { locations, getLocation, nearbyLocations, cityGeo } from "@/content/locations";
import { getEsPost } from "@/content/blog";
import { getFeaturedImages, getImagesByCity } from "@/lib/content-db";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";

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
  const description = `Fotógrafo y videógrafo de quinceañeras en ${loc.city}. Colecciones a precio fijo desde $1,800, Save-the-Date sin costo — de la misa a la recepción.`;
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
  essential: "Foto o video, un artista, los momentos clave del día.",
  signature:
    "Foto + video, dos narradores, tu día completo con un adelanto la misma semana.",
  legacy:
    "Todo lo de Signature, más video de larga duración, dron y un álbum premium.",
};

/** Spanish top-4 inclusions per tier (packages.includes is English-only; hand-authored, not auto-translated). */
const INCLUDES_ES: Record<string, string[]> = {
  essential: [
    "Foto O video — un servicio, un artista",
    "Hasta 6 horas de cobertura (iglesia + recepción)",
    "Galería editada O un video de momentos",
    "Sesión Save-the-Date sin costo",
  ],
  signature: [
    "Foto + video — dos narradores, todo el día",
    "Hasta 8 horas de cobertura del día completo",
    "Video de momentos + galería completa editada",
    "Adelanto la misma semana",
  ],
  legacy: [
    "Todo lo de Signature",
    "Video cinematográfico de larga duración (1–3 horas)",
    "Cobertura con dron / aérea",
    "Horas extra + una segunda sesión de retratos",
  ],
};

function sharedFaqsEs(city: string) {
  return [
    {
      q: `¿Cuánto cuesta un fotógrafo de quinceañera en ${city}?`,
      a: `Mis colecciones son a precio fijo — de $1,800 a $5,500 en ${city} — con el precio a la vista, sin llamada para cotizar. Cada colección incluye una sesión Save-the-Date sin costo, y puedes pagar completo o en mensualidades sin intereses.`,
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
      a: "Sí. Reservas tu fecha con un depósito y divides el resto en mensualidades sin intereses antes del día — paga completo o en pagos, tú eliges en el checkout.",
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

  const faqs = [...loc.faqsEs, ...sharedFaqsEs(loc.city)];
  const nearby = nearbyLocations(loc.slug);
  const guides = ES_CITY_GUIDES.map(getEsPost).filter((p) => p !== undefined);
  const esUrl = `${site.url}/es/fotografo-de-quinceaneras/${loc.slug}`;
  const prices = packages.map((p) => p.price);
  // Las fotos propias de esta ciudad primero; si no hay, se usan las destacadas.
  const cityShots = await getImagesByCity(loc.slug, 3);
  const featured = cityShots.length ? cityShots : await getFeaturedImages(3);
  const isCityWork = cityShots.length > 0;

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
            url: `${site.url}/reserve?collection=${p.id}`,
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

      {/* Breadcrumb — rastro visible, refleja el BreadcrumbList */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-4xl px-5 pt-10 text-xs text-ink-faint md:px-10 lg:px-16"
      >
        <Link href="/es/fotografo-de-quinceaneras" className="transition-colors hover:text-ink">
          Inicio
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <Link
          href="/es/fotografo-de-quinceaneras"
          className="transition-colors hover:text-ink"
        >
          Fotógrafo de Quinceañeras
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <span className="text-ink-soft">{loc.city}, TX</span>
      </nav>

      {/* Hero — alineado a la izquierda, editorial */}
      <section className="mx-auto max-w-5xl px-5 pt-8 md:px-10 lg:px-16 md:pt-12">
        <Reveal>
          <p className="eyebrow mb-5">Fotografía y Video de Quinceañeras · {loc.city}, TX</p>
          <h1 className="max-w-3xl display-2 text-ink text-balance">
            Fotógrafo de Quinceañeras en {loc.city}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            {loc.leadEs}
          </p>
          <p className="mt-4 text-sm">
            <Link
              href={`/quinceanera-photographer/${loc.slug}`}
              className="text-wine underline underline-offset-2 hover:text-wine-deep"
              hrefLang="en"
            >
              View this page in English →
            </Link>
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <CTAButton href={site.cta.href} variant="primary">
              Reserva tu fecha
            </CTAButton>
            <CTAButton href={site.secondaryCta.href} variant="text">
              ¿Preguntas primero? Escríbeme
            </CTAButton>
          </div>
        </Reveal>
      </section>

      {/* Intro local */}
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <Reveal className="flex flex-col gap-6">
          {loc.introEs.map((para) => (
            <p key={para.slice(0, 24)} className="text-base leading-relaxed text-ink-soft">
              {para}
            </p>
          ))}
          <p className="text-sm text-ink-faint">
            Cubriendo {loc.areas.slice(0, -1).join(", ")}
            {loc.areas.length > 1 ? ` y ${loc.areas[loc.areas.length - 1]}` : loc.areas[0]}
            .
          </p>
        </Reveal>
      </section>

      {/* Colecciones */}
      <section className="bg-greige">
        <div className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <Reveal>
            <h2 className="display-2 text-ink text-balance">
              Colecciones a precio fijo desde {packages[0].priceLabel}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-soft">
              Cada quinceañera en {loc.city} se cubre de la iglesia a la recepción.
              La mayoría elige Signature — dos narradores, el día completo, foto y
              video.
            </p>
          </Reveal>

          <div className="mt-10 border-t border-line">
            {packages.map((p, i) => (
              <Reveal
                key={p.id}
                delay={i * 60}
                className="grid gap-y-4 border-b border-line py-8 md:grid-cols-12 md:gap-x-8"
              >
                <div className="md:col-span-4">
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-display text-3xl text-ink">{p.name}</h3>
                    {p.highlight ? (
                      <span className="text-[0.6rem] uppercase tracking-[0.18em] text-wine-deep">
                        Más popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 max-w-xs text-sm text-ink-soft">{TIER_ES[p.id]}</p>
                  <p className="mt-4 font-display text-3xl text-ink">{p.priceLabel}</p>
                </div>
                <div className="md:col-span-7 md:col-start-6">
                  <ul className="grid gap-x-8 gap-y-2 text-sm leading-relaxed text-ink-soft sm:grid-cols-2">
                    {INCLUDES_ES[p.id].map((item) => (
                      <li key={item} className="border-b border-line/70 pb-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <CTAButton
                    href={`/reserve?collection=${p.id}`}
                    variant="text"
                    className="mt-5"
                  >
                    Reservar {p.name}
                  </CTAButton>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 text-sm">
            <Link
              href="/investment"
              className="text-wine underline underline-offset-2 hover:text-wine-deep"
            >
              Ver todo lo que incluye cada colección →
            </Link>
          </p>
          <p className="mt-3 text-sm">
            <Link
              href="/es/save-the-date-quinceanera"
              className="text-wine underline underline-offset-2 hover:text-wine-deep"
            >
              Tu sesión Save-the-Date está incluida gratis →
            </Link>
          </p>
        </div>
      </section>

      {/* Cómo funciona la reserva */}
      <section className="mx-auto max-w-4xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <h2 className="display-2 text-ink text-center text-balance">
          Cómo funciona la reserva
        </h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            {
              t: "Reserva tu fecha",
              b: "Elige tu colección y fecha y paga un depósito desde $500. Tu día queda apartado al instante; paga completo o en mensualidades sin intereses.",
            },
            {
              t: "Lo planeamos juntos",
              b: "Te contacto personalmente en menos de 24 horas para confirmar los detalles: tu itinerario, la iglesia y el salón, y los momentos que más importan.",
            },
            {
              t: "Tu día, capturado completo",
              b: "Una sola quinceañera al día. De la misa al último baile, con todo mi enfoque en tu celebración.",
            },
          ].map((step, i) => (
            <li key={step.t} className="flex flex-col gap-3">
              <span className="font-display text-3xl text-wine">{i + 1}</span>
              <span className="font-display text-xl text-ink">{step.t}</span>
              <span className="text-sm leading-relaxed text-ink-soft">{step.b}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Trabajo reciente — fotos destacadas reales (no renderiza nada si no hay) */}
      {featured.length ? (
        <section className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <Reveal>
            <p className="eyebrow mb-5">
              {isCityWork ? `Trabajo reciente en ${loc.city}` : "Trabajo seleccionado"}
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((img, i) => (
              <Reveal
                key={img.slug ?? i}
                delay={i * 70}
                className={i === 0 ? "sm:col-span-2" : ""}
              >
                <Link href="/portfolio" className="group block">
                  <div
                    className={`relative overflow-hidden ${i === 0 ? "aspect-[16/10]" : "aspect-[4/5]"}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `Fotografía de quinceañera en ${loc.city}, TX`}
                      fill
                      sizes={i === 0 ? "(max-width: 768px) 100vw, 64rem" : "(max-width: 768px) 100vw, 32rem"}
                      className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                      style={{
                        objectPosition: `${img.focus_x != null ? Math.round(img.focus_x * 100) : 50}% ${img.focus_y != null ? Math.round(img.focus_y * 100) : 35}%`,
                      }}
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
            {isCityWork
              ? `Fotografía de quinceañera en ${loc.city}`
              : "Fotografía de quinceañera en Dallas–Fort Worth"}
          </p>
        </section>
      ) : null}

      {/* Portafolio CTA */}
      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16 md:py-section-lg">
          <h2 className="display-2 text-cream text-balance">
            Mira quinceañeras completas de {loc.city}, de principio a fin.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-cream/75">
            No un reel de momentos — galerías y videos completos de celebraciones
            reales de DFW, para que sepas exactamente lo que estás reservando.
          </p>
          <div className="mt-9 flex justify-center">
            <CTAButton href="/portfolio" variant="onDark">
              Ver las galerías
            </CTAButton>
          </div>
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
              <dd className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Guías para planear (cierra el círculo ciudad ↔ blog) */}
      {guides.length ? (
        <section className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <p className="eyebrow mb-5">Para planear su quinceañera en {loc.city}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/es/blog/${g.slug}`}
                className="group border border-line bg-white p-5 transition-colors hover:border-wine"
              >
                <h3 className="font-display text-lg leading-tight text-ink group-hover:text-wine">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{g.excerpt}</p>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm">
            <Link href="/es/blog" className="text-wine underline underline-offset-2 hover:text-wine-deep">
              Ver toda la guía de quinceañera →
            </Link>
          </p>
        </section>
      ) : null}

      {/* Ciudades cercanas */}
      <section className="bg-greige">
        <div className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <p className="eyebrow mb-5">También en todo DFW</p>
          <div className="flex flex-wrap gap-3">
            {nearby.map((n) => (
              <Link
                key={n.slug}
                href={`/es/fotografo-de-quinceaneras/${n.slug}`}
                className="border border-line bg-ivory px-4 py-2 text-sm text-ink transition-colors hover:border-wine hover:text-wine"
              >
                Fotógrafo de quinceañeras en {n.city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final — banda oscura (cierre de alto contraste) */}
      <section className="bg-dark">
        <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16 md:py-section-lg">
          <span className="text-[0.66rem] uppercase tracking-[0.24em] text-wine">
            Quedan pocas fechas de {site.scarcity.reservingYear}
          </span>
          <h2 className="mt-5 display-2 text-cream text-balance">Aparta su fecha hoy.</h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-cream/70">
            Solo reservo una quinceañera al día. Asegura la suya con un depósito —
            checkout seguro, aplicado a tu saldo final.
          </p>
          <div className="mt-10 flex justify-center">
            <CTAButton href={site.cta.href} variant="onDark">
              Reserva tu fecha
            </CTAButton>
          </div>
        </div>
      </section>
    </>
  );
}
