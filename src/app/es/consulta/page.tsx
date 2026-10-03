import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/InquiryForm";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Consulta tu Fecha para Foto y Video de Quinceañera",
  description: "Cuéntanos sobre su quinceañera. Confirmamos personalmente si tu fecha está disponible y respondemos tus preguntas en 24 horas.",
  alternates: { canonical: "/es/consulta", languages: { "en-US": "/check-your-date", "es-MX": "/es/consulta" } },
  openGraph: { locale: "es_MX" },
};

const steps = [
  { title: "Nos cuentas su plan", body: "Comparte la fecha, el salón y la cobertura que buscas." },
  { title: "Revisamos el calendario", body: "Confirmamos disponibilidad contigo de manera personal." },
  { title: "Decides el siguiente paso", body: "Si todo encaja, revisamos las colecciones. Consultar no requiere pago." },
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
      <section aria-labelledby="consulta-title" className="mx-auto max-w-[88rem] px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-14">
          <figure className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden bg-greige sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image src="/portfolio/red-garden.webp" alt="Quinceañera con vestido rojo y flores" fill priority sizes="(max-width: 1024px) 100vw, 54vw" className="object-cover object-[center_35%]" />
            </div>
            <figcaption className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-soft">Su celebración empieza con una fecha</figcaption>
          </figure>
          <div className="max-w-xl lg:pb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Consulta de fecha / Dallas–Fort Worth</p>
            <h1 id="consulta-title" className="mt-5 max-w-[17ch] font-display text-[clamp(2rem,3.2vw,3rem)] font-normal leading-[1.14] text-ink">Cuéntanos sobre su día.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">Aunque todavía estés eligiendo fecha o decidiendo entre foto y video, puedes empezar aquí. Revisamos los detalles y te respondemos personalmente.</p>
            <a href="#formulario" className="mt-8 inline-flex min-h-12 items-center gap-8 whitespace-nowrap border-b border-ink text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Empezar la consulta <span aria-hidden="true">↓</span></a>
            <p className="mt-8 border-t border-line pt-5 text-base leading-7 text-ink-soft">Consultar no cuesta nada. Enviar este formulario no aparta la fecha ni requiere un depósito.</p>
          </div>
        </div>
      </section>

      <section id="formulario" aria-labelledby="formulario-title" className="scroll-mt-20 border-t border-line bg-white">
        <div className="mx-auto grid max-w-[88rem] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20 lg:px-12">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">01 / El primer paso</p>
            <h2 id="formulario-title" className="mt-4 max-w-sm font-display text-[clamp(1.75rem,2.6vw,2.4rem)] font-normal leading-tight text-ink">Empieza con lo que ya sabes.</h2>
            <p className="mt-4 max-w-sm text-base leading-7 text-ink-soft">Unos detalles nos ayudan a responder con la disponibilidad y la colección adecuada.</p>
            <p className="mt-7 max-w-sm border-t border-line pt-5 text-base leading-7 text-ink-soft">¿Quieres revisar los precios primero? <Link href="/es/paquetes" className="text-ink underline underline-offset-4">Ver colecciones ↗</Link></p>
          </div>
          <div className="min-w-0 border-t border-line pt-8 lg:pt-0">
            <InquiryForm initialDate={initialDate} locale="es" />
            <p className="mt-7 text-base text-ink-soft">¿Prefieres escribirnos? <a href={"mailto:" + site.contact.email} className="inline-flex min-h-11 items-center text-ink underline underline-offset-4">{site.contact.email}</a></p>
          </div>
        </div>
      </section>

      <section aria-labelledby="consulta-next-title" className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-6 border-b border-line pb-8 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Después de escribirnos</p>
          <h2 id="consulta-next-title" className="font-display text-[clamp(1.75rem,2.6vw,2.4rem)] font-normal leading-tight text-ink">Qué sigue.</h2>
        </div>
        <ol className="divide-y divide-line">{steps.map((step, index) => <li key={step.title} className="grid gap-3 py-6 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-6"><p className="text-xs uppercase tracking-[0.16em] text-ink-soft">0{index + 1}</p><div><h3 className="text-lg font-medium text-ink">{step.title}</h3><p className="mt-2 max-w-xl text-base leading-7 text-ink-soft">{step.body}</p></div></li>)}</ol>
      </section>
    </>
  );
}
