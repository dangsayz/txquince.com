import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/InquiryForm";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Consulta tu Fecha para Foto y Video de Quinceañera",
  description: "Cuéntanos sobre su quinceañera. Confirmamos personalmente si tu fecha está disponible y respondemos tus preguntas.",
  alternates: { canonical: "/es/consulta", languages: { "en-US": "/check-your-date", "es-MX": "/es/consulta" } },
  openGraph: { locale: "es_MX" },
};

const steps = [
  { title: "Cuéntanos sobre su día", body: "Comparte la fecha, el salón o la ciudad y la cobertura que buscas." },
  { title: "Revisamos el calendario", body: "Confirmamos disponibilidad contigo de manera personal." },
  { title: "Elige el siguiente paso", body: "Si la fecha está libre, podemos revisar las colecciones. Consultar no requiere pago." },
] as const;

export default async function ConsultaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const date = (await searchParams).date;
  const initialDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";

  return (
    <>
      <section aria-labelledby="consulta-title" className="relative flex min-h-[32rem] items-center justify-center overflow-hidden bg-ink px-5 py-20 text-center text-white sm:min-h-[38rem] sm:px-8 lg:min-h-[44rem]">
        <Image src="/portfolio/red-garden.webp" alt="Quinceañera con flores en un jardín" fill priority sizes="100vw" className="object-cover object-[center_39%]" />
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.26em] text-white">Hablemos / Dallas–Fort Worth</p>
          <h1 id="consulta-title" className="mx-auto mt-7 max-w-[19ch] font-display text-[clamp(2.5rem,5vw,4.75rem)] font-light leading-[1.12] text-white">Cuéntanos cómo va a celebrar.</h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-white">Cuéntanos la fecha que tienes en mente. Revisaremos los detalles y te responderemos personalmente.</p>
          <a href="#formulario" className="mt-8 inline-flex min-h-12 items-center justify-center gap-4 whitespace-nowrap border-b border-white text-xs uppercase tracking-[0.17em] text-white">Empezar la consulta <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section id="formulario" aria-labelledby="formulario-title" className="scroll-mt-20 bg-ivory px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
          <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs uppercase tracking-[0.24em] text-ink-soft">El primer paso</p>
            <h2 id="formulario-title" className="mt-6 max-w-sm font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light leading-[1.13] text-ink">Empieza con lo que ya sabes.</h2>
            <p className="mt-7 max-w-sm text-base leading-8 text-ink-soft">Aunque sigas eligiendo fecha o decidiendo entre foto y video, unos detalles nos ayudan a darte una respuesta útil.</p>
            <p className="mt-8 max-w-sm border-t border-line pt-6 text-base leading-7 text-ink-soft">Consultar no cuesta nada. Enviar el formulario no aparta la fecha.</p>
            <Link href="/es/paquetes" className="mt-6 inline-flex min-h-12 items-center gap-4 whitespace-nowrap border-b border-ink text-sm uppercase tracking-[0.13em] text-ink">Ver colecciones <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="min-w-0 bg-white px-5 py-8 sm:px-10 sm:py-12 lg:px-12">
            <InquiryForm initialDate={initialDate} locale="es" />
            <p className="mt-7 text-base text-ink-soft">¿Prefieres escribirnos? <a href={"mailto:" + site.contact.email} className="inline-flex min-h-11 items-center text-ink underline underline-offset-4">{site.contact.email}</a></p>
          </div>
        </div>
      </section>

      <section aria-labelledby="consulta-next-title" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="text-center"><p className="text-xs uppercase tracking-[0.24em] text-ink-soft">Después de escribirnos</p><h2 id="consulta-next-title" className="mt-5 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light text-ink">Cómo seguimos</h2></div>
        <ol className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-12">{steps.map((step, index) => <li key={step.title}><span className="font-display text-3xl font-light text-ink-soft">0{index + 1}</span><h3 className="mt-6 text-lg font-normal text-ink">{step.title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-ink-soft">{step.body}</p></li>)}</ol>
      </section>
    </>
  );
}
