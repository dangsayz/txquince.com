import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { getAllPosts, BLOG_CATEGORIES } from "@/content/blog";
import { getFeaturedImages, getPageHero } from "@/lib/content-db";
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

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.35) * 100)}%`;
}

export default async function BlogIndexPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  // Real photography carries the contrast a text-only index can't. The hero is
  // operator-choosable in /admin/hero (falls back to the top featured frame);
  // the featured post + each category tile get a different frame so nothing
  // repeats.
  const imgs = await getFeaturedImages(24);
  const hero = (await getPageHero("blog")) ?? imgs[0] ?? null;
  const pool = imgs.filter((i) => i.url !== hero?.url);
  const featuredImg = pool[0] ?? imgs[0] ?? null;
  const tilePool = pool.length > 1 ? pool.slice(1) : pool;
  const imgForIndex = (idx: number) =>
    tilePool.length ? tilePool[idx % tilePool.length] : (imgs[0] ?? null);
  // Stable per-post image across the category loop.
  const imgBySlug = new Map(rest.map((p, idx) => [p.slug, imgForIndex(idx)]));

  return (
    <>
      <section className="mx-auto max-w-[90rem] px-5 pb-14 pt-12 md:px-10 md:pb-20 md:pt-16 lg:px-16 lg:pt-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-ink-soft">The Quince Journal</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.14] text-ink text-balance">
            Plan her quinceañera with no guesswork.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-ink-soft">
            Real costs, real timelines, and the traditions that make the day —
            written for Dallas–Fort Worth families, so you know exactly what to
            expect before you spend a dollar.
          </p>
          <Link
            href="/quinceanera-guide"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong"
          >
            Start with the Quinceañera Guide <span aria-hidden className="ml-3">→</span>
          </Link>
        </Reveal>
        <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-lg bg-greige sm:mt-12 sm:aspect-[16/8] lg:aspect-[16/7]">
          <Image
            src={hero?.url ?? "/portfolio/hero.webp"}
            alt={hero?.alt || "Quinceañera in Dallas–Fort Worth"}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1440px"
            className="object-cover"
            style={hero ? { objectPosition: focal(hero.focus_x, hero.focus_y) } : undefined}
          />
        </div>
      </section>

      {/* ===== Featured guide — wide editorial card, image + text side by side ===== */}
      {featured ? (
        <section className="mx-auto mt-12 max-w-[90rem] px-5 md:mt-16 md:px-10 lg:px-16">
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid overflow-hidden rounded-lg border border-line bg-white md:grid-cols-[1.15fr_1fr] md:items-center"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-greige md:h-full md:min-h-[22rem]">
                {featuredImg?.url ? (
                  <Image
                    src={featuredImg.url}
                    alt={featuredImg.alt || "Quinceañera"}
                    fill
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    style={{ objectPosition: focal(featuredImg.focus_x, featuredImg.focus_y) }}
                  />
                ) : null}
              </div>
              <div className="p-6 md:p-8 lg:p-10">
                <p className="text-sm font-medium text-ink-soft">
                  {featured.category} · Featured
                </p>
                <h2
                  className="mt-3 font-display text-ink"
                  style={{ fontSize: "clamp(1.75rem,3vw,2.5rem)", lineHeight: 1.12, letterSpacing: "-0.02em" }}
                >
                  {featured.title}
                </h2>
                <p className="mt-4 max-w-md text-base leading-7 text-ink-soft">
                  {featured.excerpt}
                </p>
                <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-base font-medium text-ink transition-colors group-hover:text-accent">
                  Read the guide
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      ) : null}

      {/* ===== Categories — photo-led editorial tiles ===== */}
      <section className="mx-auto mt-16 max-w-[90rem] px-5 pb-section md:mt-24 md:px-10 lg:px-16 md:pb-section-lg">
        {BLOG_CATEGORIES.map((cat) => {
          const inCat = rest.filter((p) => p.category === cat);
          if (inCat.length === 0) return null;
          return (
            <div key={cat} className="mt-16 first:mt-0">
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <h2 className="font-display text-2xl text-ink md:text-[1.7rem]">{cat}</h2>
                <span className="shrink-0 text-sm text-ink-faint">
                  {inCat.length} {inCat.length === 1 ? "guide" : "guides"}
                </span>
              </div>
              <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {inCat.map((p, i) => {
                  const img = imgBySlug.get(p.slug) ?? null;
                  return (
                    <Reveal key={p.slug} delay={(i % 3) * 70}>
                      <Link href={`/blog/${p.slug}`} className="group block h-full overflow-hidden rounded-lg border border-line bg-white">
                        <div className="relative aspect-[4/3] overflow-hidden bg-greige">
                          {img?.url ? (
                            <Image
                              src={img.url}
                              alt={img.alt || "Quinceañera"}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                              style={{ objectPosition: focal(img.focus_x, img.focus_y) }}
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-ink/5 transition-colors group-hover:bg-ink/0" />
                        </div>
                        <div className="p-5">
                          <p className="text-sm text-ink-soft">{cat} · {p.readMinutes} min read</p>
                          <h3 className="mt-2 font-display text-xl leading-snug text-ink transition-colors group-hover:text-accent">{p.title}</h3>
                          <p className="mt-2 line-clamp-2 text-base leading-7 text-ink-soft">{p.excerpt}</p>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <FinalCTA />
    </>
  );
}
