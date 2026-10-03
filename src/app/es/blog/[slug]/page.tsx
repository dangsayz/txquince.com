import type { Metadata } from "next";
import Link from "next/link";
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

      <article className="mx-auto max-w-3xl px-5 pt-10 md:px-10 md:pt-14 lg:px-16">
        <div className="flex items-center justify-between gap-4">
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

        <Reveal className="mx-auto mt-8 max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium text-ink-soft">{CATEGORY_ES[post.category]}</p>
          <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.14] text-ink text-balance">{post.title}</h1>
          <p className="mt-4 text-sm text-ink-faint">
            {formatDateEs(post.publishedAt)} · {post.readMinutes} min de lectura
          </p>
          <p className="mt-6 text-base leading-7 text-ink-soft">{post.lead}</p>
        </Reveal>

        {toc.length >= 4 ? (
          <nav aria-label="En esta guía" className="mt-10 rounded-lg border border-line bg-white p-6">
            <p className="text-sm font-medium text-ink-soft">En esta guía</p>
            <ul className="mt-3 flex flex-col gap-1">
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
                  <h3 className="mt-1.5 font-display text-lg leading-tight text-ink transition-colors group-hover:text-accent md:text-xl">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <section className="mt-16 bg-ivory px-5 py-16 md:px-10 md:py-20 lg:px-16">
        <div className="mx-auto max-w-3xl rounded-lg border border-line bg-white px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2 className="font-display text-[clamp(1.875rem,2.8vw,2.625rem)] leading-tight text-ink text-balance">Reserva la fecha de su quinceañera</h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-ink-soft">
            Le confirmo que su fecha está disponible y le envío un enlace seguro para el depósito. Sin pago ahora mismo.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/es/consulta" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Reservar mi fecha
            </Link>
            <Link href="/es/paquetes" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-md border border-line px-6 text-base font-medium text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Ver colecciones
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
