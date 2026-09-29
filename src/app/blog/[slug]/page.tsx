import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getAllPosts, getPost, relatedPosts, slugifyHeading, esSlugForEn } from "@/content/blog";
import { getBlogImages } from "@/lib/content-db";
import { BlogContent } from "@/components/BlogContent";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `${site.url}/blog/${post.slug}`;
  const esSlug = esSlugForEn(post.slug);
  return {
    title: post.metaTitle ?? post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
      ...(esSlug
        ? {
            languages: {
              "en-US": `/blog/${post.slug}`,
              "es-MX": `/es/blog/${esSlug}`,
              "x-default": `/blog/${post.slug}`,
            },
          }
        : {}),
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${site.url}/blog/${post.slug}`;
  const toc = post.content.filter((b) => b.type === "h2") as { type: "h2"; text: string }[];
  const related = relatedPosts(post);
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
        inLanguage: post.lang === "es" ? "es" : "en",
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
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
      ...(post.faqs && post.faqs.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
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
        <nav className="flex items-center gap-1 text-sm text-ink-faint" aria-label="Breadcrumb">
          <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/blog" className="inline-flex min-h-11 items-center hover:text-ink">Blog</Link>
        </nav>

        <Reveal className="mx-auto mt-8 max-w-2xl text-center">
          <p className="eyebrow mb-4">{post.category}</p>
          <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.14] text-ink text-balance">{post.title}</h1>
          <p className="mt-4 text-sm text-ink-faint">
            {formatDate(post.publishedAt)} · {post.readMinutes} min read
          </p>
          <p className="mt-6 text-base leading-7 text-ink-soft">{post.lead}</p>
        </Reveal>

        {toc.length >= 4 ? (
          <nav aria-label="In this guide" className="mt-10 rounded-lg border border-line bg-white p-6">
            <p className="text-sm font-medium text-ink-soft">In this guide</p>
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

        {/* FAQ */}
        {post.faqs && post.faqs.length ? (
          <section className="mt-14">
            <h2 className="font-display text-3xl text-ink">Frequently asked questions</h2>
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

        {/* related — hairline rows, no cards */}
        {related.length ? (
          <section className="mt-16 border-t border-ink/10 pt-10">
            <p className="eyebrow mb-2">Keep reading</p>
            <div>
              {related.map((r, idx) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className={`group block py-5 ${idx > 0 ? "border-t border-ink/10" : ""}`}
                >
                  <p className="text-sm text-ink-soft">{r.category}</p>
                  <h3 className="mt-1.5 font-display text-lg leading-tight text-ink transition-colors group-hover:text-accent md:text-xl">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <div className="mt-section">
        <FinalCTA />
      </div>
    </>
  );
}
