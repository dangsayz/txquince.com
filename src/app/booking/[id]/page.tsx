import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb, isDbConfigured } from "@/lib/db";
import { isSignedAgreement, signedBalanceDue, signedDepositPercent, tokenMatches } from "@/lib/agreement";
import { usd } from "@/lib/commission";
import { PayButton } from "@/components/txq/PayButton";
import { BalancePay } from "@/components/txq/BalancePay";
import { balanceCentsFrom, MIN_PART_CENTS, paidCents, type BalancePaymentRow } from "@/lib/balance";
import { site } from "@/content/site";
import "@/components/txq/pages/pages.css";
import { TrustLine } from "@/components/TrustLine";

/**
 * /booking/[id]?t=… — the family's private booking page, linked from the
 * approval email. Shows where their booking stands and, once approved, the
 * button to pay their deposit. The token is the only key; anything else is a
 * 404. Every number shown comes from the SIGNED agreement / stored deposit,
 * never the current price book, so a later price change can't alter it.
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
    approvedBody: (date: string, dep: string, pct: number) =>
      `Pay your ${pct}% deposit of ${dep} to lock in ${date}. It goes toward your total.`,
    pay: (dep: string) => `Pay ${dep} deposit`,
    opening: "Opening secure checkout…",
    payError: "We couldn't open checkout. Please try again.",
    secure: "Secure payment by Stripe.",
    confirming: "Payment received — confirming…",
    confirmingBody: "This usually takes a few seconds. Refresh in a moment, and watch your email for your confirmation.",
    paid: "You're booked!",
    paidBody: (date: string, rest: string, due: string) =>
      `${date} is officially yours. The rest of your total (${rest}) is due ${due} before the event. We'll be in touch to plan every detail.`,
    review: "We're reviewing your agreement.",
    reviewBody: "We'll email you within one day. Once we approve it, you'll be able to pay your deposit right here.",
    closed: "This link has expired.",
    closedBody: "Your date is no longer being held. Write to us and we'll gladly help you find another.",
    total: "Total",
    deposit: (pct: number) => `${pct}% deposit`,
    rest: (due: string) => `The rest, ${due} before`,
    agreement: "Your signed agreement",
    signed: (name: string, when: string) => `Signed by ${name} on ${when}`,
    help: "Questions? Write to us at",
    balTitle: "Pay the rest",
    balBody: "Pay it all now, or a part at a time. It just has to be paid off before the due date in your agreement.",
    balBnpl: "At checkout you can pay by card, or split it into smaller payments with Klarna, Afterpay or Affirm if you qualify.",
    balPaid: "Paid so far",
    balLeft: "Left to pay",
    balDone: "Paid in full. Thank you!",
    balConfirming: "Payment received — confirming. Refresh in a moment.",
    balProcessing: "Your last payment is still processing. It will show here once it clears.",
    pay_: {
      payAll: (amt: string) => `Pay ${amt} now`,
      payPart: "Pay part now",
      amountLabel: "Amount to pay",
      amountHint: (min: string, max: string) => `Between ${min} and ${max}.`,
      payThis: "Continue to checkout",
      cancel: "Back",
      opening: "Opening secure checkout…",
      error: "We couldn't open checkout. Please try again.",
      tooSmall: (min: string) => `The smallest payment is ${min}.`,
      tooBig: "That's more than what's left.",
      invalid: "Please enter an amount, like 250.",
    },
  },
  es: {
    index: "Tu reservación",
    approved: "¡Tu reservación fue aprobada!",
    approvedBody: (date: string, dep: string, pct: number) =>
      `Paga tu depósito del ${pct}% de ${dep} para asegurar el ${date}. Se abona a tu total.`,
    pay: (dep: string) => `Pagar depósito de ${dep}`,
    opening: "Abriendo el pago seguro…",
    payError: "No pudimos abrir el pago. Inténtalo de nuevo.",
    secure: "Pago seguro con Stripe.",
    confirming: "Pago recibido — confirmando…",
    confirmingBody: "Esto toma unos segundos. Actualiza la página en un momento y revisa tu correo para tu confirmación.",
    paid: "¡Ya estás reservada!",
    paidBody: (date: string, rest: string, due: string) =>
      `El ${date} es oficialmente tuyo. El resto de tu total (${rest}) se paga ${due} antes del evento. Te contactaremos para planear cada detalle.`,
    review: "Estamos revisando tu contrato.",
    reviewBody: "Te escribimos en un día. Cuando lo aprobemos, podrás pagar tu depósito aquí mismo.",
    closed: "Este enlace ya venció.",
    closedBody: "Tu fecha ya no está apartada. Escríbenos y con gusto te ayudamos a encontrar otra.",
    total: "Total",
    deposit: (pct: number) => `Depósito del ${pct}%`,
    rest: (due: string) => `El resto, ${due} antes`,
    agreement: "Tu contrato firmado",
    signed: (name: string, when: string) => `Firmado por ${name} el ${when}`,
    help: "¿Preguntas? Escríbenos a",
    balTitle: "Paga el resto",
    balBody: "Págalo todo ahora, o en partes. Solo tiene que quedar pagado antes de la fecha límite de tu contrato.",
    balBnpl: "Al pagar puedes usar tarjeta, o dividirlo en pagos más pequeños con Klarna, Afterpay o Affirm si calificas.",
    balPaid: "Pagado hasta ahora",
    balLeft: "Te queda por pagar",
    balDone: "Pagado por completo. ¡Gracias!",
    balConfirming: "Pago recibido — confirmando. Actualiza la página en un momento.",
    balProcessing: "Tu último pago todavía se está procesando. Aparecerá aquí cuando se confirme.",
    pay_: {
      payAll: (amt: string) => `Pagar ${amt} ahora`,
      payPart: "Pagar una parte",
      amountLabel: "Cantidad a pagar",
      amountHint: (min: string, max: string) => `Entre ${min} y ${max}.`,
      payThis: "Continuar al pago",
      cancel: "Regresar",
      opening: "Abriendo el pago seguro…",
      error: "No pudimos abrir el pago. Inténtalo de nuevo.",
      tooSmall: (min: string) => `El pago mínimo es de ${min}.`,
      tooBig: "Es más de lo que te queda.",
      invalid: "Escribe una cantidad, por ejemplo 250.",
    },
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
  searchParams: Promise<{ t?: string; paid?: string; balance?: string }>;
}) {
  const [{ id }, { t: token, paid: paidParam, balance: balanceParam }] = await Promise.all([params, searchParams]);
  if (!isDbConfigured() || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data: b } = await getDb()
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
  const due = signedBalanceDue(agreement, lang);
  const pct = signedDepositPercent(agreement);

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

  // Balance (after the deposit): signed amount minus what's been paid online.
  // If the ledger can't be read (table not created yet), the section stays hidden.
  const balanceCents = balanceCentsFrom(agreement.balanceUsd);
  let balanceRows: Pick<BalancePaymentRow, "status" | "amount_cents">[] | null = null;
  if (state === "paid" && balanceCents !== null) {
    const { data, error } = await getDb()
      .from("booking_payments")
      .select("status, amount_cents")
      .eq("booking_id", b.id)
      .eq("kind", "balance");
    if (!error) balanceRows = data ?? [];
  }
  const balPaid = balanceRows ? paidCents(balanceRows) : 0;
  const balLeft = balanceCents !== null ? Math.max(0, balanceCents - balPaid) : 0;
  const balProcessing = !!balanceRows?.some((r) => r.status === "processing");
  const minStr = usd(Math.min(MIN_PART_CENTS, balLeft) / 100);
  const leftStr = usd(balLeft / 100);

  const title = { paid: c.paid, confirming: c.confirming, approved: c.approved, review: c.review, closed: c.closed }[state];
  const body = {
    paid: c.paidBody(date, usd(agreement.balanceUsd), due),
    confirming: c.confirmingBody,
    approved: c.approvedBody(date, dep, pct),
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
          <TrustLine lang={lang} />
          <dl className="tq-pay__lines tq-nums">
            <div>
              <dt>{c.total}</dt>
              <dd>{usd(agreement.totalUsd)}</dd>
            </div>
            <div>
              <dt>{c.deposit(pct)}</dt>
              <dd>{dep}</dd>
            </div>
            <div>
              <dt>{c.rest(due)}</dt>
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

      {balanceRows && balanceCents !== null && (
        <section className="tq-pg-row" style={{ borderTop: "1px solid var(--border-hairline)" }} aria-labelledby="tq-balance-title">
          <p className="tq-pg-row__index tq-mono">[{c.balTitle}]</p>
          <div className="tq-pg-row__body">
            <h2 id="tq-balance-title" className="tq-display" style={{ margin: 0, fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
              {balLeft > 0 ? c.balTitle : c.balDone}
            </h2>
            {balLeft > 0 && <p style={{ margin: "12px 0 0", maxWidth: "60ch" }}>{c.balBody}</p>}
            <dl className="tq-pay__lines tq-nums">
              <div>
                <dt>{c.balPaid}</dt>
                <dd>{usd((b.deposit_amount_cents + balPaid) / 100)}</dd>
              </div>
              <div>
                <dt>{c.balLeft}</dt>
                <dd>{leftStr}</dd>
              </div>
            </dl>
            {balLeft > 0 && (
              <div className="tq-pay__cta">
                {balanceParam === "1" && !balProcessing && (
                  <p role="status" style={{ margin: 0 }}>{c.balConfirming}</p>
                )}
                {balProcessing ? (
                  <p role="status" style={{ margin: 0 }}>{c.balProcessing}</p>
                ) : (
                  <BalancePay
                    id={b.id}
                    token={token!}
                    remainingCents={balLeft}
                    copy={{
                      payAll: c.pay_.payAll(leftStr),
                      payPart: c.pay_.payPart,
                      amountLabel: c.pay_.amountLabel,
                      amountHint: c.pay_.amountHint(minStr, leftStr),
                      payThis: c.pay_.payThis,
                      cancel: c.pay_.cancel,
                      opening: c.pay_.opening,
                      error: c.pay_.error,
                      tooSmall: c.pay_.tooSmall(minStr),
                      tooBig: c.pay_.tooBig,
                      invalid: c.pay_.invalid,
                    }}
                  />
                )}
                <p className="tq-hint" style={{ margin: 0 }}>
                  {c.balBnpl} {c.secure}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

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
