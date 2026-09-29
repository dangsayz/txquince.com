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
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">{c.eyebrow}</p>
          <h1 className="mt-6 max-w-[12ch] font-serif text-[clamp(3.4rem,7vw,7rem)] leading-[0.94] tracking-[-0.045em] text-ink">{c.title}</h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-ink-soft">{c.intro}</p>
          <Link href={inquiry} className="mt-9 inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-white hover:bg-ink/85">{c.cta} <span aria-hidden className="ml-3">→</span></Link>
          <p className="mt-3 text-sm text-ink-soft">{c.small}</p>
        </div>
      </section>
      <section className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16">
        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {c.steps.map(([title, body], i) => <li key={title} className="border-t border-line pt-6"><span className="font-serif text-4xl text-ink/35">0{i + 1}</span><h2 className="mt-5 font-serif text-3xl text-ink">{title}</h2><p className="mt-4 text-base leading-7 text-ink-soft">{body}</p></li>)}
        </ol>
      </section>
      <section className="bg-greige">
        <div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16">
          <h2 className="font-serif text-[clamp(2.6rem,5vw,4rem)] leading-none text-ink">{c.deposits}</h2>
          <p className="mt-4 text-base text-ink-soft">{c.depositNote}</p>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((p) => <div key={p.id} className="border border-line bg-white p-6"><h3 className="font-serif text-2xl text-ink">{p.name}</h3><p className="mt-5 text-sm text-ink-soft">{p.priceLabel}</p><p className="mt-1 font-serif text-4xl text-ink">{p.depositLabel}</p></div>)}
          </div>
          <p className="mt-6 text-sm text-ink-soft">{c.detail}</p>
        </div>
      </section>
      <section className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-28 lg:px-16">
        <h2 className="font-serif text-[clamp(2.6rem,5vw,4rem)] leading-none text-ink">{c.faqTitle}</h2>
        <div className="mt-8 max-w-3xl border-t border-line">{c.faqs.map(([q, a]) => <details key={q} className="group border-b border-line py-6"><summary className="cursor-pointer list-none font-medium text-ink marker:hidden">{q} <span aria-hidden className="float-right">+</span></summary><p className="mt-4 leading-7 text-ink-soft">{a}</p></details>)}</div>
        <Link href={inquiry} className="mt-10 inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-white hover:bg-ink/85">{c.cta} <span aria-hidden className="ml-3">→</span></Link>
      </section>
    </>
  );
}
