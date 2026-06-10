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
  const img = await getImageBySlug(slug);
  if (!img || img.section !== category) return {};

  const title = img.title || img.alt || "Quinceañera photograph";
  const description = `${img.caption || img.alt} — quinceañera photography by ${site.brand}, Dallas–Fort Worth. Collections from $2,500; reserve your date.`;
  const pagePath = imagePagePath(img.section, slug);
  const imgUrl = `${site.url}/api/img/${slug}`;

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
  const img = await getImageBySlug(slug);
  if (!img || !img.slug || img.section !== category) notFound();

  const label = SECTION_LABELS[img.section] ?? "Portfolio";
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

      <article className="mx-auto max-w-[90rem] px-5 pb-24 pt-12 md:px-8 md:pb-36 md:pt-16">
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
        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-7">
            <ProtectedImg
              src={img.url}
              alt={img.alt}
              width={img.width}
              height={img.height}
              loading="eager"
              className="h-auto w-full"
            />
          </Reveal>

          {/* Caption block — pinned low like a plate caption. */}
          <div className="flex flex-col justify-end md:col-span-4 md:col-start-9">
            <Reveal>
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
              <div className="mt-10 flex flex-col gap-3">
                <Link
                  href={site.cta.href}
                  className="group inline-flex items-baseline gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-ink underline decoration-ink/30 underline-offset-[6px] transition-colors hover:text-wine hover:decoration-wine"
                >
                  Reserve your date
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </Link>
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
            <div className="mt-6 grid grid-cols-3 gap-3 md:gap-5">
              {related.map((r) => (
                <Link key={r.id} href={imagePagePath(r.section, r.slug as string)} className="group block overflow-hidden">
                  <ProtectedImg
                    src={r.url}
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
