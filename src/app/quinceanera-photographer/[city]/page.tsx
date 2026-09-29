import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { locations, getLocation, nearbyLocations, cityGeo } from "@/content/locations";
import { getCityContent } from "@/content/city-content";
import { getPost } from "@/content/blog";
import { getFeaturedImages, getImagesByCity } from "@/lib/content-db";
import { venuesByCity } from "@/content/venues";
import { Reveal } from "@/components/Reveal";

/** Curated guides surfaced on each city page (closes the city↔blog loop). */
const CITY_GUIDES = [
  "best-quinceanera-photo-locations-dfw",
  "quinceanera-reception-venues-dfw",
  "quinceanera-photographer-cost-dallas-fort-worth",
  "when-to-book-quinceanera-photographer-dfw",
];
import { CTAButton } from "@/components/CTAButton";
import { FinalCTA } from "@/components/FinalCTA";
import { HowBookingWorks } from "@/components/HowBookingWorks";
import { Testimonials } from "@/components/Testimonials";

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

  const title = `${loc.city} Quinceañera Photographer, TX`;
  const description = `Quinceañera photographer & videographer in ${loc.city}. Fixed-price collections from $1,800, complimentary Save-the-Date — la misa to the reception.`;
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
      a: `My collections are fixed-price — $1,800 to $5,500 in ${city} — with the number shown up front, no inquiry call to get a quote. Every collection includes a complimentary Save-the-Date session, and you can pay in full or split the balance into interest-free installments.`,
    },
    {
      q: "Do you offer video too, or only photography?",
      a: "Both — I'm a quinceañera photographer and videographer. The Signature and Legacy collections cover the day with photo and film together, one team, so the misa, el vals, and the reception are captured as stills and cinematic video without two vendors getting in each other's way.",
    },
    {
      q: "Do you charge a travel fee?",
      a: `No — ${city} is inside my Dallas–Fort Worth service area, so there's no travel fee. Coverage hours are the same whether your church and venue are close together or across town.`,
    },
    {
      q: "Do you offer payment plans?",
      a: "Yes. You reserve your date with a deposit and split the balance into interest-free installments before the day — pay in full or in payments, your choice at checkout.",
    },
  ];
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) notFound();

  const content = getCityContent(loc.slug);
  // Prefer the unique, researched per-city FAQs; fall back to the legacy set.
  const faqs = content?.faqs ?? [...loc.faqs, ...sharedFaqs(loc.city)];
  const nearby = nearbyLocations(loc.slug);
  const cityVenues = venuesByCity(loc.slug);
  const guides = CITY_GUIDES.map(getPost).filter((p) => p !== undefined);
  const url = `${site.url}/quinceanera-photographer/${loc.slug}`;
  const prices = packages.map((p) => p.price);
  // This city's OWN tagged work first; fall back to featured until it's tagged.
  const cityShots = await getImagesByCity(loc.slug, 6);
  const featured = cityShots.length ? cityShots : await getFeaturedImages(6);
  const isCityWork = cityShots.length > 0;
  // The opener gets its own cinematic frame; the rest fill the work grid below.
  const hero = featured[0] ?? null;
  const recentWork = featured.slice(1);

  // Per-city structured data: a ProfessionalService scoped to this city + the
  // FAQPage. Mirrors the global JsonLd but with areaServed = this city.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${url}#business`,
        name: `${site.brand} — Quinceañera Photography in ${loc.city}`,
        description: `Quinceañera photography & film serving ${loc.city}, ${loc.county}.`,
        url,
        image: `${site.url}/opengraph-image`,
        email: site.contact.email,
        ...(site.contact.phoneE164 ? { telephone: site.contact.phoneE164 } : {}),
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
        priceRange: `$${Math.min(...prices)}–$${Math.max(...prices)}`,
        knowsLanguage: ["en", "es"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Quinceañera Collections",
          itemListElement: packages.map((p) => ({
            "@type": "Offer",
            name: p.name,
            description: p.teaser,
            price: String(p.price),
            priceCurrency: "USD",
            url: `${site.url}/reserve?collection=${p.id}`,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb — visible trail, mirrors the BreadcrumbList schema */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex max-w-[90rem] items-center px-5 pt-6 text-sm text-ink-faint md:px-10 lg:px-16"
      >
        <Link href="/" className="inline-flex min-h-11 items-center transition-colors hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <Link
          href="/quinceanera-photographer"
          className="inline-flex min-h-11 items-center transition-colors hover:text-ink"
        >
          Quinceañera Photographer
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <span className="text-ink-soft">{loc.city}, TX</span>
      </nav>

      <section className="mx-auto max-w-[90rem] px-5 pb-14 pt-8 md:px-10 md:pb-20 md:pt-10 lg:px-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-ink-soft">
            Quinceañera Photography &amp; Film · {loc.city}, TX
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.14] text-ink text-balance">
            {loc.city} Quinceañera Photographer
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-ink-soft">
            {loc.lead}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={site.cta.href}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong"
            >
              {site.cta.label}
            </Link>
            <Link
              href={site.secondaryCta.href}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-line px-6 text-base font-medium text-ink transition-colors hover:border-ink"
            >
              {site.secondaryCta.label}
            </Link>
            <Link
              href={`/es/fotografo-de-quinceaneras/${loc.slug}`}
              hrefLang="es"
              className="inline-flex min-h-12 items-center px-3 text-base font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
            >
              Español →
            </Link>
          </div>
        </Reveal>
        <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-lg bg-greige sm:mt-12 sm:aspect-[16/8] lg:aspect-[16/7]">
          {hero?.url ? (
            <Image
              src={hero.url}
              alt={hero.alt || `Quinceañera photography in ${loc.city}, TX`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1440px"
              className="object-cover"
              style={{
                objectPosition: `${hero.focus_x != null ? Math.round(hero.focus_x * 100) : 50}% ${hero.focus_y != null ? Math.round(hero.focus_y * 100) : 32}%`,
              }}
            />
          ) : null}
        </div>
      </section>

      {/* Local intro */}
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <Reveal className="flex flex-col gap-6">
          {(content?.intro ?? loc.intro).map((para) => (
            <p key={para.slice(0, 24)} className="text-base leading-relaxed text-ink-soft">
              {para}
            </p>
          ))}
          <p className="text-base leading-7 text-ink-soft">
            Serving {loc.areas.slice(0, -1).join(", ")}
            {loc.areas.length > 1 ? `, and ${loc.areas[loc.areas.length - 1]}` : loc.areas[0]}
            {nearby.length
              ? ` — plus nearby DFW cities like ${nearby.slice(0, 3).map((n) => n.city).join(", ")}.`
              : "."}
          </p>
        </Reveal>
      </section>

      {/* Where to shoot — real local photo spots (unique per city; answers
          "best places to take quince pictures in {city}") */}
      {content?.photoSpots?.length ? (
        <section className="mx-auto max-w-5xl px-5 pb-section md:px-10 lg:px-16 md:pb-section-lg">
          <Reveal className="mb-8 max-w-xl md:mb-10">
            <p className="eyebrow">Where to shoot in {loc.city}</p>
            <h2
              className="mt-4 font-display text-ink"
              style={{ fontSize: "clamp(1.75rem,3vw,2.5rem)", lineHeight: 1.14, letterSpacing: "-0.02em" }}
            >
              The {loc.city} spots that photograph beautifully.
            </h2>
          </Reveal>
          <div className="border-t border-ink/10">
            {content.photoSpots.map((s) => (
              <Reveal
                key={s.name}
                className="grid gap-1.5 border-b border-ink/10 py-6 md:grid-cols-12 md:gap-x-8"
              >
                <h3 className="font-display text-xl text-ink md:col-span-4">{s.name}</h3>
                <p className="text-base leading-7 text-ink-soft md:col-span-8">{s.why}</p>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Compact collections — full detail lives on /investment */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <Reveal>
            <h2 className="display-2 text-ink text-balance">
              Fixed-price collections from {packages[0].priceLabel}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft">
              Fixed pricing, held for your {site.scarcity.bookedThrough.split(" ")[1]} or{" "}
              {site.scarcity.reservingYear} {loc.city} date — every quinceañera covered
              church-to-reception. Most families choose Signature: two storytellers,
              the full day, film and gallery both.
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
                    <h3 className="font-display text-2xl text-ink">{p.name}</h3>
                    {p.badge ? (
                      <span className="text-sm font-medium text-ink-soft">
                        {p.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 max-w-xs text-base leading-7 text-ink-soft">{p.tagline}</p>
                  <p className="mt-4 font-display text-2xl text-ink">{p.priceLabel}</p>
                </div>
                <div className="md:col-span-7 md:col-start-6">
                  <ul className="grid gap-x-8 gap-y-2 text-base leading-7 text-ink-soft sm:grid-cols-2">
                    {p.includes.slice(0, 4).map((item) => (
                      <li key={item} className="border-b border-line/70 pb-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <CTAButton
                    href={`/reserve?collection=${p.id}`}
                    variant="text"
                    className="mt-5 text-base"
                  >
                    Reserve {p.name}
                  </CTAButton>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 text-base">
            <Link
              href="/investment"
              className="inline-flex min-h-11 items-center text-ink underline underline-offset-2 hover:text-ink-soft"
            >
              See everything included in each collection →
            </Link>
          </p>
          <p className="mt-3 text-base">
            <Link
              href="/quinceanera-save-the-date"
              className="inline-flex min-h-11 items-center text-ink underline underline-offset-2 hover:text-ink-soft"
            >
              Your Save-the-Date session is included free →
            </Link>
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <Reveal>
            <p className="mb-4 text-sm font-medium text-ink-soft">
              A {loc.city} quinceañera, hour by hour
            </p>
            <h2 className="display-2 text-ink text-balance">
              The whole day, church to reception.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft">
              Every collection is built around the full celebration — not a two-hour
              window. Whether you call it a quinceañera or just her quince, here&apos;s
              how the day unfolds for most {loc.city} families, and how I cover each part of it.
            </p>
          </Reveal>
          <ol className="mt-10 divide-y divide-line border-y border-line">
            {DAY_TIMELINE.map((t) => (
              <li key={t.title} className="grid grid-cols-12 gap-4 py-6">
                <p className="col-span-3 text-sm font-medium text-ink-soft sm:col-span-2">
                  {t.when}
                </p>
                <div className="col-span-9 sm:col-span-10">
                  <h3 className="font-display text-xl text-ink">{t.title}</h3>
                  <p className="mt-2 text-base leading-7 text-ink-soft">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How booking works */}
      <section className="mx-auto max-w-7xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <HowBookingWorks />
      </section>

      {/* Recent work — real featured photos (renders nothing if none exist) */}
      {recentWork.length ? (
        <section className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <Reveal>
            <p className="eyebrow mb-5">
              {isCityWork ? `Recent ${loc.city} work` : "Selected work"}
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
                  <div
                    className={`relative overflow-hidden rounded-lg ${i === 0 ? "aspect-[16/10]" : "aspect-[4/5]"}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `Quinceañera photography in ${loc.city}, TX`}
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
          <p className="mt-4 text-sm text-ink-soft">
            {isCityWork ? `${loc.city}, TX` : "Dallas–Fort Worth, TX"}
          </p>
        </section>
      ) : null}

      {/* Portfolio CTA */}
      <section className="border-y border-line bg-ivory">
        <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16 md:py-section-lg">
          <h2 className="display-2 text-ink text-balance">
            See full {loc.city} quinceañeras, start to finish.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-ink-soft">
            Not a highlight reel — complete galleries and films from real DFW
            celebrations, so you know exactly what you&apos;re reserving.
          </p>
          <div className="mt-9 flex justify-center">
            <CTAButton href="/portfolio" className="min-h-12 rounded-md px-6 text-base font-medium">
              View the galleries
            </CTAButton>
          </div>
        </div>
      </section>

      {/* City FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <h2 className="display-2 text-ink">
          Quinceañera photography in {loc.city} — questions, answered.
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

      {/* Planning guides (closes the city ↔ blog loop) */}
      {guides.length ? (
        <section className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <p className="eyebrow mb-5">Planning your {loc.city} quinceañera</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/blog/${g.slug}`}
                className="group rounded-lg border border-line bg-white p-5 transition-colors hover:border-ink"
              >
                <h3 className="font-display text-lg leading-tight text-ink group-hover:text-accent">
                  {g.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-ink-soft">{g.excerpt}</p>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-base">
            <Link href="/blog" className="inline-flex min-h-11 items-center text-ink underline underline-offset-2 hover:text-ink-soft">
              See the full quinceañera guide →
            </Link>
          </p>
        </section>
      ) : null}

      {/* Venues we shoot in this city — internal links into the venue cluster */}
      {cityVenues.length ? (
        <section className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <p className="eyebrow mb-5">Quinceañera venues we shoot in {loc.city}</p>
          <div className="flex flex-wrap gap-3">
            {cityVenues.map((v) => (
              <Link
                key={v.slug}
                href={`/venues/${v.slug}`}
                className="inline-flex min-h-11 items-center rounded-md border border-line bg-white px-4 py-2 text-base text-ink transition-colors hover:border-ink"
              >
                {v.venue}
              </Link>
            ))}
            <Link
              href="/venues"
              className="inline-flex min-h-11 items-center rounded-md border border-line px-4 py-2 text-base text-ink transition-colors hover:border-ink hover:bg-white"
            >
              All venues →
            </Link>
          </div>
        </section>
      ) : null}

      {/* Nearby cities — internal link graph */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <p className="eyebrow mb-5">Also serving across DFW</p>
          <div className="flex flex-wrap gap-3">
            {nearby.map((n) => (
              <Link
                key={n.slug}
                href={`/quinceanera-photographer/${n.slug}`}
                className="inline-flex min-h-11 items-center rounded-md border border-line bg-white px-4 py-2 text-base text-ink transition-colors hover:border-ink"
              >
                Quinceañera photographer in {n.city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — renders only when release-cleared ones exist. */}
      <Testimonials className="mx-auto max-w-7xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg" />

      <FinalCTA />
    </>
  );
}
