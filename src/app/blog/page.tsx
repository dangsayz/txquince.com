import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { getAllPosts, BLOG_CATEGORIES } from "@/content/blog";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Quinceañera Planning Guide & Journal",
  description:
    "Honest, no-guesswork guides to planning a quinceañera in Dallas–Fort Worth — real costs, timelines, traditions, and how to choose your photographer & film team.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Quinceañera Planning Guide · TX Quince",
    description:
      "Real costs, timelines, traditions, and how to choose your photographer in Dallas–Fort Worth.",
    url: `${site.url}/blog`,
  },
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-section md:px-10 lg:px-16 md:pt-section-lg">
        <Reveal className="max-w-3xl">
          <p className="eyebrow mb-5">The Quince Journal</p>
          <h1 className="display-1 text-ink text-balance">
            Plan her quinceañera with no guesswork.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            Real costs, real timelines, and the traditions that make the day — written for
            Dallas–Fort Worth families, so you know exactly what to expect before you spend a dollar.
          </p>
        </Reveal>
      </section>

      {/* Featured post */}
      {featured ? (
        <section className="mx-auto max-w-7xl px-5 py-section md:px-10 lg:px-16">
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group block rounded-[1.75rem] border border-line bg-white p-8 transition-colors hover:border-wine md:p-12"
            >
              <p className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
                {featured.category} · Featured
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-3xl leading-tight text-ink group-hover:text-wine md:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">{featured.excerpt}</p>
              <p className="mt-5 text-xs text-ink-faint">
                {formatDate(featured.publishedAt)} · {featured.readMinutes} min read
              </p>
            </Link>
          </Reveal>
        </section>
      ) : null}

      {/* Category sections */}
      <section className="mx-auto max-w-7xl px-5 pb-section md:px-10 lg:px-16 md:pb-section-lg">
        {BLOG_CATEGORIES.map((cat) => {
          const inCat = rest.filter((p) => p.category === cat);
          if (inCat.length === 0) return null;
          return (
            <div key={cat} className="mt-14 first:mt-0">
              <h2 className="border-b border-line pb-3 font-display text-2xl text-ink">{cat}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {inCat.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 3) * 70}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-colors hover:border-wine"
                    >
                      <h3 className="font-display text-xl leading-tight text-ink group-hover:text-wine">
                        {p.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{p.excerpt}</p>
                      <p className="mt-4 text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint">
                        {p.readMinutes} min read
                      </p>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <FinalCTA />
    </>
  );
}
