import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { getAllEsPosts, type BlogCategory } from "@/content/blog";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { getFeaturedImages, getPageHero } from "@/lib/content-db";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Guía de Quinceañera (Dallas–Fort Worth)",
  description: "Guías honestas para planear una quinceañera en Dallas–Fort Worth: costos reales, fechas, tradiciones y cómo elegir a tu fotógrafo y equipo de video.",
  alternates: { canonical: "/es/blog", languages: { "es-MX": "/es/blog", "en-US": "/blog" } },
  openGraph: {
    locale: "es_MX",
    title: "Guía de Quinceañera · TX Quince",
    description: "Costos reales, fechas, tradiciones y cómo elegir a tu fotógrafo en Dallas–Fort Worth.",
    url: site.url + "/es/blog",
  },
};

const CATEGORY_ES: Record<BlogCategory, string> = {
  "Cost & Budget": "Costo y presupuesto",
  Planning: "Planeación",
  Traditions: "Tradiciones",
  "Photography & Film": "Foto y video",
  Locations: "Lugares",
};
const CATEGORY_ORDER: BlogCategory[] = ["Cost & Budget", "Planning", "Traditions", "Photography & Film", "Locations"];

function focal(fx?: number | null, fy?: number | null): string {
  return String(Math.round((fx ?? 0.5) * 100)) + "% " + String(Math.round((fy ?? 0.35) * 100)) + "%";
}

export default async function EsBlogIndexPage() {
  const posts = getAllEsPosts();
  const featured = posts[0];
  const rest = posts.slice(1);
  const imgs = await getFeaturedImages(24);
  const fallbacks = portfolioFallback.map((image) => ({ url: image.url, alt: image.alt, focus_x: null, focus_y: null }));
  const hero = (await getPageHero("blog")) ?? imgs[0] ?? fallbacks[0] ?? null;
  const pool = imgs.filter((image) => image.url !== hero?.url);
  const featuredImg = pool[0] ?? imgs[0] ?? fallbacks[1] ?? null;
  const tilePool = pool.length > 1 ? pool.slice(1) : (pool.length ? pool : fallbacks.slice(2));
  const imgBySlug = new Map(rest.map((post, index) => [post.slug, tilePool.length ? tilePool[index % tilePool.length] : (imgs[0] ?? null)]));

  return (
    <>
      <header aria-labelledby="blog-title" className="bg-white px-4 pt-5 sm:px-6 md:px-10 md:pt-8">
        <div className="relative mx-auto min-h-[55svh] max-w-[92rem] overflow-hidden bg-ink sm:min-h-[70svh]">
          <Image src={hero?.url ?? "/portfolio/save-date.webp"} alt={hero?.alt || "Fotografía de quinceañera en Dallas–Fort Worth"} fill priority sizes="(max-width: 1472px) 100vw, 1472px" unoptimized={!hero || hero.url.startsWith("/portfolio/")} className="object-cover" style={{ objectPosition: focal(hero?.focus_x, hero?.focus_y) }} />
          <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
          <div className="relative flex min-h-[55svh] flex-col items-center justify-center px-6 py-20 text-center text-white sm:min-h-[70svh]">
            <p className="text-[0.6875rem] uppercase tracking-[0.28em]">La Guía del Quince</p>
            <h1 id="blog-title" className="mt-5 max-w-[19ch] font-body text-[clamp(2.25rem,4.4vw,4rem)] font-light leading-[1.14] tracking-[-0.035em]">Planea su quinceañera con claridad.</h1>
            <a href="#guias" className="mt-8 inline-flex min-h-11 items-center border-b border-white/80 text-xs uppercase tracking-[0.18em]">Explorar guías <span className="ml-3" aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="mx-auto flex max-w-[92rem] flex-col items-center gap-3 px-2 py-9 text-center sm:py-12">
          <p className="max-w-2xl font-serif text-lg leading-relaxed text-ink-soft sm:text-xl">Costos, fechas y tradiciones para las familias de Dallas–Fort Worth. Respuestas concretas para preparar el día antes de tomar decisiones.</p>
          <Link href="/blog" hrefLang="en" className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.15em] text-ink underline underline-offset-4">Read in English</Link>
        </div>
      </header>

      {featured ? (
        <section aria-labelledby="featured-title" className="border-t border-line bg-white">
          <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
            <p className="mb-6 text-xs uppercase tracking-[0.18em] text-ink-soft">Una lectura para empezar</p>
            <Link href={"/es/blog/" + featured.slug} className="group grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
              <div className="relative aspect-[4/3] overflow-hidden bg-greige sm:aspect-[5/4] lg:aspect-[4/3]">
                <Image src={featuredImg?.url ?? "/portfolio/stockyards.webp"} alt={featuredImg?.alt || "Quinceañera"} fill sizes="(max-width: 1024px) 100vw, 55vw" unoptimized={(featuredImg?.url ?? "").startsWith("/portfolio/")} className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none" style={{ objectPosition: focal(featuredImg?.focus_x, featuredImg?.focus_y) }} />
              </div>
              <div><p className="text-xs uppercase tracking-[0.16em] text-ink-soft">{CATEGORY_ES[featured.category]} / Destacado</p><h2 id="featured-title" className="mt-4 max-w-[18ch] font-body text-[clamp(1.75rem,2.7vw,2.5rem)] font-light leading-tight text-ink">{featured.title}</h2><p className="mt-4 max-w-xl text-base leading-7 text-ink-soft">{featured.excerpt}</p><span className="mt-6 inline-flex min-h-12 items-center gap-7 border-b border-ink text-base text-ink">Leer la guía <span aria-hidden="true">↗</span></span></div>
            </Link>
          </div>
        </section>
      ) : null}

      <section id="guias" aria-label="Todas las guías" className="mx-auto max-w-[88rem] scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        {CATEGORY_ORDER.map((category) => {
          const inCategory = rest.filter((post) => post.category === category);
          if (!inCategory.length) return null;
          return (
            <div key={category} className="border-t border-line py-10 first:pt-0">
              <div className="grid gap-3 pb-7 md:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)]">
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">{inCategory.length} {inCategory.length === 1 ? "guía" : "guías"}</p>
                <h2 className="font-body text-[clamp(1.55rem,2.4vw,2.2rem)] font-light leading-tight text-ink">{CATEGORY_ES[category]}</h2>
              </div>
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                {inCategory.map((post) => {
                  const image = imgBySlug.get(post.slug);
                  return <Link key={post.slug} href={"/es/blog/" + post.slug} className="group block min-w-0">
                    <span className="relative block aspect-[4/5] overflow-hidden bg-greige"><Image src={image?.url ?? "/portfolio/reception.webp"} alt={image?.alt || "Fotografía de quinceañera"} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" unoptimized={!image || image.url.startsWith("/portfolio/")} className="object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none" style={{ objectPosition: focal(image?.focus_x, image?.focus_y) }} /></span>
                    <span className="mt-4 block text-xs uppercase tracking-[0.12em] text-ink-soft">{post.readMinutes} min de lectura</span>
                    <span className="mt-2 block font-body text-[1.375rem] font-light leading-snug text-ink group-hover:underline group-hover:underline-offset-4">{post.title}</span>
                    <span className="mt-2 block line-clamp-2 text-base leading-7 text-ink-soft">{post.excerpt}</span>
                  </Link>;
                })}
              </div>
            </div>
          );
        })}
      </section>

    </>
  );
}
