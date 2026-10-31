import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/plan/JsonLdScript";
import { site } from "@/content/site";
import { languageAlternates, HREFLANG, OG_LOCALE } from "@/lib/hreflang";
import { getPriceGuide } from "@/lib/plan-db";
import { formatPlanDate, type PlanLang } from "@/lib/plan";
import { guideCategory, guideSamples, guideUpdated, guideUsd, priceGuideFaq } from "@/lib/price-guide";
import { getPriceBook } from "@/lib/pricing";
import { priceFloor, usd } from "@/lib/commission";
import "@/components/txq/pages/pages.css";
import "./plan.css";
import "./price-guide.css";

/**
 * The DFW quinceañera price guide, rendered from the price_guide table (the
 * owner's lead sheet, pasted at /admin/price-guide). Spanish lives at
 * /precios-quince-dfw (the URL Spanish searchers type), English at
 * /quince-prices-dfw; they are an hreflang pair.
 *
 * SEO gates: with no rows the page is noindex (a thin page must not rank),
 * and the FAQ (body + FAQPage JSON-LD) is written from the same numbers as
 * the table, so the structured data always matches the visible content.
 */
export const GUIDE_PATH: Record<PlanLang, string> = { en: "/quince-prices-dfw", es: "/precios-quince-dfw" };

const COPY = {
  en: {
    title: (year: string) => `Quinceañera Prices in Dallas–Fort Worth (${year}): Real Quotes`,
    description: (n: number) =>
      `What a quinceañera really costs in DFW: low, typical and high prices by category${n ? ` from ${n} real quotes` : ""}, updated regularly.`,
    eyebrow: "Price guide / Dallas–Fort Worth",
    h1: "How much does a quinceañera cost in Dallas–Fort Worth?",
    dek: (n: number, date: string) => `Real prices from ${n} quotes DFW families shared with us. Updated ${date}.`,
    col: { category: "Category", low: "Low", typical: "Typical", high: "High", quotes: "Quotes" },
    total: (sum: string) => `Hiring every category above at its typical price comes to about ${sum}. Most families skip or combine a few.`,
    faq: "Questions families ask",
    ours: (from: string) => `Our photo and video packages start at ${from}, with every price published.`,
    planCta: "Get your free quince plan",
    pkgCta: "See our packages",
    empty: "We're gathering this season's quotes. Check back soon, or ask us for a personal plan.",
    method: "How we gather these numbers",
    methodBody:
      "Families planning their quinceañera share the quotes they receive with us. We group them by category and show the lowest, the most common (typical), and the highest price we see. We never list a vendor's name.",
    breadcrumb: "Price guide",
  },
  es: {
    title: (year: string) => `Precios de quinceañera en Dallas–Fort Worth (${year}): cotizaciones reales`,
    description: (n: number) =>
      `Cuánto cuesta de verdad una quinceañera en DFW: precio bajo, típico y alto por categoría${n ? `, de ${n} cotizaciones reales` : ""}, actualizado con frecuencia.`,
    eyebrow: "Guía de precios / Dallas–Fort Worth",
    h1: "¿Cuánto cuesta una quinceañera en Dallas–Fort Worth?",
    dek: (n: number, date: string) => `Precios reales de ${n} cotizaciones que familias de DFW nos compartieron. Actualizado el ${date}.`,
    col: { category: "Categoría", low: "Bajo", typical: "Típico", high: "Alto", quotes: "Cotizaciones" },
    total: (sum: string) => `Contratar todas las categorías al precio típico suma unos ${sum}. La mayoría de las familias omite o combina algunas.`,
    faq: "Preguntas que hacen las familias",
    ours: (from: string) => `Nuestros paquetes de foto y video empiezan en ${from}, con todos los precios publicados.`,
    planCta: "Recibe tu plan de quince gratis",
    pkgCta: "Ver nuestros paquetes",
    empty: "Estamos reuniendo las cotizaciones de esta temporada. Vuelve pronto o pídenos un plan personal.",
    method: "Cómo reunimos estos números",
    methodBody:
      "Las familias que planean su quinceañera nos comparten las cotizaciones que reciben. Las agrupamos por categoría y mostramos el precio más bajo, el más común (típico) y el más alto que vemos. Nunca publicamos el nombre de un proveedor.",
    breadcrumb: "Guía de precios",
  },
} as const;

export async function priceGuideMetadata(lang: PlanLang): Promise<Metadata> {
  const rows = await getPriceGuide();
  const c = COPY[lang];
  const updated = guideUpdated(rows);
  const year = (updated ?? new Date().toISOString()).slice(0, 4);
  const title = c.title(year);
  const description = c.description(guideSamples(rows));
  return {
    title: { absolute: `${title} · ${site.brand}` },
    description,
    alternates: { canonical: GUIDE_PATH[lang], languages: languageAlternates(GUIDE_PATH.en, GUIDE_PATH.es) },
    openGraph: { title, description, url: `${site.url}${GUIDE_PATH[lang]}`, locale: OG_LOCALE[lang], type: "article" },
    ...(rows.length ? {} : { robots: { index: false, follow: true } }),
  };
}

export async function PriceGuidePage({ lang }: { lang: PlanLang }) {
  const [rows, book] = await Promise.all([getPriceGuide(), getPriceBook()]);
  const c = COPY[lang];
  const updated = guideUpdated(rows);
  const updatedLabel = updated ? formatPlanDate(updated, lang, { weekday: false }) : "";
  const samples = guideSamples(rows);
  const faq = priceGuideFaq(rows, lang, updatedLabel);
  const total = rows.reduce((s, r) => s + r.typical_usd, 0);
  const url = `${site.url}${GUIDE_PATH[lang]}`;
  const planHref = lang === "es" ? "/es/plan?src=price-guide" : "/plan?src=price-guide";
  const pkgHref = lang === "es" ? "/es#commissions" : "/#commissions";

  const jsonLd = rows.length
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `${url}#page`,
            url,
            name: c.h1,
            inLanguage: HREFLANG[lang],
            ...(updated ? { dateModified: updated } : {}),
            about: { "@id": `${site.url}/#business` },
          },
          {
            "@type": "FAQPage",
            "@id": `${url}#faq`,
            url,
            inLanguage: HREFLANG[lang],
            mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: site.brand, item: lang === "es" ? `${site.url}/es` : site.url },
              { "@type": "ListItem", position: 2, name: c.breadcrumb, item: url },
            ],
          },
        ],
      }
    : null;

  return (
    <div className="tq-wrap qp-page pg-page">
      {jsonLd ? <JsonLdScript data={jsonLd} /> : null}
      <header className="qp-head">
        <p className="tq-mono qp-eyebrow">[{c.eyebrow}]</p>
        <h1 className="tq-display qp-title">{c.h1}</h1>
        {rows.length ? <p className="qp-intake__intro">{c.dek(samples, updatedLabel)}</p> : <p className="qp-intake__intro">{c.empty}</p>}
      </header>

      {rows.length ? (
        <section className="qp-section" aria-label={c.h1}>
          <table className="pg-table">
            <thead>
              <tr>
                <th scope="col">{c.col.category}</th>
                <th scope="col">{c.col.low}</th>
                <th scope="col">{c.col.typical}</th>
                <th scope="col">{c.col.high}</th>
                <th scope="col">{c.col.quotes}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <th scope="row">{guideCategory(r, lang)}</th>
                  <td data-label={c.col.low} className="tq-nums">{guideUsd(r.low_usd)}</td>
                  <td data-label={c.col.typical} className="tq-nums pg-typical">{guideUsd(r.typical_usd)}</td>
                  <td data-label={c.col.high} className="tq-nums">{guideUsd(r.high_usd)}</td>
                  <td data-label={c.col.quotes} className="tq-nums">{r.sample_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length >= 3 ? <p className="qp-muted">{c.total(guideUsd(total))}</p> : null}
        </section>
      ) : null}

      <section className="qp-section pg-cta" aria-label={c.planCta}>
        <p className="qp-questions">{c.ours(usd(priceFloor(book)))}</p>
        <div className="pg-cta__row">
          <Link href={planHref} className="tq-btn tq-btn--lg qp-cta">
            {c.planCta} <span className="tq-arrow" aria-hidden>→</span>
          </Link>
          <Link href={pkgHref} className="tq-btn tq-btn--lg tq-btn--ghost qp-cta">
            {c.pkgCta}
          </Link>
        </div>
      </section>

      {faq.length ? (
        <section className="qp-section" aria-labelledby="pg-faq">
          <h2 id="pg-faq" className="tq-display qp-h2">{c.faq}</h2>
          <div className="pg-faq">
            {faq.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="qp-section" aria-labelledby="pg-method">
        <h2 id="pg-method" className="tq-display qp-h2">{c.method}</h2>
        <p className="qp-muted">{c.methodBody}</p>
      </section>
    </div>
  );
}
