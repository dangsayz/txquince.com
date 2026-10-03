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
      <section aria-labelledby="blog-title" className="mx-auto max-w-[88rem] px-5 pb-14 pt-8 sm:px-8 sm:pt-12 lg:px-12">
        <figure>
          <div className="relative aspect-[4/3] overflow-hidden bg-greige sm:aspect-[16/8] lg:aspect-[16/7]">
            <Image src={hero?.url ?? "/portfolio/hero.webp"} alt={hero?.alt || "Fotografía de quinceañera en Dallas–Fort Worth"} fill priority sizes="(max-width: 1408px) 100vw, 1408px" unoptimized={(hero?.url ?? "").startsWith("/portfolio/")} className="object-cover" style={{ objectPosition: focal(hero?.focus_x, hero?.focus_y) }} />
          </div>
          <figcaption className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-soft">Historias y consejos / Dallas–Fort Worth</figcaption>
        </figure>
        <div className="mt-10 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:items-end md:gap-16">
          <div><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">La Guía del Quince</p><h1 id="blog-title" className="mt-4 max-w-[18ch] font-display text-[clamp(2rem,3.2vw,3rem)] font-normal leading-[1.14] text-ink">Planea su quinceañera con claridad.</h1></div>
          <div><p className="max-w-xl text-base leading-7 text-ink-soft">Costos, fechas y tradiciones para las familias de Dallas–Fort Worth. Respuestas concretas para preparar el día antes de tomar decisiones.</p><div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2"><a href="#guias" className="inline-flex min-h-11 items-center gap-4 whitespace-nowrap border-b border-ink text-base text-ink">Explorar guías ↓</a><Link href="/blog" hrefLang="en" className="inline-flex min-h-11 items-center text-base text-ink-soft underline underline-offset-4">Read in English</Link></div></div>
        </div>
      </section>

      {featured ? (
        <section aria-labelledby="featured-title" className="border-t border-line bg-white">
          <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
            <p className="mb-6 text-xs uppercase tracking-[0.18em] text-ink-soft">Una lectura para empezar</p>
            <Link href={"/es/blog/" + featured.slug} className="group grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
              <div className="relative aspect-[4/3] overflow-hidden bg-greige sm:aspect-[5/4] lg:aspect-[4/3]">
                <Image src={featuredImg?.url ?? "/portfolio/stockyards.webp"} alt={featuredImg?.alt || "Quinceañera"} fill sizes="(max-width: 1024px) 100vw, 55vw" unoptimized={(featuredImg?.url ?? "").startsWith("/portfolio/")} className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none" style={{ objectPosition: focal(featuredImg?.focus_x, featuredImg?.focus_y) }} />
              </div>
              <div><p className="text-xs uppercase tracking-[0.16em] text-ink-soft">{CATEGORY_ES[featured.category]} / Destacado</p><h2 id="featured-title" className="mt-4 max-w-[18ch] font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">{featured.title}</h2><p className="mt-4 max-w-xl text-base leading-7 text-ink-soft">{featured.excerpt}</p><span className="mt-6 inline-flex min-h-12 items-center gap-7 border-b border-ink text-base text-ink">Leer la guía <span aria-hidden="true">↗</span></span></div>
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
                <h2 className="font-display text-[clamp(1.55rem,2.4vw,2.2rem)] font-normal leading-tight text-ink">{CATEGORY_ES[category]}</h2>
              </div>
              <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
                {inCategory.map((post) => {
                  const image = imgBySlug.get(post.slug);
                  return <Link key={post.slug} href={"/es/blog/" + post.slug} className="group grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 border-t border-line pt-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-5">
                    <div className="relative aspect-[4/5] overflow-hidden bg-greige"><Image src={image?.url ?? "/portfolio/reception.webp"} alt={image?.alt || "Fotografía de quinceañera"} fill sizes="(max-width: 640px) 88px, 128px" unoptimized={(image?.url ?? "").startsWith("/portfolio/")} className="object-cover" style={{ objectPosition: focal(image?.focus_x, image?.focus_y) }} /></div>
                    <div className="min-w-0"><p className="text-xs uppercase tracking-[0.12em] text-ink-soft">{post.readMinutes} min de lectura</p><h3 className="mt-2 font-display text-lg font-normal leading-snug text-ink group-hover:underline group-hover:underline-offset-4 sm:text-xl">{post.title}</h3><p className="mt-2 hidden text-base leading-6 text-ink-soft sm:line-clamp-2">{post.excerpt}</p></div>
                  </Link>;
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section aria-labelledby="blog-next-title" className="bg-ink text-white"><div className="mx-auto flex max-w-[88rem] flex-col gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12"><div><p className="text-xs uppercase tracking-[0.18em] text-white/70">Cuando estés lista</p><h2 id="blog-next-title" className="mt-3 max-w-2xl font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight">Hablemos de su fecha.</h2><p className="mt-3 max-w-xl text-base leading-7 text-white/80">Cuéntanos tus planes. Confirmamos la disponibilidad antes de pedir un depósito.</p></div><Link href="/es/consulta" className="inline-flex min-h-12 shrink-0 items-center justify-between gap-8 self-start whitespace-nowrap border border-white px-6 text-base text-white">Consultar fecha <span aria-hidden="true">↗</span></Link></div></section>
    </>
  );
}
