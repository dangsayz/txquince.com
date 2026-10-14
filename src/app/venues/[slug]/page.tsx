/**
 * /venues/[slug] — the keyword-targeted landing page for ONE venue. Built to
 * rank when families search "{Venue} quinceañera photographer" / "quinceañera
 * at {Venue}". Venue facts come from the registry (src/content/venues.ts);
 * unique copy (about + FAQ) from the venues DB table; photos auto-matched by the
 * location the ingest pipeline stamps. Place + ImageGallery + FAQPage schema.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { commissionsFromLabel } from "@/content/commissions";
import { PRICE_CEILING_USD, PRICE_FLOOR_USD, usd } from "@/lib/commission";
import { venues, getVenue } from "@/content/venues";
import { getLocation } from "@/content/locations";
import { getImagesByVenue, getVenueCopy } from "@/lib/content-db";
import { igUrl, websiteUrl, websiteLabel } from "@/lib/vendor-links";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import "@/components/txq/pages/places.css";

export const revalidate = 3600;

export function generateStaticParams() {
  return venues.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const venue = getVenue(slug);
  if (!venue) return {};
  const copy = await getVenueCopy(slug);
  const title = `${venue.venue} Quinceañera Photographer — ${venue.city}, TX`;
  const description =
    copy?.about?.slice(0, 200) ||
    `Quinceañera photography at ${venue.venue} in ${venue.city}, Texas. Explore ${site.brand} commissions from ${commissionsFromLabel} and check your date.`;
  return {
    title,
    description,
    keywords: `${venue.venue} quinceañera photographer, quinceañera at ${venue.venue}, ${venue.venue} ${venue.city}, quinceañera photography ${venue.city} TX`,
    alternates: { canonical: `/venues/${slug}` },
    openGraph: {
      title: `${venue.venue} · Quinceañera Photography`,
      description,
      url: `${site.url}/venues/${slug}`,
    },
  };
}

export default async function VenuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = getVenue(slug);
  if (!venue) notFound();

  const [copy, photos] = await Promise.all([getVenueCopy(slug), getImagesByVenue(slug)]);
  const heroPhoto = photos[0] ?? null;
  const cityLoc = venue.citySlug ? getLocation(venue.citySlug) : undefined;
  const ig = igUrl(copy?.ig_handle);
  const web = websiteUrl(copy?.website);
  const url = `${site.url}/venues/${slug}`;

  const items: GalleryItem[] = photos.map((i) => {
    const photoCopy = publicPhotoCopy(i, altPhraseFor(i.section));
    return {
      url: i.url,
      alt: photoCopy.alt,
      title: photoCopy.title,
      caption: photoCopy.description,
      city: i.city,
      ratio: i.is_feature ? "landscape" : "portrait",
      feature: i.is_feature,
      width: i.width,
      height: i.height,
      slug: i.slug,
      section: i.section,
      id: i.id,
      fx: i.focus_x,
      fy: i.focus_y,
    };
  });

  const about =
    copy?.about ||
    `Planning a quinceañera at ${venue.venue} in ${venue.city}? Explore our photography and film, then tell us about your date and the moments your family wants documented.`;

  const sameAs = [ig, web].filter(Boolean) as string[];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${url}#service`,
        name: `${site.brand} — Quinceañera Photography at ${venue.venue}`,
        description: `Quinceañera photography & film at ${venue.venueFull}, ${venue.city}, TX.`,
        url,
        image: `${site.url}/opengraph-image`,
        email: site.contact.email,
        areaServed: { "@type": "City", name: `${venue.city}, TX` },
        priceRange: `${usd(PRICE_FLOOR_USD)}–${usd(PRICE_CEILING_USD)}`,
        knowsLanguage: ["en", "es"],
      },
      {
        "@type": "Place",
        "@id": `${url}#venue`,
        name: venue.venue,
        ...(sameAs.length ? { sameAs } : {}),
        address: {
          "@type": "PostalAddress",
          ...(copy?.address ? { streetAddress: copy.address } : {}),
          addressLocality: venue.city,
          addressRegion: "TX",
          addressCountry: "US",
        },
      },
      ...(items.length
        ? [
            {
              "@type": "ImageGallery",
              "@id": `${url}#gallery`,
              name: `Quinceañera photos at ${venue.venue}`,
              url,
              associatedMedia: photos.slice(0, 40).map((i) => {
                const path = i.url.split("?")[0];
                const contentUrl = path.startsWith("http") ? path : `${site.url}${path}`;
                const photoCopy = publicPhotoCopy(i, altPhraseFor(i.section));
                return {
                  "@type": ["ImageObject", "Photograph"],
                  contentUrl,
                  name: photoCopy.title,
                  description: photoCopy.description,
                  ...(i.width && i.height ? { width: i.width, height: i.height } : {}),
                  creator: { "@type": "Organization", name: site.brand, url: site.url },
                  contentLocation: { "@type": "Place", name: `${venue.venue}, ${venue.city}, TX` },
                };
              }),
            },
          ]
        : []),
      ...(copy?.faq?.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: copy.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Venues", item: `${site.url}/venues` },
          { "@type": "ListItem", position: 3, name: venue.venue, item: url },
        ],
      },
    ],
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const faq = copy?.faq ?? [];
  const place = copy?.address ?? (copy?.area ? `${copy.area}, ${venue.city}` : null);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="tq-wrap">
        <nav className="tq-place-crumbs tq-mono" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/venues">Venues</Link></li>
            <li><span aria-current="page">{venue.venue}</span></li>
          </ol>
        </nav>
      </div>

      {heroPhoto ? (
        <div className="tq-place-stage">
          <figure className="tq-plate" style={{ margin: 0 }}>
            <div className="tq-plate__loop">
              <Image
                src={heroPhoto.url}
                alt={publicPhotoCopy(heroPhoto, altPhraseFor(heroPhoto.section)).alt}
                fill
                preload
                sizes="100vw"
                style={{ objectPosition: `${Math.round((heroPhoto.focus_x ?? 0.5) * 100)}% ${Math.round((heroPhoto.focus_y ?? 0.5) * 100)}%` }}
              />
            </div>
            <figcaption>
              <span className="tq-tag tq-tag--tl tq-mono">[{venue.venue}]</span>
              <span className="tq-tag tq-tag--bl tq-mono">{venue.city}, TX</span>
            </figcaption>
          </figure>
        </div>
      ) : null}

      <div className="tq-wrap">
        <div className="tq-ledger tq-place-ledger">
          <div className="tq-ledger__head">
            <p className="tq-mono tq-place-eyebrow">Venue / {venue.city}, TX</p>
            <h1 className="tq-display">
              Quinceañera photography at <em>{venue.venue}.</em>
            </h1>
            <p className="tq-ledger__dek">{about}</p>
          </div>
          <div className="tq-ledger__meta">
            <dl className="tq-meta tq-mono tq-place-meta">
              <div>
                <dt>City</dt>
                <dd>
                  {cityLoc ? (
                    <Link href={`/quinceanera-photographer/${cityLoc.slug}`}>{venue.city}, TX</Link>
                  ) : (
                    `${venue.city}, TX`
                  )}
                </dd>
              </div>
              {place ? (
                <div>
                  <dt>Address</dt>
                  <dd>{place}</dd>
                </div>
              ) : null}
              {ig ? (
                <div>
                  <dt>Instagram</dt>
                  <dd>
                    <a href={ig} target="_blank" rel="noopener noreferrer">@{copy?.ig_handle}</a>
                  </dd>
                </div>
              ) : null}
              {web ? (
                <div>
                  <dt>Website</dt>
                  <dd>
                    <a href={web} target="_blank" rel="noopener noreferrer">{websiteLabel(copy?.website)}</a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Frames</dt>
                <dd className="tq-nums">{items.length}</dd>
              </div>
            </dl>
          </div>
          <div className="tq-action">
            <span className="tq-mono tq-muted">[ Ask about a date at {venue.venue} ]</span>
            <div style={{ display: "grid", gap: 12 }}>
              <Link href={site.cta.href} className="tq-action__link">
                <span>Ask about a date</span>
                <span className="tq-arrow" aria-hidden>→</span>
              </Link>
              <span className="tq-mono tq-muted">Commissions from {commissionsFromLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="tq-section" aria-labelledby="venue-work-title">
        <div className="tq-wrap">
          <header className="tq-head tq-place-head--long">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[01 / The work · {venue.city}]</p>
            <h2 id="venue-work-title" className="tq-display tq-head__title">
              {items.length ? `Quinceañeras at ${venue.venue}.` : `Explore the work before your day at ${venue.venue}.`}
            </h2>
          </header>
          {items.length ? (
            <div className="tq-place-gallery">
              <PortfolioGallery images={items} editorial imageSizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />
            </div>
          ) : (
            <p className="tq-place-empty">
              No photographs from this venue are published yet.{" "}
              <Link href="/portfolio">Explore the portfolio</Link> to see our work elsewhere.
            </p>
          )}
        </div>
      </section>

      {/* FAQ — the homepage Q&A pattern; mirrors the FAQPage schema. */}
      {faq.length ? (
        <section className="tq-section" aria-labelledby="venue-faq-title">
          <div className="tq-wrap">
            <header className="tq-head tq-place-head--long">
              <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[02 / Good to know]</p>
              <h2 id="venue-faq-title" className="tq-display tq-head__title">
                Quinceañeras at {venue.venue}.
              </h2>
            </header>
            <div className="tq-faq">
              {faq.map((f, i) => (
                <details key={i} className="tq-faq__item" open={i === 0}>
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
      ) : null}

      <section className="tq-section" aria-labelledby="venue-next-title">
        <div className="tq-wrap">
          <div className="tq-place-cta">
            <div>
              <p className="tq-mono tq-muted" style={{ margin: "0 0 20px" }}>[{faq.length ? "03" : "02"} / Next]</p>
              <h2 id="venue-next-title" className="tq-display">
                Celebrating at {venue.venue}?
              </h2>
            </div>
            <div className="tq-place-cta__side">
              <p>Tell us your date and the moments your family wants documented. We confirm availability personally.</p>
              <div className="tq-place-actions">
                <Link href={site.cta.href} className="tq-btn tq-btn--lg">
                  Ask about a date <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
                {cityLoc ? (
                  <Link href={`/quinceanera-photographer/${cityLoc.slug}`} className="tq-btn tq-btn--ghost">
                    Photographer in {cityLoc.city}
                  </Link>
                ) : null}
                <Link href="/venues" className="tq-btn tq-btn--ghost">All venues</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
