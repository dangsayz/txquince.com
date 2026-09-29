import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { getImagesBySection } from "@/lib/content-db";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCTA } from "@/components/FinalCTA";

/**
 * SAVE-THE-DATE (ES) — la sesión que otros estudios cobran $150–$475, incluida
 * gratis desde Essential. Español natural, no traducción literal. Espejo de
 * la versión en inglés en /quinceanera-save-the-date.
 */

const STD_FAQS_ES = [
  {
    q: "¿Cuánto cuesta la sesión Save-the-Date?",
    a: "Nada extra con Essential, Signature o Legacy. Moments no incluye esta sesión. La mayoría de los estudios en Dallas–Fort Worth la venden aparte por $150–$475. Aquí ya viene con esas tres colecciones.",
  },
  {
    q: "¿Puede usar su propio vestido de quince?",
    a: "Sí — su propio vestido, sin renta y sin restricciones. Puede usar el vestido, un look casual, o los dos. Es su sesión; la armamos alrededor de lo que ella quiere recordar.",
  },
  {
    q: "¿Qué es una sesión Save-the-Date (pre-quince)?",
    a: "Una sesión de fotos tranquila antes de la celebración — para las invitaciones, el cuadro de firmas y las redes, y una forma sin presión de conocer a tu fotógrafo antes del día.",
  },
  {
    q: "¿Cuándo hacemos la sesión?",
    a: "Normalmente unas semanas o unos meses antes de la celebración, una vez apartada tu fecha. Elegimos juntos un lugar en Dallas–Fort Worth que signifique algo para tu familia.",
  },
  {
    q: "¿Tenemos que reservar la quinceañera completa para tenerla?",
    a: "La sesión Save-the-Date viene incluida con Essential, Signature y Legacy. Moments no la incluye. Si apartas una de esas tres colecciones, no hay nada más que agregar ni pagar por la sesión.",
  },
  {
    q: "¿Tienes seguro?",
    a: "Sí — con seguro y en regla con los salones, así tu iglesia y tu recepción quedan cubiertas. Muchas parroquias y salones de DFW piden comprobante de seguro antes de dejar entrar a un fotógrafo; nosotros ya lo tenemos.",
  },
];

export const metadata: Metadata = {
  title: "Sesión Save-the-Date de Quinceañera — Dallas–Fort Worth",
  description:
    "Tu sesión Save-the-Date de quinceañera está incluida desde la colección Essential de TX Quince — otros estudios cobran $150–$475. Una sesión de fotos pre-quince con su propio vestido, en todo Dallas–Fort Worth.",
  alternates: {
    canonical: "/es/save-the-date-quinceanera",
    languages: {
      "en-US": `${site.url}/quinceanera-save-the-date`,
      "es-MX": `${site.url}/es/save-the-date-quinceanera`,
      "x-default": `${site.url}/quinceanera-save-the-date`,
    },
  },
  openGraph: {
    title: `Sesión Save-the-Date de Quinceañera — Dallas–Fort Worth · ${site.brand}`,
    description:
      "Incluida desde Essential — otros cobran $150–$475. Sesión pre-quince con su propio vestido, en todo DFW.",
    url: `${site.url}/es/save-the-date-quinceanera`,
    locale: "es_MX",
  },
};

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.32) * 100)}%`;
}

export default async function SaveTheDatePageEs() {
  const images = await getImagesBySection("save-the-date");
  const fallback = portfolioFallback.find((image) => image.section === "save-the-date");
  const hero = images.find((image) => (image.width ?? 0) >= (image.height ?? 0)) ?? images[0] ?? (fallback ? { url: fallback.url, alt: fallback.alt, focus_x: null, focus_y: null } : null);
  const supporting = images.filter((image) => image.url !== hero?.url).slice(0, 2);
  const includedPackages = packages.filter((collection) => collection.id !== "moments");
  const esUrl = `${site.url}/es/save-the-date-quinceanera`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${esUrl}#service`,
        name: "Sesión Save-the-Date de Quinceañera",
        serviceType: "Sesión de retratos pre-quinceañera",
        description:
          "Una sesión de fotos pre-quinceañera, incluida desde la colección Essential de TX Quince en Dallas–Fort Worth.",
        provider: { "@type": "Organization", name: site.brand, "@id": `${site.url}/#business` },
        areaServed: { "@type": "City", name: "Dallas–Fort Worth, TX" },
        url: esUrl,
      },
      {
        "@type": "FAQPage",
        "@id": `${esUrl}#faq`,
        inLanguage: "es",
        mainEntity: STD_FAQS_ES.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${esUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
          { "@type": "ListItem", position: 2, name: "Save-the-Date", item: esUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-line bg-white px-5 pb-14 pt-14 md:px-10 md:pb-20 md:pt-20 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">Save-the-Date · Dallas–Fort Worth</p>
          <h1 className="mx-auto mt-5 max-w-[22ch] font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.15] tracking-[-0.03em] text-ink">
            Su sesión Save-the-Date, incluida desde Essential.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-soft">
            Una sesión de fotos tranquila antes del gran día — para las
            invitaciones, el cuadro de firmas y para conocer a tu fotógrafo primero.
            La mayoría de los estudios en Dallas–Fort Worth la cobran de $150 a
            $475. Aquí viene incluida desde Essential. Moments no la incluye.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Link href={site.cta.href} className="inline-flex min-h-12 items-center whitespace-nowrap rounded-lg bg-ink px-6 text-base font-medium text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              Reserva tu fecha
            </Link>
            <Link href={site.secondaryCta.href} className="inline-flex min-h-11 items-center text-base font-medium text-ink underline underline-offset-4">
              ¿Preguntas primero? Escríbeme
            </Link>
            <Link href="/quinceanera-save-the-date" hrefLang="en" className="inline-flex min-h-11 items-center text-base text-ink-soft underline underline-offset-4">
              View this page in English →
            </Link>
          </div>
        </div>
        <div className="relative mx-auto mt-12 aspect-[4/3] max-w-[90rem] overflow-hidden rounded-lg bg-accent-soft sm:aspect-[16/8]">
          {hero?.url ? (
            <Image
              src={hero.url}
              alt={hero.alt || "Sesión Save-the-Date de quinceañera en Dallas–Fort Worth"}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: focal(hero.focus_x, hero.focus_y) }}
            />
          ) : null}
        </div>
      </section>

      {/* Qué es */}
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-10 lg:px-16 md:py-20">
        <Reveal className="flex flex-col gap-6">
          <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink text-balance">
            Qué es la sesión Save-the-Date.
          </h2>
          <p className="text-base leading-relaxed text-ink-soft">
            Es una sesión de retratos dedicada, unas semanas o unos meses antes de
            la celebración — sin corte, sin prisas, solo ella. Elegimos un lugar en
            Dallas–Fort Worth que signifique algo para tu familia, y las fotos
            cargan con el resto de la planeación: las invitaciones, el cuadro de
            firmas, las redes contando los días.
          </p>
          <p className="text-base leading-relaxed text-ink-soft">
            También es la forma más fácil de conocer a tu fotógrafo antes de la
            celebración. Para cuando llega la misa, ya trabajamos juntos una vez —
            así la cámara se siente familiar y el día fluye con más calma.
          </p>
        </Reveal>
      </section>

      {supporting.length > 0 ? (
        <section className="mx-auto max-w-[90rem] px-5 pb-16 md:px-10 md:pb-20 lg:px-16" aria-label="Fotografías de Save-the-Date">
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {supporting.map((image) => (
              <div key={image.id ?? image.url} className="relative aspect-[4/5] overflow-hidden rounded-lg bg-greige sm:aspect-[3/4]">
                <Image src={image.url} alt={image.alt || "Retrato Save-the-Date de quinceañera"} fill sizes="(max-width: 640px) 50vw, 50vw" className="object-cover" style={{ objectPosition: focal(image.focus_x, image.focus_y) }} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Su vestido — la respuesta honesta a "vestido incluido" */}
      <section className="bg-accent-soft">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center md:px-10 lg:px-16 md:py-20">
          <Reveal>
            <p className="eyebrow mb-5">Su vestido, su sesión</p>
            <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink text-balance">
              Sin renta. Sin restricciones.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              Algunos estudios limitan el Save-the-Date con un vestido prestado o
              restringen cuál puede usar. Aquí usa el suyo — el vestido de quince de
              verdad, un look casual, o los dos en una sola sesión. Es su momento;
              nada de esto es un paquete genérico.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Incluida, no un extra */}
      <section className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16">
        <Reveal>
          <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink text-balance">
            Incluida, no un extra.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            En todo DFW, el Save-the-Date casi siempre se vende aparte — un cargo de
            $150 a $475 encima de la cobertura del día. Essential, Signature y Legacy
            ya lo incluyen, de principio a fin. Moments no.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {includedPackages.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 80}
              className={`flex h-full flex-col border p-7 ${
                p.highlight ? "border-ink bg-accent-soft" : "border-line bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl text-ink">{p.name}</h3>
                {p.highlight ? (
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
                    Más popular
                  </span>
                ) : null}
              </div>
              <p className="mt-5 font-display text-[2rem] text-ink">{p.priceLabel}</p>
              <p className="mt-2 text-base text-ink-soft">
                Save-the-Date incluido
              </p>
              <CTAButton
                href={`/reserve?collection=${p.id}`}
                variant="ink"
                className="mt-6 min-h-12 w-full text-base"
              >
                Reservar {p.name}
              </CTAButton>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-base">
          <Link
            href="/investment"
            className="text-ink underline underline-offset-2 hover:text-ink-soft"
          >
            Ver todo lo que incluye cada colección →
          </Link>
        </p>
      </section>

      {/* Preguntas */}
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-10 lg:px-16 md:py-20">
        <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">
          Save-the-Date — preguntas, respondidas.
        </h2>
        <dl className="mt-10 divide-y divide-line border-y border-line">
          {STD_FAQS_ES.map((f) => (
            <div key={f.q} className="py-7">
              <dt className="font-display text-xl text-ink">{f.q}</dt>
              <dd className="mt-3 text-base leading-7 text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Ciudades */}
      <section className="bg-accent-soft">
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-10 lg:px-16 md:py-20">
          <p className="eyebrow mb-5">En todo Dallas–Fort Worth</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/es/fotografo-de-quinceaneras/dallas"
              className="inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-base text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Fotógrafo de quinceañeras en Dallas
            </Link>
            <Link
              href="/es/fotografo-de-quinceaneras/fort-worth"
              className="inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-base text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Fotógrafo de quinceañeras en Fort Worth
            </Link>
            <Link
              href="/es/fotografo-de-quinceaneras"
              className="inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-base text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Todas las áreas de DFW →
            </Link>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
