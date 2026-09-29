import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { EditOverlay } from "@/components/EditMode";
import { getFeaturedImages, getHeroMedia, getVideos } from "@/lib/content-db";
import { VideoGallery } from "@/components/VideoGallery";
import { packages } from "@/content/packages";
import { locations } from "@/content/locations";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { heroObjectPosition } from "@/lib/hero-focus";
import { publicPhotoCopy } from "@/lib/public-photo-copy";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Fotografía y Video de Quinceañeras en Dallas–Fort Worth",
  description: "Fotos y video de quinceañera en Dallas–Fort Worth. Celebraciones reales, precios claros desde $1,800 y una respuesta personal en 24 horas.",
  alternates: { canonical: "/es", languages: { "en-US": "/", "es-MX": "/es" } },
  openGraph: { locale: "es_MX" },
};

export default async function InicioEs() {
  const [images, videos, heroMedia] = await Promise.all([getFeaturedImages(12), getVideos(), getHeroMedia()]);
  const displayImages = images.length ? images : portfolioFallback.filter((image) => image.slug !== "domed-ballroom-portrait");
  const featuredHero = images[0];
  const heroUrl = heroMedia?.kind === "image" && heroMedia.imageUrl
    ? heroMedia.imageUrl
    : heroMedia?.kind === "video" && heroMedia.posterUrl
      ? heroMedia.posterUrl
      : displayImages[0]?.url;
  const heroAlt = heroMedia?.kind === "image"
    ? heroMedia.imageAlt
    : heroMedia?.kind === "video" && heroMedia.posterUrl
      ? "Fotograma de una quinceañera"
    : featuredHero
      ? publicPhotoCopy(featuredHero, altPhraseFor(featuredHero.section)).alt
      : displayImages[0]?.alt || "Quinceañera en Dallas–Fort Worth";
  const heroPosition = heroMedia?.kind === "image"
    ? heroObjectPosition(heroMedia)
    : `${Math.round((featuredHero?.focus_x ?? 0.5) * 100)}% ${Math.round((featuredHero?.focus_y ?? 0.7) * 100)}%`;
  const supportingImages = displayImages.filter((image) => image.url !== heroUrl).slice(0, 2);
  return <>
    <section className="border-b border-line bg-white" aria-labelledby="inicio-titulo">
      <div className="mx-auto grid max-w-[88rem] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8 lg:px-8 xl:gap-12 xl:px-12">
        <div className="relative h-[clamp(16rem,39svh,21rem)] overflow-hidden bg-greige sm:h-[26rem] lg:h-[clamp(34rem,55vw,42rem)]">
          {heroUrl ? (
            <Link href="/portfolio" className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" aria-label="Ver el portafolio de quinceañeras">
              <Image src={heroUrl} alt={heroAlt} fill priority fetchPriority="high" decoding="sync" unoptimized={heroUrl.startsWith("/portfolio/")} sizes="(max-width: 1023px) 100vw, (max-width: 1440px) 46vw, 36rem" className="object-cover" style={{ objectPosition: heroPosition }} />
            </Link>
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-base text-ink-soft">Las fotografías no están disponibles por ahora.</div>
          )}
          {heroMedia?.kind === "image"
            ? <EditOverlay image={{ alt: heroAlt }} editHref="/admin/hero#framing" label="Set focal point" />
            : featuredHero && heroUrl === featuredHero.url && <EditOverlay image={{ id: featuredHero.id, slug: featuredHero.slug, alt: heroAlt, fx: featuredHero.focus_x, fy: featuredHero.focus_y }} />}
        </div>
        <div className="flex min-w-0 flex-col justify-between px-5 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-9 lg:px-0 lg:pb-0 lg:pt-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft sm:text-sm">Dallas–Fort Worth · Fotografía y video de quinceañeras</p>
            <h1 id="inicio-titulo" className="mt-4 max-w-[22ch] font-display text-[clamp(1.875rem,3vw,2.5rem)] font-normal leading-[1.14] tracking-[-0.035em] text-ink sm:mt-6">Su quinceañera es mucho más que el vestido.</h1>
            <p className="mt-4 max-w-[31rem] text-base leading-7 text-ink-soft sm:mt-5">Los retratos, las tradiciones, las personas a su lado. Fotografía y video de un día hecho a su manera.</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 sm:mt-8">
              <Link href="/es/consulta" className="inline-flex min-h-12 items-center justify-center gap-4 whitespace-nowrap rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Consulta su fecha <span aria-hidden="true">↗</span></Link>
              <Link href="/portfolio" className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap border-b border-ink text-base font-medium text-ink transition-colors hover:border-ink-soft hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Ver el portafolio <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          {supportingImages.length > 0 && (
            <div className="mt-7 grid grid-cols-2 gap-3 lg:mt-0" aria-label="Más fotografías de quinceañeras">
              {supportingImages.map((image) => (
                <figure key={image.url} className="min-w-0">
                  <div className="relative aspect-[4/5] overflow-hidden bg-greige sm:aspect-[8/5]">
                    <Link href="/portfolio" className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" aria-label="Ver más fotografías de quinceañeras">
                      <Image src={image.url} alt={publicPhotoCopy(image, "Retrato de quinceañera").alt} fill sizes="(max-width: 1023px) 45vw, (max-width: 1440px) 24vw, 20rem" unoptimized={!images.length} className="object-cover" />
                    </Link>
                  </div>
                  <figcaption className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">Fotografía de quinceañera</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16"><div className="grid gap-8 md:grid-cols-12"><div className="md:col-span-5"><p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">Celebraciones reales</p><h2 className="mt-4 font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">Mira lo que recordarán.</h2></div><p className="max-w-md self-end text-base leading-7 text-ink-soft md:col-span-5 md:col-start-8">Familias reales, salones reales y una historia diferente en cada quinceañera. Conoce el trabajo antes de reservar.</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{displayImages.slice(1, 7).map((img) => <div key={img.url} className="relative aspect-[4/5] overflow-hidden rounded-lg bg-greige"><Image src={img.url} alt={publicPhotoCopy(img, "Retrato de quinceañera").alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /></div>)}</div><Link href="/portfolio" className="mt-8 inline-flex min-h-11 items-center text-base font-medium text-ink underline underline-offset-4">Ver el portafolio →</Link></section>
    {videos.length > 0 ? <section className="border-y border-line bg-white"><div className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16"><h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">El día también se escucha.</h2><p className="mb-9 mt-4 text-base leading-7 text-ink-soft">La música, las palabras y las risas que una foto no puede guardar.</p><VideoGallery videos={videos.filter((v) => v.orientation !== "vertical").slice(0, 3)} /><Link href="/es/videografo-de-quinceaneras" className="mt-8 inline-flex min-h-11 items-center text-base font-medium text-ink underline underline-offset-4">Ver los videos →</Link></div></section> : null}
    <section className="bg-white"><div className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16"><p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">Colecciones sin sorpresas</p><h2 className="mt-4 font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">Una forma de recordarla, a tu medida.</h2><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{packages.map((p) => <Link key={p.id} href="/es/paquetes" className="group flex min-h-52 flex-col rounded-lg border border-line bg-white p-6 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"><h3 className="font-display text-[1.5rem] text-ink">{p.name}</h3><p className="mt-6 font-display text-[1.75rem] text-ink">{p.priceLabel}</p><p className="mt-2 text-base text-ink-soft">Depósito: {p.depositLabel}</p><span className="mt-auto inline-flex min-h-11 items-center text-base text-ink underline underline-offset-4">Ver detalles →</span></Link>)}</div><Link href="/es/planes-de-pago" className="mt-8 inline-flex min-h-11 items-center text-base font-medium text-ink underline underline-offset-4">Conoce los planes de pago →</Link></div></section>
    <section className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16"><h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">En todo Dallas–Fort Worth.</h2><p className="mt-4 max-w-xl text-base leading-7 text-ink-soft">De la iglesia al salón, acompañamos a familias en toda la región.</p><div className="mt-9 flex flex-wrap gap-3">{locations.map((l) => <Link key={l.slug} href={`/es/fotografo-de-quinceaneras/${l.slug}`} className="inline-flex min-h-11 items-center rounded-lg border border-line px-5 text-base text-ink hover:border-ink">{l.city}</Link>)}</div><Link href="/es/salones" className="mt-8 inline-flex min-h-11 items-center text-base font-medium text-ink underline underline-offset-4">Explora los salones →</Link></section>
    <section className="bg-accent-soft"><div className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16"><p className="text-xs uppercase tracking-[0.16em] text-ink-soft">Solo una celebración por día</p><h2 className="mt-5 font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">¿Está libre su fecha?</h2><Link href="/es/consulta" className="mt-7 inline-flex min-h-12 items-center whitespace-nowrap rounded-lg bg-ink px-6 text-base font-medium text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Consulta su fecha →</Link></div></section>
  </>;
}
