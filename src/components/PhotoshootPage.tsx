import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { getImagesBySection } from "@/lib/content-db";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { Reveal } from "@/components/Reveal";
import { commissionLinks, commissions } from "@/content/commissions";
import { ADD_ON_PRICE_USD, TIER_PRICE_USD, usd } from "@/lib/commission";

/**
 * PRE-QUINCE PHOTOSHOOT landing page (EN /quinceanera-photoshoot, ES
 * /es/sesion-de-fotos-quinceanera). Targets "pre quince photoshoot",
 * "quinceanera photoshoot only dallas fort worth" and "sesión de fotos
 * quinceañera" — the largest gap in the search research. Sells the Portrait
 * Study on its own, and shows where the session is already included. Prices
 * come from the price book; no fabricated offers.
 */

type Locale = "en" | "es";

const study = commissions.find((c) => c.id === "study")!;

const COPY = {
  en: {
    path: "/quinceanera-photoshoot",
    eyebrow: "Pre-quince photoshoot / Dallas–Fort Worth",
    h1: "The quinceañera photoshoot, made like an editorial",
    lead: "A pre-quince portrait session for the invitations, the welcome board and the family wall. Book it on its own, no event coverage required, or receive it inside The Full Production.",
    check: "Check your date",
    other: "Ver en español",
    otherHref: "/es/sesion-de-fotos-quinceanera",
    sessionEyebrow: "The Portrait Study / 01",
    sessionTitle: "Three unhurried hours, one direction.",
    sessionBody: [
      "We plan the session like a magazine sitting: the location, the light, the hour, the two looks. Her own quince gown, a second dress, or both. A director guides posture and light, then steps back so she still looks like herself.",
      "It is also the easiest way to know us before the celebration. By the time the misa begins, the camera already feels familiar.",
    ],
    includedTitle: "What the Portrait Study includes",
    included: [
      "A 3-hour editorial portrait session",
      "Location and timing planned with you",
      "60 retouched frames",
      "1 motion portrait for social",
      "Her own dress, a second look, or both",
    ],
    whereEyebrow: "Locations / 02",
    whereTitle: "Where we photograph pre-quince portraits around Dallas",
    where: [
      ["Dallas Arboretum", "Seasonal gardens and fountains. The garden sets its own session fee; we confirm the permit with you."],
      ["Highland Park Village", "Spanish Colonial arcades and storefronts, best early morning."],
      ["Klyde Warren Park", "The skyline over Woodall Rodgers, for a modern city look."],
      ["Fort Worth Botanic Garden", "The Japanese Garden and rose terraces."],
      ["Fort Worth Stockyards", "Brick streets and western light for a vaquera session."],
      ["Private estates and hotel ballrooms", "Your venue, a family home, or a suite before the celebration."],
    ],
    waysEyebrow: "Ways to book / 03",
    waysTitle: "On its own, or already included",
    ways: [
      { label: "Portrait Study, on its own", note: "The session alone, no event coverage", price: usd(TIER_PRICE_USD.study) },
      { label: "Included in III. The Full Production", note: "Portrait session at one location, plus the full day", price: usd(TIER_PRICE_USD.production) },
      { label: "Included in IV. Multi-Day Editorial Archive", note: "Two portrait locations, plus the whole season", price: usd(TIER_PRICE_USD.archive) },
      { label: "Destination portrait session", note: "A half-day anywhere in Texas, added to any commission", price: `+${usd(ADD_ON_PRICE_USD.destination)}` },
    ],
    compare: "Compare every commission",
    faqTitle: "Photoshoot questions, answered.",
    faqs: [
      { q: "How much is a quinceañera photoshoot?", a: `The Portrait Study is ${usd(TIER_PRICE_USD.study)} on its own: a 3-hour editorial session with 60 retouched frames and a motion portrait. It is included in The Full Production (${usd(TIER_PRICE_USD.production)}) and the Multi-Day Editorial Archive (${usd(TIER_PRICE_USD.archive)}).` },
      { q: "Can we book only the photoshoot, without the event?", a: "Yes. The Portrait Study is designed to stand alone, for the invitations and welcome board, and it works just as well when the celebration itself is covered by family or another team." },
      { q: "Can she wear her own quince dress?", a: "Yes, her own gown and as many as two looks in the session. There is no rental and no restriction on the dress." },
      { q: "When should we schedule it?", a: "Usually two to four months before the celebration, so the portraits are ready for invitations. Spring and fall light in Dallas–Fort Worth is the most forgiving; we plan the hour around it." },
      { q: "Do you handle location permits?", a: "Yes. Some gardens, including the Dallas Arboretum, charge their own photography fee, which is paid to the location. We confirm the rules and book the permit with you before the session." },
      { q: "Are you insured?", a: "Yes, insured and venue-compliant. Many DFW parishes, gardens and venues ask for proof of insurance before a session; we have it ready." },
    ],
    crumb: "Pre-quince photoshoot",
    areas: "Across Dallas–Fort Worth",
    areaLinks: [
      ["/quinceanera-photographer/dallas", "Quinceañera photographer in Dallas"],
      ["/quinceanera-photographer/fort-worth", "Quinceañera photographer in Fort Worth"],
      ["/quinceanera-photographer", "All DFW areas →"],
    ],
    alt: "Quinceañera pre-quince portrait session in Dallas–Fort Worth",
  },
  es: {
    path: "/es/sesion-de-fotos-quinceanera",
    eyebrow: "Sesión de fotos pre-quince / Dallas–Fort Worth",
    h1: "La sesión de fotos de quinceañera, hecha como una editorial",
    lead: "Una sesión de retratos pre-quince para las invitaciones, el tablero de bienvenida y la pared de la familia. Resérvala sola, sin cobertura del evento, o recíbela dentro de La producción completa.",
    check: "Consultar tu fecha",
    other: "View in English",
    otherHref: "/quinceanera-photoshoot",
    sessionEyebrow: "Estudio de retrato / 01",
    sessionTitle: "Tres horas sin prisa, una sola dirección.",
    sessionBody: [
      "Planeamos la sesión como una producción de revista: el lugar, la luz, la hora y los dos cambios. Su propio vestido de quince, un segundo vestido, o los dos. Un director guía la postura y la luz, y luego se aparta para que ella siga siendo ella.",
      "También es la forma más fácil de conocernos antes de la celebración. Para cuando empieza la misa, la cámara ya le resulta familiar.",
    ],
    includedTitle: "Qué incluye el Estudio de retrato",
    included: [
      "Una sesión editorial de 3 horas",
      "Lugar y horario planeados contigo",
      "60 imágenes retocadas",
      "1 retrato en movimiento para redes",
      "Su propio vestido, un segundo cambio, o los dos",
    ],
    whereEyebrow: "Lugares / 02",
    whereTitle: "Dónde tomamos los retratos pre-quince en Dallas",
    where: [
      ["Dallas Arboretum", "Jardines de temporada y fuentes. El jardín cobra su propia cuota de sesión; confirmamos el permiso contigo."],
      ["Highland Park Village", "Arcos y fachadas de estilo colonial español, mejor temprano en la mañana."],
      ["Klyde Warren Park", "El horizonte de la ciudad sobre Woodall Rodgers, para un estilo moderno."],
      ["Fort Worth Botanic Garden", "El Jardín Japonés y las terrazas de rosas."],
      ["Stockyards de Fort Worth", "Calles de ladrillo y luz del oeste para una sesión vaquera."],
      ["Residencias privadas y salones de hotel", "Tu salón, la casa de la familia o una suite antes de la celebración."],
    ],
    waysEyebrow: "Cómo reservar / 03",
    waysTitle: "Sola, o ya incluida",
    ways: [
      { label: "Estudio de retrato, por sí solo", note: "Solo la sesión, sin cobertura del evento", price: usd(TIER_PRICE_USD.study) },
      { label: "Incluida en III. La producción completa", note: "Sesión de retrato en una locación, más el día completo", price: usd(TIER_PRICE_USD.production) },
      { label: "Incluida en IV. Archivo editorial de varios días", note: "Dos locaciones de retrato, más toda la temporada", price: usd(TIER_PRICE_USD.archive) },
      { label: "Sesión de retrato en destino", note: "Medio día en cualquier parte de Texas, añadido a cualquier encargo", price: `+${usd(ADD_ON_PRICE_USD.destination)}` },
    ],
    compare: "Comparar todos los encargos",
    faqTitle: "Preguntas sobre la sesión de fotos.",
    faqs: [
      { q: "¿Cuánto cuesta una sesión de fotos de quinceañera?", a: `El Estudio de retrato cuesta ${usd(TIER_PRICE_USD.study)} por sí solo: una sesión editorial de 3 horas con 60 imágenes retocadas y un retrato en movimiento. Está incluido en La producción completa (${usd(TIER_PRICE_USD.production)}) y en el Archivo editorial de varios días (${usd(TIER_PRICE_USD.archive)}).` },
      { q: "¿Podemos reservar solo la sesión de fotos, sin el evento?", a: "Sí. El Estudio de retrato está pensado para reservarse solo, para las invitaciones y el tablero de bienvenida, y funciona igual de bien si la celebración la cubre la familia u otro equipo." },
      { q: "¿Puede usar su propio vestido de quince?", a: "Sí, su propio vestido y hasta dos cambios en la sesión. No hay renta ni restricciones sobre el vestido." },
      { q: "¿Cuándo conviene hacerla?", a: "Normalmente de dos a cuatro meses antes de la celebración, para que los retratos estén listos para las invitaciones. La luz de primavera y otoño en Dallas–Fort Worth es la más amable; planeamos la hora alrededor de ella." },
      { q: "¿Ustedes se encargan de los permisos?", a: "Sí. Algunos jardines, como el Dallas Arboretum, cobran su propia cuota de fotografía, que se paga al lugar. Confirmamos las reglas y reservamos el permiso contigo antes de la sesión." },
      { q: "¿Tienen seguro?", a: "Sí, con seguro y en regla con los salones. Muchas parroquias, jardines y salones de DFW piden comprobante de seguro antes de una sesión; lo tenemos listo." },
    ],
    crumb: "Sesión de fotos pre-quince",
    areas: "En todo Dallas–Fort Worth",
    areaLinks: [
      ["/es/fotografo-de-quinceaneras/dallas", "Fotógrafo de quinceañeras en Dallas"],
      ["/es/fotografo-de-quinceaneras/fort-worth", "Fotógrafo de quinceañeras en Fort Worth"],
      ["/es/fotografo-de-quinceaneras", "Todas las zonas de DFW →"],
    ],
    alt: "Sesión de retratos pre-quince en Dallas–Fort Worth",
  },
} satisfies Record<Locale, unknown>;

export function photoshootMetadata(locale: Locale) {
  const t = COPY[locale];
  const en = `${site.url}${COPY.en.path}`;
  const es = `${site.url}${COPY.es.path}`;
  const title =
    locale === "en"
      ? "Quinceañera Photoshoot & Pre-Quince Session — Dallas–Fort Worth"
      : "Sesión de Fotos de Quinceañera y Pre-Quince — Dallas–Fort Worth";
  const description =
    locale === "en"
      ? `Pre-quince photoshoot in Dallas–Fort Worth: a 3-hour editorial Portrait Study for ${study.priceLabel}, bookable on its own. Her own dress, Arboretum to Highland Park Village.`
      : `Sesión de fotos pre-quince en Dallas–Fort Worth: un Estudio de retrato editorial de 3 horas por ${study.priceLabel}, se reserva solo. Su propio vestido, del Arboretum a Highland Park Village.`;
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
  const t = COPY[locale];
  const links = commissionLinks[locale];
  const url = `${site.url}${t.path}`;

  const imgs = await getImagesBySection("save-the-date");
  const fallback = portfolioFallback.find((image) => image.section === "save-the-date");
  const hero =
    imgs.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ??
    imgs[0] ??
    (fallback ? { url: fallback.url, alt: fallback.alt, focus_x: null, focus_y: null } : null);
  const supporting = imgs.filter((image) => image.url !== hero?.url).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: locale === "en" ? "Quinceañera Portrait Study (pre-quince photoshoot)" : "Estudio de retrato de quinceañera (sesión pre-quince)",
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-ink text-white sm:min-h-[80svh]" aria-labelledby="photoshoot-title">
        <Image src={hero?.url ?? "/portfolio/save-date.webp"} alt={hero?.alt || t.alt} fill unoptimized={!hero} priority sizes="100vw" className="object-cover" style={{ objectPosition: focal(hero?.focus_x, hero?.focus_y) }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <p className="text-xs uppercase tracking-[0.24em] text-white/85">{t.eyebrow}</p>
          <h1 id="photoshoot-title" className="mt-5 max-w-[23ch] font-display text-[clamp(2.15rem,4vw,4rem)] font-light leading-[1.14]">{t.h1}</h1>
        </div>
      </header>

      <section className="bg-ivory px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-[78rem] gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-20">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">{study.numeral} {study.name[locale]} · {study.priceLabel}</p>
          <div>
            <p className="max-w-[34ch] font-display text-[clamp(1.6rem,2.6vw,2.6rem)] font-light leading-[1.24] text-ink">{t.lead}</p>
            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
              <Link href={links.book} className="inline-flex min-h-12 items-center gap-4 border-b border-ink text-xs uppercase tracking-[0.16em] text-ink">{t.check} <span aria-hidden="true">↗</span></Link>
              <Link href={t.otherHref} hrefLang={locale === "en" ? "es" : "en"} className="inline-flex min-h-12 items-center border-b border-ink text-xs uppercase tracking-[0.16em] text-ink">{t.other} ↗</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 md:px-10 md:py-20 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] lg:gap-16 lg:px-16">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">{t.sessionEyebrow}</p>
        <Reveal className="flex max-w-3xl flex-col gap-6">
          <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] font-normal leading-tight text-ink text-balance">{t.sessionTitle}</h2>
          {t.sessionBody.map((para) => (
            <p key={para} className="text-base leading-relaxed text-ink-soft">{para}</p>
          ))}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">{t.includedTitle}</h3>
            <ul className="mt-4 grid gap-x-8 gap-y-2 text-base leading-7 text-ink sm:grid-cols-2">
              {t.included.map((item) => (
                <li key={item} className="border-b border-line/70 pb-2">{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {supporting.length > 0 ? (
        <section className="mx-auto max-w-[90rem] px-5 pb-16 md:px-10 md:pb-20 lg:px-16" aria-label={t.crumb}>
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {supporting.map((image) => (
              <div key={image.id ?? image.url} className="relative aspect-[4/5] overflow-hidden bg-greige sm:aspect-[3/4]">
                <Image src={image.url} alt={image.alt || t.alt} fill sizes="50vw" className="object-cover" style={{ objectPosition: focal(image.focus_x, image.focus_y) }} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-[#e9e8e4]">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 md:px-10 md:py-20 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] lg:gap-16 lg:px-16">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">{t.whereEyebrow}</p>
          <Reveal>
            <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] font-normal leading-tight text-ink text-balance">{t.whereTitle}</h2>
            <dl className="mt-8 divide-y divide-ink/15 border-y border-ink/15">
              {t.where.map(([place, note]) => (
                <div key={place} className="grid gap-1 py-5 sm:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] sm:gap-6">
                  <dt className="font-display text-xl text-ink">{place}</dt>
                  <dd className="text-base leading-7 text-ink-soft">{note}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-20 lg:px-16">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">{t.waysEyebrow}</p>
        <Reveal>
          <h2 className="mt-4 font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink text-balance">{t.waysTitle}</h2>
        </Reveal>
        <div className="mt-10 border-t border-line">
          {t.ways.map((w, i) => (
            <Reveal key={w.label} delay={i * 80} className="grid gap-3 border-b border-line py-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-8">
              <div>
                <h3 className="font-display text-[clamp(1.4rem,2.1vw,2rem)] font-normal text-ink">{w.label}</h3>
                <p className="mt-2 text-base text-ink-soft">{w.note}</p>
              </div>
              <p className="font-display text-[1.5rem] font-normal text-ink">{w.price}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-base">
          <Link href={links.book} className="inline-flex min-h-12 items-center gap-4 border-b border-ink font-medium text-ink">{t.check} <span aria-hidden="true">↗</span></Link>
          <Link href={links.compare} className="inline-flex min-h-12 items-center text-ink underline underline-offset-2 hover:text-ink-soft">{t.compare} →</Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 md:px-10 lg:px-16 md:py-20">
        <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">{t.faqTitle}</h2>
        <dl className="mt-10 divide-y divide-line border-y border-line">
          {t.faqs.map((f) => (
            <div key={f.q} className="py-7">
              <dt className="font-display text-xl text-ink">{f.q}</dt>
              <dd className="mt-3 text-base leading-7 text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-[#e9e8e4]">
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-10 lg:px-16 md:py-20">
          <p className="eyebrow mb-5">{t.areas}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {t.areaLinks.map(([href, label]) => (
              <Link key={href} href={href} className="inline-flex min-h-11 items-center border-b border-ink text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
