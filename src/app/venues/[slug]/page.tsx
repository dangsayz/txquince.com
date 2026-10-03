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
import { packages } from "@/content/packages";
import { venues, getVenue } from "@/content/venues";
import { getLocation } from "@/content/locations";
import { getImagesByVenue, getVenueCopy } from "@/lib/content-db";
import { igUrl, websiteUrl, websiteLabel } from "@/lib/vendor-links";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { Reveal } from "@/components/Reveal";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";

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
    `Quinceañera photography at ${venue.venue} in ${venue.city}, Texas. Explore ${site.brand} collections from ${packages[0].priceLabel} and ask about your date.`;
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {heroPhoto && (
        <div className="relative mx-4 mt-5 aspect-[4/5] min-h-80 max-h-[48rem] overflow-hidden bg-cream sm:mx-6 sm:aspect-[16/8] md:mx-10 lg:mx-auto lg:max-w-[92rem]">
          <Image src={heroPhoto.url} alt={publicPhotoCopy(heroPhoto, altPhraseFor(heroPhoto.section)).alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: `${Math.round((heroPhoto.focus_x ?? 0.5) * 100)}% ${Math.round((heroPhoto.focus_y ?? 0.5) * 100)}%` }} />
        </div>
      )}
      <section className="bg-white px-5 py-16 md:px-10 md:py-24 lg:px-16">
        <Reveal className="mx-auto grid max-w-[82rem] gap-8 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] lg:gap-16">
          <div>
            <Link href="/venues" className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-ink">← Venues</Link>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink-soft">{venue.city}, TX</p>
          </div>
          <div>
            <h1 className="max-w-[25ch] font-body text-[clamp(2rem,3.5vw,3.25rem)] font-light leading-[1.13] tracking-[-0.035em] text-ink text-balance">Quinceañera photography at {venue.venue}.</h1>
            <p className="mt-6 max-w-2xl font-serif text-lg leading-8 text-ink-soft">{about}</p>
            {copy?.address || copy?.area || ig || web || cityLoc ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-line pt-4 text-base text-ink-soft">
              {copy?.address ? <span>{copy.address}</span> : copy?.area ? <span>{copy.area}, {venue.city}</span> : null}
              {ig ? (
                <a href={ig} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-ink underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink">
                  @{copy?.ig_handle}
                </a>
              ) : null}
              {web ? (
                <a href={web} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-ink underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink">
                  {websiteLabel(copy?.website)}
                </a>
              ) : null}
              {cityLoc ? (
                <Link href={`/quinceanera-photographer/${cityLoc.slug}`} className="inline-flex min-h-11 items-center text-ink underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink">
                  Quinceañera photographer in {cityLoc.city} →
                </Link>
              ) : null}
            </div>
            ) : null}
            <Link href="/check-your-date" className="mt-8 inline-flex min-h-12 items-center justify-between gap-6 whitespace-nowrap bg-ink px-5 text-base font-medium text-white hover:bg-[#42423d]">Ask about a date at {venue.venue} <span aria-hidden="true">↗</span></Link>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-[90rem] px-5 py-14 md:px-10 lg:px-16 md:py-20">
          <Reveal className="mb-10 grid gap-5 border-t border-line pt-6 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)]">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">The work / {venue.city}</p>
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-tight text-ink">{items.length ? `Quinceañeras at ${venue.venue}` : `Explore the work before your day at ${venue.venue}`}</h2>
          </Reveal>
          {items.length ? (
            <PortfolioGallery images={items} editorial imageSizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />
          ) : (
            <p className="border-t border-line py-8 text-base leading-7 text-ink-soft">
              No photographs from this venue are published yet. <Link href="/portfolio" className="font-medium text-ink underline underline-offset-4">Explore the portfolio</Link> to see our work elsewhere.
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      {copy?.faq?.length ? (
        <section className="border-t border-line">
          <div className="mx-auto max-w-3xl px-5 py-14 md:px-10 md:py-20">
            <Reveal>
              <p className="text-sm font-medium text-ink-soft">Good to know</p>
              <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-tight text-ink">
                Quinceañeras at {venue.venue}
              </h2>
            </Reveal>
            <dl className="mt-8 divide-y divide-line border-t border-line">
              {copy.faq.map((f, i) => (
                <div key={i} className="py-5">
                  <dt className="font-display text-lg text-ink">{f.q}</dt>
                  <dd className="mt-2 text-base leading-7 text-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

    </>
  );
}
