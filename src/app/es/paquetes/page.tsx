import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { packages } from "@/content/packages";
import { getPageHero } from "@/lib/content-db";

export const metadata: Metadata = {
  title: "Paquetes de Foto y Video de Quinceañera — Dallas–Fort Worth",
  description: "Colecciones de fotografía y video de quinceañera en Dallas–Fort Worth desde $1,800. Precios, cobertura y depósitos publicados claramente.",
  alternates: { canonical: "/es/paquetes", languages: { "en-US": "/investment", "es-MX": "/es/paquetes" } },
  openGraph: { locale: "es_MX" },
};

const inclusions: Record<string, string[]> = {
  moments: ["Foto o video; un artista", "5 horas de cobertura", "Galería editada o video destacado"],
  essential: ["Foto o video; un artista", "Hasta 6 horas de cobertura", "Galería editada o video destacado", "Sesión Save-the-Date incluida"],
  signature: ["Foto y video; dos artistas", "Hasta 7 horas de cobertura", "Video destacado y galería completa", "Adelanto la misma semana", "Sesión Save-the-Date incluida"],
  legacy: ["Todo lo de Signature", "Video cinematográfico largo", "Cobertura aérea", "Hasta 8 horas y una segunda sesión de retratos", "Álbum premium y crédito de impresión"],
};
const teasers: Record<string, string> = {
  moments: "Foto o video con un artista durante cinco horas esenciales.",
  essential: "Foto o video para los momentos principales del día, con sesión previa incluida.",
  signature: "Foto y video con dos artistas, el día completo y un adelanto la misma semana.",
  legacy: "Todo lo de Signature, más video largo, cobertura aérea y álbum premium.",
};

export default async function PaquetesPage() {
  const hero = await getPageHero("investment");
  return <>
    <section aria-labelledby="paquetes-heading" className="mx-auto grid max-w-[88rem] gap-8 px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16 lg:px-12 lg:py-20">
      <div className="order-2 max-w-xl lg:order-1">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Foto y video · Dallas–Fort Worth</p>
        <h1 id="paquetes-heading" className="mt-5 max-w-[18ch] font-display text-[clamp(2rem,3.2vw,3rem)] font-normal leading-[1.14] text-ink">Un recuerdo a su manera.</h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">Cuatro colecciones para contar su historia. Compara la cobertura, el precio y el depósito antes de consultar su fecha.</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link href="#colecciones" className="inline-flex min-h-12 items-center justify-center gap-5 whitespace-nowrap bg-ink px-6 text-base text-white">Ver colecciones <span aria-hidden="true">↓</span></Link>
          <Link href="/portfolio" className="inline-flex min-h-12 items-center gap-3 whitespace-nowrap border-b border-ink text-base text-ink">Ver fotografías <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <figure className="order-1 lg:order-2">
        <div className="relative aspect-[4/3] overflow-hidden bg-greige sm:aspect-[5/4] lg:aspect-[4/5]">
          <Image src={hero?.url ?? "/portfolio/reception.webp"} alt="Retrato de quinceañera durante su celebración" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" style={hero ? { objectPosition: `${Math.round((hero.focus_x ?? 0.5) * 100)}% ${Math.round((hero.focus_y ?? 0.5) * 100)}%` } : { objectPosition: "center 35%" }} />
        </div>
        <figcaption className="mt-3 flex justify-between gap-4 text-xs uppercase tracking-[0.14em] text-ink-soft"><span>Su día, en imágenes</span><span>TX Quince / DFW</span></figcaption>
      </figure>
    </section>
    <section id="colecciones" aria-labelledby="colecciones-heading" className="scroll-mt-24 border-t border-line bg-white">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-5 border-b border-line pb-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] md:items-end">
          <div><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Fotografía y cine</p><h2 id="colecciones-heading" className="mt-3 font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">Las colecciones.</h2></div>
          <p className="max-w-md text-base leading-7 text-ink-soft">Precios en dólares. El depósito forma parte del total y se paga después de confirmar la disponibilidad.</p>
        </div>
        <div className="divide-y divide-line">
          {packages.map((collection, index) => <article key={collection.id} id={collection.id} className="scroll-mt-24 grid gap-6 py-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10 lg:py-12">
            <div><p className="text-xs uppercase tracking-[0.16em] text-ink-soft">0{index + 1} / 04{collection.highlight ? " · La más elegida" : ""}</p><h3 className="mt-3 font-display text-[clamp(1.75rem,2.7vw,2.4rem)] font-normal leading-tight text-ink">{collection.name}</h3><p className="mt-2 max-w-sm text-base leading-7 text-ink-soft">{teasers[collection.id]}</p></div>
            <div><div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-line pb-5"><p className="font-display text-[clamp(1.75rem,2.5vw,2.25rem)] font-normal leading-none text-ink">{collection.priceLabel}</p><p className="text-base text-ink-soft">Depósito: {collection.depositLabel}</p></div><ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">{inclusions[collection.id].map((item) => <li key={item} className="flex gap-3 text-base leading-6 text-ink-soft"><span aria-hidden="true" className="text-ink">—</span><span>{item}</span></li>)}</ul><Link href="/es/consulta" className="mt-8 inline-flex min-h-12 items-center gap-8 whitespace-nowrap border-b border-ink text-base font-medium text-ink">Consultar {collection.name} <span aria-hidden="true">↗</span></Link></div>
          </article>)}
        </div>
        <p className="border-t border-line pt-6 text-base leading-7 text-ink-soft">También puedes pagar el saldo por etapas. Confirmaremos la fecha y la cobertura antes de enviarte un enlace seguro para el depósito. <Link href="/es/planes-de-pago" className="underline underline-offset-4">Conoce los planes de pago ↗</Link></p>
      </div>
    </section>
    <section className="bg-ink text-white"><div className="mx-auto flex max-w-[88rem] flex-col gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12"><div><p className="text-xs uppercase tracking-[0.18em] text-white/70">El siguiente paso</p><h2 className="mt-3 max-w-2xl font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight">Todo empieza con su fecha.</h2><p className="mt-3 max-w-xl text-base leading-7 text-white/80">Cuéntanos cuándo y dónde será la celebración. Confirmaremos la disponibilidad antes de pedir un depósito.</p></div><Link href="/es/consulta" className="inline-flex min-h-12 shrink-0 items-center justify-between gap-8 self-start whitespace-nowrap border border-white px-6 text-base text-white">Consultar fecha <span aria-hidden="true">↗</span></Link></div></section>
  </>;
}
