/**
 * /photos/[category]/[slug] — the shareable, indexable page for one photograph.
 * Sharing an image shares THIS page (rich branded preview), never a file.
 * Editorial-system layout; ImageObject JSON-LD; quiet CTA to book.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { getPortfolioImages, imagePagePath } from "@/lib/content-db";
import { Reveal } from "@/components/Reveal";
import { ProtectedImg } from "@/components/ProtectedImg";
import { EditOverlay } from "@/components/EditMode";
import { PhotoActions } from "@/components/gallery/PhotoActions";

/** Branded serve URL at an explicit derivative width. */
function at(url: string, w: number): string {
  return url.startsWith("/api/img/") ? `${url}${url.includes("?") ? "&" : "?"}w=${w}` : url;
}

type DisplayPhoto = {
  url: string;
  alt: string;
  section: string;
  slug: string;
  title?: string | null;
  caption?: string | null;
  city?: string | null;
  width?: number | null;
  height?: number | null;
  id?: string | null;
  focus_x?: number | null;
  focus_y?: number | null;
  source: "database" | "static";
};

async function getAvailablePhotos(): Promise<DisplayPhoto[]> {
  const dbImages = await getPortfolioImages();
  if (dbImages.length) {
    return dbImages.filter((image): image is typeof image & { slug: string } => typeof image.slug === "string" && image.slug.length > 0).map((image) => ({
      url: image.url,
      alt: image.alt,
      section: image.section,
      slug: image.slug,
      title: image.title,
      caption: image.caption,
      city: image.city,
      width: image.width,
      height: image.height,
      id: image.id,
      focus_x: image.focus_x,
      focus_y: image.focus_y,
      source: "database",
    }));
  }
  return portfolioFallback.map((image) => ({
    ...image,
    source: "static",
  }));
}

export const revalidate = 3600;

const SECTION_LABELS: Record<string, string> = {
  "save-the-date": "Save-the-Date",
  church: "La Misa",
  portraits: "Portraits",
  celebration: "The Celebration",
  films: "Films",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const img = (await getAvailablePhotos()).find((image) => image.slug === slug && image.section === category);
  if (!img) return {};

  const title = img.title || img.alt || "Quinceañera photograph";
  const description = `${img.caption || img.alt} — quinceañera photography by ${site.brand}, Dallas–Fort Worth. Collections from $2,500; reserve your date.`;
  const pagePath = imagePagePath(img.section, slug);
  const imgUrl = img.source === "database" ? `${site.url}/api/img/${slug}` : `${site.url}${img.url}`;

  return {
    title: `${title} · ${SECTION_LABELS[img.section] ?? "Portfolio"}`,
    description,
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
  const photos = await getAvailablePhotos();
  const img = photos.find((image) => image.slug === slug && image.section === category);
  if (!img) notFound();

  const label = SECTION_LABELS[img.section] ?? "Portfolio";
  const pageUrl = `${site.url}${imagePagePath(img.section, slug)}`;
  const related = photos
    .filter((r) => r.section === img.section && r.slug !== slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["ImageObject", "Photograph"],
        "@id": `${pageUrl}#image`,
        contentUrl: img.source === "database" ? `${site.url}/api/img/${slug}` : `${site.url}${img.url}`,
        url: pageUrl,
        name: img.title || img.alt,
        description: img.caption || img.alt,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-[90rem] px-5 pb-24 pt-12 md:px-10 lg:px-16 md:pb-36 md:pt-16">
        {/* Breadcrumb line */}
        <Reveal>
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-ink-faint">
            <Link href="/portfolio" className="transition-colors hover:text-ink">
              Portfolio
            </Link>
            <span aria-hidden> — </span>
            <Link href={`/portfolio#${img.section}`} className="transition-colors hover:text-ink">
              {label}
            </Link>
          </p>
        </Reveal>

        {/* The photograph — display derivative only; expanding never fetches more. */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:gap-12">
          <Reveal>
            <div className="relative overflow-hidden rounded-xl bg-greige">
              <ProtectedImg
                src={at(img.url, 1920)}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="eager"
                className="h-auto w-full"
              />
              {img.source === "database" ? (
                <EditOverlay image={{ id: img.id, slug: img.slug, alt: img.alt, fx: img.focus_x, fy: img.focus_y }} />
              ) : null}
            </div>
          </Reveal>

          {/* Caption block — pinned low like a plate caption. */}
          <div className="flex flex-col lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-wine">{label}</p>
              <h1
                className="font-display text-ink"
                style={{ fontSize: "clamp(1.6rem,2.6vw,2.2rem)", lineHeight: 1.15, letterSpacing: "-0.01em" }}
              >
                {img.title || img.alt}
              </h1>
              {img.caption ? (
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">{img.caption}</p>
              ) : null}
              <dl className="mt-8 space-y-3 border-t border-ink/10 pt-6 text-sm">
                <div className="flex justify-between gap-6">
                  <dt className="text-ink-faint">Photographer</dt>
                  <dd className="text-ink">{site.brand}</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="text-ink-faint">Location</dt>
                  <dd className="text-ink">{img.city ? `${img.city}, TX` : "Dallas–Fort Worth, TX"}</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="text-ink-faint">Series</dt>
                  <dd className="text-ink">{label}</dd>
                </div>
              </dl>
              <div className="mt-8">
                <PhotoActions section={img.section} slug={slug} title={img.title || img.alt} pageUrl={pageUrl} bookingHref={site.cta.href} />
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href={`/portfolio#${img.section}`}
                  className="text-[0.72rem] uppercase tracking-[0.2em] text-ink-soft underline decoration-ink/20 underline-offset-[6px] transition-colors hover:text-ink"
                >
                  More from {label}
                </Link>
              </div>
              <p className="mt-10 text-[0.6rem] uppercase tracking-[0.22em] text-ink-faint">
                © {site.brand} · {site.domain}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Related — same series. */}
        {related.length ? (
          <div className="mt-20 border-t border-ink/10 pt-10 md:mt-28">
            <p className="text-[0.62rem] uppercase tracking-[0.28em] text-ink-faint">
              Also from {label}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
              {related.map((r) => (
                <Link key={r.slug} href={imagePagePath(r.section, r.slug)} className="group block min-w-0">
                  <div className="overflow-hidden rounded-xl bg-greige">
                    <ProtectedImg
                      src={at(r.url, 640)}
                      alt={r.alt}
                      loading="lazy"
                      width={r.width}
                      height={r.height}
                      className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.025]"
                    />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-medium text-ink group-hover:text-wine">{r.title || r.alt}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </article>
    </>
  );
}
