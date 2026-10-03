import Link from "next/link";
import { packages } from "@/content/packages";

const copy = {
  en: {
    eyebrow: "Simple payment plans · Dallas–Fort Worth",
    title: "Her day, in payments — not all at once.",
    intro: "Choose the collection that fits her celebration. After we confirm your date, a deposit reserves it; the remaining balance can be divided into payments before the event.",
    steps: [
      ["Ask about her date", "Send a few details. Checking availability is free and does not commit you to a collection."],
      ["Reserve with a deposit", "Once we confirm the date and collection, the deposit holds your day and applies to the final price."],
      ["Split the rest", "We agree on a payment schedule for the remaining balance before the celebration. No interest is added."],
    ],
    deposits: "Deposits by collection",
    depositNote: "The deposit is part of the listed price, not an additional fee.",
    detail: "Ask us to put the exact dates and amounts in writing before you reserve.",
    faqTitle: "Questions families ask",
    faqs: [
      ["Do I need to pay the full price today?", "No. First, ask us about your date. If it is available, the collection deposit reserves it and we arrange the remaining payments."],
      ["Are there interest or financing fees?", "We do not add interest to a payment schedule arranged directly with us."],
      ["What if I do not know which collection I want?", "Tell us about her day and the coverage you want. We can help you compare the collections before you decide."],
    ],
    cta: "Check her date",
    small: "No payment to ask",
  },
  es: {
    eyebrow: "Planes de pago sencillos · Dallas–Fort Worth",
    title: "Su día, en pagos — no todo de una vez.",
    intro: "Elige la colección que va con su celebración. Después de confirmar tu fecha, un depósito la aparta; el saldo se puede dividir en pagos antes del evento.",
    steps: [
      ["Pregunta por su fecha", "Envíanos los detalles. Consultar disponibilidad es gratis y no te compromete a reservar."],
      ["Aparta con un depósito", "Al confirmar la fecha y la colección, el depósito aparta el día y cuenta para el precio final."],
      ["Divide el saldo", "Acordamos un calendario de pagos para el saldo antes de la celebración, sin intereses adicionales."],
    ],
    deposits: "Depósitos por colección",
    depositNote: "El depósito forma parte del precio publicado; no es un cargo adicional.",
    detail: "Pide las fechas y los montos exactos por escrito antes de reservar.",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      ["¿Tengo que pagar todo hoy?", "No. Primero pregunta si tu fecha está disponible. Si lo está, apartas con el depósito de la colección y programamos los demás pagos."],
      ["¿Cobran intereses?", "No agregamos intereses a un plan de pagos acordado directamente con nosotros."],
      ["¿Y si todavía no sé cuál colección elegir?", "Cuéntanos cómo será su día y qué cobertura buscas. Podemos ayudarte a comparar antes de decidir."],
    ],
    cta: "Consulta su fecha",
    small: "Preguntar no tiene costo",
  },
} as const;

export function PaymentPlansPage({ locale }: { locale: "en" | "es" }) {
  const c = copy[locale];
  const inquiry = locale === "es" ? "/es/consulta" : "/check-your-date";
  return (
    <>
      <header className="bg-[#f4f2ee]">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] lg:gap-14 lg:px-16 lg:py-24">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">{c.eyebrow}</p>
          <div>
            <h1 className="max-w-[20ch] font-display text-[clamp(2.125rem,3.6vw,3.5rem)] font-normal leading-[1.1] tracking-[-0.03em] text-ink">{c.title}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft">{c.intro}</p>
            <Link href={inquiry} className="mt-7 inline-flex min-h-12 items-center gap-5 bg-ink px-6 text-sm font-medium text-white hover:bg-ink-soft">{c.cta}<span aria-hidden="true">↗</span></Link>
            <p className="mt-3 text-sm text-ink-soft">{c.small}</p>
          </div>
        </div>
      </header>

      <section className="bg-white" aria-label={locale === "es" ? "Cómo funcionan los pagos" : "How payments work"}>
        <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] lg:gap-14 lg:px-16">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">01 / {locale === "es" ? "El proceso" : "The process"}</p>
            <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">{locale === "es" ? "De la consulta a su celebración." : "From your question to her day."}</h2>
          </div>
          <ol className="border-t border-line">
            {c.steps.map(([title, body], index) => <li key={title} className="grid gap-3 border-b border-line py-6 sm:grid-cols-[2.5rem_minmax(0,0.36fr)_minmax(0,0.64fr)] sm:gap-6"><span className="text-xs text-ink-faint">0{index + 1}</span><h3 className="font-display text-xl font-normal text-ink">{title}</h3><p className="text-base leading-7 text-ink-soft">{body}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="bg-[#f4f2ee]" aria-labelledby="deposits-heading">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] lg:gap-14 lg:px-16">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">02 / {locale === "es" ? "Las colecciones" : "The collections"}</p>
            <h2 id="deposits-heading" className="mt-3 max-w-[18ch] font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">{c.deposits}</h2>
            <p className="mt-4 max-w-md text-base leading-7 text-ink-soft">{c.depositNote}</p>
          </div>
          <div>
            <ol className="border-t border-line">
              {packages.map((collection, index) => <li key={collection.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line py-5 sm:gap-6"><span className="text-xs text-ink-faint">0{index + 1}</span><span className="font-display text-xl font-normal text-ink">{collection.name}<small className="mt-1 block text-sm font-normal text-ink-soft">{collection.priceLabel}</small></span><span className="text-lg text-ink">{collection.depositLabel}</span></li>)}
            </ol>
            <p className="mt-6 text-sm text-ink-soft">{c.detail}</p>
          </div>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="payment-faq-heading">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] lg:gap-14 lg:px-16">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">03 / FAQ</p>
            <h2 id="payment-faq-heading" className="mt-3 max-w-[18ch] font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">{c.faqTitle}</h2>
          </div>
          <div className="border-t border-line">
            {c.faqs.map(([question, answer]) => <details key={question} className="group border-b border-line py-5"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 text-base font-medium text-ink [&::-webkit-details-marker]:hidden">{question}<span aria-hidden="true" className="text-xl font-light group-open:rotate-45">+</span></summary><p className="mt-2 max-w-prose text-base leading-7 text-ink-soft">{answer}</p></details>)}
            <Link href={inquiry} className="mt-8 inline-flex min-h-12 items-center gap-5 bg-ink px-6 text-sm font-medium text-white hover:bg-ink-soft">{c.cta}<span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
