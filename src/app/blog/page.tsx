import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { getAllPosts, BLOG_CATEGORIES } from "@/content/blog";
import { getFeaturedImages } from "@/lib/content-db";
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

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.35) * 100)}%`;
}

export default async function BlogIndexPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  // Real photography carries the contrast a text-only index can't. Pull the
  // featured set and hand each post a frame (hero gets the first).
  const imgs = await getFeaturedImages(24);
  const hero = imgs[0] ?? null;
  const imgForIndex = (idx: number) =>
    imgs.length > 1 ? imgs[(idx % (imgs.length - 1)) + 1] : (imgs[0] ?? null);
  // Stable per-post image across the category loop.
  const imgBySlug = new Map(rest.map((p, idx) => [p.slug, imgForIndex(idx)]));

  return (
    <>
      {/* ===== Masthead ===== */}
      <section className="mx-auto max-w-[90rem] px-5 pt-section md:px-10 lg:px-16 md:pt-section-lg">
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

      {/* ===== Featured — cinematic image hero ===== */}
      {featured ? (
        <section className="mx-auto mt-10 max-w-[90rem] px-5 md:mt-12 md:px-10 lg:px-16">
          <Reveal>
            <Link href={`/blog/${featured.slug}`} className="group relative block overflow-hidden bg-ink">
              <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9]">
                {hero?.url ? (
                  <Image
                    src={hero.url}
                    alt={hero.alt || "Quinceañera"}
                    fill
                    priority
                    sizes="(max-width: 1440px) 100vw, 90rem"
                    className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    style={{ objectPosition: focal(hero.focus_x, hero.focus_y) }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/5" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-14">
                  <p className="text-[0.62rem] uppercase tracking-[0.3em] text-cream/85">
                    {featured.category} · Featured
                  </p>
                  <h2
                    className="mt-3 max-w-3xl font-display text-cream"
                    style={{ fontSize: "clamp(1.9rem,4.4vw,3.6rem)", lineHeight: 1.03, letterSpacing: "-0.02em" }}
                  >
                    {featured.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/80 md:text-base">
                    {featured.excerpt}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-cream">
                    Read the guide
                    <span aria-hidden className="text-wine-tint transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
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
              <div className="flex items-baseline justify-between border-b border-ink/10 pb-3">
                <h2 className="font-display text-2xl text-ink md:text-[1.7rem]">{cat}</h2>
                <span className="text-[0.6rem] uppercase tracking-[0.22em] text-ink-faint">
                  {inCat.length} {inCat.length === 1 ? "guide" : "guides"}
                </span>
              </div>
              <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {inCat.map((p, i) => {
                  const img = imgBySlug.get(p.slug) ?? null;
                  return (
                    <Reveal key={p.slug} delay={(i % 3) * 70}>
                      <Link href={`/blog/${p.slug}`} className="group block">
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
                        <p className="mt-4 text-[0.6rem] uppercase tracking-[0.2em] text-wine-deep">
                          {cat} · {p.readMinutes} min read
                        </p>
                        <h3 className="mt-2 font-display text-xl leading-snug text-ink transition-colors group-hover:text-wine">
                          {p.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                          {p.excerpt}
                        </p>
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
