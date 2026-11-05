import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { inspoImageSrc, type InspoPlace } from "@/content/inspo-places";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";
import { jsonLdString } from "@/lib/json-ld";
import { HREFLANG, OG_LOCALE, languageAlternates } from "@/lib/hreflang";
import { ContactButtons } from "@/components/ContactButtons";
import "@/components/txq/pages/places.css";
import "@/components/txq/pages/inspo.css";

/**
 * InspoPlacePage — the photo-spot inspiration page template (one per location,
 * EN + ES). Content lives in src/content/inspo-places.ts.
 *
 * Photos are shown whole: each frame takes the photo's own aspect ratio and the
 * image is `object-fit: contain`, so nothing is cropped, overlaid or tinted.
 * Schema: the page's photos are ImageObjects whose contentLocation is a Place
 * (the location is never marked up as a LocalBusiness); TX Quince is the
 * business, referenced by its site-wide @id.
 */

type Lang = "en" | "es";

const UI = {
  en: { home: "Home", budget: "/budget", check: "/check-your-date", checkLabel: "Check her date", photo: "Photo", of: "of", credit: "Photographed by TX Quince at", talk: "Prefer to talk it through? Text, WhatsApp or call, in English or Spanish.", more: "Keep planning" },
  es: { home: "Inicio", budget: "/es/presupuesto", check: "/es/consulta", checkLabel: "Consultar su fecha", photo: "Foto", of: "de", credit: "Fotografiado por TX Quince en", talk: "¿Prefieren platicarlo? Mándennos un texto, WhatsApp o llámennos, en español o inglés.", more: "Sigan planeando" },
} as const;

function cityHref(place: InspoPlace, lang: Lang): string {
  return lang === "es"
    ? `/es/fotografo-de-quinceaneras/${place.citySlug}`
    : `/quinceanera-photographer/${place.citySlug}`;
}

export function inspoMetadata(place: InspoPlace, lang: Lang): Metadata {
  const c = place.copy[lang];
  const cover = place.photos[0];
  const url = `${site.url}${place.path[lang]}`;
  return {
    title: c.metaTitle,
    description: c.description,
    alternates: {
      canonical: place.path[lang],
      languages: languageAlternates(place.path.en, place.path.es),
    },
    openGraph: {
      type: "website",
      siteName: site.brand,
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[lang === "en" ? "es" : "en"]],
      title: c.metaTitle,
      description: c.description,
      url,
      // A plain photo, never text on a photo.
      images: [{ url: `${site.url}${inspoImageSrc(place, cover.file)}`, width: cover.width, height: cover.height, alt: cover.alt[lang] }],
    },
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.description,
      images: [`${site.url}${inspoImageSrc(place, cover.file)}`],
    },
  };
}

function Photo({ place, i, lang, priority = false }: { place: InspoPlace; i: number; lang: Lang; priority?: boolean }) {
  const p = place.photos[i];
  const ui = UI[lang];
  return (
    <figure className="tq-inspo-fig" style={{ ["--inspo-ar" as string]: String(p.width / p.height) }}>
      <div className="tq-inspo-fig__frame" style={{ aspectRatio: `${p.width} / ${p.height}` }}>
        {/* Static, pre-sized WebP (800w + 1600w); next/image is not used so the
            browser picks the right file without an image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={inspoImageSrc(place, p.file)}
          srcSet={`${inspoImageSrc(place, p.file, 800)} 800w, ${inspoImageSrc(place, p.file)} 1600w`}
          sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1279px) 45vw, 560px"
          width={p.width}
          height={p.height}
          alt={p.alt[lang]}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      </div>
      <figcaption className="tq-inspo-fig__cap">
        <span className="tq-mono">
          {ui.photo} {String(i + 1).padStart(2, "0")} {ui.of} {String(place.photos.length).padStart(2, "0")}
        </span>
        <span>{p.caption[lang]}</span>
      </figcaption>
    </figure>
  );
}

export async function InspoPlacePage({ place, lang }: { place: InspoPlace; lang: Lang }) {
  const book = await getPriceBook();
  const c = fillDeep(place.copy[lang], book);
  const ui = UI[lang];
  const url = `${site.url}${place.path[lang]}`;
  const budgetHref = `${ui.budget}?ref=${place.ref}`;
  const placeId = `${site.url}${place.path.en}#place`;
  const business = { "@id": `${site.url}/#business` };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: c.metaTitle,
        description: c.description,
        inLanguage: HREFLANG[lang],
        isPartOf: { "@id": `${site.url}/#website`, "@type": "WebSite", url: site.url, name: site.brand },
        about: { "@id": placeId },
        publisher: business,
        primaryImageOfPage: { "@id": `${url}#photo-01` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        // The location itself: a Place, never a LocalBusiness.
        "@type": "Place",
        "@id": placeId,
        name: place.place.name,
        ...(place.place.alternateName ? { alternateName: place.place.alternateName } : {}),
        address: {
          "@type": "PostalAddress",
          addressLocality: place.place.locality,
          addressRegion: place.place.region,
          addressCountry: "US",
        },
        ...(place.place.containedIn
          ? {
              containedInPlace: {
                "@type": "Place",
                name: `${place.place.containedIn}, ${place.place.locality}, ${place.place.region}`,
              },
            }
          : {}),
      },
      ...place.photos.map((p, i) => ({
        "@type": "ImageObject",
        "@id": `${url}#photo-${String(i + 1).padStart(2, "0")}`,
        contentUrl: `${site.url}${inspoImageSrc(place, p.file)}`,
        url: `${site.url}${inspoImageSrc(place, p.file)}`,
        width: p.width,
        height: p.height,
        caption: p.caption[lang],
        description: p.alt[lang],
        inLanguage: HREFLANG[lang],
        contentLocation: { "@id": placeId },
        creator: business,
        copyrightHolder: business,
        creditText: site.brand,
      })),
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: ui.home, item: `${site.url}${lang === "es" ? "/es" : ""}` },
          { "@type": "ListItem", position: 2, name: c.crumbCity, item: `${site.url}${cityHref(place, lang)}` },
          { "@type": "ListItem", position: 3, name: c.crumbPlace, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: HREFLANG[lang],
        mainEntity: c.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />

      <div className="tq-wrap">
        <nav className="tq-place-crumbs tq-mono" aria-label="Breadcrumb">
          <ol>
            <li><Link href={lang === "es" ? "/es" : "/"}>{ui.home}</Link></li>
            <li><Link href={cityHref(place, lang)}>{c.crumbCity}</Link></li>
            <li><span aria-current="page">{c.crumbPlace}</span></li>
          </ol>
        </nav>
      </div>

      <article className="tq-inspo">
        <header className="tq-wrap tq-inspo-hero">
          <div className="tq-inspo-hero__text">
            <p className="tq-mono tq-inspo-eyebrow">{c.eyebrow}</p>
            <h1 className="tq-display tq-inspo-h1">{c.h1}</h1>
            <p className="tq-inspo-answer">{c.answer}</p>
            <p className="tq-inspo-lead">{c.lead}</p>
            <p className="tq-inspo-credit">
              {ui.credit} {place.credit[lang]}
            </p>
            <div className="tq-inspo-actions">
              <Link href={budgetHref} className="tq-btn tq-btn--lg tq-inspo-cta">
                {c.ctaLabel} <span className="tq-arrow" aria-hidden>↗</span>
              </Link>
              <Link href={lang === "es" ? place.path.en : place.path.es} className="tq-btn tq-btn--ghost" hrefLang={lang === "es" ? "en" : "es"}>
                {c.switchLabel}
              </Link>
            </div>
          </div>
          <div className="tq-inspo-hero__photo">
            <Photo place={place} i={0} lang={lang} priority />
          </div>
        </header>

        <section className="tq-wrap tq-inspo-block" aria-labelledby="inspo-gallery">
          <h2 id="inspo-gallery" className="tq-display tq-inspo-h2">{c.galleryTitle}</h2>
          <div className="tq-inspo-gallery">
            {place.photos.slice(1).map((p, k) => (
              <Photo key={p.file} place={place} i={k + 1} lang={lang} />
            ))}
          </div>
        </section>

        {c.sections.map((s, k) => (
          <section key={s.title} className="tq-wrap tq-inspo-block tq-inspo-text" aria-labelledby={`inspo-s${k}`}>
            <h2 id={`inspo-s${k}`} className="tq-display tq-inspo-h2">{s.title}</h2>
            {s.body?.map((b) => <p key={b}>{b}</p>)}
            {s.items ? (
              <ul className="tq-inspo-list">
                {s.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="tq-wrap tq-inspo-block tq-inspo-text" aria-labelledby="inspo-book">
          <h2 id="inspo-book" className="tq-display tq-inspo-h2">{c.bookTitle}</h2>
          {c.book.map((b) => <p key={b}>{b}</p>)}
          <div className="tq-inspo-actions">
            <Link href={budgetHref} className="tq-btn tq-btn--lg tq-inspo-cta">
              {c.ctaLabel} <span className="tq-arrow" aria-hidden>↗</span>
            </Link>
            <Link href={ui.check} className="tq-btn tq-btn--ghost">{ui.checkLabel}</Link>
          </div>
          <p className="tq-inspo-talk">{ui.talk}</p>
          <ContactButtons lang={lang} placement={`inspo-${place.slug}`} primary={false} />
        </section>

        <section className="tq-wrap tq-inspo-block tq-inspo-text" aria-labelledby="inspo-more">
          <h2 id="inspo-more" className="tq-display tq-inspo-h2">{ui.more}</h2>
          <ul className="tq-inspo-links">
            <li>
              <Link href={cityHref(place, lang)}>{c.cityLink} <span aria-hidden>→</span></Link>
            </li>
            {c.moreLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label} <span aria-hidden>→</span></Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="tq-wrap tq-inspo-block" aria-labelledby="inspo-faq">
          <h2 id="inspo-faq" className="tq-display tq-inspo-h2">{c.faqTitle}</h2>
          <div className="tq-faq">
            {c.faqs.map((f, i) => (
              <details key={f.q} className="tq-faq__item" open={i === 0}>
                <summary>
                  <span className="tq-mono tq-muted">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="tq-faq__q">{f.q}</h3>
                  <span className="tq-faq__icon" aria-hidden />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
