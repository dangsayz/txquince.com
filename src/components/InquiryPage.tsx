import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/InquiryForm";
import { site } from "@/content/site";

const copy = {
  en: {
    eyebrow: "An invitation / Dallas–Fort Worth",
    title: "Tell us about her day.",
    intro: "Start with a date, a place, or simply what she is dreaming of. We will reply personally.",
    anchor: "Begin your inquiry",
    details: "The first conversation",
    formTitle: "It starts here.",
    formIntro: "A few details help us give your family a useful answer. You do not need to have every decision made.",
    formNote: "There is no payment to inquire. A date is only held after we confirm availability and you complete a deposit.",
    price: "Explore the collections",
    process: "What happens next",
    steps: [
      ["01", "Share her date", "Tell us the date, venue or city, and the coverage you are considering."],
      ["02", "We check availability", "We review your details and reply with a clear answer."],
      ["03", "Plan together", "If the date is open, we help you choose a collection and explain how to reserve it."],
    ],
    work: "View the photographs",
  },
  es: {
    eyebrow: "Una invitación / Dallas–Fort Worth",
    title: "Cuéntanos sobre su día.",
    intro: "Comparte la fecha, el lugar o lo que ella imagina. Te responderemos personalmente.",
    anchor: "Empieza tu consulta",
    details: "La primera conversación",
    formTitle: "Todo empieza aquí.",
    formIntro: "Unos detalles nos ayudan a responderle a tu familia. No necesitas tener todo decidido.",
    formNote: "Consultar no requiere pago. La fecha se aparta después de confirmar disponibilidad y completar el depósito.",
    price: "Explora las colecciones",
    process: "Cómo seguimos",
    steps: [
      ["01", "Comparte su fecha", "Cuéntanos la fecha, el salón o la ciudad y la cobertura que buscas."],
      ["02", "Revisamos disponibilidad", "Revisamos los detalles y respondemos con claridad."],
      ["03", "Planeamos juntos", "Si la fecha está libre, te ayudamos a elegir una colección y explicamos cómo reservarla."],
    ],
    work: "Ver las fotografías",
  },
} as const;

export function InquiryPage({ locale, initialDate = "" }: { locale: "en" | "es"; initialDate?: string }) {
  const c = copy[locale];
  const isSpanish = locale === "es";
  const formId = isSpanish ? "formulario" : "inquiry-form";

  return (
    <>
      <header className="grid bg-white lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]" aria-labelledby="inquiry-title">
        <div className="relative min-h-[60svh] bg-greige sm:min-h-[42rem] lg:min-h-[min(84svh,55rem)]">
          <Image
            src="/portfolio/red-garden.webp"
            alt={isSpanish ? "Quinceañera con flores en un jardín" : "Quinceañera holding flowers in a garden"}
            fill
            priority
            unoptimized
            sizes="(max-width: 1023px) 100vw, 55vw"
            className="object-cover object-[center_39%]"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-16 sm:px-12 sm:py-20 lg:px-[clamp(3rem,7vw,8rem)]">
          <p className="text-[.7rem] uppercase tracking-[.22em] text-ink-soft">{c.eyebrow}</p>
          <h1 id="inquiry-title" className="mt-8 max-w-[14ch] font-display text-[clamp(2.3rem,3.8vw,3.8rem)] font-light leading-[1.13] tracking-[-.035em] text-ink">{c.title}</h1>
          <p className="mt-7 max-w-md font-serif text-[clamp(1.15rem,1.5vw,1.45rem)] leading-[1.6] text-ink-soft">{c.intro}</p>
          <a href={`#${formId}`} className="mt-9 inline-flex min-h-12 w-fit items-center gap-12 border-b border-ink text-xs uppercase tracking-[.14em] text-ink">{c.anchor}<span aria-hidden="true">↓</span></a>
        </div>
      </header>

      <section id={formId} className="scroll-mt-20 bg-ivory px-5 py-20 sm:px-10 sm:py-28 lg:px-16" aria-labelledby="inquiry-form-title">
        <div className="mx-auto grid max-w-[90rem] gap-12 lg:grid-cols-[minmax(0,.38fr)_minmax(0,.62fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[.7rem] uppercase tracking-[.2em] text-ink-soft">{c.details}</p>
            <h2 id="inquiry-form-title" className="mt-5 font-display text-[clamp(1.9rem,2.8vw,2.8rem)] font-light leading-tight text-ink">{c.formTitle}</h2>
            <p className="mt-7 max-w-md font-serif text-lg leading-8 text-ink-soft">{c.formIntro}</p>
            <p className="mt-8 max-w-md border-t border-line pt-6 text-sm leading-7 text-ink-soft">{c.formNote}</p>
            <Link href={isSpanish ? "/es/paquetes" : "/investment"} className="mt-5 inline-flex min-h-12 items-center gap-6 border-b border-ink text-xs uppercase tracking-[.14em] text-ink">{c.price}<span aria-hidden="true">↗</span></Link>
          </div>
          <div className="min-w-0"><InquiryForm initialDate={initialDate} locale={locale} /></div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-10 sm:py-28 lg:px-16" aria-labelledby="inquiry-process-title">
        <div className="mx-auto max-w-[90rem]">
          <p className="text-[.7rem] uppercase tracking-[.2em] text-ink-soft">{isSpanish ? "Después de escribirnos" : "After you write"}</p>
          <h2 id="inquiry-process-title" className="mt-4 font-display text-[clamp(1.9rem,2.8vw,2.8rem)] font-light text-ink">{c.process}</h2>
          <ol className="mt-12 grid gap-8 border-t border-line pt-9 md:grid-cols-3 md:gap-12">
            {c.steps.map(([number, title, body]) => <li key={number}><span className="text-xs tracking-[.14em] text-ink-faint">{number}</span><h3 className="mt-6 font-display text-xl font-light text-ink">{title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-ink-soft">{body}</p></li>)}
          </ol>
          <div className="mt-14 flex flex-wrap items-center gap-6 border-t border-line pt-7">
            <Link href="/portfolio" className="inline-flex min-h-12 items-center gap-5 border-b border-ink text-xs uppercase tracking-[.14em] text-ink">{c.work} <span aria-hidden="true">↗</span></Link>
            <a href={`mailto:${site.contact.email}`} className="inline-flex min-h-12 items-center text-sm text-ink-soft underline underline-offset-4">{site.contact.email}</a>
          </div>
        </div>
      </section>
    </>
  );
}
