import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { locations, getLocation, nearbyLocations, cityGeo } from "@/content/locations";
import { getPost } from "@/content/blog";
import { getFeaturedImages } from "@/lib/content-db";
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
import { SocialProofStrip } from "@/components/SocialProofStrip";
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
  const description = `Quinceañera photographer & videographer in ${loc.city}. Fixed-price collections from $2,500, complimentary Save-the-Date — la misa to the reception.`;
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
      a: `My collections are fixed-price — $2,500 to $5,500 in ${city} — with the number shown up front, no inquiry call to get a quote. Every collection includes a complimentary Save-the-Date session, and you can pay in full or split the balance into interest-free installments.`,
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

  const faqs = [...loc.faqs, ...sharedFaqs(loc.city)];
  const nearby = nearbyLocations(loc.slug);
  const guides = CITY_GUIDES.map(getPost).filter((p) => p !== undefined);
  const url = `${site.url}/quinceanera-photographer/${loc.slug}`;
  const prices = packages.map((p) => p.price);
  const featured = await getFeaturedImages(3);

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
        className="mx-auto max-w-4xl px-5 pt-10 text-xs text-ink-faint md:px-10 lg:px-16"
      >
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <Link
          href="/quinceanera-photographer"
          className="transition-colors hover:text-ink"
        >
          Quinceañera Photographer
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <span className="text-ink-soft">{loc.city}, TX</span>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 pt-8 text-center md:px-10 lg:px-16 md:pt-12">
        <Reveal>
          <p className="eyebrow mb-5">Quinceañera Photography &amp; Film · {loc.city}, TX</p>
          <h1 className="mx-auto max-w-3xl display-2 text-ink text-balance">
            {loc.city} Quinceañera Photographer
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            {loc.lead}
          </p>
          <p className="mt-4 text-sm">
            <Link
              href={`/es/fotografo-de-quinceaneras/${loc.slug}`}
              className="text-wine underline underline-offset-2 hover:text-wine-deep"
              hrefLang="es"
            >
              Ver esta página en español →
            </Link>
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <CTAButton href={site.cta.href} variant="primary">
              {site.cta.label}
            </CTAButton>
            <CTAButton href={site.secondaryCta.href} variant="text">
              {site.secondaryCta.label}
            </CTAButton>
          </div>
          <SocialProofStrip className="mt-10" />
        </Reveal>
      </section>

      {/* Local intro */}
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <Reveal className="flex flex-col gap-6">
          {loc.intro.map((para) => (
            <p key={para.slice(0, 24)} className="text-base leading-relaxed text-ink-soft">
              {para}
            </p>
          ))}
          <p className="text-sm text-ink-faint">
            Serving {loc.areas.slice(0, -1).join(", ")}
            {loc.areas.length > 1 ? `, and ${loc.areas[loc.areas.length - 1]}` : loc.areas[0]}
            .
          </p>
        </Reveal>
      </section>

      {/* Compact collections — full detail lives on /investment */}
      <section className="bg-greige">
        <div className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <Reveal>
            <h2 className="display-2 text-ink text-center text-balance">
              Fixed-price collections from {packages[0].priceLabel}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-ink-soft">
              Fixed pricing, held for your {site.scarcity.bookedThrough.split(" ")[1]} or{" "}
              {site.scarcity.reservingYear} {loc.city} date — every quinceañera covered
              church-to-reception. Most families choose Signature: two storytellers,
              the full day, film and gallery both.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {packages.map((p, i) => (
              <Reveal
                key={p.id}
                delay={i * 80}
                className={`flex h-full flex-col border p-7 ${
                  p.highlight
                    ? "border-wine bg-ivory"
                    : "border-line bg-ivory"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl text-ink">{p.name}</h3>
                  {p.badge ? (
                    <span className="text-[0.6rem] uppercase tracking-[0.18em] text-wine-deep">
                      {p.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-ink-soft">{p.tagline}</p>
                <p className="mt-5 font-display text-4xl text-ink">{p.priceLabel}</p>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  {p.teaser}
                </p>
                <ul className="mt-5 flex-1 space-y-2 border-t border-line pt-5 text-sm leading-relaxed text-ink-soft">
                  {p.includes.slice(0, 4).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <CTAButton
                  href={`/reserve?collection=${p.id}`}
                  variant="ink"
                  className="mt-6 w-full"
                >
                  Reserve {p.name}
                </CTAButton>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 text-center text-sm">
            <Link
              href="/investment"
              className="text-wine underline underline-offset-2 hover:text-wine-deep"
            >
              See everything included in each collection →
            </Link>
          </p>
          <p className="mt-3 text-center text-sm">
            <Link
              href="/quinceanera-save-the-date"
              className="text-wine underline underline-offset-2 hover:text-wine-deep"
            >
              Your Save-the-Date session is included free →
            </Link>
          </p>
        </div>
      </section>

      {/* Sample quinceañera day — topical depth + local relevance */}
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <Reveal>
          <p className="eyebrow mb-5">A {loc.city} quinceañera, hour by hour</p>
          <h2 className="display-2 text-ink text-balance">
            The whole day, church to reception.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            Every collection is built around the full celebration — not a two-hour
            window. Here&apos;s how the day unfolds for most {loc.city} families, and
            how I cover each part of it.
          </p>
        </Reveal>
        <ol className="mt-10 divide-y divide-line border-y border-line">
          {DAY_TIMELINE.map((t) => (
            <li key={t.title} className="grid grid-cols-12 gap-4 py-6">
              <p className="col-span-3 font-display text-xs uppercase tracking-[0.16em] text-ink-faint sm:col-span-2">
                {t.when}
              </p>
              <div className="col-span-9 sm:col-span-10">
                <h3 className="font-display text-xl text-ink">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* How booking works */}
      <section className="mx-auto max-w-7xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <HowBookingWorks />
      </section>

      {/* Recent work — real featured photos (renders nothing if none exist) */}
      {featured.length ? (
        <section className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <Reveal>
            <p className="eyebrow mb-5">Recent {loc.city} work</p>
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
          <p className="mt-4 text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
            {loc.city}, TX
          </p>
        </section>
      ) : null}

      {/* Portfolio CTA */}
      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16 md:py-section-lg">
          <h2 className="display-2 text-cream text-balance">
            See full {loc.city} quinceañeras, start to finish.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-cream/75">
            Not a highlight reel — complete galleries and films from real DFW
            celebrations, so you know exactly what you&apos;re reserving.
          </p>
          <div className="mt-9 flex justify-center">
            <CTAButton href="/portfolio" variant="onDark">
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
              <dd className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
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
                className="group rounded-2xl border border-line bg-white p-5 transition-colors hover:border-wine"
              >
                <h3 className="font-display text-lg leading-tight text-ink group-hover:text-wine">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{g.excerpt}</p>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm">
            <Link href="/blog" className="text-wine underline underline-offset-2 hover:text-wine-deep">
              See the full quinceañera guide →
            </Link>
          </p>
        </section>
      ) : null}

      {/* Nearby cities — internal link graph */}
      <section className="bg-greige">
        <div className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <p className="eyebrow mb-5">Also serving across DFW</p>
          <div className="flex flex-wrap gap-3">
            {nearby.map((n) => (
              <Link
                key={n.slug}
                href={`/quinceanera-photographer/${n.slug}`}
                className="border border-line bg-ivory px-4 py-2 text-sm text-ink transition-colors hover:border-wine hover:text-wine"
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
