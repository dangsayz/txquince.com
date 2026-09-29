import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { locations } from "@/content/locations";
import { getFeaturedImages } from "@/lib/content-db";
import { Reveal } from "@/components/Reveal";

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
  const hero = imgs.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ?? imgs[0] ?? null;
  const tilePool = imgs.filter((i) => i.url !== hero?.url);
  const imgFor = (i: number) => (tilePool.length ? tilePool[i % tilePool.length] : (imgs[0] ?? null));

  return (
    <>
      <section className="bg-white px-5 pb-14 pt-14 md:px-10 md:pb-20 md:pt-20 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">Áreas que cubro</p>
          <h1 className="mx-auto mt-5 max-w-[22ch] font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.15] tracking-[-0.03em] text-ink">
            Fotografía de quinceañeras en todo Dallas–Fort Worth.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-soft">
            Un fotógrafo, una celebración al día, todo el metroplex. Encuentra tu
            ciudad abajo — la misa, las fotos, el vals y la recepción,
            documentados de principio a fin.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Link href={site.cta.href} className="inline-flex min-h-12 items-center whitespace-nowrap rounded-lg bg-ink px-6 text-base font-medium text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              Reserva tu fecha
            </Link>
            <Link href="/investment" className="inline-flex min-h-11 items-center text-base font-medium text-ink underline underline-offset-4">
              Ver precios
            </Link>
            <Link href="/quinceanera-photographer" hrefLang="en" className="inline-flex min-h-11 items-center text-base text-ink-soft underline underline-offset-4">
              View in English →
            </Link>
          </div>
        </div>
        <div className="relative mx-auto mt-12 aspect-[4/3] max-w-[90rem] overflow-hidden rounded-lg bg-greige sm:aspect-[16/8]">
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
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16">
        <Reveal className="mb-9 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">En todo el metroplex</p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">
            Encuentra tu ciudad.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink-soft">
            Cobertura real en todo DFW — de la iglesia a la recepción. Elige tu ciudad
            para ver el trabajo, los salones de la zona y cómo se vive el día ahí.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location, index) => {
            const img = imgFor(index);
            return (
              <Reveal key={location.slug} delay={(index % 3) * 70}>
                <Link
                  href={"/es/fotografo-de-quinceaneras/" + location.slug}
                  className="group block overflow-hidden rounded-lg border border-line bg-white transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <div className="relative aspect-[4/3] bg-greige">
                    {img?.url ? (
                      <Image
                        src={img.url}
                        alt={"Fotografía de quinceañera en " + location.city}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                        style={{ objectPosition: focal(img.focus_x, img.focus_y) }}
                      />
                    ) : null}
                    {location.tier === "premium" ? (
                      <span className="absolute left-4 top-4 rounded bg-white px-3 py-2 text-xs font-medium text-ink">Premium</span>
                    ) : null}
                  </div>
                  <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <h3 className="font-display text-xl text-ink">{location.city}</h3>
                      <p className="mt-1 text-sm text-ink-soft">Fotógrafo de quinceañeras</p>
                    </div>
                    <span aria-hidden="true" className="text-lg text-ink">↗</span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="bg-accent-soft py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">
            Quedan pocas fechas de {site.scarcity.reservingYear}
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">
            Aparta su fecha hoy.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-ink-soft">
            Solo reservo una quinceañera al día. Asegura la suya con un depósito —
            checkout seguro, aplicado a tu saldo final.
          </p>
          <Link href={site.cta.href} className="mt-7 inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-lg bg-ink px-6 text-base font-medium text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            Reserva tu fecha
          </Link>
        </div>
      </section>
    </>
  );
}
