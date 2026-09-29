import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { getAllEsPosts, type BlogCategory } from "@/content/blog";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { getFeaturedImages, getPageHero } from "@/lib/content-db";
import { Reveal } from "@/components/Reveal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Guía de Quinceañera (Dallas–Fort Worth)",
  description:
    "Guías honestas y sin adivinanzas para planear una quinceañera en Dallas–Fort Worth: costos reales, fechas, tradiciones y cómo elegir a tu fotógrafo y equipo de video.",
  alternates: {
    canonical: "/es/blog",
    languages: { "es-MX": "/es/blog", "en-US": "/blog" },
  },
  openGraph: {
    locale: "es_MX",
    title: "Guía de Quinceañera · TX Quince",
    description: "Costos reales, fechas, tradiciones y cómo elegir a tu fotógrafo en Dallas–Fort Worth.",
    url: `${site.url}/es/blog`,
  },
};

const CATEGORY_ES: Record<BlogCategory, string> = {
  "Cost & Budget": "Costo y presupuesto",
  Planning: "Planeación",
  Traditions: "Tradiciones",
  "Photography & Film": "Foto y video",
  Locations: "Lugares",
};
const CATEGORY_ORDER: BlogCategory[] = [
  "Cost & Budget",
  "Planning",
  "Traditions",
  "Photography & Film",
  "Locations",
];

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.35) * 100)}%`;
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
      <section className="mx-auto max-w-[90rem] px-5 pb-14 pt-12 md:px-10 md:pb-20 md:pt-16 lg:px-16 lg:pt-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-ink-soft">La Guía del Quince</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.14] text-ink text-balance">Planea su quinceañera sin adivinar.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-ink-soft">
            Costos reales, fechas reales y las tradiciones que hacen el día — escrito para las familias
            de Dallas–Fort Worth, para que sepa exactamente qué esperar antes de gastar un solo dólar.
          </p>
          <Link href="#guias" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            Explora las guías <span aria-hidden className="ml-3">→</span>
          </Link>
        </Reveal>
        <div className="mt-6 flex justify-center">
          <Link href="/blog" hrefLang="en" className="inline-flex min-h-11 items-center text-base text-ink-soft underline underline-offset-4 hover:text-ink">
            Read in English
          </Link>
        </div>
        <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-lg bg-greige sm:mt-12 sm:aspect-[16/8] lg:aspect-[16/7]">
          {hero?.url ? <Image src={hero.url} alt={hero.alt || "Quinceañera en Dallas–Fort Worth"} fill priority sizes="(max-width: 1024px) 100vw, 1440px" unoptimized={hero.url.startsWith("/portfolio/")} className="object-cover" style={{ objectPosition: focal(hero.focus_x, hero.focus_y) }} /> : null}
        </div>
      </section>

      {featured ? (
        <section className="mx-auto mt-12 max-w-[90rem] px-5 md:mt-16 md:px-10 lg:px-16">
          <Reveal>
            <Link href={`/es/blog/${featured.slug}`} className="group grid overflow-hidden rounded-lg border border-line bg-white md:grid-cols-[1.15fr_1fr] md:items-center">
              <div className="relative aspect-[4/3] overflow-hidden bg-greige md:h-full md:min-h-[22rem]">
                {featuredImg?.url ? <Image src={featuredImg.url} alt={featuredImg.alt || "Quinceañera"} fill sizes="(max-width: 768px) 100vw, 55vw" unoptimized={featuredImg.url.startsWith("/portfolio/")} className="object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none" style={{ objectPosition: focal(featuredImg.focus_x, featuredImg.focus_y) }} /> : null}
              </div>
              <div className="p-6 md:p-8 lg:p-10">
                <p className="text-sm font-medium text-ink-soft">{CATEGORY_ES[featured.category]} · Destacado</p>
                <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.12] text-ink">{featured.title}</h2>
                <p className="mt-4 max-w-md text-base leading-7 text-ink-soft">{featured.excerpt}</p>
                <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-base font-medium text-ink">Leer la guía <span aria-hidden>→</span></span>
              </div>
            </Link>
          </Reveal>
        </section>
      ) : null}

      <section id="guias" className="mx-auto mt-16 max-w-[90rem] scroll-mt-24 px-5 pb-section md:mt-24 md:px-10 lg:px-16 md:pb-section-lg">
        {CATEGORY_ORDER.map((cat) => {
          const inCat = rest.filter((p) => p.category === cat);
          if (inCat.length === 0) return null;
          return (
            <div key={cat} className="mt-16 first:mt-0">
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <h2 className="font-display text-2xl text-ink md:text-[1.7rem]">{CATEGORY_ES[cat]}</h2>
                <span className="shrink-0 text-sm text-ink-faint">
                  {inCat.length} {inCat.length === 1 ? "guía" : "guías"}
                </span>
              </div>
              <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {inCat.map((p, i) => {
                  const image = imgBySlug.get(p.slug) ?? null;
                  return (
                    <Reveal key={p.slug} delay={(i % 3) * 70}>
                      <Link href={`/es/blog/${p.slug}`} className="group block h-full overflow-hidden rounded-lg border border-line bg-white">
                        <div className="relative aspect-[4/3] overflow-hidden bg-greige">
                          {image?.url ? <Image src={image.url} alt={image.alt || "Quinceañera"} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw" unoptimized={image.url.startsWith("/portfolio/")} className="object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none" style={{ objectPosition: focal(image.focus_x, image.focus_y) }} /> : null}
                        </div>
                        <div className="p-5">
                          <p className="text-sm text-ink-soft">{CATEGORY_ES[cat]} · {p.readMinutes} min de lectura</p>
                          <h3 className="mt-2 font-display text-xl leading-snug text-ink group-hover:text-accent">{p.title}</h3>
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

      <section className="bg-ivory px-5 py-16 md:px-10 md:py-20 lg:px-16">
        <div className="mx-auto max-w-3xl rounded-lg border border-line bg-white px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2 className="font-display text-[clamp(1.875rem,2.8vw,2.625rem)] leading-tight text-ink text-balance">Reserva la fecha de su quinceañera</h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-ink-soft">
            Le confirmo que su fecha está disponible y le envío un enlace seguro para el depósito. Sin pago ahora mismo.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/reserve" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Reservar mi fecha
            </Link>
            <Link href="/check-your-date" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-md border border-line px-6 text-base font-medium text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Ver si mi fecha está libre
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
