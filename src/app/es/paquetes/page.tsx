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
    <section className="border-b border-line bg-white"><div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16"><p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">Foto y video de quinceañeras · Dallas–Fort Worth</p><h1 className="mt-6 max-w-[12ch] font-serif text-[clamp(3.5rem,7vw,7rem)] leading-[0.93] tracking-[-0.045em] text-ink">Precios claros para un día irrepetible.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-ink-soft">Cuatro maneras de recordar su celebración. Desde cinco horas de foto o video hasta la historia completa con dos artistas. Cada precio y depósito están aquí.</p><Link href="/es/consulta" className="mt-9 inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-white hover:bg-ink/85">Consulta su fecha <span aria-hidden className="ml-3">→</span></Link></div></section>
    <section className="bg-greige"><div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16"><h2 className="font-serif text-[clamp(2.7rem,5vw,4.5rem)] leading-none text-ink">Elige cómo recordarlo.</h2><div className="mt-10 grid gap-5 md:grid-cols-2">{packages.map((p) => <article key={p.id} className={`flex flex-col border p-7 sm:p-9 ${p.highlight ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"}`}><p className={`text-xs font-medium uppercase tracking-[0.2em] ${p.highlight ? "text-white/70" : "text-wine-deep"}`}>{p.highlight ? "La más elegida" : "Colección"}</p><div className="mt-4 flex flex-wrap items-baseline justify-between gap-3"><h3 className="font-serif text-4xl">{p.name}</h3><span className="font-serif text-4xl">{p.priceLabel}</span></div><p className={`mt-4 text-base leading-7 ${p.highlight ? "text-white/80" : "text-ink-soft"}`}>{teasers[p.id]}</p><ul className={`mt-8 space-y-3 border-t pt-6 text-sm leading-6 ${p.highlight ? "border-white/25 text-white/90" : "border-line text-ink-soft"}`}>{inclusions[p.id].map((item) => <li key={item}>✓ &nbsp;{item}</li>)}</ul><p className={`mt-7 text-sm ${p.highlight ? "text-white/75" : "text-ink-soft"}`}>Depósito para apartar: <strong>{p.depositLabel}</strong></p><Link href="/es/consulta" className={`mt-7 inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold ${p.highlight ? "bg-white text-ink" : "bg-ink text-white"}`}>Consultar disponibilidad →</Link></article>)}</div></div></section>
    <section className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16"><p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">Para planear sin sorpresas</p><h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4rem)] leading-none text-ink">Aparta ahora. Paga por etapas.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft">Tu depósito cuenta para el precio total. Podemos acordar pagos para el saldo antes de la celebración, sin intereses adicionales.</p><Link href="/es/planes-de-pago" className="mt-7 inline-flex text-sm font-semibold text-ink underline underline-offset-4">Conoce los planes de pago →</Link></section>
  </>;
}
