import type { Metadata } from "next";
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
  const counts = await Promise.all(venues.map((v) => getImagesByVenue(v.slug)));
  const groups = new Map<string, { venue: string; slug: string; count: number }[]>();
  venues.forEach((v, i) => groups.set(v.city, [...(groups.get(v.city) ?? []), { venue: v.venue, slug: v.slug, count: counts[i].length }]));
  return <><section className="border-b border-line bg-white"><div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16"><p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">Salones · Dallas–Fort Worth</p><h1 className="mt-6 max-w-[12ch] font-serif text-[clamp(3.4rem,7vw,7rem)] leading-[0.93] tracking-[-0.04em] text-ink">Lugares que ya conocemos.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-ink-soft">Salones, jardines y centros de eventos donde hemos fotografiado quinceañeras reales. Encuentra tu lugar y mira cómo se ve una celebración ahí.</p></div></section>{[...groups.entries()].map(([city, list]) => <section key={city} className="border-b border-line bg-white"><div className="mx-auto max-w-[90rem] px-5 py-12 md:px-10 md:py-16 lg:px-16"><h2 className="font-serif text-[clamp(2rem,4vw,3.3rem)] text-ink">{city}, TX</h2><ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map((v) => <li key={v.slug}><Link href={`/venues/${v.slug}`} hrefLang="en" className="flex min-h-14 items-center justify-between gap-3 border border-line bg-ivory px-5 py-3 text-ink hover:border-ink"><span>{v.venue}</span><span className="shrink-0 text-xs text-ink-soft">{v.count} fotos · EN</span></Link></li>)}</ul></div></section>)}<section className="bg-ink"><div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 lg:px-16"><h2 className="font-serif text-[clamp(2.8rem,5vw,4.5rem)] text-white">¿Ya elegiste el salón?</h2><p className="mt-4 text-base text-white/75">Cuéntanos dónde será y revisamos tu fecha.</p><Link href="/es/consulta" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-white px-7 text-sm font-semibold text-ink">Consulta su fecha →</Link></div></section></>;
}
