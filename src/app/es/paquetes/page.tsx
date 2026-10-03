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
      <header aria-labelledby="paquetes-heading" className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-ink text-white sm:min-h-[80svh]">
        <Image src={hero?.url ?? "/portfolio/red-garden.webp"} alt={hero?.alt || "Retrato de quinceañera en Dallas–Fort Worth"} fill priority unoptimized={!hero} sizes="100vw" className="object-cover" style={{ objectPosition: hero ? `${Math.round((hero.focus_x ?? 0.5) * 100)}% ${Math.round((hero.focus_y ?? 0.5) * 100)}%` : "center 36%" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-white/85">Fotografía y video · Dallas–Fort Worth</p>
          <h1 id="paquetes-heading" className="mt-5 max-w-[24ch] font-display text-[clamp(2.15rem,4vw,4rem)] font-light leading-[1.14]">Servicios e inversión</h1>
        </div>
      </header>

      <section className="bg-ivory px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-[78rem] gap-9 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:gap-20">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Las colecciones</p>
          <div><p className="max-w-[27ch] font-display text-[clamp(1.8rem,3vw,3rem)] font-light leading-[1.25] text-ink">Su quinceañera, en foto y video.</p><p className="mt-6 max-w-xl text-base leading-8 text-ink-soft">Cuatro formas de recordar los retratos, las tradiciones y a todas las personas que celebraron con ella. Aquí puedes ver precios y detalles antes de escribirnos.</p><Link href="#colecciones" className="mt-7 inline-flex min-h-12 items-center gap-4 border-b border-ink text-xs uppercase tracking-[0.16em] text-ink">Ver colecciones <span aria-hidden="true">↓</span></Link></div>
        </div>
      </section>

      <section id="colecciones" aria-label="Colecciones de fotografía y video" className="scroll-mt-20 bg-white px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-[84rem] space-y-24 lg:space-y-36">
        {packages.map((collection, index) => {
          const photo = photographs[index];
          const reversed = index % 2 === 1;
          const src = photo.src;
          const position = photo.position;
          return (
            <article key={collection.id} id={collection.id} className="scroll-mt-20 grid gap-9 lg:grid-cols-[minmax(0,0.47fr)_minmax(0,0.53fr)] lg:items-center lg:gap-[clamp(3rem,8vw,9rem)]">
              <div className={"relative aspect-[4/5] overflow-hidden bg-greige " + (reversed ? "lg:order-2" : "")}>
                <Image src={src} alt={photo.alt} fill unoptimized sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" style={{ objectPosition: position }} />
              </div>
              <div className={"flex min-w-0 flex-col justify-center " + (reversed ? "lg:order-1" : "")}>
                <p className="text-xs uppercase tracking-[0.24em] text-ink-soft">Colección 0{index + 1} / 04</p>
                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2"><h2 className="font-display text-[clamp(2rem,3vw,3rem)] font-light leading-[1.15] text-ink">{collection.name}</h2><p className="text-xl text-ink">{collection.priceLabel}</p></div>
                <p className="mt-6 max-w-xl text-base leading-8 text-ink-soft">{descriptions[collection.id]}</p>
                <div className="mt-9 grid gap-8 border-t border-line pt-7 sm:grid-cols-2">
                  <div><p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Incluye</p><ul className="mt-5 space-y-3">{inclusions[collection.id].map((item) => <li key={item} className="text-sm leading-6 text-ink">{item}</li>)}</ul></div>
                  <div><p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Depósito</p><p className="mt-5 text-sm leading-6 text-ink-soft">{collection.depositLabel} después de confirmar su fecha. Se descuenta del total.</p></div>
                </div>
                <Link href="/es/consulta" className="mt-9 inline-flex min-h-12 w-fit items-center gap-6 border-b border-ink text-xs uppercase tracking-[0.17em] text-ink">Consultar {collection.name} <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          );
        })}
        </div>
      </section>

      <section aria-labelledby="proceso-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="text-center"><p className="text-xs uppercase tracking-[0.24em] text-ink-soft">Después de elegir</p><h2 id="proceso-heading" className="mt-5 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light text-ink">Cómo seguimos</h2></div>
        <ol className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-12">{process.map((step, index) => <li key={step.title}><span className="font-display text-3xl font-light text-ink-soft">0{index + 1}</span><h3 className="mt-6 text-lg font-normal text-ink">{step.title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-ink-soft">{step.body}</p></li>)}</ol>
        <p className="mt-14 border-t border-line pt-6 text-base leading-7 text-ink-soft">Puedes pagar el saldo por etapas. <Link href="/es/planes-de-pago" className="text-ink underline underline-offset-4">Conoce los planes de pago ↗</Link></p>
      </section>

    </>
  );
}
