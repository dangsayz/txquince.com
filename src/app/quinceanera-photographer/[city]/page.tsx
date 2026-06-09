import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { locations, getLocation, nearbyLocations } from "@/content/locations";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCTA } from "@/components/FinalCTA";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { HowBookingWorks } from "@/components/HowBookingWorks";
import { Testimonials } from "@/components/Testimonials";

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

  const title = `Quinceañera Photographer in ${loc.city}, TX`;
  const description = `Cinematic quinceañera photography & film in ${loc.city}, Texas. Fixed-price collections from $2,500 — la misa, portraits, and the reception, start to finish. Reserve your date.`;
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
  };
}

/** Shared FAQs appended to every city's local ones. */
function sharedFaqs(city: string) {
  return [
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
  const url = `${site.url}/quinceanera-photographer/${loc.slug}`;
  const prices = packages.map((p) => p.price);

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
        areaServed: { "@type": "City", name: `${loc.city}, TX` },
        address: {
          "@type": "PostalAddress",
          addressLocality: loc.city,
          addressRegion: "TX",
          addressCountry: "US",
        },
        priceRange: `$${Math.min(...prices)}–$${Math.max(...prices)}`,
        knowsLanguage: ["en", "es"],
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

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 pt-section text-center md:px-8 md:pt-section-lg">
        <Reveal>
          <p className="eyebrow mb-5">Quinceañera Photography · {loc.city}, TX</p>
          <h1 className="mx-auto max-w-3xl display-2 text-ink text-balance">
            Quinceañera Photographer in {loc.city}
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
      <section className="mx-auto max-w-3xl px-5 py-section md:px-8 md:py-section-lg">
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
        <div className="mx-auto max-w-5xl px-5 py-section md:px-8 md:py-section-lg">
          <Reveal>
            <h2 className="display-2 text-ink text-center text-balance">
              Fixed-price collections from {packages[0].priceLabel}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-ink-soft">
              Every {loc.city} quinceañera is covered church-to-reception. Most
              families choose Signature — two storytellers, the full day, film and
              gallery both.
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
                    <span className="bg-wine px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-cream">
                      {p.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-ink-soft">{p.tagline}</p>
                <p className="mt-5 font-display text-4xl text-ink">{p.priceLabel}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                  {p.teaser}
                </p>
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
        </div>
      </section>

      {/* How booking works */}
      <section className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg">
        <HowBookingWorks />
      </section>

      {/* Portfolio CTA */}
      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-8 md:py-section-lg">
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
      <section className="mx-auto max-w-3xl px-5 py-section md:px-8 md:py-section-lg">
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

      {/* Nearby cities — internal link graph */}
      <section className="bg-greige">
        <div className="mx-auto max-w-5xl px-5 py-section md:px-8 md:py-section-lg">
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
      <Testimonials className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg" />

      <FinalCTA />
    </>
  );
}
