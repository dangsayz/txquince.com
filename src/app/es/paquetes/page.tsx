import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { packages, type CollectionId } from "@/content/packages";
import { getPageHero } from "@/lib/content-db";

export const metadata: Metadata = {
  title: "Paquetes de Foto y Video de Quinceañera — Dallas–Fort Worth",
  description: "Colecciones de fotografía y video de quinceañera en Dallas–Fort Worth desde $1,800. Precios, cobertura y depósitos publicados claramente.",
  alternates: { canonical: "/es/paquetes", languages: { "en-US": "/investment", "es-MX": "/es/paquetes" } },
  openGraph: { locale: "es_MX" },
};

const inclusions: Record<CollectionId, string[]> = {
  moments: ["Foto o video; un artista", "5 horas de cobertura", "Galería editada o video destacado"],
  essential: ["Foto o video; un artista", "Hasta 6 horas de cobertura", "Galería editada o video destacado", "Sesión Save-the-Date incluida"],
  signature: ["Foto y video; dos artistas", "Hasta 7 horas de cobertura", "Video destacado y galería completa", "Adelanto la misma semana", "Sesión Save-the-Date incluida"],
  legacy: ["Todo lo de Signature", "Video cinematográfico largo", "Cobertura aérea", "Hasta 8 horas y una segunda sesión de retratos", "Álbum premium y crédito de impresión"],
};
const descriptions: Record<CollectionId, string> = {
  moments: "Cinco horas para los momentos esenciales de su día, con un artista dedicado a fotografía o video.",
  essential: "La misa, los retratos y la recepción con un solo artista, más una sesión previa para comenzar la historia.",
  signature: "Dos artistas para narrar su día en fotografía y video, con un adelanto de imágenes esa misma semana.",
  legacy: "La historia completa: más tiempo, película larga, imágenes aéreas y un álbum para volver a sentirlo todo.",
};
const photographs = [
  { src: "/portfolio/reception.webp", alt: "Retrato de quinceañera con vestido rosa", position: "center 35%" },
  { src: "/portfolio/lilac-arch.webp", alt: "Quinceañera con vestido lila frente a su salón", position: "center 55%" },
  { src: "/portfolio/kimberly-reception.webp", alt: "Quinceañera bailando con su padre", position: "center 55%" },
  { src: "/portfolio/dance.webp", alt: "Bailarinas durante una celebración de quinceañera", position: "center 52%" },
] as const;
const process = [
  { title: "Comparte su fecha", body: "Elige la colección y cuéntanos cuándo será la celebración." },
  { title: "Confirmamos los detalles", body: "Revisamos la disponibilidad y la cobertura contigo antes de pedir un depósito." },
  { title: "Aparta el día", body: "Después de confirmar, te enviamos un enlace seguro para completar el depósito." },
] as const;

export default async function PaquetesPage() {
  const hero = await getPageHero("investment");
  return (
    <>
      <section aria-labelledby="paquetes-heading" className="bg-white px-5 pb-20 pt-20 text-center sm:px-8 sm:pb-28 sm:pt-28 lg:pb-36 lg:pt-36">
        <p className="text-xs uppercase tracking-[0.26em] text-ink-soft">Fotografía y video de quinceañera · Dallas–Fort Worth</p>
        <h1 id="paquetes-heading" className="mx-auto mt-7 max-w-[20ch] font-display text-[clamp(2.25rem,4vw,3.75rem)] font-light leading-[1.13] text-ink">Su quinceañera, en foto y video.</h1>
        <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-ink-soft">Cuatro formas de recordar los retratos, las tradiciones y a todas las personas que celebraron con ella. Aquí puedes ver precios y detalles antes de escribirnos.</p>
        <Link href="#colecciones" className="mt-9 inline-flex min-h-12 items-center justify-center gap-4 whitespace-nowrap border-b border-ink px-1 text-sm uppercase tracking-[0.15em] text-ink">Ver colecciones <span aria-hidden="true">↓</span></Link>
      </section>

      <section id="colecciones" aria-label="Colecciones de fotografía y video" className="scroll-mt-20">
        {packages.map((collection, index) => {
          const photo = photographs[index];
          const reversed = index % 2 === 1;
          const src = index === 0 ? (hero?.url ?? photo.src) : photo.src;
          const position = index === 0 && hero
            ? String(Math.round((hero.focus_x ?? 0.5) * 100)) + "% " + String(Math.round((hero.focus_y ?? 0.5) * 100)) + "%"
            : photo.position;
          return (
            <article key={collection.id} id={collection.id} className="scroll-mt-20 grid bg-ivory lg:min-h-[42rem] lg:grid-cols-2">
              <div className={"relative min-h-0 aspect-[4/5] overflow-hidden bg-greige sm:aspect-[6/5] lg:aspect-auto " + (reversed ? "lg:order-2" : "")}>
                <Image src={src} alt={index === 0 ? (hero?.alt || photo.alt) : photo.alt} fill unoptimized={src.startsWith("/portfolio/")} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" style={{ objectPosition: position }} priority={index === 0} />
              </div>
              <div className={"flex min-w-0 flex-col justify-center px-6 py-14 sm:px-12 sm:py-20 lg:px-[clamp(3rem,6vw,7rem)] " + (reversed ? "lg:order-1" : "")}>
                <p className="text-xs uppercase tracking-[0.24em] text-ink-soft">Colección 0{index + 1} / 04</p>
                <h2 className="mt-6 font-display text-[clamp(2.25rem,3.4vw,3.5rem)] font-light leading-[1.1] text-ink">{collection.name}</h2>
                <p className="mt-6 max-w-xl text-base leading-8 text-ink-soft">{descriptions[collection.id]}</p>
                <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
                  <div><p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Incluye</p><ul className="mt-5 space-y-3">{inclusions[collection.id].map((item) => <li key={item} className="text-sm leading-6 text-ink">{item}</li>)}</ul></div>
                  <div><p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Precio de la colección</p><p className="mt-5 font-display text-[clamp(1.75rem,2.2vw,2.5rem)] font-light leading-none text-ink">{collection.priceLabel}</p><p className="mt-4 text-sm leading-6 text-ink-soft">Depósito de {collection.depositLabel} después de confirmar su fecha. Se descuenta del total.</p></div>
                </div>
                <Link href="/es/consulta" className="mt-10 inline-flex min-h-12 w-fit items-center justify-center gap-6 whitespace-nowrap bg-ink px-6 text-xs uppercase tracking-[0.17em] text-white transition-colors hover:bg-accent-strong">Consultar {collection.name} <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          );
        })}
      </section>

      <section aria-labelledby="proceso-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="text-center"><p className="text-xs uppercase tracking-[0.24em] text-ink-soft">Después de elegir</p><h2 id="proceso-heading" className="mt-5 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light text-ink">Cómo seguimos</h2></div>
        <ol className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-12">{process.map((step, index) => <li key={step.title}><span className="font-display text-3xl font-light text-ink-soft">0{index + 1}</span><h3 className="mt-6 text-lg font-normal text-ink">{step.title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-ink-soft">{step.body}</p></li>)}</ol>
        <p className="mt-14 border-t border-line pt-6 text-base leading-7 text-ink-soft">Puedes pagar el saldo por etapas. <Link href="/es/planes-de-pago" className="text-ink underline underline-offset-4">Conoce los planes de pago ↗</Link></p>
      </section>

      <section aria-labelledby="paquetes-next-heading" className="bg-ink px-5 py-20 text-center text-white sm:px-8 sm:py-28">
        <p className="text-xs uppercase tracking-[0.24em] text-white/70">El siguiente paso</p>
        <h2 id="paquetes-next-heading" className="mx-auto mt-5 max-w-3xl font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light leading-tight">Todo empieza con su fecha.</h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/80">Cuéntanos cuándo y dónde será la celebración. Confirmamos la disponibilidad antes de pedir un depósito.</p>
        <Link href="/es/consulta" className="mt-8 inline-flex min-h-12 items-center justify-center gap-6 whitespace-nowrap border border-white px-6 text-xs uppercase tracking-[0.17em] text-white">Consultar fecha <span aria-hidden="true">↗</span></Link>
      </section>
    </>
  );
}
