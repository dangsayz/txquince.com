/**
 * contact.ts — the studio's phone, as links and words (client + server).
 *
 * Families text far more than they email, so the one phone number in
 * `site.contact` is offered three ways (Text, WhatsApp, Call) in many places.
 * Every link and label is built here, so the number, the prefilled WhatsApp
 * message and the wording change in one place.
 */
import { site } from "@/content/site";

export type ContactLang = "en" | "es";
export type ContactKind = "text" | "whatsapp" | "call";

/** The order the buttons appear in everywhere: texting first. */
export const CONTACT_KINDS: readonly ContactKind[] = ["text", "whatsapp", "call"];

/** Analytics event fired on click (first-party /api/track). */
export const CONTACT_EVENT: Record<ContactKind, string> = {
  text: "contact_text",
  whatsapp: "contact_whatsapp",
  call: "contact_call",
};

export const CONTACT_COPY = {
  en: {
    text: "Text us",
    whatsapp: "WhatsApp",
    call: "Call",
    /** Spoken labels for screen readers (the number is not in the visible label). */
    textAria: `Text us at ${site.contact.phone}`,
    whatsappAria: `Message us on WhatsApp at ${site.contact.phone}`,
    callAria: `Call us at ${site.contact.phone}`,
    groupLabel: "Text, WhatsApp or call us",
    /** Small line under the buttons. */
    note: `${site.contact.phone} · English or Spanish`,
    /** The one-line prompt ("Prefer to text? (945) 200-1939"). */
    prefer: "Prefer to text?",
    orWhatsapp: "or WhatsApp",
  },
  es: {
    text: "Envíanos un texto",
    whatsapp: "WhatsApp",
    call: "Llámanos",
    textAria: `Envíanos un texto al ${site.contact.phone}`,
    whatsappAria: `Escríbenos por WhatsApp al ${site.contact.phone}`,
    callAria: `Llámanos al ${site.contact.phone}`,
    groupLabel: "Escríbenos o llámanos",
    note: `${site.contact.phone} · en español o inglés`,
    prefer: "¿Prefieres mandar un texto?",
    orWhatsapp: "o por WhatsApp",
  },
} as const;

/** `sms:+19452001939` — opens the phone's messages app. */
export function smsHref(): string {
  return `sms:${site.contact.phoneE164}`;
}

/** `tel:+19452001939`. */
export function telHref(): string {
  return `tel:${site.contact.phoneE164}`;
}

/** wa.me link with a first message in the page's language. */
export function whatsappHref(lang: ContactLang): string {
  return `${site.contact.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage[lang])}`;
}

/**
 * schema.org fields for the business node (LocalBusiness / ProfessionalService):
 * the phone, plus a bilingual customer-service ContactPoint. Spread into every
 * business JSON-LD block so they all say the same thing.
 */
export function businessContactJsonLd() {
  return {
    telephone: site.contact.phoneE164,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: site.contact.phoneE164,
      email: site.contact.email,
      availableLanguage: ["English", "Spanish"],
      areaServed: "US",
    },
  };
}

export function contactHref(kind: ContactKind, lang: ContactLang): string {
  if (kind === "text") return smsHref();
  if (kind === "call") return telHref();
  return whatsappHref(lang);
}
