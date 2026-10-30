/**
 * /photos/[category]/[slug] — the shareable page for one photograph (noindex, follow).
 * Sharing an image shares THIS page (rich branded preview), never a file.
 * Editorial-system layout; ImageObject JSON-LD; quiet CTA to book.
 */
import type { Metadata } from "next";
import { priceFloor, usd } from "@/lib/commission";
import { getPriceBook } from "@/lib/pricing";
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
import "@/components/txq/pages/pages.css";
import { jsonLdString } from "@/lib/json-ld";

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
  const description = `${copy.description} — quinceañera photography by ${site.brand}, Dallas–Fort Worth. Packages from ${usd(priceFloor(await getPriceBook()))}; check your date.`;
  const pagePath = imagePagePath(img.section, slug);
  const imgUrl = `${site.url}/api/img/${slug}`;

  return {
    title: `${copy.title} · ${categoryLabel(img.section)}`,
    description,
    ...(img.tags ? { keywords: img.tags } : {}),
    alternates: { canonical: pagePath },
    // A single photograph is a share target, not a search landing page: ~200
    // words of templated copy per photo, ~100 near-identical pages. Keep them
    // out of the index (and out of both sitemaps) but let their links count.
    // The images themselves are listed under /portfolio in /image-sitemap.xml.
    robots: { index: false, follow: true },
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
        acquireLicensePage: `${site.url}/#commissions`,
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
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <article className="tq-wrap">
        <nav className="tq-pg-crumbs tq-mono" aria-label="Breadcrumb">
          <Link href={`/portfolio#${img.section}`}>
            <span aria-hidden="true">←</span> Portfolio
          </Link>
          <span>
            {label} <span aria-hidden="true">/</span> TX Quince
          </span>
        </nav>

        <header className="tq-pg-mast">
          <p className="tq-pg-mast__index tq-mono">[{label}]</p>
          <div className="tq-pg-mast__body">
            <h1 className="tq-display tq-pg-mast__title tq-pg-mast__title--sm">{copy.title}</h1>
            <p className="tq-mono tq-muted" style={{ margin: 0 }}>Photography by {site.brand}</p>
          </div>
        </header>

        <figure style={{ margin: 0 }}>
          <div className="tq-pg-photo">
            <ProtectedImg
              src={at(img.url, 1920)}
              alt={copy.alt}
              width={img.width}
              height={img.height}
              loading="eager"
              className="tq-pg-photo__img"
            />
            <EditOverlay image={{ id: img.id, slug: img.slug, alt: img.alt, fx: img.focus_x, fy: img.focus_y }} />
          </div>
          <figcaption className="tq-pg-cap tq-mono">
            <span>[{label}]</span>
            <span>Photography by {site.brand}</span>
          </figcaption>
        </figure>

        <section className="tq-pg-row" style={{ borderTop: "1px solid var(--border-hairline)" }} aria-labelledby="photo-about">
          <h2 id="photo-about" className="tq-pg-row__index tq-mono">[The photograph]</h2>
          <div className="tq-pg-row__body tq-pg-row__body--narrow">
            {img.hook ? <p className="tq-display tq-pg-lede">{img.hook}</p> : null}
            {img.caption && copy.description !== copy.alt ? (
              <div className="tq-pg-prose">
                <p>{copy.description}</p>
              </div>
            ) : null}
            <PhotoActions section={img.section} slug={slug} title={copy.title} pageUrl={pageUrl} bookingHref={site.cta.href} />
          </div>
        </section>

        <section className="tq-pg-row" aria-labelledby="photo-details">
          <h2 id="photo-details" className="tq-pg-row__index tq-mono">[The details]</h2>
          <div className="tq-pg-row__body tq-pg-row__body--narrow">
            <dl className="tq-pg-dl">
              <div>
                <dt className="tq-mono">Photographer</dt>
                <dd>{site.brand}</dd>
              </div>
              {venue ? (
                <div>
                  <dt className="tq-mono">Venue</dt>
                  <dd>
                    <Link href={`/venues/${venue.slug}`}>{venue.venue}</Link>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="tq-mono">Location</dt>
                <dd>{img.city ? `${img.city}, TX` : "Dallas–Fort Worth, TX"}</dd>
              </div>
              <div>
                <dt className="tq-mono">Series</dt>
                <dd>
                  <Link href={`/portfolio#${img.section}`}>{label}</Link>
                </dd>
              </div>
              {(img.vendors ?? []).map((v) => {
                const ig = igUrl(v.ig_handle);
                const out = ig || websiteUrl(v.website);
                return (
                  <div key={v.vendor_id}>
                    <dt className="tq-mono">{v.role || vendorCreditLabel(v.category)}</dt>
                    <dd>
                      <Link href={`/vendors/${v.slug}`}>{v.business || v.name}</Link>
                      {out ? (
                        <a href={out} target="_blank" rel="noopener noreferrer" aria-label={`Open ${v.business || v.name} ${ig ? "Instagram" : "website"}`} className="tq-icon-btn">
                          ↗
                        </a>
                      ) : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </section>

        {related.length ? (
          <section className="tq-section" aria-labelledby="more-from-series">
            <header className="tq-head">
              <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
                [Continue looking]
              </p>
              <h2 id="more-from-series" className="tq-display tq-head__title">
                More from {label}
              </h2>
              <p className="tq-head__dek">
                <Link href={`/portfolio#${img.section}`} className="tq-pg-link">
                  <span>View the collection</span>
                  <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
              </p>
            </header>
            <ul className="tq-pg-thumbs">
              {related.map((r, i) => {
                const rc = publicPhotoCopy(r, altPhraseFor(r.section));
                return (
                  <li key={r.id}>
                    <Link href={imagePagePath(r.section, r.slug as string)} aria-label={`View ${rc.title}`}>
                      <span className="tq-pg-thumb">
                        <ProtectedImg src={at(r.url, 640)} alt={rc.alt} loading="lazy" width={r.width} height={r.height} />
                      </span>
                      <span className="tq-cap tq-mono">
                        <span>[{String(i + 1).padStart(2, "0")}]</span>
                        <span className="tq-cap__mid">{rc.title}</span>
                        <span className="tq-cap__end" aria-hidden>↗</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </article>
    </>
  );
}
