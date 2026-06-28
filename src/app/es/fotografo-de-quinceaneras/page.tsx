import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { locations } from "@/content/locations";
import { getFeaturedImages } from "@/lib/content-db";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fotógrafo de Quinceañeras — Dallas–Fort Worth",
  description:
    "Fotografía y video de quinceañera en todo Dallas–Fort Worth — Grand Prairie, Irving, Garland, Dallas, Fort Worth, Arlington, Mansfield y Farmers Branch. Colecciones a precio fijo desde $1,800.",
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
      "Fotografía y video de quinceañera en todo el metroplex de DFW. Colecciones a precio fijo desde $1,800.",
    url: `${site.url}/es/fotografo-de-quinceaneras`,
    locale: "es_MX",
  },
};

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.32) * 100)}%`;
}

export default async function LocationsHubEs() {
  const imgs = await getFeaturedImages(24);
  // Un cuadro horizontal recorta mejor para el hero amplio; los retratos llenan las tarjetas.
  const hero = imgs.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ?? imgs[0] ?? null;
  const tilePool = imgs.filter((i) => i.url !== hero?.url);
  const imgFor = (i: number) => (tilePool.length ? tilePool[i % tilePool.length] : (imgs[0] ?? null));

  return (
    <>
      {/* ===== Hero cinematográfico — imagen con el texto abajo a la izquierda ===== */}
      <section className="relative overflow-hidden bg-ink">
        <div className="relative h-[70svh] min-h-[460px] w-full md:h-[80svh]">
          {hero?.url ? (
            <Image
              src={hero.url}
              alt={hero.alt || "Quinceañera en Dallas–Fort Worth"}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: focal(hero.focus_x, hero.focus_y) }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/45 to-ink/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-[90rem] px-5 pb-12 md:px-10 lg:px-16 md:pb-16">
              <Reveal>
                <p className="text-[0.62rem] uppercase tracking-[0.32em] text-cream/85">Áreas que cubro</p>
                <h1
                  className="mt-4 max-w-3xl font-display text-cream text-balance"
                  style={{ fontSize: "clamp(2.2rem,5.4vw,4.6rem)", lineHeight: 1.02, letterSpacing: "-0.025em" }}
                >
                  Fotografía de quinceañeras en todo Dallas–Fort Worth.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/80 md:text-base">
                  Un fotógrafo, una celebración al día, todo el metroplex. Encuentra tu
                  ciudad abajo — la misa, las fotos, el vals y la recepción,
                  documentados de principio a fin.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                  <Link
                    href={site.cta.href}
                    className="inline-flex whitespace-nowrap rounded-full bg-cream px-7 py-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-white"
                  >
                    Reserva tu fecha
                  </Link>
                  <Link
                    href="/investment"
                    className="whitespace-nowrap text-[0.7rem] uppercase tracking-[0.18em] text-cream/85 underline decoration-cream/30 underline-offset-[6px] transition-colors hover:text-cream"
                  >
                    Ver precios
                  </Link>
                  <Link
                    href="/quinceanera-photographer"
                    hrefLang="en"
                    className="whitespace-nowrap text-[0.7rem] uppercase tracking-[0.18em] text-cream/65 underline decoration-cream/20 underline-offset-[6px] transition-colors hover:text-cream"
                  >
                    View in English →
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Cuadrícula de ciudades — tarjetas con foto, no cajas con borde ===== */}
      <section className="mx-auto max-w-[90rem] px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <Reveal className="mb-10 max-w-xl md:mb-12">
          <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">En todo el metroplex</p>
          <h2
            className="mt-4 font-display text-ink"
            style={{ fontSize: "clamp(2rem,4vw,3.2rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
          >
            Encuentra tu ciudad.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
            Cobertura real en todo DFW — de la iglesia a la recepción. Elige tu ciudad
            para ver el trabajo, los salones de la zona y cómo se vive el día ahí.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {locations.map((l, i) => {
            const img = imgFor(i);
            return (
              <Reveal key={l.slug} delay={(i % 3) * 70}>
                <Link
                  href={`/es/fotografo-de-quinceaneras/${l.slug}`}
                  className="group relative block overflow-hidden bg-ink"
                >
                  <div className="relative aspect-[4/5]">
                    {img?.url ? (
                      <Image
                        src={img.url}
                        alt={`Fotografía de quinceañera en ${l.city}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 30vw"
                        className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                        style={{ objectPosition: focal(img.focus_x, img.focus_y) }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/25 to-transparent" />
                    {l.tier === "premium" ? (
                      <span className="absolute left-4 top-4 bg-cream/15 px-2.5 py-1 text-[0.52rem] uppercase tracking-[0.2em] text-cream backdrop-blur-sm">
                        Premium
                      </span>
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                      <h3 className="font-display text-2xl leading-none text-cream md:text-3xl">{l.city}</h3>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-[0.56rem] uppercase tracking-[0.2em] text-cream/85">
                        Fotógrafo de quinceañeras
                        <span aria-hidden className="text-wine-tint transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* CTA final — banda oscura (cierre de alto contraste) */}
      <section className="bg-dark">
        <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16 md:py-section-lg">
          <Reveal>
            <span className="text-[0.66rem] uppercase tracking-[0.24em] text-wine">
              Quedan pocas fechas de {site.scarcity.reservingYear}
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl display-2 text-cream text-balance">
              Aparta su fecha hoy.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-cream/70">
              Solo reservo una quinceañera al día. Asegura la suya con un depósito —
              checkout seguro, aplicado a tu saldo final.
            </p>
            <div className="mt-10 flex justify-center">
              <CTAButton href={site.cta.href} variant="onDark">
                Reserva tu fecha
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
