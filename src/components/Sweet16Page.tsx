import Link from "next/link";
import { ogBase } from "@/lib/share-meta";
import { site } from "@/content/site";
import { getBlogPhoto } from "@/content/blog-photos";
import { commissionLinks, commissionsFor } from "@/content/commissions";
import { getPriceBook } from "@/lib/pricing";
import "@/components/txq/pages/places.css";
import { jsonLdString } from "@/lib/json-ld";
import { HREFLANG, OG_LOCALE, languageAlternates } from "@/lib/hreflang";

/**
 * SWEET 16 landing page (EN /sweet-16-photographer, ES /es/fotografo-de-sweet-16).
 *
 * Facts on this page come from the owner (2026-11-10): TX Quince photographs
 * and films sweet 16s, has covered sisters celebrating together (a quince and
 * a sweet 16 in one night), and birthdays up to 18. A sweet 16 uses the same
 * packages and prices as a quinceañera (owner, 2026-11-10), so the price rows
 * are read from the live price book; no price is typed in this file.
 * Photos are real celebrations from the published albums; the captions say so.
 */

type Locale = "en" | "es";

const HERO = "album-plaza-pink-gold-175";
const DUO = ["album-plaza-pink-gold-153", "album-plaza-pink-gold-107"];

const COPY = {
  en: {
    path: "/sweet-16-photographer",
    crumb: "Sweet 16 photographer",
    eyebrow: "Sweet 16 / Dallas–Fort Worth",
    h1: "Sweet 16 photos and video, made with the same care as a quince",
    lead: "TX Quince photographs and films sweet 16 celebrations across Dallas–Fort Worth, in English or Spanish. One team for the portraits, the entrance, the dances and the party.",
    check: "Check your date",
    other: "Ver en español",
    otherHref: "/es/fotografo-de-sweet-16",
    photoNote: "From a celebration we photographed in Irving",
    coverEyebrow: "01 / What we cover",
    coverTitle: "Her whole night, start to finish.",
    coverBody: [
      "A sweet 16 has its own shape. Some families keep the traditions of a quinceañera, with a court, a waltz and a toast. Others want a birthday party with a grand entrance, a father-daughter dance and a full dance floor. We plan the coverage around the night you are having, not a template.",
      "Photos and video are made by the same team, so nobody is in anyone's way, and we, the owners, edit every gallery and film.",
    ],
    coverListTitle: "Moments families ask us to keep",
    coverList: [
      "Portraits in her dress before the guests arrive",
      "The grand entrance",
      "The father-daughter dance and the toast",
      "The candle ceremony or the shoe change, if you have one",
      "The cake, the friends and the dance floor",
    ],
    sistersEyebrow: "02 / Sisters and shared celebrations",
    sistersTitle: "A quince and a sweet 16 in one night.",
    sistersBody: [
      "We have photographed sisters who celebrated together: one turning fifteen, the other sixteen. A shared night needs a plan so each girl gets her own entrance, her own portraits and her own dance, and neither feels like a guest at the other's party.",
      "We also photograph birthdays up to eighteen. Tell us who is celebrating and we plan the day around them.",
    ],
    priceEyebrow: "03 / Packages and prices",
    priceTitle: "The same packages as a quinceañera, every price published.",
    priceBody: "A sweet 16 is booked with the same packages and the same prices as a quinceañera. Nothing is hidden, and nothing is charged to send a request.",
    pick: "Our pick",
    budget: "See packages and prices",
    budgetHref: "/budget",
    faqEyebrow: "04 / Questions",
    faqTitle: "Sweet 16 questions, answered.",
    faqs: [
      { q: "Do you photograph sweet 16 parties, or only quinceañeras?", a: "Both. TX Quince photographs and films sweet 16 celebrations across Dallas–Fort Worth, as well as quinceañeras." },
      { q: "Can you cover two sisters celebrating together?", a: "Yes. We have covered sisters who shared one celebration, one turning fifteen and the other sixteen. We plan separate portraits, entrances and dances so each girl has her own moments." },
      { q: "How much does a sweet 16 photographer cost?", a: "The same as a quinceañera. A sweet 16 uses the same packages at the same published prices, listed on this page and on the budget page." },
      { q: "Do you offer both photo and video for a sweet 16?", a: "Yes. One team makes the photos and the video, and we, the owners, edit every gallery and film." },
      { q: "Do you speak Spanish?", a: "Yes. Everything runs in English and Spanish, from the first message to the day itself." },
      { q: "Where can we order invitations, posters and shirts?", a: "We send every family to QuinceNetwork, our sister shop, at quincenetwork.com. Ask us for the TX Quince discount code." },
      { q: "Do you photograph weddings?", a: "Weddings are photographed through our wedding studio at smallhourwedding.com." },
    ],
    areasEyebrow: "05 / Keep looking",
    areas: "More from TX Quince",
    areaLinks: [
      ["/budget", "Packages and prices"],
      ["/portfolio", "Portfolio"],
      ["/blog/quinceanera-vs-sweet-16", "Quinceañera vs sweet 16: the differences"],
      ["/quinceanera-photoshoot", "Portrait session before the party"],
      ["/quinceanera-videographer", "Video"],
    ],
    alt: "Family and guests raise their glasses in a toast around the girl of honor in a pink gown at a reception in Irving",
    title: "Sweet 16 Photographer & Videographer in Dallas–Fort Worth",
    description: "Sweet 16 photos and video across Dallas–Fort Worth, in English or Spanish. Portraits, the entrance, the dances and the party. Sisters celebrating together welcome.",
  },
  es: {
    path: "/es/fotografo-de-sweet-16",
    crumb: "Fotógrafo de sweet 16",
    eyebrow: "Sweet 16 / Dallas–Fort Worth",
    h1: "Fotos y video de sweet 16, con el mismo cuidado que unos quince",
    lead: "TX Quince fotografía y graba fiestas de sweet 16 en todo Dallas–Fort Worth, en español o en inglés. Un solo equipo para los retratos, la entrada, los bailes y la fiesta.",
    check: "Consulte su fecha",
    other: "View in English",
    otherHref: "/sweet-16-photographer",
    photoNote: "De una celebración que fotografiamos en Irving",
    coverEyebrow: "01 / Lo que cubrimos",
    coverTitle: "Toda su noche, de principio a fin.",
    coverBody: [
      "Un sweet 16 tiene su propia forma. Algunas familias conservan las tradiciones de una quinceañera, con corte, vals y brindis. Otras quieren una fiesta de cumpleaños con gran entrada, baile con papá y la pista llena. Planeamos la cobertura según la noche que usted va a tener, no según una plantilla.",
      "Las fotos y el video los hace el mismo equipo, así nadie se estorba, y nosotros, los dueños, editamos cada galería y cada video.",
    ],
    coverListTitle: "Momentos que las familias nos piden guardar",
    coverList: [
      "Retratos con su vestido antes de que lleguen los invitados",
      "La gran entrada",
      "El baile con papá y el brindis",
      "La ceremonia de las velas o el cambio de zapatillas, si lo hacen",
      "El pastel, las amistades y la pista de baile",
    ],
    sistersEyebrow: "02 / Hermanas y fiestas compartidas",
    sistersTitle: "Unos quince y un sweet 16 en una sola noche.",
    sistersBody: [
      "Hemos fotografiado a hermanas que celebraron juntas: una cumplía quince y la otra dieciséis. Una noche compartida necesita un plan para que cada una tenga su entrada, sus retratos y su baile, y ninguna se sienta invitada en la fiesta de la otra.",
      "También fotografiamos cumpleaños hasta los dieciocho. Díganos quién celebra y planeamos el día alrededor de ellas.",
    ],
    priceEyebrow: "03 / Paquetes y precios",
    priceTitle: "Los mismos paquetes que unos quince, con todos los precios publicados.",
    priceBody: "Un sweet 16 se reserva con los mismos paquetes y los mismos precios que una quinceañera. No hay nada escondido, y no se cobra nada por enviar una solicitud.",
    pick: "Nuestra recomendación",
    budget: "Ver paquetes y precios",
    budgetHref: "/es/presupuesto",
    faqEyebrow: "04 / Preguntas",
    faqTitle: "Preguntas sobre sweet 16, con respuesta.",
    faqs: [
      { q: "¿Fotografían fiestas de sweet 16 o solo quinceañeras?", a: "Las dos. TX Quince fotografía y graba fiestas de sweet 16 en todo Dallas–Fort Worth, además de quinceañeras." },
      { q: "¿Pueden cubrir a dos hermanas que celebran juntas?", a: "Sí. Hemos cubierto a hermanas que compartieron una celebración, una de quince y otra de dieciséis. Planeamos retratos, entradas y bailes por separado para que cada una tenga sus momentos." },
      { q: "¿Cuánto cuesta un fotógrafo de sweet 16?", a: "Lo mismo que para una quinceañera. Un sweet 16 usa los mismos paquetes con los mismos precios publicados, que están en esta página y en la página de presupuesto." },
      { q: "¿Ofrecen foto y video para un sweet 16?", a: "Sí. Un solo equipo hace las fotos y el video, y nosotros, los dueños, editamos cada galería y cada video." },
      { q: "¿Hablan español?", a: "Sí. Todo se maneja en español y en inglés, desde el primer mensaje hasta el día de la fiesta." },
      { q: "¿Dónde podemos pedir invitaciones, pósters y playeras?", a: "A todas las familias las mandamos a QuinceNetwork, nuestra tienda hermana, en quincenetwork.com. Pídanos el código de descuento de TX Quince." },
      { q: "¿Fotografían bodas?", a: "Las bodas las fotografiamos con nuestro estudio de bodas en smallhourwedding.com." },
    ],
    areasEyebrow: "05 / Siga viendo",
    areas: "Más de TX Quince",
    areaLinks: [
      ["/es/presupuesto", "Paquetes y precios"],
      ["/portfolio", "Portafolio"],
      ["/es/blog/quinceanera-o-sweet-16", "Quinceañera o sweet 16: las diferencias"],
      ["/es/sesion-de-fotos-quinceanera", "Sesión de retratos antes de la fiesta"],
      ["/es/videografo-de-quinceaneras", "Video"],
    ],
    alt: "Familia e invitados levantan sus copas en un brindis alrededor de la festejada de vestido rosa en un salón en Irving",
    title: "Fotógrafo y Videógrafo de Sweet 16 en Dallas–Fort Worth",
    description: "Fotos y video de sweet 16 en todo Dallas–Fort Worth, en español o en inglés. Retratos, la entrada, los bailes y la fiesta. Hermanas que celebran juntas, bienvenidas.",
  },
} as const;

export function sweet16Metadata(locale: Locale) {
  const t = COPY[locale];
  const en = `${site.url}${COPY.en.path}`;
  const es = `${site.url}${COPY.es.path}`;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: t.path, languages: languageAlternates(en, es) },
    openGraph: {
      ...ogBase(locale),
      title: `${t.title} · ${site.brand}`,
      description: t.description,
      url: `${site.url}${t.path}`,
      ...(locale === "es" ? { locale: OG_LOCALE.es } : {}),
    },
  };
}

const fill = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } as const;

export async function Sweet16Page({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const packages = commissionsFor(await getPriceBook());
  const links = commissionLinks[locale];
  const url = `${site.url}${t.path}`;
  const hero = getBlogPhoto(HERO);
  const duo = DUO.map((slug) => getBlogPhoto(slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const pad = (n: number) => String(n).padStart(2, "0");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: locale === "en" ? "Sweet 16 photography and video" : "Fotografía y video de sweet 16",
        serviceType: "Sweet 16 photography and videography",
        provider: { "@id": `${site.url}/#business` },
        areaServed: { "@type": "AdministrativeArea", name: "Dallas–Fort Worth, TX" },
        inLanguage: HREFLANG[locale],
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${hero.src}?w=1600`}
                srcSet={`${hero.src}?w=640 640w, ${hero.src}?w=1080 1080w, ${hero.src}?w=1600 1600w`}
                sizes="100vw"
                alt={t.alt}
                width={hero.width}
                height={hero.height}
                fetchPriority="high"
                decoding="async"
                style={fill}
              />
            </div>
            <figcaption>
              <span className="tq-tag tq-tag--tl tq-mono">[Sweet 16]</span>
              <span className="tq-tag tq-tag--bl tq-mono">{t.photoNote}</span>
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
          <div className="tq-action">
            <Link href={t.otherHref} hrefLang={locale === "en" ? "es" : "en"} lang={locale === "en" ? "es" : "en"} className="tq-mono tq-place-note">
              {t.other} ↗
            </Link>
            <Link href={links.book} className="tq-action__link">
              <span>{t.check}</span>
              <span className="tq-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>

      <section className="tq-section" aria-labelledby="s16-cover-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[{t.coverEyebrow}]</p>
            <h2 id="s16-cover-title" className="tq-display tq-head__title">{t.coverTitle}</h2>
          </header>
          <div className="tq-place-prose">
            {t.coverBody.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
          <div className="tq-head" style={{ paddingTop: 0 }}>
            <h3 className="tq-head__index tq-mono" style={{ margin: 0 }}>{t.coverListTitle}</h3>
          </div>
          <ol className="tq-place-rows">
            {t.coverList.map((item, i) => (
              <li key={item} className="tq-place-row">
                <span className="tq-mono tq-place-row__k">[{pad(i + 1)}]</span>
                <span className="tq-display tq-place-row__t">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="s16-sisters-title">
        <div className="tq-wrap">
          <header className="tq-head tq-place-head--long">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[{t.sistersEyebrow}]</p>
            <h2 id="s16-sisters-title" className="tq-display tq-head__title">{t.sistersTitle}</h2>
          </header>
          <div className="tq-place-prose">
            {t.sistersBody.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
          {duo.length > 0 ? (
            <ul className="tq-place-duo" aria-label={t.photoNote}>
              {duo.map((image) => (
                <li key={image.src}>
                  <figure className="tq-place-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${image.src}?w=1080`}
                      srcSet={`${image.src}?w=640 640w, ${image.src}?w=1080 1080w`}
                      sizes="(min-width: 960px) 40vw, 50vw"
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      loading="lazy"
                      decoding="async"
                      style={fill}
                    />
                  </figure>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="tq-section" aria-labelledby="s16-price-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[{t.priceEyebrow}]</p>
            <h2 id="s16-price-title" className="tq-display tq-head__title">{t.priceTitle}</h2>
          </header>
          <div className="tq-place-prose">
            <p>{t.priceBody}</p>
          </div>
          <ol className="tq-place-rows tq-place-rows--priced" style={{ paddingBottom: 0 }}>
            {packages.map((c) => (
              <li key={c.id} className="tq-place-row">
                <span className="tq-mono tq-place-row__k">[{c.numeral}]</span>
                <h3 className="tq-display tq-place-row__t">{c.name[locale]}</h3>
                <p className="tq-place-row__b">
                  {c.recommended ? `${t.pick}. ` : ""}
                  {c.summary[locale]}
                </p>
                <p className="tq-display tq-nums tq-place-row__end">{c.priceLabel}</p>
              </li>
            ))}
          </ol>
          <div className="tq-place-after" style={{ borderTop: 0 }}>
            <Link href={links.book} className="tq-btn tq-btn--lg">
              {t.check} <span className="tq-arrow" aria-hidden>↗</span>
            </Link>
            <Link href={t.budgetHref} className="tq-btn tq-btn--ghost">
              {t.budget} <span className="tq-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="s16-faq-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[{t.faqEyebrow}]</p>
            <h2 id="s16-faq-title" className="tq-display tq-head__title">{t.faqTitle}</h2>
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

      <section className="tq-section" aria-labelledby="s16-areas-title">
        <div className="tq-wrap tq-place-block">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>[{t.areasEyebrow}]</p>
            <h2 id="s16-areas-title" className="tq-display tq-head__title">{t.areas}</h2>
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
