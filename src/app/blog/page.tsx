import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { getAllPosts, BLOG_CATEGORIES } from "@/content/blog";
import { getFeaturedImages, getPageHero } from "@/lib/content-db";
import { FinalCTA } from "@/components/FinalCTA";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";

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
  const photoAlt = (image: (typeof imgs)[number]) => publicPhotoCopy(image, altPhraseFor(image.section)).alt;

  return (
    <>
      <header className="relative isolate min-h-[34rem] overflow-hidden bg-ink text-white sm:min-h-[42rem]" aria-labelledby="journal-title">
        <Image src={hero?.url ?? "/portfolio/hero.webp"} alt={hero ? photoAlt(hero) : "Quinceañera portrait in Dallas–Fort Worth"} fill priority sizes="100vw" className="object-cover" style={hero ? { objectPosition: focal(hero.focus_x, hero.focus_y) } : undefined} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[34rem] max-w-[90rem] flex-col justify-between px-5 pb-10 pt-8 sm:min-h-[42rem] sm:px-10 sm:pb-14 lg:px-16">
          <p className="text-xs uppercase tracking-[0.18em] text-white/80">TX Quince / The journal</p>
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-white/80">Planning, traditions, and the people beside her</p>
            <h1 id="journal-title" className="mt-4 max-w-[20ch] font-display text-[clamp(2.25rem,4.5vw,4.25rem)] font-normal leading-[1.06] tracking-[-0.035em]">A thoughtful guide to her quinceañera.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/85">Costs, timelines, photography, film, and the traditions that shape the day.</p>
            <Link href="/quinceanera-guide" className="mt-8 inline-flex min-h-12 items-center gap-4 border-b border-white pb-1 text-sm font-medium">Begin with the guide <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </header>

      {featured && (
        <section className="bg-[#f4f2ee]" aria-labelledby="featured-guide-title">
          <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
            <div className="grid gap-8 border-t border-ink/25 pt-6 lg:grid-cols-[minmax(0,0.33fr)_minmax(0,0.67fr)] lg:gap-14">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">01 / Featured guide</p>
              <h2 id="featured-guide-title" className="max-w-[24ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight text-ink">Start with what matters most.</h2>
            </div>
            <Link href={`/blog/${featured.slug}`} className="group mt-10 grid gap-7 lg:mt-14 lg:grid-cols-[minmax(0,0.57fr)_minmax(0,0.43fr)] lg:items-end lg:gap-14">
              <div className="relative aspect-[4/3] overflow-hidden bg-greige sm:aspect-[3/2]">
                {featuredImg?.url && <Image src={featuredImg.url} alt={photoAlt(featuredImg)} fill sizes="(max-width: 1023px) 100vw, 55vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none" style={{ objectPosition: focal(featuredImg.focus_x, featuredImg.focus_y) }} />}
              </div>
              <div className="border-t border-line pt-6">
                <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">{featured.category} · {featured.readMinutes} min read</p>
                <h3 className="mt-4 max-w-[25ch] font-display text-[clamp(1.5rem,2.5vw,2.5rem)] font-normal leading-tight text-ink">{featured.title}</h3>
                <p className="mt-4 max-w-lg text-base leading-7 text-ink-soft">{featured.excerpt}</p>
                <span className="mt-6 inline-flex min-h-11 items-center gap-4 border-b border-ink text-sm font-medium text-ink">Read the story <span aria-hidden="true">↗</span></span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <div className="bg-white">
        {BLOG_CATEGORIES.map((category, categoryIndex) => {
          const articles = rest.filter((post) => post.category === category);
          if (!articles.length) return null;
          return (
            <section key={category} className="border-t border-line" aria-labelledby={`journal-${categoryIndex}`}>
              <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-20 lg:px-16">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] lg:gap-12">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">0{categoryIndex + 2} / The journal</p>
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <h2 id={`journal-${categoryIndex}`} className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] font-normal leading-tight text-ink">{category}</h2>
                    <span className="text-sm text-ink-soft">{articles.length} {articles.length === 1 ? "guide" : "guides"}</span>
                  </div>
                </div>
                <div className="mt-9 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                  {articles.map((post) => {
                    const image = imgBySlug.get(post.slug);
                    return <article key={post.slug} className="min-w-0">
                      <Link href={`/blog/${post.slug}`} className="group block">
                        <span className="relative block aspect-[4/5] overflow-hidden bg-greige">
                          {image?.url && <Image src={image.url} alt={photoAlt(image)} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none" style={{ objectPosition: focal(image.focus_x, image.focus_y) }} />}
                        </span>
                        <span className="mt-4 block text-xs uppercase tracking-[0.12em] text-ink-soft">{post.readMinutes} min read</span>
                        <span className="mt-2 block font-display text-[1.375rem] font-normal leading-snug text-ink group-hover:underline group-hover:underline-offset-4">{post.title}</span>
                        <span className="mt-2 block line-clamp-2 text-base leading-7 text-ink-soft">{post.excerpt}</span>
                        <span className="mt-3 inline-flex min-h-11 items-center gap-3 text-sm font-medium text-ink">Read guide <span aria-hidden="true">↗</span></span>
                      </Link>
                    </article>;
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <FinalCTA />
    </>
  );
}
