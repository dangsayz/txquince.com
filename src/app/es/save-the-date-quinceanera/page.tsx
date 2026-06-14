import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCTA } from "@/components/FinalCTA";

/**
 * SAVE-THE-DATE (ES) — la sesión que otros estudios cobran $150–$475, incluida
 * gratis en cada colección. Español natural, no traducción literal. Espejo de
 * la versión en inglés en /quinceanera-save-the-date.
 */

const STD_FAQS_ES = [
  {
    q: "¿Cuánto cuesta la sesión Save-the-Date?",
    a: "Nada extra — está incluida gratis en cada colección: Essential, Signature y Legacy. La mayoría de los estudios en Dallas–Fort Worth la venden aparte por $150–$475. Aquí ya viene con tu reservación.",
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
    a: "La sesión Save-the-Date viene incluida con cualquier colección. Apartas tu fecha y ya es parte de lo que reservaste — no hay nada más que agregar ni pagar.",
  },
  {
    q: "¿Tienes seguro?",
    a: "Sí — con seguro y en regla con los salones, así tu iglesia y tu recepción quedan cubiertas. Muchas parroquias y salones de DFW piden comprobante de seguro antes de dejar entrar a un fotógrafo; nosotros ya lo tenemos.",
  },
];

export const metadata: Metadata = {
  title: "Sesión Save-the-Date de Quinceañera — Dallas–Fort Worth",
  description:
    "Tu sesión Save-the-Date de quinceañera está incluida gratis en cada colección de TX Quince — otros estudios cobran $150–$475. Una sesión de fotos pre-quince con su propio vestido, en todo Dallas–Fort Worth.",
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
      "Incluida gratis en cada colección — otros cobran $150–$475. Sesión pre-quince con su propio vestido, en todo DFW.",
    url: `${site.url}/es/save-the-date-quinceanera`,
    locale: "es_MX",
  },
};

export default function SaveTheDatePageEs() {
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
          "Una sesión de fotos pre-quinceañera, incluida gratis en cada colección de TX Quince en Dallas–Fort Worth.",
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

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 pt-section text-center md:px-10 lg:px-16 md:pt-section-lg">
        <Reveal>
          <p className="eyebrow mb-5">Save-the-Date · Dallas–Fort Worth</p>
          <h1 className="mx-auto max-w-3xl display-2 text-ink text-balance">
            Su sesión Save-the-Date, incluida.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            Una sesión de fotos tranquila antes del gran día — para las
            invitaciones, el cuadro de firmas y para conocer a tu fotógrafo primero.
            La mayoría de los estudios en Dallas–Fort Worth la cobran de $150 a
            $475. Aquí viene en cada colección, gratis.
          </p>
          <p className="mt-4 text-sm">
            <Link
              href="/quinceanera-save-the-date"
              className="text-wine underline underline-offset-2 hover:text-wine-deep"
              hrefLang="en"
            >
              View this page in English →
            </Link>
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <CTAButton href={site.cta.href} variant="primary">
              Reserva tu fecha
            </CTAButton>
            <CTAButton href={site.secondaryCta.href} variant="text">
              ¿Preguntas primero? Escríbeme
            </CTAButton>
          </div>
        </Reveal>
      </section>

      {/* Qué es */}
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <Reveal className="flex flex-col gap-6">
          <h2 className="display-2 text-ink text-balance">
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

      {/* Su vestido — la respuesta honesta a "vestido incluido" */}
      <section className="bg-greige">
        <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16 md:py-section-lg">
          <Reveal>
            <p className="eyebrow mb-5">Su vestido, su sesión</p>
            <h2 className="display-2 text-ink text-balance">
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
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <Reveal>
          <h2 className="display-2 text-ink text-balance">
            Incluida, no un extra.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            En todo DFW, el Save-the-Date casi siempre se vende aparte — un cargo de
            $150 a $475 encima de la cobertura del día. Cada colección de TX Quince
            ya lo incluye, de principio a fin.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {packages.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 80}
              className={`flex h-full flex-col border p-7 ${
                p.highlight ? "border-wine bg-ivory" : "border-line bg-ivory"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl text-ink">{p.name}</h3>
                {p.highlight ? (
                  <span className="bg-wine px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-cream">
                    Más popular
                  </span>
                ) : null}
              </div>
              <p className="mt-5 font-display text-4xl text-ink">{p.priceLabel}</p>
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.18em] text-wine-deep">
                Save-the-Date incluido
              </p>
              <CTAButton
                href={`/reserve?collection=${p.id}`}
                variant="ink"
                className="mt-6 w-full"
              >
                Reservar {p.name}
              </CTAButton>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-sm">
          <Link
            href="/investment"
            className="text-wine underline underline-offset-2 hover:text-wine-deep"
          >
            Ver todo lo que incluye cada colección →
          </Link>
        </p>
      </section>

      {/* Preguntas */}
      <section className="mx-auto max-w-3xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <h2 className="display-2 text-ink">
          Save-the-Date — preguntas, respondidas.
        </h2>
        <dl className="mt-10 divide-y divide-line border-y border-line">
          {STD_FAQS_ES.map((f) => (
            <div key={f.q} className="py-7">
              <dt className="font-display text-xl text-ink">{f.q}</dt>
              <dd className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Ciudades */}
      <section className="bg-greige">
        <div className="mx-auto max-w-5xl px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
          <p className="eyebrow mb-5">En todo Dallas–Fort Worth</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/es/fotografo-de-quinceaneras/dallas"
              className="border border-line bg-ivory px-4 py-2 text-sm text-ink transition-colors hover:border-wine hover:text-wine"
            >
              Fotógrafo de quinceañeras en Dallas
            </Link>
            <Link
              href="/es/fotografo-de-quinceaneras/fort-worth"
              className="border border-line bg-ivory px-4 py-2 text-sm text-ink transition-colors hover:border-wine hover:text-wine"
            >
              Fotógrafo de quinceañeras en Fort Worth
            </Link>
            <Link
              href="/es/fotografo-de-quinceaneras"
              className="border border-line bg-ivory px-4 py-2 text-sm text-ink transition-colors hover:border-wine hover:text-wine"
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
