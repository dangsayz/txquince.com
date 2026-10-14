/**
 * commissions.ts — the four packages, shaped for the SEO landing
 * pages (city, videographer, guide, venue, save-the-date). Prices come from the
 * price book (src/lib/commission.ts); names and deliverables from the homepage
 * matrix, so every page shows the same offer as the homepage and checkout.
 *
 * Replaces the retired Moments / Essential / Signature / Legacy collections for
 * anything public-facing. (content/packages.ts remains only so historic
 * bookings, analytics and admin tools can still label old rows.)
 */
import { MATRIX, TIERS, type L, type Lang } from "@/components/txq/data";
import {
  CONSULT_HOLD_DAYS,
  PRICE_FLOOR_USD,
  RETAINER,
  quoteCommission,
  usd,
  type TierId,
} from "@/lib/commission";

export type Commission = {
  id: TierId;
  numeral: string;
  name: L;
  summary: L;
  price: number;
  priceLabel: string;
  retainerLabel: string;
  /** Short deliverable lines, e.g. "Hours: 6 hours (add up to 8)" — first four non-empty matrix values. */
  highlights: { en: string[]; es: string[] };
  /** Recommended package — gets the visual emphasis. */
  recommended: boolean;
};

// English matrix row labels (src/components/txq/data.ts) to surface as highlights.
const HIGHLIGHT_ROWS = [
  "Hours",
  "Your team",
  "Full-length video",
  "Edited photos",
  "Printed photo album",
];

function highlightsFor(id: TierId, lang: Lang): string[] {
  const out: string[] = [];
  for (const group of MATRIX) {
    for (const row of group.rows) {
      if (!HIGHLIGHT_ROWS.includes(row.label.en)) continue;
      const v = row.values[id];
      if (v) out.push(`${row.label[lang]}: ${v[lang]}`);
    }
  }
  return out.slice(0, 4);
}

export const commissions: Commission[] = TIERS.map((t) => ({
  id: t.id,
  numeral: t.numeral,
  name: t.name,
  summary: t.summary,
  price: t.price,
  priceLabel: usd(t.price),
  retainerLabel: usd(quoteCommission(t.id, []).retainerUsd),
  highlights: { en: highlightsFor(t.id, "en"), es: highlightsFor(t.id, "es") },
  recommended: t.id === "production",
}));

export const commissionsFromLabel = usd(PRICE_FLOOR_USD);
export const retainerPercentLabel = `${Math.round(RETAINER.rate * 100)}%`;
/** The rest of the total is due this many hours before the event. */
export const balanceDueHours = RETAINER.balanceDueHours;
/** Days we hold the date while we review a signed agreement. */
export const reviewHoldDays = CONSULT_HOLD_DAYS;

/**
 * How booking works, in plain words — one paragraph per language, reused on
 * every page that explains booking or the deposit.
 */
export const bookingFlow = {
  en: `Pick a package, fill in your details, then review and sign the agreement online. We review and approve it within one day, and we hold your date for ${reviewHoldDays} days while we do. Once it's approved, you pay the ${retainerPercentLabel} deposit to lock in your date. No payment is taken before then. The rest is due ${balanceDueHours} hours before the event.`,
  es: `Elige un paquete, llena tus datos, y revisa y firma el contrato en línea. Lo revisamos y aprobamos en un día, y mientras tanto te apartamos la fecha ${reviewHoldDays} días. Ya aprobado, pagas el depósito del ${retainerPercentLabel} para asegurar tu fecha. No se cobra nada antes. El resto se paga ${balanceDueHours} horas antes del evento.`,
} as const;

/** Where to compare and where to book, per language. */
export const commissionLinks = {
  en: { compare: "/#commissions", book: "/#intake" },
  es: { compare: "/es#commissions", book: "/es#intake" },
} as const;

export type BookingStep = { title: string; body: string };

/** The four booking steps, in plain words, per language. */
export const bookingSteps: Record<Lang, BookingStep[]> = {
  en: [
    {
      title: "Pick your package",
      body: "Choose your date on the live calendar and the package you like. Have questions first? We're happy to hop on a quick call.",
    },
    {
      title: "Sign the agreement",
      body: `Fill in your details, then review and sign the agreement online. We hold your date for ${reviewHoldDays} days while we look it over. No payment yet.`,
    },
    {
      title: "Lock in your date",
      body: `We review and approve it within one day. Then you pay the ${retainerPercentLabel} deposit to lock in your date. The rest is due ${balanceDueHours} hours before the event.`,
    },
    {
      title: "Your day, captured",
      body: "From la misa to the last dance, we capture the whole day. The Full Celebration and the Two-Day Celebration include a portrait session first, so we already know each other on the big day.",
    },
  ],
  es: [
    {
      title: "Elige tu paquete",
      body: "Escoge tu fecha en el calendario y el paquete que te guste. ¿Tienes preguntas primero? Con gusto platicamos en una llamada rápida.",
    },
    {
      title: "Firma el contrato",
      body: `Llena tus datos, y revisa y firma el contrato en línea. Te apartamos la fecha ${reviewHoldDays} días mientras lo revisamos. Todavía no pagas nada.`,
    },
    {
      title: "Asegura tu fecha",
      body: `Lo revisamos y aprobamos en un día. Luego pagas el depósito del ${retainerPercentLabel} para asegurar tu fecha. El resto se paga ${balanceDueHours} horas antes del evento.`,
    },
    {
      title: "Tu día, para siempre",
      body: "De la misa al último baile, capturamos todo el día. La Celebración completa y la Celebración de dos días incluyen antes una sesión de retratos, así que ya nos conocemos cuando llega el gran día.",
    },
  ],
};
