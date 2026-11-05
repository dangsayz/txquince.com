/**
 * TrustLine — the visible promise on the budget, booking and date-check pages:
 * "We never post your daughter's name." (Families share her name, date and
 * venue with us; this says plainly that it stays off the public site.)
 * Plain markup so it works in server and client components alike.
 */
import "./trust-line.css";

export const TRUST_LINE = {
  en: "We never post your daughter's name.",
  es: "Nunca publicamos el nombre de tu hija.",
} as const;

export function TrustLine({ lang, className }: { lang: "en" | "es"; className?: string }) {
  return (
    <p className={["tq-trust", className].filter(Boolean).join(" ")}>
      <svg className="tq-trust__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
        <path d="M12 2.5 4.5 5.5v6c0 4.6 3.1 8.6 7.5 10 4.4-1.4 7.5-5.4 7.5-10v-6L12 2.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m8.5 12.2 2.4 2.4 4.6-4.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{TRUST_LINE[lang]}</span>
    </p>
  );
}
