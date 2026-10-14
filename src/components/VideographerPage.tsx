import Link from "next/link";
import Image from "next/image";
import { commissionLinks, commissions } from "@/content/commissions";
import { MATRIX } from "@/components/txq/data";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { getFeaturedImages, getVideos } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { VideoGallery } from "@/components/VideoGallery";

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
  },
} as const;

/** Motion deliverables per commission, straight from the homepage matrix. */
const motionRows = MATRIX.find((g) => g.id === "motion")!.rows;
const filmCommissions = commissions.filter((c) => c.id !== "study");

export async function VideographerPage({ locale }: { locale: "en" | "es" }) {
  const c = copy[locale];
  const inquiry = locale === "es" ? "/es/consulta" : "/check-your-date";
  const [videos, images] = await Promise.all([getVideos(), getFeaturedImages(1)]);
  const hero = images[0];
  const films = videos.filter((v) => v.orientation !== "vertical");
  const shorts = videos.filter((v) => v.orientation === "vertical");
  return (
    <>
      <header className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-ink text-white sm:min-h-[80svh]" aria-labelledby="film-page-title">
        <Image src={hero?.url ?? "/portfolio/kimberly-reception.webp"} alt={hero ? publicPhotoCopy(hero, altPhraseFor(hero.section)).alt : "Quinceañera celebration photographed by TX Quince"} fill unoptimized={!hero} priority sizes="100vw" className="object-cover" style={{ objectPosition: `${Math.round((hero?.focus_x ?? 0.5) * 100)}% ${Math.round((hero?.focus_y ?? 0.4) * 100)}%` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <p className="text-xs uppercase tracking-[0.24em] text-white/85">{c.eyebrow}</p>
          <h1 id="film-page-title" className="mt-5 font-display text-[clamp(2.15rem,4vw,4rem)] font-light leading-[1.14]">{c.title}</h1>
        </div>
      </header>

      <section className="bg-ivory px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-[78rem] gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-20">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">{locale === "es" ? "La experiencia" : "The experience"}</p>
          <div><p className="max-w-[29ch] font-display text-[clamp(1.85rem,3vw,3rem)] font-light leading-[1.24] text-ink">{locale === "es" ? "Hay recuerdos que también se escuchan." : "Some memories are meant to be heard, too."}</p><p className="mt-6 max-w-xl text-base leading-8 text-ink-soft">{c.intro}</p><a href="#films" className="mt-7 inline-flex min-h-12 items-center gap-4 border-b border-ink text-xs uppercase tracking-[0.16em] text-ink">{locale === "es" ? "Ver los videos" : "Watch the films"}<span aria-hidden="true">↓</span></a></div>
        </div>
      </section>

      <section id="films" className="scroll-mt-24 bg-white" aria-labelledby="films-heading">
        <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div className="grid gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:gap-16">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">{locale === "es" ? "El trabajo" : "The work"}</p>
              <h2 id="films-heading" className="mt-4 max-w-[19ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight text-ink">{c.films}</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-ink-soft lg:pt-9">{c.filmsIntro}</p>
          </div>
          <div className="mt-10 lg:mt-14"><VideoGallery videos={films} /></div>
          {shorts.length > 0 && <div className="mt-14 border-t border-line pt-10"><VideoGallery videos={shorts} variant="vertical" /></div>}
        </div>
      </section>

      <section className="bg-[#f4f2ee]" aria-labelledby="film-pricing-title">
        <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-16 lg:px-16 lg:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">{locale === "es" ? "Cobertura" : "Coverage"}</p>
            <h2 id="film-pricing-title" className="mt-4 max-w-[18ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight text-ink">{c.collections}</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-ink-soft">{c.one}</p>
          </div>
          <ol className="border-t border-line">
            {filmCommissions.map((cm, index) => (
              <li key={cm.id} className="border-b border-line py-6">
                <Link href={commissionLinks[locale].compare} className="group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 text-ink sm:gap-6">
                  <span className="text-xs text-ink-faint">0{index + 1}</span>
                  <span className="font-display text-xl font-normal group-hover:underline">{cm.numeral} {cm.name[locale]}</span>
                  <span className="text-base">{cm.priceLabel}</span>
                </Link>
                <p className="ml-11 mt-2 max-w-lg text-base leading-7 text-ink-soft sm:ml-14">
                  {motionRows
                    .map((r) => r.values[cm.id])
                    .filter((v) => v !== null)
                    .map((v) => v![locale])
                    .join(" · ")}
                </p>
                <p className="ml-11 mt-2 text-sm text-ink-soft sm:ml-14">{cm.retainerLabel} {locale === "es" ? "de anticipo para apartar la fecha" : "retainer holds the date"}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="film-faq-title">
        <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-16 lg:px-16 lg:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">{locale === "es" ? "Preguntas" : "Good to know"}</p>
            <h2 id="film-faq-title" className="mt-4 max-w-[18ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight text-ink">{c.faq}</h2>
          </div>
          <div className="border-t border-line">
            {c.questions.map(([question, answer]) => <details key={question} className="group border-b border-line py-5"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 text-base font-medium text-ink [&::-webkit-details-marker]:hidden">{question}<span aria-hidden="true" className="text-xl font-light group-open:rotate-45">+</span></summary><p className="mt-2 max-w-prose text-base leading-7 text-ink-soft">{answer}</p></details>)}
            <Link href={inquiry} className="mt-8 inline-flex min-h-12 items-center gap-5 bg-ink px-6 text-sm font-medium text-white hover:bg-ink-soft">{c.cta}<span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
