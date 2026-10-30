"use client";

/**
 * ContactButtons — Text us · WhatsApp · Call, in the page's language.
 *
 * Families text far more than they email or fill in a five-step form, so the
 * studio phone is offered wherever a family might decide to reach out. Links
 * and words come from src/lib/contact.ts; every click fires a first-party
 * analytics event (contact_text / contact_whatsapp / contact_call) carrying the
 * page path, with `placement` as the target so each spot can be compared.
 *
 * Every button is 48px tall (primary-action size), labels never wrap, and the
 * row re-flows by the width it is given (stacked → 1 + 2 → one row), so it fits
 * a 360px phone, a narrow footer column and a wide page alike.
 */
import { trackEvent } from "@/components/Tracker";
import { site } from "@/content/site";
import {
  CONTACT_COPY,
  CONTACT_EVENT,
  CONTACT_KINDS,
  contactHref,
  smsHref,
  whatsappHref,
  type ContactKind,
  type ContactLang,
} from "@/lib/contact";
import "./contact.css";

function track(kind: ContactKind, placement: string) {
  return () => trackEvent(CONTACT_EVENT[kind], placement);
}

function Icon({ kind }: { kind: ContactKind }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    className: "tq-contact__icon",
  };
  if (kind === "text") {
    return (
      <svg {...common}>
        <path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z" />
        <path d="M8 10.75h.01M12 10.75h.01M16 10.75h.01" strokeWidth={2.4} />
      </svg>
    );
  }
  if (kind === "whatsapp") {
    return (
      <svg {...common}>
        <path d="M12 3.25a8.75 8.75 0 0 0-7.6 13.08L3.25 20.75l4.53-1.12A8.75 8.75 0 1 0 12 3.25z" />
        <path d="M9.1 8.4c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.7l-.5.6c.6 1.1 1.4 1.9 2.5 2.5l.6-.5c.2-.2.5-.2.7-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3 0 .6-.4.8-.6.4-1.5.6-2.3.3-2.2-.8-3.9-2.5-4.7-4.7-.3-.8-.1-1.7.3-2.3z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M6.6 3.75h2.6l1.4 4.1-1.9 1.3a11 11 0 0 0 6.15 6.15l1.3-1.9 4.1 1.4v2.6a1.9 1.9 0 0 1-2.05 1.9A15.6 15.6 0 0 1 4.7 5.8a1.9 1.9 0 0 1 1.9-2.05z" />
    </svg>
  );
}

export function ContactButtons({
  lang,
  placement,
  primary = true,
  note = true,
  size = "lg",
  className,
}: {
  lang: ContactLang;
  /** Where these buttons sit (analytics target), e.g. "footer", "blog-end". */
  placement: string;
  /** Fill the Text button (the main action). Off where another filled CTA sits next to it. */
  primary?: boolean;
  /** Show the number + "English or Spanish" under the buttons. */
  note?: boolean;
  /** "xl" = the big link-in-bio buttons. */
  size?: "lg" | "xl";
  className?: string;
}) {
  const c = CONTACT_COPY[lang];
  const label: Record<ContactKind, string> = { text: c.text, whatsapp: c.whatsapp, call: c.call };
  const aria: Record<ContactKind, string> = { text: c.textAria, whatsapp: c.whatsappAria, call: c.callAria };
  return (
    <div className={["tq-contact", className].filter(Boolean).join(" ")} data-size={size}>
      <ul className="tq-contact__btns" aria-label={c.groupLabel}>
        {CONTACT_KINDS.map((kind) => {
          const filled = primary && kind === "text";
          const external = kind === "whatsapp";
          return (
            <li key={kind} data-kind={kind}>
              <a
                href={contactHref(kind, lang)}
                className={`tq-btn tq-btn--lg${filled ? "" : " tq-btn--ghost"} tq-contact__btn`}
                aria-label={aria[kind]}
                onClick={track(kind, placement)}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <Icon kind={kind} />
                <span>{label[kind]}</span>
              </a>
            </li>
          );
        })}
      </ul>
      {note ? <p className="tq-contact__note tq-nums">{c.note}</p> : null}
    </div>
  );
}

/**
 * One quiet line: "Prefer to text? (945) 200-1939 · or WhatsApp". For places
 * where a full button row would crowd the main action (the booking panel).
 */
export function ContactLine({ lang, placement, className }: { lang: ContactLang; placement: string; className?: string }) {
  const c = CONTACT_COPY[lang];
  return (
    <p className={["tq-contact-line", className].filter(Boolean).join(" ")}>
      <span>{c.prefer}</span>{" "}
      <a href={smsHref()} className="tq-contact-line__link tq-nums" aria-label={c.textAria} onClick={track("text", placement)}>
        {site.contact.phone}
      </a>{" "}
      <a
        href={whatsappHref(lang)}
        className="tq-contact-line__link"
        target="_blank"
        rel="noopener noreferrer"
        onClick={track("whatsapp", placement)}
      >
        {c.orWhatsapp}
      </a>
    </p>
  );
}
