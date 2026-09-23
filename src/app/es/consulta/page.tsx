import type { Metadata } from "next";
import Link from "next/link";
import { InquiryForm } from "@/components/InquiryForm";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Consulta tu Fecha para Foto y Video de Quinceañera",
  description: "Cuéntanos sobre su quinceañera. Confirmamos personalmente si tu fecha está disponible y respondemos tus preguntas en 24 horas.",
  alternates: { canonical: "/es/consulta", languages: { "en-US": "/check-your-date", "es-MX": "/es/consulta" } },
  openGraph: { locale: "es_MX" },
};

export default async function ConsultaPage({ searchParams }: { searchParams: Promise<{ date?: string | string[] }> }) {
  const date = (await searchParams).date;
  const initialDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  return <>
    <section className="mx-auto grid max-w-[90rem] gap-10 px-5 py-14 md:px-10 md:py-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:px-16">
      <div className="lg:sticky lg:top-32 lg:self-start"><p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">Respuesta personal en 24 horas</p><h1 className="mt-5 max-w-[11ch] font-serif text-[clamp(3.2rem,6vw,5.8rem)] leading-[0.93] tracking-[-0.04em] text-ink">¿Está libre su fecha?</h1><p className="mt-6 max-w-[45ch] text-lg leading-8 text-ink-soft">Cuéntanos sobre su celebración. Revisamos el calendario y te respondemos personalmente en 24 horas.</p><p className="mt-6 border-t border-line pt-5 text-base leading-7 text-ink-soft">Consultar no cuesta nada. Colecciones desde $1,800; depósitos desde $300 después de confirmar disponibilidad.</p><Link href="/es/paquetes" className="mt-6 inline-flex text-sm font-medium text-ink underline underline-offset-4">Ver colecciones →</Link></div>
      <div className="border border-line bg-white p-6 sm:p-9 lg:p-11"><p className="text-sm font-medium text-wine-deep">Sobre su celebración</p><h2 className="mt-2 font-serif text-4xl leading-none text-ink">Empecemos con la fecha.</h2><p className="mb-8 mt-4 text-base text-ink-soft">Unos detalles nos ayudan a darte una respuesta útil.</p><InquiryForm initialDate={initialDate} locale="es" /><p className="mt-7 text-base text-ink-soft">¿Prefieres escribirnos? <a href={`mailto:${site.contact.email}`} className="text-ink underline underline-offset-4">{site.contact.email}</a></p></div>
    </section>
    <section className="border-t border-line bg-white"><div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 lg:px-16"><h2 className="font-serif text-[clamp(2.5rem,4vw,3.6rem)] text-ink">¿Qué sigue después?</h2><ol className="mt-9 grid gap-8 md:grid-cols-3">{[["Nos cuentas su plan", "Tu fecha, salón y el tipo de cobertura que buscas."],["Confirmamos disponibilidad", "Te respondemos personalmente en 24 horas."],["Apartas si todo encaja", "Solo después de elegir tu colección y revisar los detalles por escrito."]].map(([title, body], i) => <li key={title} className="border-t border-line pt-5"><span className="font-serif text-3xl text-ink/35">0{i + 1}</span><h3 className="mt-3 font-serif text-2xl text-ink">{title}</h3><p className="mt-2 leading-7 text-ink-soft">{body}</p></li>)}</ol></div></section>
  </>;
}
