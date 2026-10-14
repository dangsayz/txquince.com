import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { isSignedAgreement, tokenMatches } from "@/lib/agreement";
import { RETAINER, usd } from "@/lib/commission";
import { PayButton } from "@/components/txq/PayButton";
import { site } from "@/content/site";
import "@/components/txq/pages/pages.css";

/**
 * /booking/[id]?t=… — the family's private booking page, linked from the
 * approval email. Shows where their booking stands and, once approved, the
 * button to pay their 25% deposit. The token is the only key; anything else
 * is a 404.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your Booking",
  robots: { index: false, follow: false },
};

const COPY = {
  en: {
    index: "Your booking",
    approved: "Your booking is approved!",
    approvedBody: (date: string, dep: string) =>
      `Pay your 25% deposit of ${dep} to lock in ${date}. It goes toward your total.`,
    pay: (dep: string) => `Pay ${dep} deposit`,
    opening: "Opening secure checkout…",
    payError: "We couldn't open checkout. Please try again.",
    secure: "Secure payment by Stripe.",
    confirming: "Payment received — confirming…",
    confirmingBody: "This usually takes a few seconds. Refresh in a moment, and watch your email for your confirmation.",
    paid: "You're booked!",
    paidBody: (date: string, rest: string, hrs: number) =>
      `${date} is officially yours. The rest of your total (${rest}) is due ${hrs} hours before the event. We'll be in touch to plan every detail.`,
    review: "We're reviewing your agreement.",
    reviewBody: "We'll email you within one day. Once we approve it, you'll be able to pay your deposit right here.",
    closed: "This link has expired.",
    closedBody: "Your date is no longer being held. Write to us and we'll gladly help you find another.",
    total: "Total",
    deposit: "25% deposit",
    rest: (hrs: number) => `The rest, ${hrs} hours before`,
    agreement: "Your signed agreement",
    signed: (name: string, when: string) => `Signed by ${name} on ${when}`,
    help: "Questions? Write to us at",
  },
  es: {
    index: "Tu reservación",
    approved: "¡Tu reservación fue aprobada!",
    approvedBody: (date: string, dep: string) =>
      `Paga tu depósito del 25% de ${dep} para asegurar el ${date}. Se abona a tu total.`,
    pay: (dep: string) => `Pagar depósito de ${dep}`,
    opening: "Abriendo el pago seguro…",
    payError: "No pudimos abrir el pago. Inténtalo de nuevo.",
    secure: "Pago seguro con Stripe.",
    confirming: "Pago recibido — confirmando…",
    confirmingBody: "Esto toma unos segundos. Actualiza la página en un momento y revisa tu correo para tu confirmación.",
    paid: "¡Ya estás reservada!",
    paidBody: (date: string, rest: string, hrs: number) =>
      `El ${date} es oficialmente tuyo. El resto de tu total (${rest}) se paga ${hrs} horas antes del evento. Te contactaremos para planear cada detalle.`,
    review: "Estamos revisando tu contrato.",
    reviewBody: "Te escribimos en un día. Cuando lo aprobemos, podrás pagar tu depósito aquí mismo.",
    closed: "Este enlace ya venció.",
    closedBody: "Tu fecha ya no está apartada. Escríbenos y con gusto te ayudamos a encontrar otra.",
    total: "Total",
    deposit: "Depósito del 25%",
    rest: (hrs: number) => `El resto, ${hrs} horas antes`,
    agreement: "Tu contrato firmado",
    signed: (name: string, when: string) => `Firmado por ${name} el ${when}`,
    help: "¿Preguntas? Escríbenos a",
  },
} as const;

/** Is an approval hold still open? (Request-time check; this page is dynamic.) */
function holdIsLive(expiresAt: string) {
  return new Date(expiresAt).getTime() > Date.now();
}

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string; paid?: string }>;
}) {
  const [{ id }, { t: token, paid: paidParam }] = await Promise.all([params, searchParams]);
  if (!isSupabaseConfigured() || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data: b } = await getServiceSupabase()
    .from("bookings")
    .select("id, name, event_date, status, deposit_amount_cents, expires_at, metadata")
    .eq("id", id)
    .maybeSingle();
  const meta = (b?.metadata ?? {}) as Record<string, unknown>;
  const agreement = meta.agreement;
  if (!b || !isSignedAgreement(agreement) || !tokenMatches(agreement.payToken, token)) notFound();

  const lang = agreement.lang === "es" ? "es" : "en";
  const c = COPY[lang];
  const locale = lang === "es" ? "es-MX" : "en-US";
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${b.event_date}T12:00:00Z`));
  const signedWhen = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(agreement.signedAt));
  const dep = usd(b.deposit_amount_cents / 100);
  const hrs = RETAINER.balanceDueHours;

  const live = b.status === "pending_payment" && holdIsLive(b.expires_at);
  const state =
    b.status === "paid"
      ? "paid"
      : live && paidParam === "1"
        ? "confirming"
        : live
          ? "approved"
          : b.status === "requested"
            ? "review"
            : "closed";

  const title = { paid: c.paid, confirming: c.confirming, approved: c.approved, review: c.review, closed: c.closed }[state];
  const body = {
    paid: c.paidBody(date, usd(agreement.balanceUsd), hrs),
    confirming: c.confirmingBody,
    approved: c.approvedBody(date, dep),
    review: c.reviewBody,
    closed: c.closedBody,
  }[state];

  return (
    <div className="tq-wrap" lang={lang}>
      <header className="tq-pg-mast">
        <p className="tq-pg-mast__index tq-mono" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="tq-dot" data-limited={state === "closed"} aria-hidden /> [{c.index}]
        </p>
        <div className="tq-pg-mast__body">
          <h1 className="tq-display tq-pg-mast__title tq-pg-mast__title--sm">{title}</h1>
          <p className="tq-pg-mast__dek">{body}</p>
          <dl className="tq-pay__lines tq-nums">
            <div>
              <dt>{c.total}</dt>
              <dd>{usd(agreement.totalUsd)}</dd>
            </div>
            <div>
              <dt>{c.deposit}</dt>
              <dd>{dep}</dd>
            </div>
            <div>
              <dt>{c.rest(hrs)}</dt>
              <dd>{usd(agreement.balanceUsd)}</dd>
            </div>
          </dl>
          {state === "approved" && (
            <div className="tq-pay__cta">
              <PayButton id={b.id} token={token!} label={c.pay(dep)} busyLabel={c.opening} errorLabel={c.payError} />
              <p className="tq-hint" style={{ margin: 0 }}>
                {c.secure}
              </p>
            </div>
          )}
        </div>
      </header>

      <section className="tq-pg-row" style={{ borderTop: "1px solid var(--border-hairline)" }}>
        <p className="tq-pg-row__index tq-mono">[{c.agreement}]</p>
        <div className="tq-pg-row__body">
          <article className="tq-agreement" aria-label={agreement.title} tabIndex={0}>
            <h2 className="tq-agreement__title">{agreement.title}</h2>
            <p>{agreement.intro}</p>
            {agreement.sections.map((sec) => (
              <section key={sec.title}>
                <h3 className="tq-mono">{sec.title}</h3>
                <ul>
                  {sec.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </section>
            ))}
            <div className="tq-agreement__sig">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={agreement.signature} alt="" width={300} height={100} />
              <p className="tq-mono" style={{ margin: 0 }}>
                {c.signed(agreement.signedName, signedWhen)}
              </p>
            </div>
          </article>
          <p style={{ marginTop: 24 }}>
            {c.help}{" "}
            <a href={`mailto:${site.contact.email}`} className="tq-pg-inline">
              {site.contact.email}
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
