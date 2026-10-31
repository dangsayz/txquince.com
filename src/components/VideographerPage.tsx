import Link from "next/link";
import { commissionLinks, commissionsFor } from "@/content/commissions";
import { matrixFor } from "@/components/txq/data";
import { getPriceBook } from "@/lib/pricing";
import { SlotImage } from "@/components/SlotImage";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { getFeaturedImages, getVideos } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { VideoGallery } from "@/components/VideoGallery";
import { FinalCTA } from "@/components/FinalCTA";
import "@/components/txq/pages/pages.css";

const copy = {
  en: {
    eyebrow: "Quinceañera videographer · Dallas–Fort Worth",
    title: "Her day, on video.",
    intro: "The music, the voices, her first steps into the room — some moments need more than a photo. See real quinceañera videos from Dallas–Fort Worth and choose the package that fits her day.",
    films: "Real celebrations, real videos.",
    filmsIntro: "Watch our work before you ask about your date.",
    collections: "Video packages, clearly priced.",
    one: "Video comes with every package from the Duo up: a videographer from our team, the full-length film of her day in 4K, a short highlight and short vertical videos for social media. Only need video? Choose video only when you check your date and we'll fit the package to you.",
    faq: "Before you reserve",
    questions: [
      ["Can we book video without photos?", "Yes. Choose video only when you check your date and we'll fit the package to video. Most families get both, and every package from the Duo up includes photos and video."],
      ["How long is the video?", "The full-length film follows her day, so it has no set length. It's her whole day as it happened: la misa, the venue details and the guests, every presentation in full (the grand entrance, el vals, the surprise dance), every toast in full and 15–20 minutes of the dance floor. A highlight comes with it — 1 minute in the Duo, a 3–5 minute highlight film in the Trio — plus short vertical videos for social media."],
      ["Who films her day?", "TX Quince's own team of photographers and videographers, assigned by date and availability, so we can't take requests for specific people, the owners included. Every gallery and every film is edited by the owners."],
      ["Do you travel across DFW?", "Yes. We cover quinceañeras across Dallas–Fort Worth, from the church through the reception."],
    ],
    cta: "Check her date",
    lede: "Some memories are meant to be heard, too.",
    watch: "Watch the videos",
    work: "01 / Videos",
    coverage: "02 / Packages",
    qa: "Q&A",
    reels: "Short videos for social media",
    deposit: "deposit holds the date",
    next: "The next step",
    nextTitle: "Let's see if her date is still open.",
    nextSub: "Share the date and what you have in mind. We reply personally, and asking costs nothing.",
  },
  es: {
    eyebrow: "Video de quinceañeras · Dallas–Fort Worth",
    title: "Su día, en movimiento.",
    intro: "La música, las voces, su entrada al salón: hay momentos que merecen más que una foto. Mira videos reales de quinceañeras en Dallas–Fort Worth y elige el paquete para su día.",
    films: "Celebraciones reales, videos reales.",
    filmsIntro: "Mira nuestro trabajo antes de consultar tu fecha.",
    collections: "Paquetes con video, con precios claros.",
    one: "El video viene en cada paquete desde el Dúo: un videógrafo de nuestro equipo, el video completo de su día en 4K, un resumen corto y videos verticales cortos para redes sociales. ¿Solo necesitas video? Elige solo video al consultar tu fecha y ajustamos el paquete para ti.",
    faq: "Antes de reservar",
    questions: [
      ["¿Puedo contratar solo video?", "Sí. Elige solo video al consultar tu fecha y ajustamos el paquete al video. La mayoría de las familias elige los dos, y cada paquete desde el Dúo incluye fotos y video."],
      ["¿Cuánto dura el video?", "El video completo sigue su día, así que no tiene una duración fija. Es todo su día tal como pasó: la misa, los detalles del salón y los invitados, cada presentación completa (la entrada, el vals, el baile sorpresa), cada brindis completo y de 15 a 20 minutos de la pista de baile. Viene con un resumen —de 1 minuto en el Dúo y de 3 a 5 minutos en el Trío— y videos verticales cortos para redes sociales."],
      ["¿Quién graba su día?", "El equipo propio de TX Quince, de fotógrafos y videógrafos, asignado según la fecha y la disponibilidad; por eso no podemos aceptar solicitudes de personas específicas, ni siquiera de los dueños. Los dueños editan cada galería y cada video."],
      ["¿Trabajan en todo DFW?", "Sí. Cubrimos quinceañeras en todo Dallas–Fort Worth, desde la iglesia hasta la recepción."],
    ],
    cta: "Consulta su fecha",
    lede: "Hay recuerdos que también se escuchan.",
    watch: "Ver los videos",
    work: "01 / Videos",
    coverage: "02 / Paquetes",
    qa: "Preguntas",
    reels: "Videos cortos para redes sociales",
    deposit: "de depósito para apartar la fecha",
    next: "El siguiente paso",
    nextTitle: "Veamos si su fecha sigue libre.",
    nextSub: "Comparte la fecha y lo que tienes en mente. Te respondemos personalmente y preguntar no cuesta nada.",
  },
} as const;

/** Video deliverables per package, straight from the homepage matrix. */

export async function VideographerPage({ locale }: { locale: "en" | "es" }) {
  const priceBook = await getPriceBook();
  const motionRows = matrixFor(priceBook).find((g) => g.id === "motion")!.rows;
  const filmCommissions = commissionsFor(priceBook).filter((c) => c.id !== "study");
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
          <SlotImage
            slot="videographer.hero"
            lang={locale}
            fill
            priority
            sizes="100vw"
            fallback={hero ? { src: hero.url, alt: publicPhotoCopy(hero, altPhraseFor(hero.section)).alt, width: hero.width, height: hero.height, focus: `${Math.round((hero.focus_x ?? 0.5) * 100)}% ${Math.round((hero.focus_y ?? 0.4) * 100)}%` } : null}
          />
          <figcaption>
            <span className="tq-tag tq-tag--bl tq-mono">[Video — 4K]</span>
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
                        {cm.retainerLabel} {c.deposit}
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
