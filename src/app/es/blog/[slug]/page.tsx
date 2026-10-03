import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import {
  getAllEsPosts,
  getEsPost,
  relatedEsPosts,
  slugifyHeading,
  enSlugForEs,
  type BlogCategory,
} from "@/content/blog";
import { getBlogImages } from "@/lib/content-db";
import { BlogContent } from "@/components/BlogContent";
import { Reveal } from "@/components/Reveal";

export const revalidate = 3600;

const CATEGORY_ES: Record<BlogCategory, string> = {
  "Cost & Budget": "Costo y presupuesto",
  Planning: "Planeación",
  Traditions: "Tradiciones",
  "Photography & Film": "Foto y video",
  Locations: "Lugares",
};

export function generateStaticParams() {
  return getAllEsPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getEsPost(slug);
  if (!post) return {};
  const url = `${site.url}/es/blog/${post.slug}`;
  const enSlug = enSlugForEs(post.slug);
  return {
    title: post.metaTitle ?? post.title,
    description: post.description,
    alternates: {
      canonical: `/es/blog/${post.slug}`,
      ...(enSlug
        ? {
            languages: {
              "es-MX": `/es/blog/${post.slug}`,
              "en-US": `/blog/${enSlug}`,
              "x-default": `/blog/${enSlug}`,
            },
          }
        : {}),
    },
    openGraph: {
      type: "article",
      locale: "es_MX",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

function formatDateEs(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

export default async function EsBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getEsPost(slug);
  if (!post) notFound();

  const url = `${site.url}/es/blog/${post.slug}`;
  const enSlug = enSlugForEs(post.slug);
  const toc = post.content.filter((b) => b.type === "h2") as { type: "h2"; text: string }[];
  const related = relatedEsPosts(post);
  const images = await getBlogImages(post.content);
  const cover = Object.values(images)[0];
  const imageUrls = Object.values(images).map((im) =>
    im.url.startsWith("http") ? im.url : `${site.url}${im.url}`,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        inLanguage: "es",
        author: { "@type": "Organization", name: site.brand, url: site.url },
        publisher: { "@type": "Organization", name: site.brand, url: site.url },
        mainEntityOfPage: url,
        articleSection: post.category,
        ...(imageUrls.length ? { image: imageUrls } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
          { "@type": "ListItem", position: 2, name: "Guía", item: `${site.url}/es/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
      ...(post.faqs && post.faqs.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              inLanguage: "es",
              mainEntity: post.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative mx-4 mt-5 aspect-[4/5] max-h-[48rem] min-h-[22rem] overflow-hidden bg-cream sm:mx-6 sm:aspect-[16/9] md:mx-10 lg:mx-auto lg:max-w-[92rem]">
        <Image src={cover?.url ?? "/portfolio/save-date.webp"} alt={cover?.alt ?? "Fotografía de quinceañera en Dallas–Fort Worth"} fill priority unoptimized={!cover || cover.url.startsWith("/portfolio/")} sizes="(max-width: 1472px) 100vw, 1472px" className="object-cover" />
      </div>

      <article className="bg-white px-5 pb-20 pt-7 md:px-10 md:pt-10 lg:px-16">
        <div className="mx-auto max-w-[82rem]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="flex items-center gap-1 text-sm text-ink-faint" aria-label="Ruta">
              <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink">Inicio</Link>
              <span className="mx-1.5">/</span>
              <Link href="/es/blog" className="inline-flex min-h-11 items-center hover:text-ink">Guía</Link>
            </nav>
            {enSlug ? (
              <Link href={`/blog/${enSlug}`} hrefLang="en" className="inline-flex min-h-11 items-center text-sm text-ink-soft underline underline-offset-4 hover:text-ink">
                Read in English
              </Link>
            ) : null}
          </div>

          <Reveal className="grid gap-5 border-b border-line pb-12 pt-12 md:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] md:gap-12 md:pt-16">
            <div className="text-xs uppercase tracking-[0.14em] text-ink-soft">
              <p>{CATEGORY_ES[post.category]}</p>
              <p className="mt-3 normal-case tracking-normal">{formatDateEs(post.publishedAt)} · {post.readMinutes} min de lectura</p>
            </div>
            <div>
              <h1 className="max-w-[24ch] font-body text-[clamp(2rem,3.5vw,3.25rem)] font-light leading-[1.13] tracking-[-0.035em] text-ink text-balance">{post.title}</h1>
              <p className="mt-6 max-w-2xl font-serif text-lg leading-8 text-ink-soft">{post.lead}</p>
            </div>
          </Reveal>

          <div className="mx-auto max-w-[48rem]">
          {toc.length >= 4 ? (
            <nav aria-label="En esta guía" className="mt-12 border-y border-line py-5">
              <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">En esta guía</p>
              <ul className="mt-3 grid gap-x-8 md:grid-cols-2">
                {toc.map((h, idx) => (
                  <li key={h.text}>
                    <a
                      href={`#${slugifyHeading(h.text)}`}
                      className="group inline-flex min-h-11 items-center gap-3 text-base text-ink-soft transition-colors hover:text-ink"
                    >
                      <span className="font-display text-xs tabular-nums text-ink-faint">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="underline-offset-4 group-hover:underline">{h.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div className="mt-10">
            <BlogContent blocks={post.content} images={images} />
          </div>

          {post.faqs && post.faqs.length ? (
            <section className="mt-14">
              <h2 className="font-display text-[clamp(1.875rem,2.8vw,2.625rem)] text-ink">Preguntas frecuentes</h2>
              <dl className="mt-6 divide-y divide-line border-y border-line">
                {post.faqs.map((f) => (
                  <div key={f.q} className="py-6">
                    <dt className="font-display text-xl text-ink">{f.q}</dt>
                    <dd className="mt-2 text-base leading-7 text-ink-soft">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {related.length ? (
            <section className="mt-16 border-t border-line pt-10">
              <p className="mb-2 text-sm font-medium text-ink-soft">Sigue leyendo</p>
              <div>
                {related.map((r, idx) => (
                  <Link
                    key={r.slug}
                    href={`/es/blog/${r.slug}`}
                    className={`group block py-5 ${idx > 0 ? "border-t border-line" : ""}`}
                  >
                    <p className="text-sm text-ink-soft">{CATEGORY_ES[r.category]}</p>
                    <h3 className="mt-1.5 font-body text-lg font-light leading-tight text-ink transition-colors group-hover:underline group-hover:underline-offset-4 md:text-xl">
                      {r.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          </div>
        </div>
      </article>

    </>
  );
}
