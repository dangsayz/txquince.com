/**
 * lead-email-copy.ts — the words of the lead follow-up and booking-recovery
 * emails, in English and Spanish. Pure (no I/O), so a test can read every
 * line and the owner can review the text in one place.
 *
 * Rules for this copy (Dang, 2026-11-10):
 *  - No claim the code can't check: no "I'm holding a window near your date",
 *    no "Saturdays fill early", no "limited number each season".
 *  - No call offer. Families reply by email or text.
 *  - Prices only from the live price book (passed in as text).
 *  - Spanish families get Spanish. When we don't know the language, English
 *    first and the full Spanish version below it.
 */

export type LeadLang = "en" | "es";
/** "both" = language unknown: English, then the Spanish version below. */
export type LeadLangChoice = LeadLang | "both";

/** One paragraph. `link` is appended (text) or rendered as an anchor (HTML). */
export type CopyLine = { text: string; link?: { label: string; url: string } };

export type EmailCopy = {
  subject: string;
  greeting: string;
  lines: CopyLine[];
  cta: { label: string; url: string };
  signoff: string;
};

export type FollowupContext = {
  firstName: string;
  /** Absolute site URL, no trailing slash. */
  siteUrl: string;
  /** Live price-book prices, already formatted ("$400"). */
  portraitPrice: string;
  photoVideoFrom: string;
  depositPercent: number;
  /** "14 days" / "14 días" — from the price book or signed agreement. */
  balanceDue: { en: string; es: string };
};

export type RecoveryContext = {
  firstName: string;
  /** "Saturday, March 14, 2027" / "sábado, 14 de marzo de 2027". */
  eventDate: { en: string; es: string };
  /** Package name, or "" when unknown. */
  packageName: string;
  /** Where a reply reaches the studio (the public contact email). */
  replyEmail: string;
};

const FOLLOWUP_STEPS = [1, 2, 3] as const;
export type FollowupStep = (typeof FOLLOWUP_STEPS)[number];
export const isFollowupStep = (n: number): n is FollowupStep => (FOLLOWUP_STEPS as readonly number[]).includes(n);

/** "Hi Ana," / "Hi there," and "Hola Ana," / "Hola,". */
const hi = (lang: LeadLang, name: string) => (lang === "es" ? (name ? `Hola ${name},` : "Hola,") : name ? `Hi ${name},` : "Hi there,");
/** "Ana, " in front of a subject, or nothing when there's no name. */
const lead = (name: string, rest: string) => (name ? `${name}, ${rest.charAt(0).toLowerCase()}${rest.slice(1)}` : rest);

const home = (siteUrl: string, lang: LeadLang) => (lang === "es" ? `${siteUrl}/es` : siteUrl);

export function followupCopy(step: FollowupStep, lang: LeadLang, c: FollowupContext): EmailCopy {
  const reserveUrl = `${home(c.siteUrl, lang)}#intake`;
  const galleryUrl = `${c.siteUrl}/portfolio`;
  const pricesUrl = `${home(c.siteUrl, lang)}#commissions`;
  const signoff = "TX Quince";

  if (lang === "es") {
    const greeting = hi("es", c.firstName);
    if (step === 1)
      return {
        subject: c.firstName ? `¿Pudiste ver las fotos, ${c.firstName}?` : "¿Pudiste ver las fotos?",
        greeting,
        lines: [
          { text: "Solo quería saber cómo van los planes de la quinceañera. Sin presión, sé que hay mucho que organizar." },
          { text: "Aquí están galerías y videos completos de celebraciones reales en DFW, para que veas exactamente lo que recibirías:", link: { label: "ver las galerías", url: galleryUrl } },
          { text: `Todos los paquetes y precios están en la página: desde ${c.portraitPrice} por una sesión de retratos, y foto y video desde ${c.photoVideoFrom}.`, link: { label: "ver los precios", url: pricesUrl } },
          { text: "Cuando quieras, responde a este correo y reviso si tu fecha está disponible." },
        ],
        cta: { label: "Ver las galerías", url: galleryUrl },
        signoff,
      };
    if (step === 2)
      return {
        subject: "Cómo reservar tu fecha",
        greeting,
        lines: [
          { text: "Algo que quiero hacerte fácil: no pagas todo de una vez." },
          { text: `Escoge un paquete, llena tus datos y firma el contrato en línea. Todavía no se paga nada. Cuando confirme tu fecha, un depósito del ${c.depositPercent}% la asegura y el resto se paga ${c.balanceDue.es} antes del evento.` },
          { text: "El resto lo puedes pagar en partes, o con Klarna, Afterpay o Affirm si calificas." },
          { text: "¿Preguntas sobre los paquetes o el horario del día? Solo responde, leo todos los mensajes." },
        ],
        cta: { label: "Reservar mi fecha", url: reserveUrl },
        signoff,
      };
    return {
      subject: "Última nota sobre tu fecha",
      greeting,
      lines: [
        { text: "No quiero llenar tu correo, así que esta es mi última nota a menos que me escribas." },
        { text: "Si todavía nos quieres para la quinceañera, responde con tu fecha y te digo enseguida si está disponible." },
        { text: "Y si los planes cambiaron o ya contrataste a alguien más, no hay problema. Solo avísame y cierro tu expediente." },
      ],
      cta: { label: "Consultar mi fecha", url: reserveUrl },
      signoff,
    };
  }

  const greeting = hi("en", c.firstName);
  if (step === 1)
    return {
      subject: c.firstName ? `Did you get a chance to look, ${c.firstName}?` : "Did you get a chance to look?",
      greeting,
      lines: [
        { text: "Just checking in on your quinceañera plans. No pressure at all, I know there's a lot to plan." },
        { text: "Here are full galleries and videos from real DFW celebrations, so you can see exactly what you'd get:", link: { label: "see the galleries", url: galleryUrl } },
        { text: `Every package and price is on the site: from ${c.portraitPrice} for a portrait session, with photo and video from ${c.photoVideoFrom}.`, link: { label: "see the prices", url: pricesUrl } },
        { text: "Whenever you're ready, reply here and I'll check whether your date is open." },
      ],
      cta: { label: "See the galleries", url: galleryUrl },
      signoff,
    };
  if (step === 2)
    return {
      subject: "How reserving your date works",
      greeting,
      lines: [
        { text: "One thing I want to make easy: you don't pay it all at once." },
        { text: `Pick a package, fill in your details and sign the agreement online. No payment yet. Once I confirm your date, a ${c.depositPercent}% deposit locks it in, and the rest is due ${c.balanceDue.en} before the event.` },
        { text: "You can pay the rest in parts, or with Klarna, Afterpay or Affirm if you qualify." },
        { text: "Questions about the packages or the timeline? Just reply, I read every message." },
      ],
      cta: { label: "Reserve your date", url: reserveUrl },
      signoff,
    };
  return {
    subject: "Last check on your date",
    greeting,
    lines: [
      { text: "I don't want to keep filling your inbox, so this is my last note unless I hear from you." },
      { text: "If you'd still like us for the quinceañera, reply with your date and I'll tell you right away if it's open." },
      { text: "And if plans changed or you booked someone else, no hard feelings at all. Just let me know and I'll close your file." },
    ],
    cta: { label: "Check my date", url: reserveUrl },
    signoff,
  };
}

/**
 * One email when a date hold ends unpaid. It makes no availability claim: the
 * site's bookings table doesn't hold every event on the owner's calendar, so
 * the family replies and the owner checks the date himself.
 */
export function recoveryCopy(lang: LeadLang, c: RecoveryContext): EmailCopy {
  const mailto = (subject: string) => `mailto:${c.replyEmail}?subject=${encodeURIComponent(subject)}`;
  const pkg = c.packageName ? ` (${c.packageName})` : "";
  if (lang === "es") {
    const subject = lead(c.firstName, `Tu reservación del ${c.eventDate.es}`);
    return {
      subject,
      greeting: hi("es", c.firstName),
      lines: [
        { text: `Tu reservación del ${c.eventDate.es}${pkg} venció antes de que se pagara el depósito, así que no se cobró nada.` },
        { text: "Si todavía quieres esa fecha, responde a este correo. La reviso y, si está libre, te mando un nuevo enlace para el depósito." },
        { text: "Si los planes cambiaron, no te preocupes. Solo responde y cierro tu expediente." },
      ],
      cta: { label: "Responder", url: mailto(`Re: ${subject}`) },
      signoff: "TX Quince",
    };
  }
  const subject = lead(c.firstName, `About your hold for ${c.eventDate.en}`);
  return {
    subject,
    greeting: hi("en", c.firstName),
    lines: [
      { text: `Your hold for ${c.eventDate.en}${pkg} ended before the deposit went through, so nothing was charged.` },
      { text: "If you'd still like that date, reply here. I'll check it and, if it's free, send you a fresh deposit link." },
      { text: "If plans changed, no worries at all. Just reply and I'll close your file." },
    ],
    cta: { label: "Reply", url: mailto(`Re: ${subject}`) },
    signoff: "TX Quince",
  };
}

/** "Preferred language: Español" in a package-picker inquiry, or a stored "en"/"es". */
export function leadLangFrom(value: unknown): LeadLangChoice {
  if (typeof value !== "string") return "both";
  const v = value.trim().toLowerCase();
  if (v === "es" || v.startsWith("espa") || v.startsWith("span")) return "es";
  if (v === "en" || v.startsWith("engl") || v.startsWith("ingl")) return "en";
  return "both";
}

/** Subject line for a mail that carries both languages. */
export function bothSubject(en: string, es: string): string {
  return `${en} · ${es}`;
}

/** Plain-text body for one language. */
export function copyToText(c: EmailCopy): string {
  return [
    c.greeting,
    "",
    ...c.lines.flatMap((l) => [l.link ? `${l.text} ${l.link.url}` : l.text, ""]),
    c.cta.url.startsWith("mailto:") ? "" : `${c.cta.label}: ${c.cta.url}`,
    "",
    c.signoff,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
