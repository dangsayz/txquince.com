import { redirect } from "next/navigation";
import { getSignedInUser } from "@/lib/clerk-user";
import { getAccountBookings } from "@/lib/account-db";
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
import { HideDock } from "@/components/plan/HideDock";
import "@/components/txq/pages/pages.css";
import "./account.css";

type Lang = "en" | "es";

const COPY = {
  en: {
    index: "[Your account]",
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
    start: "Start your booking",
    startLead: "You have no booking under this email yet. Here is how it works.",
    steps: [
      "Pick your package and your date.",
      "Read and sign your agreement online.",
      "We approve it within one day.",
      "Pay your deposit here, by card or over time with Klarna, Afterpay or Affirm.",
    ],
    packages: "Packages",
    hours: (h: string) => `${h} ${h === "1" ? "hour" : "hours"}`,
    compare: "See what each package includes",
    otherEmail: "Booked with a different email? Send us a message below and we will connect it.",
    help: "Need help?",
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
    start: "Empieza tu reservación",
    startLead: "Todavía no tienes una reservación con este correo. Así funciona.",
    steps: [
      "Elige tu paquete y tu fecha.",
      "Lee y firma tu contrato en línea.",
      "Lo aprobamos en un día.",
      "Paga tu depósito aquí, con tarjeta o en pagos con Klarna, Afterpay o Affirm.",
    ],
    packages: "Paquetes",
    hours: (h: string) => `${h} ${h === "1" ? "hora" : "horas"}`,
    compare: "Ver qué incluye cada paquete",
    otherEmail: "¿Reservaste con otro correo? Mándanos un mensaje abajo y la conectamos.",
    help: "¿Necesitas ayuda?",
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

function BookingCard({ b, lang }: { b: AccountBooking; lang: Lang }) {
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
    <article className="acct-card" data-state={b.state}>
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
          <p className="acct-note">{c.overTime}</p>
        </div>
      )}
      {b.payToken && (
        <a className="acct-link" href={`/booking/${b.id}?t=${encodeURIComponent(b.payToken)}`}>{c.agreement}</a>
      )}
    </article>
  );
}

/** /account and /es/cuenta. Signed out → the log in page, then back here. */
export async function AccountDashboard({ lang }: { lang: Lang }) {
  const self = ACCOUNT_PATH[lang];
  const user = await getSignedInUser();
  if (!user) redirect(`${lang === "es" ? "/es/entrar" : "/login"}?next=${encodeURIComponent(self)}`);
  const [bookings, book] = await Promise.all([getAccountBookings(user.verifiedEmails), getPriceBook()]);
  return <AccountView lang={lang} displayName={user.displayName} email={user.verifiedEmails[0] ?? ""} bookings={bookings} book={book} />;
}

/** The page itself, from plain data (so it can be rendered and checked without a session). */
export function AccountView({ lang, displayName, email, bookings, book }: {
  lang: Lang;
  displayName: string;
  email: string;
  bookings: AccountBooking[];
  book: PriceBook;
}) {
  const c = COPY[lang];
  const open = bookings.filter((b) => b.state !== "closed");
  const first = displayName.split(" ")[0];
  const named = first && first !== "TX";
  const home = lang === "es" ? "/es" : "/";

  return (
    <div className="tq-wrap" lang={lang}>
      {/* A family with a booking has its own money action here; the "Reserve your date" dock would cover it. */}
      {open.length > 0 && <HideDock />}
      <header className="tq-pg-mast" aria-labelledby="acct-title">
        <p className="tq-pg-mast__index tq-mono">{c.index}</p>
        <div className="tq-pg-mast__body">
          <h1 id="acct-title" className="tq-display tq-pg-mast__title tq-pg-mast__title--sm">{named ? c.hi(first) : c.hiPlain}</h1>
          <p className="tq-pg-mast__dek">{open.length ? c.dekBooked : c.dekNew}</p>
        </div>
      </header>

      <div className="acct">
        {bookings.length > 0 && (
          <section className="acct__section" aria-labelledby="acct-bookings">
            <h2 id="acct-bookings" className="acct__h2">{c.bookings}</h2>
            {bookings.map((b) => <BookingCard key={b.id} b={b} lang={lang} />)}
            <TrustLine lang={lang} />
          </section>
        )}

        {open.length === 0 && (
          <section className="acct__section" aria-labelledby="acct-start">
            <h2 id="acct-start" className="acct__h2">{c.start}</h2>
            {bookings.length === 0 && <p className="acct__lead">{c.startLead}</p>}
            <ol className="acct-steps">
              {c.steps.map((s) => <li key={s}><span>{s}</span></li>)}
            </ol>
            <ul className="acct-pkgs" aria-label={c.packages}>
              {PUBLIC_TIER_IDS.map((id) => (
                <li key={id}>
                  <a href={`${home}?collection=${id}#intake`}>
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
            <p className="acct-note">{c.otherEmail}</p>
          </section>
        )}

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
  );
}
