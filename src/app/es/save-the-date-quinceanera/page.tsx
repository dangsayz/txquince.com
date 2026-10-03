import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { packages } from "@/content/packages";
import { getImagesBySection, imagePagePath } from "@/lib/content-db";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { Reveal } from "@/components/Reveal";
import { publicPhotoCopy } from "@/lib/public-photo-copy";

const STD_FAQS_ES = [
  {
    q: "¿Cuánto cuesta la sesión Save-the-Date?",
    a: "La sesión está incluida sin cargo adicional con Essential, Signature o Legacy. Moments no la incluye. Consulta los detalles de cada colección antes de elegir la tuya.",
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
    "Sesión Save-the-Date de quinceañera incluida con Essential, Signature y Legacy de TX Quince. Retratos pre-quince con su propio vestido en Dallas–Fort Worth.",
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
      "Sesión pre-quince con su propio vestido, incluida con Essential, Signature y Legacy en Dallas–Fort Worth.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }}
      />

      <header className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-ink text-white sm:min-h-[80svh]" aria-labelledby="save-date-title-es">
        <Image src={hero?.url ?? "/portfolio/save-date.webp"} alt={hero ? publicPhotoCopy(hero, "Retrato Save-the-Date de quinceañera").alt : "Retrato Save-the-Date de quinceañera"} fill unoptimized={!hero} priority sizes="100vw" className="object-cover" style={{ objectPosition: focal(hero?.focus_x, hero?.focus_y) }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <p className="text-xs uppercase tracking-[0.24em] text-white/85">Save-the-Date / Dallas–Fort Worth</p>
          <h1 id="save-date-title-es" className="mt-5 max-w-[23ch] font-display text-[clamp(2.15rem,4vw,4rem)] font-light leading-[1.14]">Sus primeros retratos antes de la celebración</h1>
        </div>
      </header>

      <section className="bg-ivory px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-[78rem] gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-20">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">La sesión de retratos</p>
          <div><p className="max-w-[29ch] font-display text-[clamp(1.85rem,3vw,3rem)] font-light leading-[1.24] text-ink">Un momento solo para ella, antes de la celebración.</p><p className="mt-6 max-w-xl text-base leading-8 text-ink-soft">Una sesión tranquila para las invitaciones, el cuadro de firmas y para conocer a tu fotógrafo. Incluida con Essential, Signature y Legacy.</p><div className="mt-7 flex flex-wrap gap-x-8 gap-y-3"><Link href="/es/consulta" className="inline-flex min-h-12 items-center gap-4 border-b border-ink text-xs uppercase tracking-[0.16em] text-ink">Consultar su fecha <span aria-hidden="true">↗</span></Link><Link href="/quinceanera-save-the-date" hrefLang="en" className="inline-flex min-h-12 items-center border-b border-ink text-xs uppercase tracking-[0.16em] text-ink">View in English ↗</Link></div></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 md:px-10 md:py-20 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] lg:gap-16 lg:px-16">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">La sesión / 01</p>
        <Reveal className="flex max-w-3xl flex-col gap-6">
          <h2 className="font-body text-[clamp(1.75rem,2.8vw,2.5rem)] font-normal leading-tight text-ink text-balance">
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
              <Link key={image.id ?? image.url} href={image.slug ? imagePagePath(image.section, image.slug) : "/portfolio#save-the-date"} aria-label={`Ver ${publicPhotoCopy(image, "Retrato Save-the-Date de quinceañera").title}`} className="relative aspect-[4/5] overflow-hidden bg-greige sm:aspect-[3/4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                <Image src={image.url} alt={publicPhotoCopy(image, "Retrato Save-the-Date de quinceañera").alt} fill sizes="(max-width: 640px) 50vw, 50vw" className="object-cover" style={{ objectPosition: focal(image.focus_x, image.focus_y) }} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-greige">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 md:px-10 md:py-20 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] lg:gap-16 lg:px-16">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">A su manera / 02</p>
          <Reveal>
            <h2 className="font-body text-[clamp(1.75rem,2.8vw,2.5rem)] font-normal leading-tight text-ink text-balance">
              Sin renta. Sin restricciones.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              Algunos estudios limitan el Save-the-Date con un vestido prestado o
              restringen cuál puede usar. Aquí usa el suyo — el vestido de quince de
              verdad, un look casual, o los dos en una sola sesión. Es su momento;
              nada de esto es un paquete genérico.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16">
        <Reveal>
          <h2 className="font-body text-[clamp(1.75rem,2.8vw,2.5rem)] font-normal leading-tight text-ink text-balance">
            Incluida, no un extra.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            Essential, Signature y Legacy incluyen la sesión Save-the-Date.
            Moments no la incluye. Compara las cuatro colecciones antes de consultar tu fecha.
          </p>
        </Reveal>
        <div className="mt-10 border-t border-line">
          {includedPackages.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 80}
              className="grid gap-4 border-b border-line py-7 sm:grid-cols-[minmax(0,0.7fr)_auto] lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.4fr)_auto] lg:items-center lg:gap-8"
            >
              <div><h3 className="font-body text-[clamp(1.5rem,2.3vw,2.25rem)] font-normal text-ink">{p.name}</h3><p className="mt-2 text-base text-ink-soft">{p.id === "essential" ? "Foto o video, un artista." : p.id === "signature" ? "Foto y video durante el día completo." : "Foto, video y recuerdos impresos."}</p></div>
              <div><p className="font-body text-[1.5rem] font-normal text-ink">{p.priceLabel}</p><p className="mt-1 text-base text-ink-soft">Save-the-Date incluido</p></div>
              <Link href={`/es/paquetes#${p.id}`} className="inline-flex min-h-12 items-center justify-between gap-5 whitespace-nowrap border-b border-ink text-base font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Ver colección <span aria-hidden="true">↗</span></Link>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-base">
          <Link
            href="/es/paquetes"
            className="text-ink underline underline-offset-2 hover:text-ink-soft"
          >
            Ver todo lo que incluye cada colección →
          </Link>
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 md:px-10 lg:px-16 md:py-20">
        <h2 className="font-body text-[clamp(1.75rem,2.8vw,2.5rem)] font-normal leading-tight text-ink">
          Save-the-Date — preguntas, respondidas.
        </h2>
        <dl className="mt-10 divide-y divide-line border-y border-line">
          {STD_FAQS_ES.map((f) => (
            <div key={f.q} className="py-7">
              <dt className="text-xl font-normal text-ink">{f.q}</dt>
              <dd className="mt-3 text-base leading-7 text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-greige">
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-10 lg:px-16 md:py-20">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">En todo Dallas–Fort Worth</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/es/fotografo-de-quinceaneras/dallas"
              className="inline-flex min-h-11 items-center border-b border-ink text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Fotógrafo de quinceañeras en Dallas
            </Link>
            <Link
              href="/es/fotografo-de-quinceaneras/fort-worth"
              className="inline-flex min-h-11 items-center border-b border-ink text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Fotógrafo de quinceañeras en Fort Worth
            </Link>
            <Link
              href="/es/fotografo-de-quinceaneras"
              className="inline-flex min-h-11 items-center border-b border-ink text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Todas las áreas de DFW →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-5 py-14 sm:px-10 md:flex-row md:items-end md:justify-between lg:px-16">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">El siguiente paso</p>
            <h2 className="mt-3 max-w-2xl font-body text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight">Todo empieza con su fecha.</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/80">Cuéntanos cuándo será la celebración. Confirmaremos la disponibilidad antes de pedir un depósito.</p>
          </div>
          <Link href="/es/consulta" className="inline-flex min-h-12 shrink-0 items-center justify-between gap-8 self-start whitespace-nowrap border border-white px-6 text-base text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Consultar fecha <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
