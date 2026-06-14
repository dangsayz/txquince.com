import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { getAllEsPosts, type BlogCategory } from "@/content/blog";
import { Reveal } from "@/components/Reveal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Guía de Quinceañera (Dallas–Fort Worth)",
  description:
    "Guías honestas y sin adivinanzas para planear una quinceañera en Dallas–Fort Worth: costos reales, fechas, tradiciones y cómo elegir a tu fotógrafo y equipo de video.",
  alternates: {
    canonical: "/es/blog",
    languages: { "es-MX": "/es/blog", "en-US": "/blog" },
  },
  openGraph: {
    locale: "es_MX",
    title: "Guía de Quinceañera · TX Quince",
    description: "Costos reales, fechas, tradiciones y cómo elegir a tu fotógrafo en Dallas–Fort Worth.",
    url: `${site.url}/es/blog`,
  },
};

const CATEGORY_ES: Record<BlogCategory, string> = {
  "Cost & Budget": "Costo y presupuesto",
  Planning: "Planeación",
  Traditions: "Tradiciones",
  "Photography & Film": "Foto y video",
  Locations: "Lugares",
};
const CATEGORY_ORDER: BlogCategory[] = [
  "Cost & Budget",
  "Planning",
  "Traditions",
  "Photography & Film",
  "Locations",
];

export default function EsBlogIndexPage() {
  const posts = getAllEsPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-section md:px-10 lg:px-16 md:pt-section-lg">
        <div className="flex justify-end">
          <Link href="/blog" hrefLang="en" className="text-xs text-wine underline underline-offset-2 hover:text-wine-deep">
            Read in English
          </Link>
        </div>
        <Reveal className="max-w-3xl">
          <p className="eyebrow mb-5">La Guía del Quince</p>
          <h1 className="display-1 text-ink text-balance">Planea su quinceañera sin adivinar.</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            Costos reales, fechas reales y las tradiciones que hacen el día — escrito para las familias
            de Dallas–Fort Worth, para que sepa exactamente qué esperar antes de gastar un solo dólar.
          </p>
        </Reveal>
      </section>

      {featured ? (
        <section className="mx-auto max-w-7xl px-5 py-section md:px-10 lg:px-16">
          <Reveal>
            <Link
              href={`/es/blog/${featured.slug}`}
              className="group block border border-line bg-white p-8 transition-colors hover:border-wine md:p-12"
            >
              <p className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
                {CATEGORY_ES[featured.category]} · Destacado
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-3xl leading-tight text-ink group-hover:text-wine md:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">{featured.excerpt}</p>
              <p className="mt-5 text-xs text-ink-faint">{featured.readMinutes} min de lectura</p>
            </Link>
          </Reveal>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-5 pb-section md:px-10 lg:px-16 md:pb-section-lg">
        {CATEGORY_ORDER.map((cat) => {
          const inCat = rest.filter((p) => p.category === cat);
          if (inCat.length === 0) return null;
          return (
            <div key={cat} className="mt-14 first:mt-0">
              <h2 className="border-b border-line pb-3 font-display text-2xl text-ink">{CATEGORY_ES[cat]}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {inCat.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 3) * 70}>
                    <Link
                      href={`/es/blog/${p.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-colors hover:border-wine"
                    >
                      <h3 className="font-display text-xl leading-tight text-ink group-hover:text-wine">{p.title}</h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{p.excerpt}</p>
                      <p className="mt-4 text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint">
                        {p.readMinutes} min de lectura
                      </p>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-10 lg:px-16">
          <h2 className="display-2 text-cream text-balance">Reserva la fecha de su quinceañera</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-cream/75">
            Le confirmo que su fecha está disponible y le envío un enlace seguro para el depósito. Sin pago ahora mismo.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/reserve" className="rounded-full bg-cream px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-white">
              Reservar mi fecha
            </Link>
            <Link href="/check-your-date" className="rounded-full border border-cream/40 px-6 py-3 text-sm text-cream transition-colors hover:border-cream">
              Ver si mi fecha está libre
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
