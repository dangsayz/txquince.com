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
  const groups = new Map<string, { venue: string; slug: string; count: number; image: string | null; alt: string | null }[]>();
  venues.forEach((venue, index) => groups.set(venue.city, [
    ...(groups.get(venue.city) ?? []),
    { venue: venue.venue, slug: venue.slug, count: photos[index].length, image: photos[index][0]?.url ?? null, alt: photos[index][0]?.alt ?? null },
  ]));

  return (
    <>
      <header className="border-b border-line bg-white px-5 pb-14 pt-14 text-center md:px-10 md:pb-20 md:pt-20">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">Salones · Dallas–Fort Worth</p>
        <h1 className="mx-auto mt-5 max-w-[22ch] font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.15] tracking-[-0.03em] text-ink">Lugares que ya conocemos.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-soft">Salones, jardines y centros de eventos donde hemos fotografiado quinceañeras reales. Encuentra tu lugar y mira cómo se ve una celebración ahí.</p>
      </header>
      {[...groups.entries()].map(([city, list]) => (
        <section key={city} className="border-b border-line bg-white py-14 md:py-20">
          <div className="mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
            <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">{city}, TX</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((venue) => (
                <li key={venue.slug}>
                  <Link href={`/venues/${venue.slug}`} hrefLang="en" className="group block overflow-hidden rounded-lg border border-line bg-white transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                    <div className="relative aspect-[4/3] bg-greige">
                      {venue.image ? <Image src={venue.image} alt={venue.alt || `Quinceañera en ${venue.venue}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /> : null}
                    </div>
                    <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-4">
                      <span className="text-base font-medium text-ink">{venue.venue}</span>
                      <span className="shrink-0 text-sm text-ink-soft">{venue.count} fotos · EN</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
      <section className="bg-accent-soft py-16 md:py-20">
        <div className="mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
          <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">¿Ya elegiste el salón?</h2>
          <p className="mt-4 text-base leading-7 text-ink-soft">Cuéntanos dónde será y revisamos tu fecha.</p>
          <Link href="/es/consulta" className="mt-7 inline-flex min-h-12 items-center whitespace-nowrap rounded-lg bg-ink px-6 text-base font-medium text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Consulta su fecha →</Link>
        </div>
      </section>
    </>
  );
}
