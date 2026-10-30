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
import { BASE_CREW, priceCeiling, priceFloor, usd } from "@/lib/commission";
import { getPriceBook } from "@/lib/pricing";
import { PT, fillDeep, fillPrices } from "@/lib/price-text";
import { locations, getLocation, nearbyLocations, cityGeo } from "@/content/locations";
import { getCityContent } from "@/content/city-content";
import { getPost } from "@/content/blog";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { releasedTestimonials } from "@/content/testimonials";
import { getFeaturedImages, getImagesByCity, type PortfolioImage } from "@/lib/content-db";
import { venuesByCity } from "@/content/venues";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import "@/components/txq/pages/places.css";
import { ContactButtons, ContactLine } from "@/components/ContactButtons";
import { businessContactJsonLd } from "@/lib/contact";
import { jsonLdString } from "@/lib/json-ld";

/** Curated guides surfaced on each city page (closes the city↔blog loop). */
const CITY_GUIDES = [
  "best-quinceanera-photo-locations-dfw",
  "quinceanera-reception-venues-dfw",
  "quinceanera-photographer-cost-dallas-fort-worth",
  "when-to-book-quinceanera-photographer-dfw",
];

/** A real church-to-reception quinceañera day — the topical depth competitors cover. */
const DAY_TIMELINE: { when: string; title: string; body: string }[] = [
  {
    when: "Morning",
    title: "Getting ready",
    body: "The first frames of the day — the dress, the shoes, the last details, and the family helping her get ready before anyone leaves for the church.",
  },
  {
    when: "Midday",
    title: "La misa",
    body: "The mass — the rosary, the medalla y ramo, the blessing. Photographed respectfully and unobtrusively, the way the church expects.",
  },
  {
    when: "Afternoon",
    title: "Portraits",
    body: "A dedicated window for portraits with the quinceañera, her court, and her family — at a spot that means something close to home.",
  },
  {
    when: "Early evening",
    title: "La entrada",
    body: "The grand entrance into the reception, the toast, and the formal welcome of her chambelanes and damas.",
  },
  {
    when: "Evening",
    title: "El vals & baile sorpresa",
    body: "The waltz, the father–daughter dance, and the surprise dance the court has been rehearsing for months.",
  },
  {
    when: "Night",
    title: "The celebration",
    body: "Dinner, la última muñeca, the dollar dance, and open dancing until the night winds down — covered start to finish, never cut short.",
  },
];

/** From first message to the day — removes the "what happens next?" drop-off. */

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

  const title = `${loc.city} Quinceañera Photographer, TX`;
  const description = `Luxury quinceañera photographer & videographer in ${loc.city}. Published packages from ${commissionsFromLabel}, bilingual, la misa to the last dance. Check your date live.`;
  const url = `${site.url}/quinceanera-photographer/${loc.slug}`;
  const esUrl = `${site.url}/es/fotografo-de-quinceaneras/${loc.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/quinceanera-photographer/${loc.slug}`,
      languages: { "en-US": url, "es-MX": esUrl, "x-default": url },
    },
    openGraph: {
      title: `${title} · ${site.brand}`,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${site.brand}`,
      description,
    },
  };
}

/** Shared FAQs appended to every city's local ones. */
function sharedFaqs(city: string) {
  return [
    {
      q: `How much does a quinceañera photographer cost in ${city}?`,
      a: `Every package is published: the Portrait Session is ${PT.price.study}, photos and video together start at ${PT.price.cinema}, and the Full Celebration, the package we recommend for most ${city} celebrations, is ${PT.price.production}. The Two-Day Celebration is ${PT.price.archive}.`,
    },
    {
      q: "Do you offer video too, or only photography?",
      a: "Both. From Photo + Video up, a photographer and a videographer cover the day as one team, so the misa, el vals and the reception are captured in photos and a 4K video without two vendors getting in each other's way.",
    },
    {
      q: "Do you charge a travel fee?",
      a: `No — ${city} is inside my Dallas–Fort Worth service area, so there's no travel fee. Your hours are the same whether your church and venue are close together or across town.`,
    },
    {
      q: "How do we reserve the date?",
      a: bookingFlow.en,
    },
  ];
}

/** One photograph, normalized from the DB or the bundled portfolio fallback. */
type Shot = { key: string; url: string; alt: string; focus: string; local: boolean };

const pad = (n: number) => String(n).padStart(2, "0");

function focal(fx?: number | null, fy?: number | null, dy = 0.35): string {
  return `${fx != null ? Math.round(fx * 100) : 50}% ${fy != null ? Math.round(fy * 100) : Math.round(dy * 100)}%`;
}

export default async function CityPage({
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
  const content = fillDeep(getCityContent(loc.slug), book);
  const commissions = commissionsFor(book);
  const commissionsFromLabel = fillPrices(FROM_TOKEN, book);
  const retainerPercentLabel = fillPrices(PCT_TOKEN, book);
  const BOOKING_STEPS = fillDeep(bookingSteps.en, book);
  // Prefer the unique, researched per-city FAQs; fall back to the legacy set.
  const faqs = content?.faqs ?? fillDeep([...loc.faqs, ...sharedFaqs(loc.city)], book);
  const nearby = nearbyLocations(loc.slug);
  const cityVenues = venuesByCity(loc.slug);
  const guides = fillDeep(CITY_GUIDES.map(getPost).filter((p) => p !== undefined), book);
  const quotes = releasedTestimonials().slice(0, 3);
  const url = `${site.url}/quinceanera-photographer/${loc.slug}`;
  // This city's OWN tagged work first; fall back to featured until it's tagged,
  // then to the bundled portfolio (that city's photos first) so the page never
  // renders an empty frame — Frisco, Plano and McKinney have no tagged work yet.
  const cityShots = await getImagesByCity(loc.slug, 6);
  const featured = cityShots.length ? cityShots : await getFeaturedImages(6);
  const isCityWork = cityShots.length > 0;
  const shots: Shot[] = featured.length
    ? featured.map((img: PortfolioImage) => ({
        key: img.slug ?? img.id,
        url: img.url,
        alt: publicPhotoCopy(img, altPhraseFor(img.section)).alt,
        focus: focal(img.focus_x, img.focus_y),
        local: false,
      }))
    : [...portfolioFallback]
        .sort((a, b) => Number(b.city === loc.city) - Number(a.city === loc.city))
        .slice(0, 6)
        .map((p) => ({ key: p.slug, url: p.url, alt: p.alt, focus: "50% 35%", local: true }));
  // The opener gets its own cinematic frame; the rest fill the work grid below.
  const hero = shots[0] ?? null;
  const recentWork = shots.slice(1);

  // Section index labels follow the sections that actually render.
  const order = [
    "intro",
    content?.photoSpots?.length ? "spots" : null,
    "commissions",
    "day",
    "booking",
    "work",
    "faq",
    guides.length ? "guides" : null,
    cityVenues.length ? "venues" : null,
    "nearby",
    quotes.length ? "quotes" : null,
    "next",
  ].filter((s): s is string => s !== null);
  const idx = (key: string, label: string) => `[${pad(order.indexOf(key) + 1)} / ${label}]`;

  // Per-city structured data: a ProfessionalService scoped to this city + the
  // FAQPage. Mirrors the global JsonLd but with areaServed = this city.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${url}#business`,
        name: `${site.brand} — Quinceañera Photography in ${loc.city}`,
        description: `Quinceañera photos & video serving ${loc.city}, ${loc.county}.`,
        url,
        image: `${site.url}/opengraph-image`,
        email: site.contact.email,
        ...businessContactJsonLd(),
        areaServed: [
          { "@type": "City", name: `${loc.city}, TX` },
          ...nearby.map((n) => ({ "@type": "City", name: `${n.city}, TX` })),
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
        knowsLanguage: ["en", "es"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Quinceañera Packages",
          itemListElement: commissions.map((c) => ({
            "@type": "Offer",
            name: `${c.numeral} ${c.name.en}`,
            description: c.summary.en,
            price: String(c.price),
            priceCurrency: "USD",
            url: `${site.url}${commissionLinks.en.compare}`,
          })),
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Quinceañera Photographer",
            item: `${site.url}/quinceanera-photographer`,
          },
          { "@type": "ListItem", position: 3, name: `${loc.city}, TX`, item: url },
        ],
      },
    ],
  };

  const areasLine =
    loc.areas.length > 1
      ? `${loc.areas.slice(0, -1).join(", ")}, and ${loc.areas[loc.areas.length - 1]}`
      : (loc.areas[0] ?? loc.city);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      <div className="tq-wrap">
        <nav className="tq-place-crumbs tq-mono" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/quinceanera-photographer">Areas served</Link></li>
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
                lang="en"
                fill
                priority
                sizes="100vw"
                fallback={{ src: hero.url, alt: hero.alt, focus: hero.focus }}
              />
            </div>
            <figcaption>
              <span className="tq-tag tq-tag--tl tq-mono">[{loc.city}, TX]</span>
              <span className="tq-tag tq-tag--bl tq-mono">{isCityWork ? `${loc.city} work` : "Dallas–Fort Worth"}</span>
            </figcaption>
          </figure>
        </div>
      ) : null}

      <div className="tq-wrap">
        <div className="tq-ledger tq-place-ledger">
          <div className="tq-ledger__head">
            <p className="tq-mono tq-place-eyebrow">Quinceañera photos &amp; video / {loc.city}, TX</p>
            <h1 className="tq-display">
              Her day in {loc.city}. <em>La misa to the last dance.</em>
            </h1>
            <p className="tq-ledger__dek">{loc.lead}</p>
          </div>
          <div className="tq-ledger__meta">
            <dl className="tq-meta tq-mono">
              <div>
                <dt>County</dt>
                <dd>{loc.county}</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>Photos &amp; video</dd>
              </div>
              <div>
                <dt>Travel</dt>
                <dd>No fee</dd>
              </div>
            </dl>
          </div>
          <div className="tq-action">
            <Link href={`/es/fotografo-de-quinceaneras/${loc.slug}`} hrefLang="es" lang="es" className="tq-mono tq-place-note">
              Leer en español ↗
            </Link>
            <div style={{ display: "grid", gap: 12 }}>
              <Link href={site.cta.href} className="tq-action__link">
                <span>{site.cta.label}</span>
                <span className="tq-arrow" aria-hidden>→</span>
              </Link>
              <span className="tq-mono tq-muted">Packages from {commissionsFromLabel}</span>
              <ContactLine lang="en" placement="city-hero" />
            </div>
          </div>
        </div>
      </div>

      <section className="tq-section" aria-labelledby="city-intro-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("intro", `In ${loc.city}`)}</p>
            <h2 id="city-intro-title" className="tq-display tq-head__title">
              A place for <em>her story.</em>
            </h2>
          </header>
          <div className="tq-place-prose">
            {(content?.intro ?? loc.intro).map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
            <p>
              Serving {areasLine}
              {nearby.length
                ? ` — plus nearby DFW cities like ${nearby.slice(0, 3).map((n) => n.city).join(", ")}.`
                : "."}
            </p>
          </div>
        </div>
      </section>

      {/* Where to shoot — real local photo spots (unique per city; answers
          "best places to take quince pictures in {city}") */}
      {content?.photoSpots?.length ? (
        <section className="tq-section" aria-labelledby="city-spots-title">
          <div className="tq-wrap">
            <header className="tq-head tq-place-head--long">
              <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("spots", "Where to shoot")}</p>
              <h2 id="city-spots-title" className="tq-display tq-head__title">
                The {loc.city} spots that photograph beautifully.
              </h2>
            </header>
            <ol className="tq-place-rows">
              {content.photoSpots.map((s, i) => (
                <li key={s.name} className="tq-place-row">
                  <span className="tq-mono tq-place-row__k">[{pad(i + 1)}]</span>
                  <h3 className="tq-display tq-place-row__t">{s.name}</h3>
                  <p className="tq-place-row__b">{s.why}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Compact commissions — full matrix lives on the homepage */}
      <section className="tq-section" aria-labelledby="city-commissions-title">
        <div className="tq-wrap">
          <header className="tq-head tq-place-head--long">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("commissions", "Packages")}</p>
            <h2 id="city-commissions-title" className="tq-display tq-head__title">
              Published packages from {commissionsFromLabel}.
            </h2>
            <p className="tq-head__dek">
              Every price for your {loc.city} celebration is published. A {retainerPercentLabel} deposit holds the
              date and goes toward your total. The Full Celebration brings a team of {BASE_CREW.production}, a day-of coordinator and a
              printed photo album.
            </p>
          </header>
          <ol className="tq-place-tiers">
            {commissions.map((c, i) => (
              <li key={c.id} className="tq-place-tier" data-rec={c.recommended ? "true" : undefined}>
                <div className="tq-place-tier__top tq-mono">
                  <span>[{pad(i + 1)} / {pad(commissions.length)}]</span>
                  {c.recommended ? <span>Recommended</span> : null}
                </div>
                <h3 className="tq-display tq-place-tier__name">
                  {c.numeral} {c.name.en}
                </h3>
                <p className="tq-place-tier__sum">{c.summary.en}</p>
                <p className="tq-display tq-nums tq-place-tier__price">
                  {c.priceLabel}
                  <small>Deposit {c.retainerLabel}</small>
                </p>
                <ul>
                  {c.highlights.en.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link href={commissionLinks.en.book} className="tq-btn tq-btn--lg tq-btn--ghost tq-btn--block">
                  Check your date <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="tq-place-after">
            <Link href={commissionLinks.en.compare} className="tq-btn tq-btn--ghost">
              Compare every deliverable <span className="tq-arrow" aria-hidden>→</span>
            </Link>
            <Link href="/quinceanera-photoshoot" className="tq-btn tq-btn--ghost">
              The pre-quince photoshoot <span className="tq-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="city-day-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("day", "Hour by hour")}</p>
            <h2 id="city-day-title" className="tq-display tq-head__title">
              The whole day, <em>church to reception.</em>
            </h2>
            <p className="tq-head__dek">
              Every package is built around the celebration — not a two-hour window. Whether you call it a
              quinceañera or just her quince, here&apos;s how the day unfolds for most {loc.city} families, and how I
              cover each part of it.
            </p>
          </header>
          <ol className="tq-place-rows">
            {DAY_TIMELINE.map((t) => (
              <li key={t.title} className="tq-place-row">
                <span className="tq-mono tq-place-row__k">{t.when}</span>
                <h3 className="tq-display tq-place-row__t">{t.title}</h3>
                <p className="tq-place-row__b">{t.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="booking-steps-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("booking", "How booking works")}</p>
            <h2 id="booking-steps-title" className="tq-display tq-head__title">
              From first look <em>to her day.</em>
            </h2>
          </header>
          <ol className="tq-place-rows">
            {BOOKING_STEPS.map((step, i) => (
              <li key={step.title} className="tq-place-row">
                <span className="tq-mono tq-place-row__k">[{pad(i + 1)}]</span>
                <h3 className="tq-display tq-place-row__t">{step.title}</h3>
                <p className="tq-place-row__b">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="city-work-title">
        <div className="tq-wrap">
          <header className="tq-head tq-place-head--long">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
              {idx("work", isCityWork ? `Recent ${loc.city} work` : "Selected work")}
            </p>
            <h2 id="city-work-title" className="tq-display tq-head__title">
              See full {loc.city} quinceañeras, start to finish.
            </h2>
            <p className="tq-head__dek">
              Not a highlight video — complete galleries and videos from real DFW celebrations, so you know exactly
              what you&apos;re reserving.
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
                      <span className="tq-cap__mid">{isCityWork ? `${loc.city}, TX` : "Dallas–Fort Worth, TX"}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="tq-place-after">
            <Link href="/portfolio" className="tq-btn tq-btn--ghost">
              View the galleries <span className="tq-arrow" aria-hidden>↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* City FAQ — the homepage Q&A pattern; mirrors the FAQPage schema. */}
      <section className="tq-section" aria-labelledby="city-faq-title">
        <div className="tq-wrap">
          <header className="tq-head tq-place-head--long">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("faq", "Questions")}</p>
            <h2 id="city-faq-title" className="tq-display tq-head__title">
              Quinceañera photography in {loc.city} — questions, answered.
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

      {/* Planning guides (closes the city ↔ blog loop) */}
      {guides.length ? (
        <section className="tq-section" aria-labelledby="city-guides-title">
          <div className="tq-wrap tq-place-block">
            <header className="tq-head tq-place-head--long">
              <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("guides", "Guides")}</p>
              <h2 id="city-guides-title" className="tq-display tq-head__title">
                Planning your {loc.city} quinceañera.
              </h2>
            </header>
            <ol className="tq-place-guides">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/blog/${g.slug}`}>
                    <span className="tq-mono tq-place-guides__cat">{g.category}</span>
                    <span className="tq-display tq-place-guides__title"><span>{g.title}</span></span>
                    <span className="tq-mono tq-muted tq-place-guides__read">{g.readMinutes} min read ↗</span>
                    <span className="tq-place-guides__ex">{g.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="tq-place-after" style={{ borderTop: 0, paddingBottom: 0 }}>
              <Link href="/blog" className="tq-btn tq-btn--ghost">
                The full quinceañera guide <span className="tq-arrow" aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Venues we shoot in this city — internal links into the venue cluster */}
      {cityVenues.length ? (
        <section className="tq-section" aria-labelledby="city-venues-title">
          <div className="tq-wrap tq-place-block">
            <header className="tq-head tq-place-head--long">
              <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("venues", "Venues")}</p>
              <h2 id="city-venues-title" className="tq-display tq-head__title">
                Quinceañera venues we shoot in {loc.city}.
              </h2>
            </header>
            <ul className="tq-place-links">
              {cityVenues.map((v) => (
                <li key={v.slug}>
                  <Link href={`/venues/${v.slug}`}>
                    <span>{v.venue}</span>
                    <span className="tq-arrow" aria-hidden>↗</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/venues">
                  <span>All venues</span>
                  <span className="tq-arrow" aria-hidden>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </section>
      ) : null}

      {/* Nearby cities — internal link graph */}
      <section className="tq-section" aria-labelledby="city-nearby-title">
        <div className="tq-wrap tq-place-block">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("nearby", "Across DFW")}</p>
            <h2 id="city-nearby-title" className="tq-display tq-head__title">
              Also serving <em>across DFW.</em>
            </h2>
          </header>
          <ul className="tq-place-links">
            {nearby.map((n) => (
              <li key={n.slug}>
                <Link href={`/quinceanera-photographer/${n.slug}`}>
                  <span>Quinceañera photographer in {n.city}</span>
                  <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials — renders only when release-cleared ones exist (never a fabricated quote). */}
      {quotes.length ? (
        <section className="tq-section" aria-labelledby="city-quotes-title">
          <div className="tq-wrap tq-place-block">
            <header className="tq-head">
              <p className="tq-head__index tq-mono" style={{ margin: 0 }}>{idx("quotes", "In their words")}</p>
              <h2 id="city-quotes-title" className="tq-display tq-head__title">
                Families who trusted me <em>with their day.</em>
              </h2>
            </header>
            <ul className="tq-place-quotes">
              {quotes.map((t, i) => (
                <li key={`${t.momName}-${i}`}>
                  <span className="tq-mono tq-muted">[{pad(i + 1)}]</span>
                  <blockquote className="tq-display">&ldquo;{t.quote}&rdquo;</blockquote>
                  <p className="tq-mono tq-muted" style={{ margin: 0 }}>
                    {t.momName} · {t.daughterName}&apos;s quinceañera{t.location ? ` · ${t.location}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="tq-section" aria-labelledby="city-next-title">
        <div className="tq-wrap">
          <div className="tq-place-cta">
            <div>
              <p className="tq-mono tq-muted" style={{ margin: "0 0 20px" }}>{idx("next", "Next")}</p>
              <h2 id="city-next-title" className="tq-display">
                Tell us about her day in {loc.city}.
              </h2>
            </div>
            <div className="tq-place-cta__side">
              <p>Check your date on the live calendar, or text us first. A quick call is fine too.</p>
              <div className="tq-place-actions">
                <Link href={commissionLinks.en.book} className="tq-btn tq-btn--lg">
                  Check your date <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
                <Link href="/quinceanera-photographer" className="tq-btn tq-btn--ghost">All areas</Link>
              </div>
              <ContactButtons lang="en" placement="city-cta" primary={false} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
