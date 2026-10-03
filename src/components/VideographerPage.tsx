import Link from "next/link";
import Image from "next/image";
import { packages } from "@/content/packages";
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
    one: "Film is available as the single service in Moments and Essential. Signature and Legacy bring photo and film together.",
    faq: "Before you reserve",
    questions: [
      ["Can we book video without photography?", "Yes. Moments and Essential let you choose film as your one service. Signature and Legacy include both photography and film."],
      ["How long is the highlight film?", "The finished film depends on the collection and the story of the day. We will confirm deliverables in writing before you reserve."],
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
    one: "En Moments y Essential puedes elegir video como servicio único. Signature y Legacy incluyen fotografía y video.",
    faq: "Antes de reservar",
    questions: [
      ["¿Puedo contratar solo video?", "Sí. En Moments y Essential puedes elegir video como tu servicio. Signature y Legacy incluyen foto y video."],
      ["¿Cuánto dura el video final?", "Depende de la colección y de lo que suceda ese día. Confirmamos las entregas por escrito antes de reservar."],
      ["¿Trabajan en todo DFW?", "Sí. Cubrimos quinceañeras en todo Dallas–Fort Worth, desde la ceremonia hasta la recepción."],
    ],
    cta: "Consulta su fecha",
  },
} as const;

const spanishTeasers: Record<string, string> = {
  moments: "Video con un artista durante cinco horas esenciales.",
  essential: "Video con un artista para los momentos principales, más una sesión previa.",
  signature: "Foto y video con dos artistas durante el día completo.",
  legacy: "Todo lo de Signature, más video largo, cobertura aérea y álbum premium.",
};

export async function VideographerPage({ locale }: { locale: "en" | "es" }) {
  const c = copy[locale];
  const inquiry = locale === "es" ? "/es/consulta" : "/check-your-date";
  const [videos, images] = await Promise.all([getVideos(), getFeaturedImages(1)]);
  const hero = images[0];
  const films = videos.filter((v) => v.orientation !== "vertical");
  const shorts = videos.filter((v) => v.orientation === "vertical");
  return (
    <>
      <header className="relative isolate min-h-[35rem] overflow-hidden bg-ink text-white sm:min-h-[43rem]" aria-labelledby="film-page-title">
        {hero?.url && <Image src={hero.url} alt={publicPhotoCopy(hero, altPhraseFor(hero.section)).alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: `${Math.round((hero.focus_x ?? 0.5) * 100)}% ${Math.round((hero.focus_y ?? 0.4) * 100)}%` }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[35rem] max-w-[90rem] flex-col justify-between px-5 pb-10 pt-8 sm:min-h-[43rem] sm:px-10 sm:pb-14 lg:px-16">
          <span className="text-xs uppercase tracking-[0.18em] text-white/80">TX Quince / Film</span>
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-white/80">{c.eyebrow}</p>
            <h1 id="film-page-title" className="mt-4 font-display text-[clamp(2.25rem,4.5vw,4.25rem)] font-normal leading-[1.06] tracking-[-0.035em]">{c.title}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/85">{c.intro}</p>
            <a href="#films" className="mt-8 inline-flex min-h-12 items-center gap-4 border-b border-white pb-1 text-sm font-medium">{locale === "es" ? "Ver los videos" : "Watch the films"}<span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </header>

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
            {packages.map((collection, index) => (
              <li key={collection.id} className="border-b border-line py-6">
                <Link href={locale === "es" ? inquiry : `/reserve?collection=${collection.id}`} className="group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 text-ink sm:gap-6">
                  <span className="text-xs text-ink-faint">0{index + 1}</span>
                  <span className="font-display text-xl font-normal group-hover:underline">{collection.name}</span>
                  <span className="text-base">{collection.priceLabel}</span>
                </Link>
                <p className="ml-11 mt-2 max-w-lg text-base leading-7 text-ink-soft sm:ml-14">{locale === "es" ? spanishTeasers[collection.id] : collection.teaser}</p>
                <p className="ml-11 mt-2 text-sm text-ink-soft sm:ml-14">{collection.depositLabel} {locale === "es" ? "de depósito tras confirmar la fecha" : "deposit after date confirmation"}</p>
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
