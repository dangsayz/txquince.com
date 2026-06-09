import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getAllPosts, getPost, relatedPosts, slugifyHeading } from "@/content/blog";
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
  return {
    title: post.metaTitle ?? post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
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

      <article className="mx-auto max-w-3xl px-5 pt-section md:px-8 md:pt-section-lg">
        {/* breadcrumb */}
        <nav className="text-xs text-ink-faint" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-wine">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/blog" className="hover:text-wine">Blog</Link>
        </nav>

        <Reveal className="mt-5">
          <p className="eyebrow mb-4">{post.category}</p>
          <h1 className="display-2 text-ink text-balance">{post.title}</h1>
          <p className="mt-4 text-sm text-ink-faint">
            {formatDate(post.publishedAt)} · {post.readMinutes} min read
          </p>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">{post.lead}</p>
        </Reveal>

        {/* TOC for longer posts */}
        {toc.length >= 4 ? (
          <div className="mt-10 rounded-2xl border border-line bg-greige p-5">
            <p className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">In this guide</p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {toc.map((h) => (
                <li key={h.text}>
                  <a href={`#${slugifyHeading(h.text)}`} className="text-sm text-ink-soft hover:text-wine">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-10">
          <BlogContent blocks={post.content} />
        </div>

        {/* FAQ */}
        {post.faqs && post.faqs.length ? (
          <section className="mt-14">
            <h2 className="font-display text-3xl text-ink">Frequently asked questions</h2>
            <dl className="mt-6 divide-y divide-line border-y border-line">
              {post.faqs.map((f) => (
                <div key={f.q} className="py-6">
                  <dt className="font-display text-xl text-ink">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {/* related */}
        {related.length ? (
          <section className="mt-14">
            <p className="eyebrow mb-5">Keep reading</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group rounded-2xl border border-line bg-white p-5 transition-colors hover:border-wine"
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">{r.category}</p>
                  <h3 className="mt-2 font-display text-lg leading-tight text-ink group-hover:text-wine">
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
