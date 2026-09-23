import Link from "next/link";
import { packages } from "@/content/packages";
import { getVideos } from "@/lib/content-db";
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

export async function VideographerPage({ locale }: { locale: "en" | "es" }) {
  const c = copy[locale];
  const inquiry = locale === "es" ? "/es/consulta" : "/check-your-date";
  const videos = await getVideos();
  const films = videos.filter((v) => v.orientation !== "vertical");
  const shorts = videos.filter((v) => v.orientation === "vertical");
  return <>
    <section className="border-b border-line bg-white"><div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16"><p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">{c.eyebrow}</p><h1 className="mt-6 max-w-[11ch] font-serif text-[clamp(4rem,8vw,8rem)] leading-[0.9] tracking-[-0.05em] text-ink">{c.title}</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-ink-soft">{c.intro}</p><Link href={inquiry} className="mt-9 inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-white hover:bg-ink/85">{c.cta} <span aria-hidden className="ml-3">→</span></Link></div></section>
    <section className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16"><h2 className="font-serif text-[clamp(2.8rem,5vw,4.5rem)] leading-none text-ink">{c.films}</h2><p className="mt-4 mb-10 text-base text-ink-soft">{c.filmsIntro}</p><VideoGallery videos={films} />{shorts.length > 0 ? <div className="mt-14"><VideoGallery videos={shorts} variant="vertical" /></div> : null}</section>
    <section className="bg-greige"><div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16"><h2 className="font-serif text-[clamp(2.8rem,5vw,4.5rem)] leading-none text-ink">{c.collections}</h2><p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft">{c.one}</p><div className="mt-10 grid gap-4 md:grid-cols-2">{packages.map((p) => <article key={p.id} className="border border-line bg-white p-7 sm:p-9"><div className="flex items-baseline justify-between gap-4"><h3 className="font-serif text-3xl text-ink">{p.name}</h3><span className="text-lg font-semibold text-ink">{p.priceLabel}</span></div><p className="mt-4 text-base leading-7 text-ink-soft">{p.teaser}</p><p className="mt-5 text-sm text-ink-soft">{p.depositLabel} {locale === "es" ? "para apartar" : "deposit to reserve"}</p></article>)}</div></div></section>
    <section className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16"><h2 className="font-serif text-[clamp(2.8rem,5vw,4.5rem)] leading-none text-ink">{c.faq}</h2><div className="mt-8 max-w-3xl border-t border-line">{c.questions.map(([q,a]) => <details key={q} className="border-b border-line py-6"><summary className="cursor-pointer list-none font-medium text-ink">{q} <span aria-hidden className="float-right">+</span></summary><p className="mt-4 leading-7 text-ink-soft">{a}</p></details>)}</div><Link href={inquiry} className="mt-10 inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-white hover:bg-ink/85">{c.cta} <span aria-hidden className="ml-3">→</span></Link></section>
  </>;
}
