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
      <section className="mx-auto max-w-5xl px-5 pt-section md:px-10 lg:px-16 md:pt-section-lg">
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
        <section className="mx-auto mt-14 max-w-5xl border-t border-ink/10 px-5 pt-12 md:mt-20 md:px-10 lg:px-16">
          <Reveal>
            <Link href={`/es/blog/${featured.slug}`} className="group block">
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-wine-deep">
                {CATEGORY_ES[featured.category]} · Destacado
              </p>
              <h2
                className="mt-5 max-w-3xl font-display text-ink transition-colors group-hover:text-wine"
                style={{ fontSize: "clamp(2rem,4.6vw,3.4rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
              >
                {featured.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">{featured.excerpt}</p>
              <p className="mt-6 inline-flex items-baseline gap-2 text-[0.66rem] uppercase tracking-[0.2em] text-ink-faint">
                {featured.readMinutes} min de lectura
                <span
                  aria-hidden
                  className="text-wine transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </p>
            </Link>
          </Reveal>
        </section>
      ) : null}

      <section className="mx-auto mt-16 max-w-5xl px-5 pb-section md:mt-24 md:px-10 lg:px-16 md:pb-section-lg">
        {CATEGORY_ORDER.map((cat) => {
          const inCat = rest.filter((p) => p.category === cat);
          if (inCat.length === 0) return null;
          return (
            <div key={cat} className="mt-16 first:mt-0">
              <div className="flex items-baseline justify-between border-b border-ink/10 pb-3">
                <h2 className="font-display text-2xl text-ink md:text-[1.7rem]">{CATEGORY_ES[cat]}</h2>
                <span className="text-[0.6rem] uppercase tracking-[0.22em] text-ink-faint">
                  {inCat.length} {inCat.length === 1 ? "guía" : "guías"}
                </span>
              </div>
              {inCat.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 4) * 60}>
                  <Link
                    href={`/es/blog/${p.slug}`}
                    className={`group block py-7 md:py-8 ${i > 0 ? "border-t border-ink/10" : ""}`}
                  >
                    <div className="flex items-baseline justify-between gap-6">
                      <h3 className="font-display text-xl text-ink transition-colors group-hover:text-wine md:text-2xl">
                        {p.title}
                      </h3>
                      <span className="shrink-0 whitespace-nowrap text-[0.6rem] uppercase tracking-[0.18em] text-ink-faint">
                        {p.readMinutes} min
                      </span>
                    </div>
                    <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-ink-soft">{p.excerpt}</p>
                  </Link>
                </Reveal>
              ))}
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
