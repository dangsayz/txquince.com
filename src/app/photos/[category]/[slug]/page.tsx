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
import { Reveal } from "@/components/Reveal";
import { ProtectedImg } from "@/components/ProtectedImg";
import { EditOverlay } from "@/components/EditMode";
import { categoryLabel, vendorCreditLabel } from "@/content/portfolio-taxonomy";
import { igUrl, websiteUrl } from "@/lib/vendor-links";
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

  const title = img.title || img.alt || "Quinceañera photograph";
  const description = `${img.caption || img.alt} — quinceañera photography by ${site.brand}, Dallas–Fort Worth. Collections from $1,800; reserve your date.`;
  const pagePath = imagePagePath(img.section, slug);
  const imgUrl = `${site.url}/api/img/${slug}`;

  return {
    title: `${title} · ${categoryLabel(img.section)}`,
    description,
    ...(img.tags ? { keywords: img.tags } : {}),
    alternates: { canonical: pagePath },
    openGraph: {
      title: `${title} · ${site.brand}`,
      description,
      url: `${site.url}${pagePath}`,
      type: "article",
      images: [
        {
          url: imgUrl,
          width: img.width ?? 1600,
          height: img.height ?? 2400,
          alt: img.alt,
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
  const pageUrl = `${site.url}${imagePagePath(img.section, slug)}`;
  const related = (await getImagesBySection(img.section))
    .filter((r) => r.slug && r.slug !== slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["ImageObject", "Photograph"],
        "@id": `${pageUrl}#image`,
        contentUrl: `${site.url}/api/img/${slug}`,
        url: pageUrl,
        name: img.title || img.alt,
        description: img.caption || img.alt,
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
          { "@type": "ListItem", position: 4, name: img.title || img.alt, item: pageUrl },
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

      <article className="mx-auto max-w-[90rem] px-5 pb-24 pt-12 md:px-10 lg:px-16 md:pb-36 md:pt-16">
        {/* Breadcrumb line */}
        <Reveal>
          <p className="text-sm text-ink-soft">
            <Link href="/portfolio" className="transition-colors hover:text-ink">
              Portfolio
            </Link>
            <span aria-hidden> / </span>
            <Link href={`/portfolio#${img.section}`} className="transition-colors hover:text-ink">
              {label}
            </Link>
          </p>
        </Reveal>

        {/* The photograph — display derivative only; expanding never fetches more. */}
        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-7">
            <div className="relative">
              <ProtectedImg
                src={at(img.url, 1920)}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="eager"
                className="h-auto w-full"
              />
              <EditOverlay
                image={{ id: img.id, slug: img.slug, alt: img.alt, fx: img.focus_x, fy: img.focus_y }}
              />
            </div>
          </Reveal>

          {/* Caption block — pinned low like a plate caption. */}
          <div className="flex flex-col justify-end md:col-span-4 md:col-start-9">
            <Reveal>
              <h1
                className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink"
              >
                {img.title || img.alt}
              </h1>
              {img.hook ? (
                <p className="accent mt-3 text-lg text-accent-strong">{img.hook}</p>
              ) : null}
              {img.caption ? (
                <p className="mt-4 text-base leading-relaxed text-ink-soft">{img.caption}</p>
              ) : null}
              <dl className="mt-8 space-y-3 border-t border-ink/10 pt-6 text-sm">
                <div className="flex justify-between gap-6">
                  <dt className="text-ink-faint">Photographer</dt>
                  <dd className="text-ink">{site.brand}</dd>
                </div>
                {/* Venue — links to its landing page when this photo was shot at
                    a known venue (internal link into the venue cluster). */}
                {(() => {
                  const v = venueForLocation(img.location);
                  return v ? (
                    <div className="flex justify-between gap-6">
                      <dt className="text-ink-faint">Venue</dt>
                      <dd className="text-right text-ink">
                        <Link
                          href={`/venues/${v.slug}`}
                          className="underline decoration-ink/20 underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
                        >
                          {v.venue}
                        </Link>
                      </dd>
                    </div>
                  ) : null;
                })()}
                <div className="flex justify-between gap-6">
                  <dt className="text-ink-faint">Location</dt>
                  <dd className="text-ink">{img.city ? `${img.city}, TX` : "Dallas–Fort Worth, TX"}</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="text-ink-faint">Series</dt>
                  <dd className="text-ink">{label}</dd>
                </div>
                {/* Vendor credits — link to each vendor's page; IG opens out.
                    Email/phone never appear. */}
                {(img.vendors ?? []).map((v) => {
                  const ig = igUrl(v.ig_handle);
                  const web = websiteUrl(v.website);
                  const out = ig || web;
                  return (
                    <div key={v.vendor_id} className="flex justify-between gap-6">
                      <dt className="text-ink-faint">{v.role || vendorCreditLabel(v.category)}</dt>
                      <dd className="text-right text-ink">
                        <Link href={`/vendors/${v.slug}`} className="underline decoration-ink/20 underline-offset-2 transition-colors hover:text-accent hover:decoration-accent">
                          {v.business || v.name}
                        </Link>
                        {out ? (
                          <a
                            href={out}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${v.business || v.name} ${ig ? "Instagram" : "website"}`}
                            className="ml-1.5 text-ink-faint transition-colors hover:text-accent"
                          >
                            ↗
                          </a>
                        ) : null}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <div className="mt-10 flex flex-col gap-5">
                <PhotoActions section={img.section} slug={slug} title={img.title || img.alt} pageUrl={pageUrl} bookingHref={site.cta.href} />
                <Link
                  href={`/portfolio#${img.section}`}
                  className="text-sm text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:text-accent-strong"
                >
                  More from {label}
                </Link>
              </div>
              <p className="mt-10 text-xs text-ink-faint">
                © {site.brand} · {site.domain}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Related — same series. */}
        {related.length ? (
          <div className="mt-20 border-t border-ink/10 pt-10 md:mt-28">
            <p className="text-sm font-semibold text-ink">
              Also from {label}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 md:gap-5">
              {related.map((r) => (
                <Link key={r.id} href={imagePagePath(r.section, r.slug as string)} className="group block overflow-hidden">
                  <ProtectedImg
                    src={at(r.url, 640)}
                    alt={r.alt}
                    loading="lazy"
                    width={r.width}
                    height={r.height}
                    className="h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </article>
    </>
  );
}
