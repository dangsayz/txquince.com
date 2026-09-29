import type { Metadata } from "next";
import Link from "next/link";
import { packages } from "@/content/packages";

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

export default function PaquetesPage() {
  return <>
    <section className="border-b border-line bg-white"><div className="mx-auto max-w-[90rem] px-5 py-16 text-center md:px-10 md:py-20 lg:px-16"><p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">Foto y video de quinceañeras · Dallas–Fort Worth</p><h1 className="mx-auto mt-5 max-w-[22ch] font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.15] tracking-[-0.03em] text-ink">Precios claros para un día irrepetible.</h1><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-soft">Cuatro maneras de recordar su celebración. Desde cinco horas de foto o video hasta la historia completa con dos artistas. Cada precio y depósito están aquí.</p><Link href="/es/consulta" className="mt-7 inline-flex min-h-12 items-center whitespace-nowrap rounded-lg bg-ink px-6 text-base font-medium text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Consulta su fecha <span aria-hidden className="ml-3">→</span></Link></div></section>
    <section className="bg-white"><div className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16"><h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">Elige cómo recordarlo.</h2><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{packages.map((p) => <article key={p.id} className={`flex flex-col rounded-lg border p-6 sm:p-7 ${p.highlight ? "border-ink bg-accent-soft text-ink" : "border-line bg-white text-ink"}`}><p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">{p.highlight ? "La más elegida" : "Colección"}</p><div className="mt-4 flex flex-wrap items-baseline justify-between gap-3"><h3 className="font-display text-[1.75rem]">{p.name}</h3><span className="font-display text-[1.75rem]">{p.priceLabel}</span></div><p className="mt-4 text-base leading-7 text-ink-soft">{teasers[p.id]}</p><ul className="mt-8 space-y-3 border-t border-line pt-6 text-base leading-6 text-ink-soft">{inclusions[p.id].map((item) => <li key={item}>✓ &nbsp;{item}</li>)}</ul><p className="mt-7 text-base text-ink-soft">Depósito para apartar: <strong>{p.depositLabel}</strong></p><Link href="/es/consulta" className="mt-auto inline-flex min-h-12 items-center justify-center rounded-lg bg-ink px-4 text-base font-medium text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Consultar disponibilidad →</Link></article>)}</div></div></section>
    <section className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16"><p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">Para planear sin sorpresas</p><h2 className="mt-4 font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">Aparta ahora. Paga por etapas.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft">Tu depósito cuenta para el precio total. Podemos acordar pagos para el saldo antes de la celebración, sin intereses adicionales.</p><Link href="/es/planes-de-pago" className="mt-7 inline-flex min-h-11 items-center text-base font-medium text-ink underline underline-offset-4">Conoce los planes de pago →</Link></section>
  </>;
}
