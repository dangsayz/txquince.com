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
      <header className="bg-white px-4 pt-5 sm:px-6 md:px-10 md:pt-8">
        <div className="relative mx-auto min-h-[50svh] max-w-[92rem] overflow-hidden bg-ink sm:min-h-[65svh]">
          <Image src={heroPhoto?.url ?? "/portfolio/canal.webp"} alt={heroPhoto?.alt || "Retrato de quinceañera en Dallas–Fort Worth"} fill priority unoptimized={!heroPhoto} sizes="(max-width: 1472px) 100vw, 1472px" className="object-cover" />
          <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
          <div className="relative flex min-h-[50svh] flex-col items-center justify-center px-6 py-20 text-center text-white sm:min-h-[65svh]">
            <p className="text-[0.6875rem] uppercase tracking-[0.28em]">Salones / Dallas–Fort Worth</p>
            <h1 className="mt-5 max-w-[19ch] font-body text-[clamp(2.25rem,4.4vw,4rem)] font-light leading-[1.14] tracking-[-0.035em]">El lugar también cuenta su historia.</h1>
            <a href="#lugares" className="mt-8 inline-flex min-h-11 items-center border-b border-white/80 text-xs uppercase tracking-[0.18em]">Explorar lugares <span className="ml-3" aria-hidden="true">↓</span></a>
          </div>
        </div>
        <p className="mx-auto max-w-[92rem] px-2 py-9 text-center font-serif text-lg leading-relaxed text-ink-soft sm:py-12 sm:text-xl">Explora salones, jardines y espacios de celebración. Mira las fotografías disponibles de cada lugar y encuentra ideas para su día.</p>
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
                      {venue.image ? <Image src={venue.image} alt={venue.alt || `Quinceañera en ${venue.venue}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /> : <span className="absolute inset-0 flex items-end p-5 font-serif text-lg italic text-ink-soft">Fotografías próximamente</span>}
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
    </>
  );
}
