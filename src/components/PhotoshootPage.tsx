import Link from "next/link";
import { SlotImage } from "@/components/SlotImage";
import { site } from "@/content/site";
import { getImagesBySection } from "@/lib/content-db";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { commissionLinks, commissionsFor } from "@/content/commissions";
import { ADD_ON_NAME_EN, usd } from "@/lib/commission";
import { getPriceBook } from "@/lib/pricing";
import { PT, fillDeep } from "@/lib/price-text";
import "@/components/txq/pages/places.css";
import { jsonLdString } from "@/lib/json-ld";

/**
 * PRE-QUINCE PHOTOSHOOT landing page (EN /quinceanera-photoshoot, ES
 * /es/sesion-de-fotos-quinceanera). Targets "pre quince photoshoot",
 * "quinceanera photoshoot only dallas fort worth" and "sesión de fotos
 * quinceañera" — the largest gap in the search research. Sells the Portrait
 * Session on its own, and shows where the session is already included. Prices
 * come from the price book; no fabricated offers.
 */

type Locale = "en" | "es";


const COPY = {
  en: {
    path: "/quinceanera-photoshoot",
    eyebrow: "Pre-quince photoshoot / Dallas–Fort Worth",
    h1: "The quinceañera photoshoot, made like an editorial",
    lead: "A pre-quince portrait session for the invitations, the welcome board and the family wall. Book it on its own, no event coverage required, or receive it inside the Full Celebration.",
    check: "Check your date",
    other: "Ver en español",
    otherHref: "/es/sesion-de-fotos-quinceanera",
    sessionEyebrow: "01 / The Portrait Session",
    sessionTitle: `${PT.hours.study} unhurried hours, one plan.`,
    sessionBody: [
      "We plan the session like a magazine sitting: the location, the light, the hour, the two looks. Her own quince gown, a second dress, or both. Your photographer guides posture and light, then steps back so she still looks like herself.",
      "It is also the easiest way to know us before the celebration. By the time the misa begins, the camera already feels familiar.",
    ],
    includedTitle: "What the Portrait Session includes",
    included: [
      `A ${PT.hours.study}-hour portrait session with one photographer`,
      "Location and timing planned with you",
      "60 edited photos",
      "1 short video for social media",
      "Her own dress, a second look, or both",
    ],
    whereEyebrow: "02 / Locations",
    whereTitle: "Where we photograph pre-quince portraits around Dallas",
    where: [
      ["Dallas Arboretum", "Seasonal gardens and fountains. The garden sets its own session fee; we confirm the permit with you."],
      ["Highland Park Village", "Spanish Colonial arcades and storefronts, best early morning."],
      ["Klyde Warren Park", "The skyline over Woodall Rodgers, for a modern city look."],
      ["Fort Worth Botanic Garden", "The Japanese Garden and rose terraces."],
      ["Fort Worth Stockyards", "Brick streets and western light for a vaquera session."],
      ["Private estates and hotel ballrooms", "Your venue, a family home, or a suite before the celebration."],
    ],
    waysEyebrow: "03 / Ways to book",
    waysTitle: "On its own, or already included",
    ways: [
      { label: "Portrait Session, on its own", note: "The session alone, no event coverage", price: PT.price.study },
      { label: "Included in the Full Celebration", note: "Portrait session at one location, plus the full day", price: PT.price.production },
      { label: "Included in the Two-Day Celebration", note: "Two portrait locations on their own day, plus the celebration", price: PT.price.archive },
      { label: ADD_ON_NAME_EN.destination, note: "A photo session in her dress before the big day, added to any package", price: `+${PT.addon.destination}` },
    ],
    compare: "Compare every package",
    faqEyebrow: "04 / Questions",
    faqTitle: "Photoshoot questions, answered.",
    faqs: [
      { q: "How much is a quinceañera photoshoot?", a: `The Portrait Session is ${PT.price.study} on its own: ${PT.hours.study} hours with one photographer, 60 edited photos and a short video for social media. It is included in the Full Celebration (${PT.price.production}) and the Two-Day Celebration (${PT.price.archive}).` },
      { q: "Can we book only the photoshoot, without the event?", a: "Yes. The Portrait Session is designed to stand alone, for the invitations and welcome board, and it works just as well when the celebration itself is covered by family or another team." },
      { q: "Can she wear her own quince dress?", a: "Yes, her own gown and as many as two looks in the session. There is no rental and no restriction on the dress." },
      { q: "When should we schedule it?", a: "Usually two to four months before the celebration, so the portraits are ready for invitations. Spring and fall light in Dallas–Fort Worth is the most forgiving; we plan the hour around it." },
      { q: "Do you handle location permits?", a: "Yes. Some gardens, including the Dallas Arboretum, charge their own photography fee, which is paid to the location. We confirm the rules and book the permit with you before the session." },
      { q: "Are you insured?", a: "Yes, insured and venue-compliant. Many DFW parishes, gardens and venues ask for proof of insurance before a session; we have it ready." },
    ],
    crumb: "Pre-quince photoshoot",
    areasEyebrow: "05 / Areas",
    areas: "Across Dallas–Fort Worth",
    areaLinks: [
      ["/quinceanera-photographer/dallas", "Quinceañera photographer in Dallas"],
      ["/quinceanera-photographer/fort-worth", "Quinceañera photographer in Fort Worth"],
      ["/quinceanera-photographer", "All DFW areas"],
    ],
    alt: "Quinceañera pre-quince portrait session in Dallas–Fort Worth",
  },
  es: {
    path: "/es/sesion-de-fotos-quinceanera",
    eyebrow: "Sesión de fotos pre-quince / Dallas–Fort Worth",
    h1: "La sesión de fotos de quinceañera, hecha como una editorial",
    lead: "Una sesión de retratos pre-quince para las invitaciones, el tablero de bienvenida y la pared de la familia. Resérvala sola, sin cobertura del evento, o recíbela dentro de la Celebración completa.",
    check: "Consultar tu fecha",
    other: "View in English",
    otherHref: "/quinceanera-photoshoot",
    sessionEyebrow: "01 / Sesión de retratos",
    sessionTitle: `${PT.hours.study} horas sin prisa, un solo plan.`,
    sessionBody: [
      "Planeamos la sesión como una producción de revista: el lugar, la luz, la hora y los dos cambios. Su propio vestido de quince, un segundo vestido, o los dos. Tu fotógrafo guía la postura y la luz, y luego se aparta para que ella siga siendo ella.",
      "También es la forma más fácil de conocernos antes de la celebración. Para cuando empieza la misa, la cámara ya le resulta familiar.",
    ],
    includedTitle: "Qué incluye la Sesión de retratos",
    included: [
      `Una sesión de retratos de ${PT.hours.study} horas con un fotógrafo`,
      "Lugar y horario planeados contigo",
      "60 fotos editadas",
      "1 video corto para redes sociales",
      "Su propio vestido, un segundo cambio, o los dos",
    ],
    whereEyebrow: "02 / Lugares",
    whereTitle: "Dónde tomamos los retratos pre-quince en Dallas",
    where: [
      ["Dallas Arboretum", "Jardines de temporada y fuentes. El jardín cobra su propia cuota de sesión; confirmamos el permiso contigo."],
      ["Highland Park Village", "Arcos y fachadas de estilo colonial español, mejor temprano en la mañana."],
      ["Klyde Warren Park", "El horizonte de la ciudad sobre Woodall Rodgers, para un estilo moderno."],
      ["Fort Worth Botanic Garden", "El Jardín Japonés y las terrazas de rosas."],
      ["Stockyards de Fort Worth", "Calles de ladrillo y luz del oeste para una sesión vaquera."],
      ["Residencias privadas y salones de hotel", "Tu salón, la casa de la familia o una suite antes de la celebración."],
    ],
    waysEyebrow: "03 / Cómo reservar",
    waysTitle: "Sola, o ya incluida",
    ways: [
      { label: "Sesión de retratos, por sí sola", note: "Solo la sesión, sin cobertura del evento", price: PT.price.study },
      { label: "Incluida en la Celebración completa", note: "Sesión de retrato en una locación, más el día completo", price: PT.price.production },
      { label: "Incluida en la Celebración de dos días", note: "Dos locaciones de retrato en su propio día, más la celebración", price: PT.price.archive },
      { label: "Sesión con el vestido", note: "Una sesión de fotos con su vestido antes del gran día, añadida a cualquier paquete", price: `+${PT.addon.destination}` },
    ],
    compare: "Comparar todos los paquetes",
    faqEyebrow: "04 / Preguntas",
    faqTitle: "Preguntas sobre la sesión de fotos.",
    faqs: [
      { q: "¿Cuánto cuesta una sesión de fotos de quinceañera?", a: `La Sesión de retratos cuesta ${PT.price.study} por sí sola: ${PT.hours.study} horas con un fotógrafo, 60 fotos editadas y un video corto para redes sociales. Está incluida en la Celebración completa (${PT.price.production}) y en la Celebración de dos días (${PT.price.archive}).` },
      { q: "¿Podemos reservar solo la sesión de fotos, sin el evento?", a: "Sí. La Sesión de retratos está pensada para reservarse sola, para las invitaciones y el tablero de bienvenida, y funciona igual de bien si la celebración la cubre la familia u otro equipo." },
      { q: "¿Puede usar su propio vestido de quince?", a: "Sí, su propio vestido y hasta dos cambios en la sesión. No hay renta ni restricciones sobre el vestido." },
      { q: "¿Cuándo conviene hacerla?", a: "Normalmente de dos a cuatro meses antes de la celebración, para que los retratos estén listos para las invitaciones. La luz de primavera y otoño en Dallas–Fort Worth es la más amable; planeamos la hora alrededor de ella." },
      { q: "¿Ustedes se encargan de los permisos?", a: "Sí. Algunos jardines, como el Dallas Arboretum, cobran su propia cuota de fotografía, que se paga al lugar. Confirmamos las reglas y reservamos el permiso contigo antes de la sesión." },
      { q: "¿Tienen seguro?", a: "Sí, con seguro y en regla con los salones. Muchas parroquias, jardines y salones de DFW piden comprobante de seguro antes de una sesión; lo tenemos listo." },
    ],
    crumb: "Sesión de fotos pre-quince",
    areasEyebrow: "05 / Zonas",
    areas: "En todo Dallas–Fort Worth",
    areaLinks: [
      ["/es/fotografo-de-quinceaneras/dallas", "Fotógrafo de quinceañeras en Dallas"],
      ["/es/fotografo-de-quinceaneras/fort-worth", "Fotógrafo de quinceañeras en Fort Worth"],
      ["/es/fotografo-de-quinceaneras", "Todas las zonas de DFW"],
    ],
    alt: "Sesión de retratos pre-quince en Dallas–Fort Worth",
  },
} satisfies Record<Locale, unknown>;
// COPY carries price tokens (PT.*) — fill with fillDeep(…, book) before rendering.

export async function photoshootMetadata(locale: Locale) {
  const book = await getPriceBook();
  const t = COPY[locale];
  const study = { priceLabel: usd(book.packages.study.price) };
  const en = `${site.url}${COPY.en.path}`;
  const es = `${site.url}${COPY.es.path}`;
  const title =
    locale === "en"
      ? "Quinceañera Photoshoot & Pre-Quince Session — Dallas–Fort Worth"
      : "Sesión de Fotos de Quinceañera y Pre-Quince — Dallas–Fort Worth";
  const description =
    locale === "en"
      ? `Pre-quince photoshoot in Dallas–Fort Worth: a ${book.packages.study.hours}-hour Portrait Session for ${study.priceLabel}, bookable on its own. Her own dress, Arboretum to Highland Park Village.`
      : `Sesión de fotos pre-quince en Dallas–Fort Worth: una Sesión de retratos de ${book.packages.study.hours} horas por ${study.priceLabel}, se reserva sola. Su propio vestido, del Arboretum a Highland Park Village.`;
  return {
    title,
    description,
    alternates: {
      canonical: t.path,
      languages: { "en-US": en, "es-MX": es, "x-default": en },
    },
    openGraph: { title: `${title} · ${site.brand}`, description, url: `${site.url}${t.path}`, ...(locale === "es" ? { locale: "es_MX" } : {}) },
  };
}

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.32) * 100)}%`;
}

export async function PhotoshootPage({ locale }: { locale: Locale }) {
  // Copy carries price tokens; fill from the live price book (body + JSON-LD).
  const book = await getPriceBook();
  const t = fillDeep(COPY[locale], book);
  const study = commissionsFor(book).find((c) => c.id === "study")!;
  const links = commissionLinks[locale];
  const url = `${site.url}${t.path}`;

  const imgs = await getImagesBySection("save-the-date");
  const fallback = portfolioFallback.find((image) => image.section === "save-the-date");
  const heroImage = imgs.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ?? imgs[0] ?? null;
  const hero = heroImage
    ? { url: heroImage.url, alt: heroImage.alt || t.alt, focus: focal(heroImage.focus_x, heroImage.focus_y), local: false }
    : fallback
      ? { url: fallback.url, alt: fallback.alt || t.alt, focus: focal(null, null), local: true }
      : null;
  const supporting = imgs.filter((image) => image.url !== hero?.url).slice(0, 2);
  const pad = (n: number) => String(n).padStart(2, "0");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: locale === "en" ? "Quinceañera Portrait Session (pre-quince photoshoot)" : "Sesión de retratos de quinceañera (sesión pre-quince)",
        serviceType: "Quinceañera portrait session",
        provider: { "@id": `${site.url}/#business` },
        areaServed: { "@type": "AdministrativeArea", name: "Dallas–Fort Worth, TX" },
        offers: { "@type": "Offer", price: String(study.price), priceCurrency: "USD", url },
        inLanguage: locale === "en" ? "en-US" : "es-MX",
        url,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: t.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: locale === "en" ? "Home" : "Inicio", item: `${site.url}${locale === "es" ? "/es" : ""}` },
          { "@type": "ListItem", position: 2, name: t.crumb, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />

      <div className="tq-wrap">
        <nav className="tq-place-crumbs tq-mono" aria-label={locale === "en" ? "Breadcrumb" : "Ruta de navegación"}>
          <ol>
            <li><Link href={locale === "es" ? "/es" : "/"}>{locale === "en" ? "Home" : "Inicio"}</Link></li>
            <li><span aria-current="page">{t.crumb}</span></li>
          </ol>
        </nav>
      </div>

      {hero ? (
        <div className="tq-place-stage">
          <figure className="tq-plate" style={{ margin: 0 }}>
            <div className="tq-plate__loop">
              <SlotImage
                slot="photoshoot.hero"
                lang={locale}
                fill
                priority
                sizes="100vw"
                fallback={{ src: hero.url, alt: hero.alt, focus: hero.focus }}
              />
            </div>
            <figcaption>
              <span className="tq-tag tq-tag--tl tq-mono">[{study.numeral} {study.name[locale]}]</span>
              <span className="tq-tag tq-tag--bl tq-mono">Dallas–Fort Worth</span>
            </figcaption>
          </figure>
        </div>
      ) : null}

      <div className="tq-wrap">
        <div className="tq-ledger tq-place-ledger">
          <div className="tq-ledger__head">
            <p className="tq-mono tq-place-eyebrow">{t.eyebrow}</p>
            <h1 className="tq-display">{t.h1}</h1>
            <p className="tq-ledger__dek">{t.lead}</p>
          </div>
          <div className="tq-ledger__meta">
            <dl className="tq-meta tq-mono">
              <div>
                <dt>{locale === "en" ? "Package" : "Paquete"}</dt>
                <dd>{study.numeral} {study.name[locale]}</dd>
              </div>
              <div>
                <dt>{locale === "en" ? "Price" : "Precio"}</dt>
                <dd className="tq-nums">{study.priceLabel}</dd>
              </div>
              <div>
                <dt>{locale === "en" ? "Region" : "Región"}</dt>
                <dd>DFW</dd>
              </div>
            </dl>
          </div>
          <div className="tq-action">
            <Link href={t.otherHref} hrefLang={locale === "en" ? "es" : "en"} lang={locale === "en" ? "es" : "en"} className="tq-mono tq-place-note">
              {t.other} ↗
            </Link>
            <div style={{ display: "grid", gap: 12 }}>
              <Link href={links.book} className="tq-action__link">
                <span>{t.check}</span>
                <span className="tq-arrow" aria-hidden>→</span>
              </Link>
              <span className="tq-mono tq-muted">{study.numeral} {study.name[locale]} · {study.priceLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="tq-section" aria-labelledby="ps-session-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[{t.sessionEyebrow}]</p>
            <h2 id="ps-session-title" className="tq-display tq-head__title">{t.sessionTitle}</h2>
          </header>
          <div className="tq-place-prose">
            {t.sessionBody.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
          <div className="tq-head" style={{ paddingTop: 0 }}>
            <h3 className="tq-head__index tq-mono" style={{ margin: 0 }}>{t.includedTitle}</h3>
          </div>
          <ol className="tq-place-rows">
            {t.included.map((item, i) => (
              <li key={item} className="tq-place-row">
                <span className="tq-mono tq-place-row__k">[{pad(i + 1)}]</span>
                <span className="tq-display tq-place-row__t">{item}</span>
              </li>
            ))}
          </ol>
          {supporting.length > 0 ? (
            <ul className="tq-place-duo" aria-label={t.crumb}>
              {supporting.map((image, i) => (
                <li key={image.id ?? image.url}>
                  <figure className="tq-place-frame">
                    <SlotImage
                      slot={`photoshoot.detail.${i + 1}`}
                      lang={locale}
                      fill
                      sizes="(min-width: 960px) 40vw, 50vw"
                      fallback={{ src: image.url, alt: image.alt || t.alt, width: image.width, height: image.height, focus: focal(image.focus_x, image.focus_y) }}
                    />
                  </figure>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="tq-section" aria-labelledby="ps-where-title">
        <div className="tq-wrap">
          <header className="tq-head tq-place-head--long">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[{t.whereEyebrow}]</p>
            <h2 id="ps-where-title" className="tq-display tq-head__title">{t.whereTitle}</h2>
          </header>
          <ol className="tq-place-rows">
            {t.where.map(([place, note], i) => (
              <li key={place} className="tq-place-row">
                <span className="tq-mono tq-place-row__k">[{pad(i + 1)}]</span>
                <h3 className="tq-display tq-place-row__t">{place}</h3>
                <p className="tq-place-row__b">{note}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="ps-ways-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[{t.waysEyebrow}]</p>
            <h2 id="ps-ways-title" className="tq-display tq-head__title">{t.waysTitle}</h2>
          </header>
          <ol className="tq-place-rows tq-place-rows--priced" style={{ paddingBottom: 0 }}>
            {t.ways.map((w, i) => (
              <li key={w.label} className="tq-place-row">
                <span className="tq-mono tq-place-row__k">[{pad(i + 1)}]</span>
                <h3 className="tq-display tq-place-row__t">{w.label}</h3>
                <p className="tq-place-row__b">{w.note}</p>
                <p className="tq-display tq-nums tq-place-row__end">{w.price}</p>
              </li>
            ))}
          </ol>
          <div className="tq-place-after" style={{ borderTop: 0 }}>
            <Link href={links.book} className="tq-btn tq-btn--lg">
              {t.check} <span className="tq-arrow" aria-hidden>↗</span>
            </Link>
            <Link href={links.compare} className="tq-btn tq-btn--ghost">
              {t.compare} <span className="tq-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="ps-faq-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[{t.faqEyebrow}]</p>
            <h2 id="ps-faq-title" className="tq-display tq-head__title">{t.faqTitle}</h2>
          </header>
          <div className="tq-faq">
            {t.faqs.map((f, i) => (
              <details key={f.q} className="tq-faq__item" open={i === 0}>
                <summary>
                  <span className="tq-mono tq-muted">{pad(i + 1)}</span>
                  <h3 className="tq-faq__q">{f.q}</h3>
                  <span className="tq-faq__icon" aria-hidden />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="ps-areas-title">
        <div className="tq-wrap tq-place-block">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[{t.areasEyebrow}]</p>
            <h2 id="ps-areas-title" className="tq-display tq-head__title">{t.areas}</h2>
          </header>
          <ul className="tq-place-links">
            {t.areaLinks.map(([href, label]) => (
              <li key={href}>
                <Link href={href}>
                  <span>{label}</span>
                  <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
