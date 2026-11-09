/**
 * Ways to pay at checkout, as name badges in each company's own colors.
 * They are labels, not the companies' logo artwork: Stripe Checkout shows the
 * official marks. Whether Klarna / Afterpay / Affirm is offered depends on the
 * family and the amount, so the line under them says "if you qualify".
 */
const MARKS = [
  { id: "card", en: "Card", es: "Tarjeta" },
  { id: "klarna", en: "Klarna", es: "Klarna" },
  { id: "afterpay", en: "Afterpay", es: "Afterpay" },
  { id: "affirm", en: "Affirm", es: "Affirm" },
] as const;

export function PayMarks({ lang }: { lang: "en" | "es" }) {
  return (
    <ul className="acct-marks" aria-label={lang === "es" ? "Formas de pago" : "Ways to pay"}>
      {MARKS.map((m) => (
        <li key={m.id} className="acct-mark" data-brand={m.id}>
          {m.id === "card" ? (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
              <rect x="2.5" y="5" width="19" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M2.5 9.5h19M6 15h4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          ) : null}
          {m[lang]}
        </li>
      ))}
    </ul>
  );
}
