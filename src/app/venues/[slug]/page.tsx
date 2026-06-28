/**
 * /venues/[slug] — the keyword-targeted landing page for ONE venue. Built to
 * rank when families search "{Venue} quinceañera photographer" / "quinceañera
 * at {Venue}". Venue facts come from the registry (src/content/venues.ts);
 * unique copy (about + FAQ) from the venues DB table; photos auto-matched by the
 * location the ingest pipeline stamps. Place + ImageGallery + FAQPage schema.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { venues, getVenue } from "@/content/venues";
import { getLocation } from "@/content/locations";
import { getImagesByVenue, getVenueCopy } from "@/lib/content-db";
import { igUrl, websiteUrl, websiteLabel } from "@/lib/vendor-links";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCTA } from "@/components/FinalCTA";

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
    `Quinceañera photography at ${venue.venue} in ${venue.city}, Texas. See real quinceañeras photographed at ${venue.venue} by ${site.brand} — collections from ${packages[0].priceLabel}; reserve your date.`;
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
  const cityLoc = venue.citySlug ? getLocation(venue.citySlug) : undefined;
  const ig = igUrl(copy?.ig_handle);
  const web = websiteUrl(copy?.website);
  const url = `${site.url}/venues/${slug}`;

  const items: GalleryItem[] = photos.map((i) => ({
    url: i.url,
    alt: i.alt,
    ratio: i.is_feature ? "landscape" : "portrait",
    feature: i.is_feature,
    width: i.width,
    height: i.height,
    slug: i.slug,
    section: i.section,
    id: i.id,
    fx: i.focus_x,
    fy: i.focus_y,
  }));

  const about =
    copy?.about ||
    `${venue.venue} is one of the quinceañera venues we love photographing in ${venue.city}. Below is real work from ${venue.venue} — and if your daughter's day is here, we'd love to capture it.`;
  const prices = packages.map((p) => p.price);

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
        priceRange: `$${Math.min(...prices)}–$${Math.max(...prices)}`,
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
                return {
                  "@type": ["ImageObject", "Photograph"],
                  contentUrl,
                  name: i.title || i.alt,
                  description: i.caption || i.alt,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-[90rem] px-5 pb-10 pt-20 md:px-10 lg:px-16 md:pb-14 md:pt-28">
        <Reveal>
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-ink-faint">
            <Link href="/venues" className="transition-colors hover:text-ink">
              Venues
            </Link>
            <span aria-hidden> — </span>
            {venue.city}, TX
          </p>
          <h1
            className="mt-5 max-w-4xl font-display text-ink"
            style={{ fontSize: "clamp(2.3rem,5.5vw,4.6rem)", lineHeight: 1, letterSpacing: "-0.025em" }}
          >
            Quinceañera Photographer at {venue.venue}
          </h1>
          <p className="accent mt-4 text-xl text-wine-deep">{venue.city}, Texas</p>
          <p className="mt-6 max-w-2xl text-[0.98rem] leading-relaxed text-ink-soft">{about}</p>

          {/* Facts + outbound links */}
          {copy?.address || copy?.area || ig || web || cityLoc ? (
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
              {copy?.address ? <span>{copy.address}</span> : copy?.area ? <span>{copy.area}, {venue.city}</span> : null}
              {ig ? (
                <a href={ig} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-ink underline decoration-ink/30 underline-offset-[6px] hover:text-wine hover:decoration-wine">
                  @{copy?.ig_handle}
                </a>
              ) : null}
              {web ? (
                <a href={web} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-ink underline decoration-ink/30 underline-offset-[6px] hover:text-wine hover:decoration-wine">
                  {websiteLabel(copy?.website)}
                </a>
              ) : null}
              {cityLoc ? (
                <Link href={`/quinceanera-photographer/${cityLoc.slug}`} className="inline-flex min-h-[44px] items-center text-ink underline decoration-ink/30 underline-offset-[6px] hover:text-wine hover:decoration-wine">
                  Quinceañera photographer in {cityLoc.city} →
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8">
            <CTAButton href={site.cta.href}>Reserve your date at {venue.venue}</CTAButton>
          </div>
        </Reveal>
      </section>

      {/* Photos shot here */}
      <section className="mt-4 border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-[90rem] px-5 py-14 md:px-10 lg:px-16 md:py-20">
          <Reveal className="mb-10">
            <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">The work</p>
            <h2
              className="mt-3 font-display text-ink"
              style={{ fontSize: "clamp(1.8rem,3.6vw,2.8rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              {items.length ? `Quinceañeras at ${venue.venue}` : `We'd love to shoot at ${venue.venue}`}
            </h2>
          </Reveal>
          {items.length ? (
            <PortfolioGallery images={items} />
          ) : (
            <p className="accent text-xl text-ink-faint">
              New work from {venue.venue} coming soon — <Link href={site.cta.href} className="underline decoration-wine/40 underline-offset-4 hover:text-wine">reserve your date</Link>.
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      {copy?.faq?.length ? (
        <section className="border-t border-ink/10">
          <div className="mx-auto max-w-3xl px-5 py-14 md:px-10 md:py-20">
            <Reveal>
              <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">Good to know</p>
              <h2
                className="mt-3 font-display text-ink"
                style={{ fontSize: "clamp(1.7rem,3.2vw,2.6rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
              >
                Quinceañeras at {venue.venue}
              </h2>
            </Reveal>
            <dl className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
              {copy.faq.map((f, i) => (
                <div key={i} className="py-5">
                  <dt className="font-display text-lg text-ink">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      <FinalCTA />
    </>
  );
}
