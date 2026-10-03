/**
 * /photos/[category]/[slug] — the shareable, indexable page for one photograph.
 * Sharing an image shares THIS page (rich branded preview), never a file.
 * Editorial-system layout; ImageObject JSON-LD; quiet CTA to book.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import {
  getImageBySlug,
  getImagesBySection,
  imagePagePath,
} from "@/lib/content-db";
import { ProtectedImg } from "@/components/ProtectedImg";
import { EditOverlay } from "@/components/EditMode";
import { altPhraseFor, categoryLabel, vendorCreditLabel } from "@/content/portfolio-taxonomy";
import { igUrl, websiteUrl } from "@/lib/vendor-links";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { venueForLocation } from "@/content/venues";
import { PhotoActions } from "@/components/gallery/PhotoActions";

/** Branded serve URL at an explicit derivative width. */
function at(url: string, w: number): string {
  return `${url}${url.includes("?") ? "&" : "?"}w=${w}`;
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const img = await getImageBySlug(slug);
  if (!img || img.section !== category) return {};

  const copy = publicPhotoCopy(img, altPhraseFor(img.section));
  const description = `${copy.description} — quinceañera photography by ${site.brand}, Dallas–Fort Worth. Collections from $1,800; reserve your date.`;
  const pagePath = imagePagePath(img.section, slug);
  const imgUrl = `${site.url}/api/img/${slug}`;

  return {
    title: `${copy.title} · ${categoryLabel(img.section)}`,
    description,
    ...(img.tags ? { keywords: img.tags } : {}),
    alternates: { canonical: pagePath },
    openGraph: {
      title: `${copy.title} · ${site.brand}`,
      description,
      url: `${site.url}${pagePath}`,
      type: "article",
      images: [
        {
          url: imgUrl,
          width: img.width ?? 1600,
          height: img.height ?? 2400,
          alt: copy.alt,
        },
      ],
    },
    twitter: { card: "summary_large_image", images: [imgUrl] },
  };
}

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const img = await getImageBySlug(slug);
  if (!img || !img.slug || img.section !== category) notFound();

  const label = categoryLabel(img.section);
  const copy = publicPhotoCopy(img, altPhraseFor(img.section));
  const pageUrl = `${site.url}${imagePagePath(img.section, slug)}`;
  const related = (await getImagesBySection(img.section))
    .filter((r) => r.slug && r.slug !== slug)
    .slice(0, 3);
  const venue = venueForLocation(img.location);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["ImageObject", "Photograph"],
        "@id": `${pageUrl}#image`,
        contentUrl: `${site.url}/api/img/${slug}`,
        url: pageUrl,
        name: copy.title,
        description: copy.description,
        ...(img.tags ? { keywords: img.tags } : {}),
        ...(img.width && img.height ? { width: img.width, height: img.height } : {}),
        creator: { "@type": "Organization", name: site.brand, url: site.url },
        copyrightHolder: { "@type": "Organization", name: site.brand },
        copyrightNotice: `© ${site.brand}`,
        creditText: site.brand,
        license: `${site.url}/privacy`,
        acquireLicensePage: `${site.url}/investment`,
        ...(img.city ? { contentLocation: { "@type": "City", name: `${img.city}, TX` } } : { contentLocation: { "@type": "Place", name: "Dallas–Fort Worth, TX" } }),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Portfolio", item: `${site.url}/portfolio` },
          { "@type": "ListItem", position: 3, name: label, item: `${site.url}/portfolio#${img.section}` },
          { "@type": "ListItem", position: 4, name: copy.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }}
      />
      <article className="bg-cream">
        <div className="mx-auto flex max-w-[100rem] flex-wrap items-center justify-between gap-3 px-5 py-5 text-sm text-ink-soft md:px-10 lg:px-16">
          <Link href={`/portfolio#${img.section}`} className="inline-flex min-h-11 items-center gap-3 text-ink transition-colors hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            <span aria-hidden="true">←</span> Back to the photographs
          </Link>
          <span>{label} <span aria-hidden="true">/</span> TX Quince</span>
        </div>

        <figure className="border-y border-line bg-greige">
          <div className="relative mx-auto flex min-h-[45svh] max-w-[100rem] items-center justify-center p-3 sm:p-8 lg:min-h-[68svh] lg:p-12">
            <ProtectedImg
              src={at(img.url, 1920)}
              alt={copy.alt}
              width={img.width}
              height={img.height}
              loading="eager"
              className="block h-auto max-h-[78svh] max-w-full object-contain"
            />
            <EditOverlay image={{ id: img.id, slug: img.slug, alt: img.alt, fx: img.focus_x, fy: img.focus_y }} />
          </div>
          <figcaption className="mx-auto flex max-w-[100rem] justify-between gap-4 px-5 pb-4 text-xs uppercase tracking-[0.15em] text-ink-soft md:px-10 lg:px-16">
            <span>{label}</span>
            <span>Photography by {site.brand}</span>
          </figcaption>
        </figure>

        <div className="mx-auto grid max-w-[100rem] gap-10 px-5 pb-20 pt-12 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)] md:gap-16 md:px-10 md:pb-28 md:pt-20 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">From the collection</p>
            <h1 className="mt-4 font-body text-[clamp(1.875rem,3vw,2.75rem)] font-normal leading-[1.12] tracking-[-0.035em] text-ink">{copy.title}</h1>
            {img.hook ? <p className="mt-5 text-lg leading-relaxed text-ink-soft">{img.hook}</p> : null}
            {img.caption && copy.description !== copy.alt ? <p className="mt-5 text-base leading-7 text-ink-soft">{copy.description}</p> : null}
            <div className="mt-8">
              <PhotoActions section={img.section} slug={slug} title={copy.title} pageUrl={pageUrl} bookingHref={site.cta.href} />
            </div>
          </div>

          <div className="border-t border-line pt-6 md:pt-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">The details</p>
            <dl className="mt-5 divide-y divide-line text-base">
              <div className="flex flex-wrap justify-between gap-x-5 gap-y-1 py-3">
                <dt className="text-ink-soft">Photographer</dt>
                <dd className="text-ink">{site.brand}</dd>
              </div>
              {venue ? (
                <div className="flex flex-wrap justify-between gap-x-5 gap-y-1 py-3">
                  <dt className="text-ink-soft">Venue</dt>
                  <dd><Link href={`/venues/${venue.slug}`} className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">{venue.venue}</Link></dd>
                </div>
              ) : null}
              <div className="flex flex-wrap justify-between gap-x-5 gap-y-1 py-3">
                <dt className="text-ink-soft">Location</dt>
                <dd className="text-ink">{img.city ? `${img.city}, TX` : "Dallas–Fort Worth, TX"}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-5 gap-y-1 py-3">
                <dt className="text-ink-soft">Series</dt>
                <dd><Link href={`/portfolio#${img.section}`} className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">{label}</Link></dd>
              </div>
              {(img.vendors ?? []).map((v) => {
                const ig = igUrl(v.ig_handle);
                const out = ig || websiteUrl(v.website);
                return (
                  <div key={v.vendor_id} className="flex flex-wrap justify-between gap-x-5 gap-y-1 py-3">
                    <dt className="text-ink-soft">{v.role || vendorCreditLabel(v.category)}</dt>
                    <dd className="flex items-center gap-2 text-right">
                      <Link href={`/vendors/${v.slug}`} className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">{v.business || v.name}</Link>
                      {out ? <a href={out} target="_blank" rel="noopener noreferrer" aria-label={`Open ${v.business || v.name} ${ig ? "Instagram" : "website"}`} className="inline-flex min-h-11 min-w-11 items-center justify-center text-ink-soft hover:text-ink">↗</a> : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>

        {related.length ? (
          <section className="border-t border-line bg-white" aria-labelledby="more-from-series">
            <div className="mx-auto max-w-[100rem] px-5 py-16 md:px-10 md:py-24 lg:px-16">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">Continue looking</p>
                  <h2 id="more-from-series" className="mt-3 font-body text-[clamp(1.75rem,2.6vw,2.5rem)] font-normal text-ink">More from {label}</h2>
                </div>
                <Link href={`/portfolio#${img.section}`} className="inline-flex min-h-11 items-center text-base text-ink underline underline-offset-4 hover:text-ink-soft">View the collection ↗</Link>
              </div>
              <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.id} href={imagePagePath(r.section, r.slug as string)} aria-label={`View ${publicPhotoCopy(r, altPhraseFor(r.section)).title}`} className="group relative block aspect-[4/5] overflow-hidden bg-greige focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                    <ProtectedImg
                      src={at(r.url, 640)}
                      alt={publicPhotoCopy(r, altPhraseFor(r.section)).alt}
                      loading="lazy"
                      width={r.width}
                      height={r.height}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
