import Link from "next/link";
import Image from "next/image";
import { commissionLinks, commissions } from "@/content/commissions";
import { MATRIX } from "@/components/txq/data";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { getFeaturedImages, getVideos } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { VideoGallery } from "@/components/VideoGallery";
import { FinalCTA } from "@/components/FinalCTA";
import "@/components/txq/pages/pages.css";

const copy = {
  en: {
    eyebrow: "Quinceañera videographer · Dallas–Fort Worth",
    title: "Her day, in motion.",
    intro: "The music, the voices, her first steps into the room — some moments need more than a photograph. See real quinceañera films from Dallas–Fort Worth and choose the coverage that fits her day.",
    films: "Real celebrations, real films.",
    filmsIntro: "Watch the work before you ask about your date.",
    collections: "Film coverage, clearly priced.",
    one: "Film is part of every commission from Cinema & Stills upward: a dedicated motion director, a 4K feature, a teaser and vertical reels. Need film only? Choose “Motion only” when you check your date and we tailor the commission.",
    faq: "Before you reserve",
    questions: [
      ["Can we book video without photography?", "Yes. Choose “Motion only” when you check your date and we tailor the commission to film. Most families pair film with photography, which every commission from Cinema & Stills upward includes."],
      ["How long is the film?", "Cinema & Stills delivers an 8–10 minute 4K feature, The Full Production 12–15 minutes, and the Multi-Day Archive a 20-minute documentary, each with a theatrical teaser and vertical reels."],
      ["Do you travel across DFW?", "Yes. We cover quinceañeras across Dallas–Fort Worth, from the ceremony through the reception."],
    ],
    cta: "Check her date",
    lede: "Some memories are meant to be heard, too.",
    watch: "Watch the films",
    work: "01 / Films",
    coverage: "02 / Coverage",
    qa: "Q&A",
    reels: "Vertical reels",
    retainer: "retainer holds the date",
    next: "The next step",
    nextTitle: "Let's see if her date is still open.",
    nextSub: "Share the date and the coverage you have in mind. We reply personally, with no payment to ask.",
  },
  es: {
    eyebrow: "Video de quinceañeras · Dallas–Fort Worth",
    title: "Su día, en movimiento.",
    intro: "La música, las voces, su entrada al salón: hay momentos que merecen más que una fotografía. Mira videos reales de quinceañeras en Dallas–Fort Worth y elige la cobertura para su día.",
    films: "Celebraciones reales, videos reales.",
    filmsIntro: "Mira nuestro trabajo antes de consultar tu fecha.",
    collections: "Cobertura de video, con precios claros.",
    one: "El cine forma parte de cada encargo desde Cine y fotografía: un director de cine dedicado, una película 4K, un avance y reels verticales. ¿Solo necesitas video? Elige “Solo cine” al consultar tu fecha y adaptamos el encargo.",
    faq: "Antes de reservar",
    questions: [
      ["¿Puedo contratar solo video?", "Sí. Elige “Solo cine” al consultar tu fecha y adaptamos el encargo al video. La mayoría combina cine y fotografía, que incluye cada encargo desde Cine y fotografía."],
      ["¿Cuánto dura la película?", "Cine y fotografía entrega una película 4K de 8 a 10 minutos, La producción completa de 12 a 15 minutos y el Archivo de varios días un documental de 20 minutos, cada una con avance y reels verticales."],
      ["¿Trabajan en todo DFW?", "Sí. Cubrimos quinceañeras en todo Dallas–Fort Worth, desde la ceremonia hasta la recepción."],
    ],
    cta: "Consulta su fecha",
    lede: "Hay recuerdos que también se escuchan.",
    watch: "Ver los videos",
    work: "01 / Cine",
    coverage: "02 / Cobertura",
    qa: "Preguntas",
    reels: "Reels verticales",
    retainer: "de anticipo para apartar la fecha",
    next: "El siguiente paso",
    nextTitle: "Veamos si su fecha sigue libre.",
    nextSub: "Comparte la fecha y la cobertura que imaginas. Respondemos personalmente y consultar no requiere pago.",
  },
} as const;

/** Motion deliverables per commission, straight from the homepage matrix. */
const motionRows = MATRIX.find((g) => g.id === "motion")!.rows;
const filmCommissions = commissions.filter((c) => c.id !== "study");

export async function VideographerPage({ locale }: { locale: "en" | "es" }) {
  const c = copy[locale];
  const book = commissionLinks[locale].book;
  const [videos, images] = await Promise.all([getVideos(), getFeaturedImages(1)]);
  const hero = images[0];
  const films = videos.filter((v) => v.orientation !== "vertical");
  const shorts = videos.filter((v) => v.orientation === "vertical");
  return (
    <>
      <div className="tq-wrap">
        <header className="tq-pg-mast" aria-labelledby="film-page-title">
          <p className="tq-pg-mast__index tq-mono">[{c.eyebrow}]</p>
          <div className="tq-pg-mast__body">
            <h1 id="film-page-title" className="tq-display tq-pg-mast__title">
              {c.title}
            </h1>
            <p className="tq-pg-mast__dek">{c.intro}</p>
            <div className="tq-pg-actions">
              <Link href={book} className="tq-btn tq-btn--lg">
                {c.cta} <span className="tq-arrow" aria-hidden>→</span>
              </Link>
              <a href="#films" className="tq-btn tq-btn--lg tq-btn--ghost">
                {c.watch} <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
        </header>
        <figure className="tq-pg-plate">
          <Image
            src={hero?.url ?? "/portfolio/kimberly-reception.webp"}
            alt={hero ? publicPhotoCopy(hero, altPhraseFor(hero.section)).alt : "Quinceañera celebration photographed by TX Quince"}
            fill
            unoptimized={!hero}
            priority
            sizes="100vw"
            style={{ objectPosition: `${Math.round((hero?.focus_x ?? 0.5) * 100)}% ${Math.round((hero?.focus_y ?? 0.4) * 100)}%` }}
          />
          <figcaption>
            <span className="tq-tag tq-tag--bl tq-mono">[Motion — 4K]</span>
          </figcaption>
        </figure>
        <div className="tq-manifesto" style={{ paddingTop: 56, borderTop: "1px solid var(--border-hairline)" }}>
          <p className="tq-display">{c.lede}</p>
        </div>
      </div>

      <section id="films" className="tq-section" aria-labelledby="films-heading">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
              [{c.work}]
            </p>
            <h2 id="films-heading" className="tq-display tq-head__title">
              {c.films}
            </h2>
            <p className="tq-head__dek">{c.filmsIntro}</p>
          </header>
          <div className="tq-inner" style={{ paddingBottom: 72 }}>
            <VideoGallery videos={films} />
            {shorts.length > 0 && (
              <div style={{ display: "grid", gap: 24, marginTop: 56, paddingTop: 40, borderTop: "1px solid var(--border-hairline)" }}>
                <h3 className="tq-mono" style={{ margin: 0 }}>[{c.reels}]</h3>
                <VideoGallery videos={shorts} variant="vertical" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="film-pricing-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
              [{c.coverage}]
            </p>
            <h2 id="film-pricing-title" className="tq-display tq-head__title">
              {c.collections}
            </h2>
            <p className="tq-head__dek">{c.one}</p>
          </header>
          <div className="tq-pg-row" style={{ paddingTop: 0 }}>
            <div className="tq-pg-row__body">
              <ol className="tq-pg-index">
                {filmCommissions.map((cm) => (
                  <li key={cm.id}>
                    <Link href={commissionLinks[locale].compare} className="tq-pg-index__row">
                      <span className="tq-mono tq-muted">{cm.numeral}</span>
                      <span className="tq-pg-index__label">{cm.name[locale]}</span>
                      <span className="tq-mono tq-nums" style={{ whiteSpace: "nowrap" }}>{cm.priceLabel}</span>
                      <p className="tq-pg-index__sub">
                        {motionRows
                          .map((r) => r.values[cm.id])
                          .filter((v) => v !== null)
                          .map((v) => v![locale])
                          .join(" · ")}
                      </p>
                      <p className="tq-pg-index__sub tq-mono">
                        {cm.retainerLabel} {c.retainer}
                      </p>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="film-faq-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
              [{c.qa}]
            </p>
            <h2 id="film-faq-title" className="tq-display tq-head__title">
              {c.faq}
            </h2>
          </header>
          <div className="tq-faq tq-pg-faq">
            {c.questions.map(([question, answer], i) => (
              <details key={question} className="tq-faq__item" open={i === 0}>
                <summary>
                  <span className="tq-mono tq-muted">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="tq-faq__q">{question}</h3>
                  <span className="tq-faq__icon" aria-hidden />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA accent={c.next} headline={c.nextTitle} sub={c.nextSub} href={book} label={c.cta} />
    </>
  );
}
