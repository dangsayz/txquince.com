import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Gracias por tu Consulta",
  description: "Recibimos tu consulta sobre su quinceañera.",
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return (
    <section className="bg-ivory px-5 py-12 sm:px-6 md:py-20">
      <div className="mx-auto max-w-2xl rounded-lg border border-line bg-white p-7 text-center sm:p-12">
        <Badge>Consulta recibida</Badge>
        <h1 className="mt-5 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink text-balance">
          Gracias. Te responderemos personalmente en 24 horas.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base leading-7 text-ink-soft">
          Confirmaremos si la fecha está disponible y responderemos tus preguntas personalmente.
          Si no recibes un correo, puedes escribirnos directamente.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/portfolio" className="inline-flex min-h-12 items-center justify-center rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Ver portafolio</Link>
          <Link href="/es" className="inline-flex min-h-11 items-center text-base text-ink-soft underline underline-offset-4 hover:text-ink">
            Volver al inicio
          </Link>
        </div>
        <p className="mt-12 text-base text-ink-soft">
          ¿No llegó el correo? Escríbenos a{" "}
          <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4 hover:text-ink">
            {site.contact.email}
          </a>.
        </p>
      </div>
    </section>
  );
}
