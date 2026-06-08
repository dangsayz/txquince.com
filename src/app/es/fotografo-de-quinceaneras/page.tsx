import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { locations } from "@/content/locations";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";

export const metadata: Metadata = {
  title: "Fotógrafo de Quinceañeras — Dallas–Fort Worth",
  description:
    "Fotografía y video de quinceañera en todo Dallas–Fort Worth — Grand Prairie, Irving, Garland, Dallas, Fort Worth, Arlington, Mansfield y Farmers Branch. Colecciones a precio fijo desde $2,500.",
  alternates: {
    canonical: "/es/fotografo-de-quinceaneras",
    languages: {
      "en-US": `${site.url}/quinceanera-photographer`,
      "es-MX": `${site.url}/es/fotografo-de-quinceaneras`,
      "x-default": `${site.url}/quinceanera-photographer`,
    },
  },
  openGraph: {
    title: `Fotógrafo de Quinceañeras — Dallas–Fort Worth · ${site.brand}`,
    description:
      "Fotografía y video de quinceañera en todo el metroplex de DFW. Colecciones a precio fijo desde $2,500.",
    url: `${site.url}/es/fotografo-de-quinceaneras`,
    locale: "es_MX",
  },
};

export default function LocationsHubEs() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-5 pt-section text-center md:px-8 md:pt-section-lg">
        <Reveal>
          <p className="eyebrow mb-5">Áreas que cubro</p>
          <h1 className="mx-auto max-w-3xl display-2 text-ink text-balance">
            Fotografía de quinceañeras en todo Dallas–Fort Worth.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            Un fotógrafo, una celebración al día, todo el metroplex. Encuentra tu
            ciudad abajo — la misa, las fotos, el vals y la recepción,
            documentados de principio a fin.
          </p>
          <p className="mt-4 text-sm">
            <Link
              href="/quinceanera-photographer"
              className="text-wine underline underline-offset-2 hover:text-wine-deep"
              hrefLang="en"
            >
              View in English →
            </Link>
          </p>
          <div className="mt-9 flex justify-center">
            <CTAButton href={site.cta.href} variant="primary">
              Reserva tu fecha
            </CTAButton>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-section md:px-8 md:py-section-lg">
        <div className="grid gap-5 sm:grid-cols-2">
          {locations.map((l, i) => (
            <Reveal key={l.slug} delay={i * 60}>
              <Link
                href={`/es/fotografo-de-quinceaneras/${l.slug}`}
                className="group block h-full border border-line bg-ivory p-7 transition-colors hover:border-wine"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-2xl text-ink">{l.city}</h2>
                  <span className="text-[0.66rem] uppercase tracking-[0.16em] text-ink-faint">
                    {l.tier === "premium" ? "Premium" : "TX"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {l.leadEs}
                </p>
                <span className="mt-5 inline-block text-[0.72rem] uppercase tracking-[0.18em] text-wine">
                  Fotógrafo de quinceañeras en {l.city} →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
