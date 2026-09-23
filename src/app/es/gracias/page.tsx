import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Gracias por tu Consulta",
  description: "Recibimos tu consulta sobre su quinceañera.",
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return <section className="mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center md:px-10 lg:px-16">
    <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">Consulta recibida</p>
    <h1 className="font-serif text-[clamp(2.8rem,5vw,4.5rem)] leading-[0.98] text-ink">Gracias. Te responderemos personalmente en 24 horas.</h1>
    <p className="mt-6 max-w-md text-base leading-7 text-ink-soft">Confirmaremos si la fecha está disponible y responderemos tus preguntas. Revisa tu correo para ver nuestra confirmación.</p>
    <div className="mt-10 flex flex-wrap justify-center gap-5"><Link href="/portfolio" className="inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-white">Ver portafolio</Link><Link href="/es" className="inline-flex min-h-12 items-center text-sm text-ink underline underline-offset-4">Volver al inicio</Link></div>
    <p className="mt-12 text-sm text-ink-soft">¿No llegó el correo? Escríbenos a <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">{site.contact.email}</a>.</p>
  </section>;
}
