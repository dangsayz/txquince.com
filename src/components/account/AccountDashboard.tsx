import { redirect } from "next/navigation";
import { getSignedInUser } from "@/lib/clerk-user";
import { getAccountBookings, withReceipts } from "@/lib/account-db";
import type { AccountBooking } from "@/lib/account";
import { getPriceBook } from "@/lib/pricing";
import { PUBLIC_TIER_IDS, fmtHours, usd, type PriceBook } from "@/lib/commission";
import { tierById } from "@/components/txq/data";
import { MIN_PART_CENTS } from "@/lib/balance";
import { PayButton } from "@/components/txq/PayButton";
import { BalancePay } from "@/components/txq/BalancePay";
import { ContactButtons } from "@/components/ContactButtons";
import { TrustLine } from "@/components/TrustLine";
import { SupportForm } from "./SupportForm";
import { PayMarks } from "./PayMarks";
import { site } from "@/content/site";
import { HideDock } from "@/components/plan/HideDock";
import { COPY as SITE_COPY } from "@/components/txq/copy";
import { fillDeep } from "@/lib/price-text";
import "@/components/txq/pages/pages.css";
import "./account.css";

type Lang = "en" | "es";

const COPY = {
  en: {
    index: "[Your account]",
    rail: {
      label: "Your account",
      nav: { booking: "Your booking", start: "Book your date", payments: "Payments and receipts", answers: "Answers", help: "Help" },
      need: "Need us?",
    },
    booked: "We got your signed agreement. Your date is held while we check it. We email you within one day, and this page updates.",
    payments: "Payments and receipts",
    paymentsLead: "Every payment we received from you. Stripe also emails you a receipt each time.",
    payKind: { deposit: "Deposit", balance: "Payment toward the rest" },
    receipt: "Receipt",
    waysToPay: "Ways to pay",
    hi: (n: string) => `Hi, ${n}.`,
    hiPlain: "Your account.",
    dekBooked: "Your booking, your payments and your agreement, in one place.",
    dekNew: "Pick a package, reserve your date and pay from here.",
    bookings: "Your booking",
    status: { review: "In review", approved: "Approved — deposit due", booked: "Booked", closed: "Closed" },
    next: {
      review: "We are reading your agreement. We email you within one day. After we approve it, you pay your deposit here.",
      approved: (dep: string) => `Pay your ${dep} deposit to lock in your date. It goes toward your total.`,
      bookedLeft: "Your date is yours. Pay the rest all at once or a part at a time, before the due date in your agreement.",
      bookedDone: "Your date is yours and you are paid in full. Thank you!",
      closed: "This date is no longer held. Send us a message below and we will help you find another.",
      processing: "Your last payment is still processing. It shows here when it clears.",
    },
    total: "Total",
    deposit: "Deposit",
    paid: "Paid so far",
    left: "Left to pay",
    payDeposit: (dep: string) => `Pay ${dep} deposit`,
    opening: "Opening secure checkout…",
    payError: "We couldn't open checkout. Please try again.",
    overTime: "At checkout, pay by card, or split it into smaller payments with Klarna, Afterpay or Affirm if you qualify. Secure payment by Stripe.",
    agreement: "See your signed agreement",
    pdf: "Download your signed agreement (PDF)",
    start: "Book in 4 steps",
    startLead: "You have no booking under this email yet. Follow the steps. We tell you what to do at each one.",
    stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
    here: "You are here",
    done: "Done",
    later: "Later",
    startHere: "Start here. Tap the package you want.",
    yourTurn: { approved: "Your turn. Tap the button to pay your deposit.", booked: "Your turn. Pay the rest when you are ready." },
    allDone: "All 4 steps are done.",
    steps: [
      { t: "Pick your package and your date", d: "Tap a package in the list. On the next screen you pick your date. Nothing is charged to send your request." },
      { t: "Read and sign your agreement", d: "Your agreement shows your date, your package and your total. You read it and sign it on the screen." },
      { t: "We approve it within one day", d: "We check that your date is open and we email you. You do nothing in this step." },
      { t: "Pay your deposit to lock in your date", d: (pct: string, days: string) => `The deposit is ${pct} of your total. All of it goes toward your total. The rest is due ${days} days before the event. Pay by card, or in smaller payments with Klarna, Afterpay or Affirm if you qualify.` },
    ],
    rest: { t: "Pay the rest", d: "Pay it all at once or a part at a time, before the due date in your agreement." },
    answers: "Answers to common questions",
    answersLead: "Tap a question to read the answer.",
    extraFaq: [
      { q: "Does it cost anything to send my request?", a: "No. You pick your package and your date and send it to us. Nothing is charged. You pay only after we approve your agreement." },
      { q: "Can I pay in smaller payments?", a: "Yes. At checkout, pay by card, or split it into smaller payments with Klarna, Afterpay or Affirm if you qualify. After your deposit, you can also pay the rest a part at a time here, before the due date in your agreement." },
      { q: "I booked with a different email. Where is my booking?", a: "Your booking shows under the email you used to book. Send us a message below and we will connect it to this account." },
    ],
    packages: "Packages",
    hours: (h: string) => `${h} ${h === "1" ? "hour" : "hours"}`,
    compare: "See what each package includes",
    otherEmail: "Booked with a different email? Send us a message below and we will connect it.",
    help: "Still need help?",
    helpLead: "A real person answers, in English or Spanish.",
    reach: "Text, WhatsApp or call",
    ticket: "Send us a message",
    signedAs: (e: string) => `Logged in as ${e}`,
    logout: "Log out",
    pay_: {
      payAll: (amt: string) => `Pay ${amt} now`,
      payPart: "Pay part now",
      amountLabel: "Amount to pay",
      amountHint: (min: string, max: string) => `Between ${min} and ${max}.`,
      payThis: "Continue to checkout",
      cancel: "Back",
      tooSmall: (min: string) => `The smallest payment is ${min}.`,
      tooBig: "That's more than what's left.",
      invalid: "Please enter an amount, like 250.",
    },
    support: {
      topic: "What is it about?",
      topics: { booking: "My booking or date", payment: "A payment", contract: "My agreement", other: "Something else" },
      phone: "Phone (optional)",
      phoneHint: "If you want a call or text back.",
      message: "Your message",
      messageHint: "We answer by email, usually the same day.",
      send: "Send message",
      sending: "Sending…",
      sent: "Got it. We received your message and will answer by email soon.",
      error: "We couldn't send that. Please try again, or text us.",
      tooShort: "Please write a few words so we can help.",
    },
  },
  es: {
    index: "[Tu cuenta]",
    rail: {
      label: "Tu cuenta",
      nav: { booking: "Tu reservación", start: "Aparta tu fecha", payments: "Pagos y recibos", answers: "Respuestas", help: "Ayuda" },
      need: "¿Nos necesitas?",
    },
    booked: "Recibimos tu contrato firmado. Tu fecha queda apartada mientras lo revisamos. Te escribimos en un día, y esta página se actualiza.",
    payments: "Pagos y recibos",
    paymentsLead: "Cada pago que recibimos de ti. Stripe también te manda un recibo por correo cada vez.",
    payKind: { deposit: "Depósito", balance: "Pago del resto" },
    receipt: "Recibo",
    waysToPay: "Formas de pago",
    hi: (n: string) => `Hola, ${n}.`,
    hiPlain: "Tu cuenta.",
    dekBooked: "Tu reservación, tus pagos y tu contrato, en un solo lugar.",
    dekNew: "Elige un paquete, aparta tu fecha y paga desde aquí.",
    bookings: "Tu reservación",
    status: { review: "En revisión", approved: "Aprobada — falta el depósito", booked: "Reservada", closed: "Cerrada" },
    next: {
      review: "Estamos leyendo tu contrato. Te escribimos en un día. Cuando lo aprobemos, pagas tu depósito aquí.",
      approved: (dep: string) => `Paga tu depósito de ${dep} para asegurar tu fecha. Se abona a tu total.`,
      bookedLeft: "Tu fecha es tuya. Paga el resto de una vez o en partes, antes de la fecha límite de tu contrato.",
      bookedDone: "Tu fecha es tuya y ya está todo pagado. ¡Gracias!",
      closed: "Esta fecha ya no está apartada. Mándanos un mensaje abajo y te ayudamos a encontrar otra.",
      processing: "Tu último pago todavía se está procesando. Aparecerá aquí cuando se confirme.",
    },
    total: "Total",
    deposit: "Depósito",
    paid: "Pagado hasta ahora",
    left: "Te queda por pagar",
    payDeposit: (dep: string) => `Pagar depósito de ${dep}`,
    opening: "Abriendo el pago seguro…",
    payError: "No pudimos abrir el pago. Inténtalo de nuevo.",
    overTime: "Al pagar puedes usar tarjeta, o dividirlo en pagos más pequeños con Klarna, Afterpay o Affirm si calificas. Pago seguro con Stripe.",
    agreement: "Ver tu contrato firmado",
    pdf: "Descargar tu contrato firmado (PDF)",
    start: "Reserva en 4 pasos",
    startLead: "Todavía no tienes una reservación con este correo. Sigue los pasos. En cada uno te decimos qué hacer.",
    stepOf: (n: number, total: number) => `Paso ${n} de ${total}`,
    here: "Estás aquí",
    done: "Listo",
    later: "Después",
    startHere: "Empieza aquí. Toca el paquete que quieres.",
    yourTurn: { approved: "Te toca. Toca el botón para pagar tu depósito.", booked: "Te toca. Paga el resto cuando estés lista." },
    allDone: "Los 4 pasos están listos.",
    steps: [
      { t: "Elige tu paquete y tu fecha", d: "Toca un paquete de la lista. En la siguiente pantalla eliges tu fecha. No se cobra nada por enviar tu solicitud." },
      { t: "Lee y firma tu contrato", d: "Tu contrato muestra tu fecha, tu paquete y tu total. Lo lees y lo firmas en la pantalla." },
      { t: "Lo aprobamos en un día", d: "Revisamos que tu fecha esté libre y te escribimos por correo. En este paso no haces nada." },
      { t: "Paga tu depósito para asegurar tu fecha", d: (pct: string, days: string) => `El depósito es el ${pct} de tu total. Todo se abona a tu total. El resto se paga ${days} días antes del evento. Paga con tarjeta, o en pagos más pequeños con Klarna, Afterpay o Affirm si calificas.` },
    ],
    rest: { t: "Paga el resto", d: "Págalo de una vez o en partes, antes de la fecha límite de tu contrato." },
    answers: "Respuestas a las preguntas más comunes",
    answersLead: "Toca una pregunta para leer la respuesta.",
    extraFaq: [
      { q: "¿Cuesta algo enviar mi solicitud?", a: "No. Eliges tu paquete y tu fecha y nos lo envías. No se cobra nada. Pagas solo después de que aprobemos tu contrato." },
      { q: "¿Puedo pagar en pagos más pequeños?", a: "Sí. Al pagar puedes usar tarjeta, o dividirlo en pagos más pequeños con Klarna, Afterpay o Affirm si calificas. Después de tu depósito, también puedes pagar el resto en partes aquí, antes de la fecha límite de tu contrato." },
      { q: "Reservé con otro correo. ¿Dónde está mi reservación?", a: "Tu reservación aparece con el correo que usaste para reservar. Mándanos un mensaje abajo y la conectamos a esta cuenta." },
    ],
    packages: "Paquetes",
    hours: (h: string) => `${h} ${h === "1" ? "hora" : "horas"}`,
    compare: "Ver qué incluye cada paquete",
    otherEmail: "¿Reservaste con otro correo? Mándanos un mensaje abajo y la conectamos.",
    help: "¿Todavía necesitas ayuda?",
    helpLead: "Te contesta una persona, en español o inglés.",
    reach: "Texto, WhatsApp o llamada",
    ticket: "Mándanos un mensaje",
    signedAs: (e: string) => `Entraste como ${e}`,
    logout: "Cerrar sesión",
    pay_: {
      payAll: (amt: string) => `Pagar ${amt} ahora`,
      payPart: "Pagar una parte",
      amountLabel: "Cantidad a pagar",
      amountHint: (min: string, max: string) => `Entre ${min} y ${max}.`,
      payThis: "Continuar al pago",
      cancel: "Regresar",
      tooSmall: (min: string) => `El pago mínimo es de ${min}.`,
      tooBig: "Es más de lo que te queda.",
      invalid: "Escribe una cantidad, por ejemplo 250.",
    },
    support: {
      topic: "¿De qué se trata?",
      topics: { booking: "Mi reservación o fecha", payment: "Un pago", contract: "Mi contrato", other: "Otra cosa" },
      phone: "Teléfono (opcional)",
      phoneHint: "Si quieres que te llamemos o te mandemos un texto.",
      message: "Tu mensaje",
      messageHint: "Contestamos por correo, casi siempre el mismo día.",
      send: "Enviar mensaje",
      sending: "Enviando…",
      sent: "Listo. Recibimos tu mensaje y te contestamos pronto por correo.",
      error: "No pudimos enviarlo. Inténtalo de nuevo, o mándanos un texto.",
      tooShort: "Escribe unas palabras para poder ayudarte.",
    },
  },
} as const;

export const ACCOUNT_PATH = { en: "/account", es: "/es/cuenta" } as const;

function longDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

/**
 * Which homepage FAQ items (src/components/txq/copy.ts, same order in EN and
 * ES) answer what families ask while booking. Facts stay in one place: the
 * answers are the site's own, filled from the live price book.
 * (deposit, hours, photo + film, how many on the team,
 * delivery time, sick-day cover, posting photos, Spanish, travel)
 */
export const ACCOUNT_FAQ_PICKS = [9, 3, 1, 2, 13, 14, 15, 7, 12] as const;

function DownArrow() {
  return (
    <svg className="acct-arrow" viewBox="0 0 24 24" width="22" height="22" aria-hidden focusable="false">
      <path d="M12 3v17M5 13.5l7 6.5 7-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}
function Check() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden focusable="false">
      <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  );
}

type StepItem = { t: string; d: string };

/**
 * The walkthrough: every step with a plain explanation, the current one
 * opened with its action inside. `now` is 1-based; a number past the last
 * step means everything is done.
 */
function Steps({ lang, items, now, children }: { lang: Lang; items: StepItem[]; now: number; children?: React.ReactNode }) {
  const c = COPY[lang];
  const total = items.length;
  return (
    <div className="acct-steps">
      <p className="acct-steps__count tq-mono" role="status">
        {now <= total ? c.stepOf(now, total) : c.allDone}
      </p>
      <ol className="acct-steps__list">
        {items.map((it, i) => {
          const n = i + 1;
          const state = n < now ? "done" : n === now ? "now" : "next";
          return (
            <li key={it.t} className="acct-step" data-state={state} aria-current={state === "now" ? "step" : undefined}>
              <span className="acct-step__n" aria-hidden>{state === "done" ? <Check /> : n}</span>
              <div className="acct-step__body">
                <p className="acct-step__head">
                  <span className="acct-step__t">{it.t}</span>
                  <span className="acct-step__tag tq-mono">{state === "done" ? c.done : state === "now" ? c.here : c.later}</span>
                </p>
                <p className="acct-step__d">{it.d}</p>
                {state === "now" && children ? <div className="acct-step__do">{children}</div> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function BookingCard({ b, lang, bare = false }: { b: AccountBooking; lang: Lang; bare?: boolean }) {
  const c = COPY[lang];
  const dep = usd(b.depositCents / 100);
  const left = usd(b.leftCents / 100);
  const min = usd(Math.min(MIN_PART_CENTS, b.leftCents) / 100);
  const tier = b.tier ? tierById(b.tier as Parameters<typeof tierById>[0])?.name[lang] : null;
  const next =
    b.state === "review" ? c.next.review
    : b.state === "approved" ? c.next.approved(dep)
    : b.state === "closed" ? c.next.closed
    : b.leftCents > 0 ? c.next.bookedLeft : c.next.bookedDone;
  return (
    <article className="acct-card" data-state={b.state} data-bare={bare || undefined}>
      <div className="acct-card__head">
        <h3 className="acct-card__date">{longDate(b.eventDate, lang)}</h3>
        {tier ? <p className="acct-card__meta">{tier}</p> : null}
        <p className="acct-status" data-state={b.state}>{c.status[b.state]}</p>
      </div>
      <p className="acct-card__next">{next}</p>
      {b.state !== "closed" && (
        <dl className="acct-lines">
          <div><dt>{c.total}</dt><dd>{usd(b.totalUsd)}</dd></div>
          {b.state === "booked" ? (
            <>
              <div><dt>{c.paid}</dt><dd>{usd(b.paidCents / 100)}</dd></div>
              <div data-strong><dt>{c.left}</dt><dd>{left}</dd></div>
            </>
          ) : (
            <div data-strong><dt>{c.deposit}</dt><dd>{dep}</dd></div>
          )}
        </dl>
      )}
      {b.state === "approved" && b.payToken && (
        <div className="acct-card__pay">
          <PayButton id={b.id} token={b.payToken} label={c.payDeposit(dep)} busyLabel={c.opening} errorLabel={c.payError} />
          <PayMarks lang={lang} />
          <p className="acct-note">{c.overTime}</p>
        </div>
      )}
      {b.state === "booked" && b.leftCents > 0 && b.payToken && (
        <div className="acct-card__pay">
          {b.processing ? (
            <p role="status" style={{ margin: 0 }}>{c.next.processing}</p>
          ) : (
            <BalancePay
              id={b.id}
              token={b.payToken}
              remainingCents={b.leftCents}
              copy={{
                payAll: c.pay_.payAll(left),
                payPart: c.pay_.payPart,
                amountLabel: c.pay_.amountLabel,
                amountHint: c.pay_.amountHint(min, left),
                payThis: c.pay_.payThis,
                cancel: c.pay_.cancel,
                opening: c.opening,
                error: c.payError,
                tooSmall: c.pay_.tooSmall(min),
                tooBig: c.pay_.tooBig,
                invalid: c.pay_.invalid,
              }}
            />
          )}
          <PayMarks lang={lang} />
          <p className="acct-note">{c.overTime}</p>
        </div>
      )}
      {b.payToken && (
        <a className="acct-link" href={`/booking/${b.id}?t=${encodeURIComponent(b.payToken)}`}>{c.agreement}</a>
      )}
      {b.state !== "closed" && (
        <a className="acct-link" href={`/api/account/contract?id=${b.id}`}>{c.pdf}</a>
      )}
    </article>
  );
}

/** /account and /es/cuenta. Signed out → the log in page, then back here. */
export async function AccountDashboard({ lang, justBooked = false }: { lang: Lang; justBooked?: boolean }) {
  const self = ACCOUNT_PATH[lang];
  const user = await getSignedInUser();
  if (!user) redirect(`${lang === "es" ? "/es/entrar" : "/login"}?next=${encodeURIComponent(self)}`);
  const [bookings, book] = await Promise.all([getAccountBookings(user.verifiedEmails).then(withReceipts), getPriceBook()]);
  return <AccountView lang={lang} displayName={user.displayName} email={user.verifiedEmails[0] ?? ""} bookings={bookings} book={book} justBooked={justBooked} />;
}

/** The page itself, from plain data (so it can be rendered and checked without a session). */
export function AccountView({ lang, displayName, email, bookings, book, justBooked = false }: {
  lang: Lang;
  displayName: string;
  email: string;
  bookings: AccountBooking[];
  book: PriceBook;
  justBooked?: boolean;
}) {
  const c = COPY[lang];
  const open = bookings.filter((b) => b.state !== "closed");
  const first = displayName.split(" ")[0];
  const named = first && first !== "TX";
  const bookPath = lang === "es" ? "/es/cuenta/reservar" : "/account/book";
  const paid = open.flatMap((b) => b.payments);
  const closed = bookings.filter((b) => b.state === "closed");
  const last = c.steps[3];
  const baseSteps: StepItem[] = [
    ...c.steps.slice(0, 3).map((x) => ({ t: x.t, d: x.d as string })),
    { t: last.t, d: (last.d as (pct: string, days: string) => string)(`${book.depositPercent}%`, String(book.balanceDueDays)) },
  ];
  const siteFaq = fillDeep(SITE_COPY[lang].faq.items, book);
  const faqs = [...c.extraFaq, ...ACCOUNT_FAQ_PICKS.map((i) => siteFaq[i]).filter(Boolean)];

  return (
    <div className="tq-wrap" lang={lang}>
      {/* A family with a booking has its own money action here; the "Reserve your date" dock would cover it. */}
      <HideDock />
      <header className="tq-pg-mast" aria-labelledby="acct-title">
        <p className="tq-pg-mast__index tq-mono">{c.index}</p>
        <div className="tq-pg-mast__body">
          <h1 id="acct-title" className="tq-display tq-pg-mast__title tq-pg-mast__title--sm">{named ? c.hi(first) : c.hiPlain}</h1>
          <p className="tq-pg-mast__dek">{open.length ? c.dekBooked : c.dekNew}</p>
        </div>
      </header>

      <div className="acct">
        <aside className="acct-rail" aria-label={c.rail.label}>
          <nav aria-label={c.rail.label}>
            <ul className="acct-rail__nav">
              <li><a href="#acct-top">{open.length ? c.rail.nav.booking : c.rail.nav.start}</a></li>
              {paid.length > 0 && <li><a href="#acct-payments">{c.rail.nav.payments}</a></li>}
              <li><a href="#acct-answers">{c.rail.nav.answers}</a></li>
              <li><a href="#acct-help">{c.rail.nav.help}</a></li>
            </ul>
          </nav>
          <div className="acct-rail__need">
            <p className="acct-rail__h">{c.rail.need}</p>
            <a href={`sms:${site.contact.phoneE164}`}>{site.contact.phone}</a>
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          </div>
          <div className="acct-rail__pay">
            <p className="acct-rail__h">{c.waysToPay}</p>
            <PayMarks lang={lang} />
          </div>
        </aside>

        <div className="acct__main" id="acct-top">
        {justBooked && open.length > 0 && (
          <p className="acct-flash" role="status">{c.booked}</p>
        )}
        {open.map((bk) => {
          const steps: StepItem[] = [...baseSteps, ...(bk.state === "booked" ? [c.rest] : [])];
          const now = bk.state === "review" ? 3 : bk.state === "approved" ? 4 : bk.leftCents > 0 ? 5 : 6;
          return (
            <section key={bk.id} className="acct__section" aria-labelledby={`acct-b-${bk.id}`}>
              <h2 id={`acct-b-${bk.id}`} className="acct__h2">{c.bookings}</h2>
              <div className="acct-panel">
                <Steps lang={lang} items={steps} now={now}>
                  {bk.state !== "review" && bk.payToken ? (
                    <p className="acct-point">
                      <DownArrow />
                      <span>{bk.state === "approved" ? c.yourTurn.approved : c.yourTurn.booked}</span>
                    </p>
                  ) : null}
                  <BookingCard b={bk} lang={lang} bare />
                </Steps>
                {now > steps.length ? <BookingCard b={bk} lang={lang} bare /> : null}
              </div>
              <TrustLine lang={lang} />
            </section>
          );
        })}

        {closed.length > 0 && (
          <section className="acct__section" aria-label={c.status.closed}>
            {closed.map((bk) => <BookingCard key={bk.id} b={bk} lang={lang} />)}
          </section>
        )}

        {open.length === 0 && (
          <section className="acct__section" aria-labelledby="acct-start">
            <h2 id="acct-start" className="acct__h2">{c.start}</h2>
            {bookings.length === 0 && <p className="acct__lead">{c.startLead}</p>}
            <div className="acct-panel">
              <Steps lang={lang} items={baseSteps} now={1}>
                <p className="acct-point">
                  <DownArrow />
                  <span>{c.startHere}</span>
                </p>
                <ul className="acct-pkgs" aria-label={c.packages}>
                  {PUBLIC_TIER_IDS.map((id) => (
                    <li key={id}>
                      <a href={`${bookPath}?collection=${id}#intake`}>
                        <span className="acct-pkgs__name">
                          {tierById(id).name[lang]}
                          <span className="acct-pkgs__hours">{c.hours(fmtHours(book.packages[id].hours))}</span>
                        </span>
                        <span className="acct-pkgs__price">{usd(book.packages[id].price)}</span>
                        <span className="tq-arrow" aria-hidden>→</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <a className="acct-link" href={lang === "es" ? "/es/presupuesto" : "/budget"}>{c.compare}</a>
              </Steps>
            </div>
          </section>
        )}

        {paid.length > 0 && (
          <section className="acct__section" aria-labelledby="acct-payments">
            <h2 id="acct-payments" className="acct__h2">{c.payments}</h2>
            <p className="acct__lead">{c.paymentsLead}</p>
            <ul className="acct-panel acct-pays">
              {paid.map((p, i) => (
                <li key={`${p.kind}-${i}`}>
                  <span className="acct-pays__what">
                    {c.payKind[p.kind]}
                    {p.paidAt ? <span className="acct-pays__when">{longDate(p.paidAt.slice(0, 10), lang)}</span> : null}
                  </span>
                  <span className="acct-pays__amt">{usd(p.amountCents / 100)}</span>
                  {p.receiptUrl ? (
                    <a className="acct-link" href={p.receiptUrl} target="_blank" rel="noopener noreferrer">
                      {c.receipt}&nbsp;<span aria-hidden>↗</span>
                    </a>
                  ) : <span />}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="acct__section" aria-labelledby="acct-answers">
          <h2 id="acct-answers" className="acct__h2">{c.answers}</h2>
          <p className="acct__lead">{c.answersLead}</p>
          <div className="acct-panel acct-faq">
            {faqs.map((f) => (
              <details key={f.q} className="acct-faq__item">
                <summary>
                  <span>{f.q}</span>
                  <span className="acct-faq__icon" aria-hidden />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="acct__section" aria-labelledby="acct-help">
          <h2 id="acct-help" className="acct__h2">{c.help}</h2>
          <p className="acct__lead">{c.helpLead}</p>
          <div className="acct-help">
            <div className="acct-help__col">
              <h3 className="acct-help__h3">{c.reach}</h3>
              <ContactButtons lang={lang} placement="account" />
            </div>
            <div className="acct-help__col">
              <h3 className="acct-help__h3">{c.ticket}</h3>
              <SupportForm lang={lang} bookingId={open[0]?.id ?? null} copy={c.support} />
            </div>
          </div>
        </section>

        <p className="acct-foot">
          <span>{c.signedAs(email)}</span>
          <a className="acct-link" href={`/logout${lang === "es" ? "?to=es" : ""}`}>{c.logout}</a>
        </p>
        </div>
      </div>
    </div>
  );
}
