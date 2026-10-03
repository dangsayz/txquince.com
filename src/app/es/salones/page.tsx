import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { venues } from "@/content/venues";
import { getImagesByVenue } from "@/lib/content-db";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Salones de Quinceañera en Dallas–Fort Worth",
  description: "Explora salones de quinceañera en Dallas–Fort Worth donde hemos fotografiado celebraciones reales. Encuentra tu lugar y consulta tu fecha.",
  alternates: { canonical: "/es/salones", languages: { "en-US": "/venues", "es-MX": "/es/salones" } },
  openGraph: { locale: "es_MX" },
};

export default async function SalonesPage() {
  const photos = await Promise.all(venues.map((venue) => getImagesByVenue(venue.slug)));
  const heroPhoto = photos.flat().find((photo) => Boolean(photo.url)) ?? null;
  const groups = new Map<string, { venue: string; slug: string; count: number; image: string | null; alt: string | null }[]>();
  venues.forEach((venue, index) => groups.set(venue.city, [
    ...(groups.get(venue.city) ?? []),
    { venue: venue.venue, slug: venue.slug, count: photos[index].length, image: photos[index][0]?.url ?? null, alt: photos[index][0]?.alt ?? null },
  ]));

  return (
    <>
      <header className="mx-auto grid max-w-[88rem] gap-8 px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-16 lg:px-12">
        <figure className="min-w-0">
          <div className="relative aspect-[4/3] overflow-hidden bg-greige sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image src={heroPhoto?.url ?? "/portfolio/canal.webp"} alt={heroPhoto?.alt || "Retrato de quinceañera en Dallas–Fort Worth"} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
          </div>
          <figcaption className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-soft">Celebraciones en Dallas–Fort Worth</figcaption>
        </figure>
        <div className="max-w-xl lg:pb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Salones / Dallas–Fort Worth</p>
          <h1 className="mt-5 max-w-[19ch] font-display text-[clamp(2rem,3.2vw,3rem)] font-normal leading-[1.14] text-ink">El lugar también cuenta su historia.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">Explora salones, jardines y espacios de celebración. Mira las fotografías disponibles de cada lugar y encuentra ideas para su día.</p>
          <a href="#lugares" className="mt-8 inline-flex min-h-12 items-center gap-8 whitespace-nowrap border-b border-ink text-base text-ink">Explorar lugares <span aria-hidden="true">↓</span></a>
        </div>
      </header>
      <div id="lugares" className="scroll-mt-24" />
      {[...groups.entries()].map(([city, list]) => (
        <section key={city} className="border-t border-line bg-white py-14 md:py-20">
          <div className="mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-3 border-b border-line pb-7 md:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)]"><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Galerías por ciudad</p><h2 className="font-display text-[clamp(1.75rem,2.6vw,2.4rem)] font-normal leading-tight text-ink">{city}, TX</h2></div>
            <ul className="mt-8 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((venue) => (
                <li key={venue.slug}>
                  <Link href={`/venues/${venue.slug}`} hrefLang="en" className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                    <div className="relative aspect-[4/3] bg-greige">
                      {venue.image ? <Image src={venue.image} alt={venue.alt || `Quinceañera en ${venue.venue}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /> : null}
                    </div>
                    <div className="flex min-h-16 items-start justify-between gap-4 border-b border-line py-4">
                      <span className="text-base font-medium text-ink group-hover:underline group-hover:underline-offset-4">{venue.venue}</span>
                      <span className="shrink-0 text-xs uppercase tracking-[0.12em] text-ink-soft">{venue.count ? `${venue.count} fotos` : "Ver lugar"} · EN</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
      <section className="bg-ink py-14 text-white">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
          <div><p className="text-xs uppercase tracking-[0.18em] text-white/70">El siguiente paso</p><h2 className="mt-3 font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight">¿Ya elegiste el salón?</h2><p className="mt-3 text-base leading-7 text-white/80">Cuéntanos dónde será y revisamos tu fecha.</p></div>
          <Link href="/es/consulta" className="inline-flex min-h-12 items-center justify-between gap-8 self-start whitespace-nowrap border border-white px-6 text-base text-white">Consultar fecha <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
