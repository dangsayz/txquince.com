/**
 * agreement.ts — the booking agreement a family signs on the homepage.
 *
 * Built from exactly what they picked (package, hours, team, extras) and
 * written in plain words, in their language. The rendered text is stored on
 * the booking at signing time (with AGREEMENT_VERSION), so editing this file
 * later never changes an agreement someone already signed.
 *
 * Pure and isomorphic: the intake renders it for review with the price book
 * the page was served, the API re-builds it server-side from its own live
 * book (never trusting client text), and the admin, email and pay pages show
 * the stored snapshot — including the deposit %, balance-due days and hold
 * days it was signed under, so a later price change never touches it.
 */
import { addOnAllowed,
  COORDINATOR_INCLUDED,
  normalizeCrew,
  quoteCommission,
  usd,
  type AddOnId,
  type Crew,
  type PriceBook,
  type TierId,
} from "@/lib/commission";
import { ADD_ONS, matrixFor, TIERS, type Lang } from "@/components/txq/data";

/** Bump when the wording below changes; stored with every signature. */
export const AGREEMENT_VERSION = "2026-10-31.1";

export type AgreementInput = {
  lang: Lang;
  tier: TierId;
  hours?: number | null;
  crew?: Partial<Crew> | null;
  addOns: AddOnId[];
  eventDate: string; // YYYY-MM-DD
  cityLabel: string;
  venue: string;
  startTime: string;
  honoree: string;
  name: string;
  email: string;
  phone: string;
  sharePermission: boolean;
};

export type AgreementSection = { title: string; lines: string[] };
export type Agreement = {
  version: string;
  lang: Lang;
  title: string;
  intro: string;
  sections: AgreementSection[];
  totalUsd: number;
  depositUsd: number;
  balanceUsd: number;
  /** Terms it was signed under (absent on agreements signed before 2026-10-14.2: 25% / 48 hours / 7 days). */
  depositPercent?: number;
  balanceDueDays?: number;
  holdDays?: number;
};

const T = {
  en: {
    title: "TX Quince Booking Agreement",
    intro: (name: string, honoree: string) =>
      `This agreement is between TX Quince ("we") and ${name} ("you")${honoree ? ` for ${honoree}'s quinceañera` : " for the quinceañera"}. Please read it, then sign at the bottom.`,
    event: "Your event",
    date: "Date",
    city: "Area",
    venue: "Venue",
    venueTbd: "To be confirmed",
    start: "Start time",
    startTbd: "To be confirmed",
    pkg: "Your package",
    hours: (h: number, base: number) =>
      h > base ? `${h} hours on the day (${base} included + ${h - base} extra)` : `${h} hours on the day`,
    hoursArchive: (h: number) => `${h} hours on the celebration day, plus a second day for portraits`,
    team: (p: number, v: number) =>
      `Your team: ${p} ${p === 1 ? "photographer" : "photographers"}${v ? ` and ${v} ${v === 1 ? "videographer" : "videographers"}` : ""}`,
    coordinator: "A coordinator who runs the day is included",
    includes: "What you get",
    extras: "Extras you added",
    noExtras: "No extras",
    money: "Price and payments",
    pkgPrice: "Package",
    extraHours: (n: number) => `Extra ${n === 1 ? "hour" : "hours"} (${n})`,
    total: "Total",
    deposit: (amt: string, pct: number) =>
      `Deposit: ${amt} (${pct}%). You pay it after we approve this agreement. It locks in your date and goes toward your total.`,
    balance: (amt: string, days: number) => `The rest: ${amt}, due ${days} ${days === 1 ? "day" : "days"} before the event.`,
    tax: "Texas sales tax, and travel outside Dallas–Fort Worth, Houston, Austin and San Antonio, are quoted separately if they apply.",
    how: "How booking works",
    howLines: (days: number) => [
      `When you sign, we hold your date for ${days} days while we review your booking.`,
      "When we approve it, we email you a link to pay your deposit.",
      "Your booking is final once your deposit is paid.",
      "If we can't take your date, we'll let you know and you won't be charged anything.",
    ],
    changes: "Changes and cancellations",
    changesLines: [
      "Want more hours or an extra later? Just ask — if we're available, we'll add it and update your total.",
      "If you cancel, your deposit is not refundable, because we save your date and turn other families away.",
      "If we ever have to cancel, we refund everything you've paid.",
    ],
    crew: "Who covers your day",
    crewLines: [
      "Your day is covered by TX Quince team photographers and videographers, assigned by the studio. Requests for specific team members, including the owners, are not accepted.",
      "Every gallery and film is edited by the owners.",
    ],
    media: "Your photos and videos",
    mediaLines: (share: boolean) => [
      "Everything we deliver is yours to keep, print and share with family and friends.",
      share
        ? "You're okay with us sharing some of your photos and videos on our website and social media."
        : "We will not share your photos or videos publicly.",
    ],
  },
  es: {
    title: "Contrato de reservación de TX Quince",
    intro: (name: string, honoree: string) =>
      `Este contrato es entre TX Quince ("nosotros") y ${name} ("tú")${honoree ? ` para la quinceañera de ${honoree}` : " para la quinceañera"}. Léelo y luego firma al final.`,
    event: "Tu evento",
    date: "Fecha",
    city: "Zona",
    venue: "Salón",
    venueTbd: "Por confirmar",
    start: "Hora de inicio",
    startTbd: "Por confirmar",
    pkg: "Tu paquete",
    hours: (h: number, base: number) =>
      h > base ? `${h} horas el día del evento (${base} incluidas + ${h - base} extra)` : `${h} horas el día del evento`,
    hoursArchive: (h: number) => `${h} horas el día de la celebración, más un segundo día para retratos`,
    team: (p: number, v: number) =>
      `Tu equipo: ${p} ${p === 1 ? "fotógrafo" : "fotógrafos"}${v ? ` y ${v} ${v === 1 ? "videógrafo" : "videógrafos"}` : ""}`,
    coordinator: "Incluye una coordinadora que lleva el día",
    includes: "Lo que recibes",
    extras: "Extras que añadiste",
    noExtras: "Sin extras",
    money: "Precio y pagos",
    pkgPrice: "Paquete",
    extraHours: (n: number) => `${n === 1 ? "Hora extra" : "Horas extra"} (${n})`,
    total: "Total",
    deposit: (amt: string, pct: number) =>
      `Depósito: ${amt} (${pct}%). Lo pagas después de que aprobemos este contrato. Aparta tu fecha y se abona a tu total.`,
    balance: (amt: string, days: number) => `El resto: ${amt}, se paga ${days} ${days === 1 ? "día" : "días"} antes del evento.`,
    tax: "El impuesto de Texas, y los viajes fuera de Dallas–Fort Worth, Houston, Austin y San Antonio, se cotizan aparte si aplican.",
    how: "Cómo funciona la reservación",
    howLines: (days: number) => [
      `Cuando firmas, apartamos tu fecha por ${days} días mientras revisamos tu reservación.`,
      "Cuando la aprobamos, te enviamos por correo un enlace para pagar tu depósito.",
      "Tu reservación queda confirmada en cuanto pagas el depósito.",
      "Si no podemos tomar tu fecha, te avisamos y no se te cobra nada.",
    ],
    changes: "Cambios y cancelaciones",
    changesLines: [
      "¿Quieres más horas o un extra después? Solo pídelo — si estamos disponibles, lo añadimos y actualizamos tu total.",
      "Si cancelas, el depósito no es reembolsable, porque apartamos tu fecha y rechazamos a otras familias.",
      "Si nosotros tuviéramos que cancelar, te devolvemos todo lo que hayas pagado.",
    ],
    crew: "Quién cubre tu día",
    crewLines: [
      "Tu día lo cubren fotógrafos y videógrafos del equipo de TX Quince, asignados por el estudio. No se aceptan peticiones de miembros específicos del equipo, incluidos los dueños.",
      "Cada galería y cada video lo editan los dueños.",
    ],
    media: "Tus fotos y videos",
    mediaLines: (share: boolean) => [
      "Todo lo que te entregamos es tuyo para guardar, imprimir y compartir con familia y amigos.",
      share
        ? "Estás de acuerdo con que compartamos algunas de tus fotos y videos en nuestra página y redes sociales."
        : "No compartiremos tus fotos ni videos públicamente.",
    ],
  },
} as const;

function longDate(iso: string, lang: Lang) {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function buildAgreement(input: AgreementInput, book: PriceBook): Agreement {
  const t = T[input.lang];
  const q = quoteCommission(book, input.tier, input.addOns, input.hours);
  const crew = normalizeCrew(input.tier, input.crew);
  const tier = TIERS.find((x) => x.id === input.tier)!;
  const base = q.baseHours;
  const extraHours = q.hours - base;
  // Same rule as the quote: an extra the package doesn't offer is never listed (or charged).
  const extras = ADD_ONS.filter((a) => input.addOns.includes(a.id) && addOnAllowed(input.tier, a.id));

  const includes = matrixFor(book).flatMap((g) =>
    g.rows
      .filter((r) => r.values[input.tier] && !/hours|horas|team|equipo|coordinat/i.test(r.label.en))
      .map((r) => `${r.label[input.lang]}: ${r.values[input.tier]![input.lang]}`),
  );

  const sections: AgreementSection[] = [
    {
      title: t.event,
      lines: [
        `${t.date}: ${longDate(input.eventDate, input.lang)}`,
        `${t.city}: ${input.cityLabel}`,
        `${t.venue}: ${input.venue || t.venueTbd}`,
        `${t.start}: ${input.startTime || t.startTbd}`,
      ],
    },
    {
      title: `${t.pkg}: ${tier.name[input.lang]}`,
      lines: [
        input.tier === "archive" ? t.hoursArchive(q.hours) : t.hours(q.hours, base),
        t.team(crew.photo, crew.motion),
        ...(COORDINATOR_INCLUDED[input.tier] ? [t.coordinator] : []),
      ],
    },
    { title: t.includes, lines: includes },
    {
      title: t.extras,
      lines: extras.length ? extras.map((a) => `${a.name[input.lang]} — ${usd(book.addOns[a.id])}`) : [t.noExtras],
    },
    {
      title: t.money,
      lines: [
        `${t.pkgPrice}: ${usd(q.tierUsd)}`,
        ...(extraHours > 0 ? [`${t.extraHours(extraHours)}: ${usd(q.extraHoursUsd)}`] : []),
        ...(extras.length ? [`${t.extras}: ${usd(q.addOnsUsd)}`] : []),
        `${t.total}: ${usd(q.totalUsd)}`,
        t.deposit(usd(q.retainerUsd), q.depositPercent),
        t.balance(usd(q.balanceUsd), book.balanceDueDays),
        t.tax,
      ],
    },
    { title: t.how, lines: [...t.howLines(book.holdDays)] },
    { title: t.crew, lines: [...t.crewLines] },
    { title: t.changes, lines: [...t.changesLines] },
    { title: t.media, lines: [...t.mediaLines(input.sharePermission)] },
  ];

  return {
    version: AGREEMENT_VERSION,
    lang: input.lang,
    title: t.title,
    intro: t.intro(input.name, input.honoree),
    sections,
    totalUsd: q.totalUsd,
    depositUsd: q.retainerUsd,
    balanceUsd: q.balanceUsd,
    depositPercent: q.depositPercent,
    balanceDueDays: book.balanceDueDays,
    holdDays: book.holdDays,
  };
}

/**
 * When the rest is due, in the words of the agreement the family SIGNED —
 * never the current book. Older agreements predate the days rule and said 48 hours.
 */
export function signedBalanceDue(a: Pick<Agreement, "balanceDueDays">, lang: Lang): string {
  if (typeof a.balanceDueDays === "number") {
    const d = a.balanceDueDays;
    return lang === "es" ? `${d} ${d === 1 ? "día" : "días"}` : `${d} ${d === 1 ? "day" : "days"}`;
  }
  return lang === "es" ? "48 horas" : "48 hours";
}

/** Deposit percent the family signed for (older agreements: 25%). */
export function signedDepositPercent(a: Pick<Agreement, "depositPercent">): number {
  return typeof a.depositPercent === "number" ? a.depositPercent : 25;
}

/** Plain-text rendering for emails and the stored snapshot. */
export function agreementToText(a: Pick<Agreement, "title" | "intro" | "sections">): string {
  return [
    a.title,
    "",
    a.intro,
    ...a.sections.flatMap((s) => ["", s.title.toUpperCase(), ...s.lines.map((l) => `• ${l}`)]),
  ].join("\n");
}

/** What gets saved on the booking (metadata.agreement) when a family signs. */
export type SignedAgreement = Agreement & {
  signedName: string;
  /** PNG data URL of the drawn signature. */
  signature: string;
  signedAt: string;
  ip: string;
  userAgent: string;
  sharePermission: boolean;
  /** Set when the studio approves; the token unlocks the family's pay page. */
  approvedAt?: string;
  payToken?: string;
};

export function isSignedAgreement(v: unknown): v is SignedAgreement {
  return Boolean(
    v &&
      typeof v === "object" &&
      typeof (v as SignedAgreement).signedName === "string" &&
      Array.isArray((v as SignedAgreement).sections),
  );
}

/** Constant-time check of the pay-link token from the approval email. */
export function tokenMatches(expected: string | undefined, given: string | undefined | null): boolean {
  if (!expected || !given || expected.length !== given.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}
