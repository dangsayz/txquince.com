/**
 * commissions.ts — the four packages, shaped for the SEO landing
 * pages (city, videographer, guide, venue, save-the-date). Prices come from the
 * LIVE price book (commissionsFor(await getPriceBook())); names and
 * deliverables from the homepage matrix, so every page shows the same offer as
 * the homepage and checkout. The prose exports below carry price tokens
 * (src/lib/price-text.ts) — fill them with fillPrices/fillDeep when rendering.
 *
 * Replaces the retired Moments / Essential / Signature / Legacy collections for
 * anything public-facing. (content/packages.ts remains only so historic
 * bookings, analytics and admin tools can still label old rows.)
 */
import { matrixFor, TIERS, type L, type Lang } from "@/components/txq/data";
import { depositFor, usd, type PriceBook, type TierId } from "@/lib/commission";
import { PT } from "@/lib/price-text";

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
  /** Recommended package (the Trio, "our pick") — gets the visual emphasis. */
  recommended: boolean;
};

// English matrix row labels (src/components/txq/data.ts) to surface as highlights.
const HIGHLIGHT_ROWS = [
  "Hours",
  "Your team",
  "Full-length film",
  "Edited photos",
  "Printed photo album",
];

function highlightsFor(book: PriceBook, id: TierId, lang: Lang): string[] {
  const out: string[] = [];
  for (const group of matrixFor(book)) {
    for (const row of group.rows) {
      if (!HIGHLIGHT_ROWS.includes(row.label.en)) continue;
      const v = row.values[id];
      if (v) out.push(`${row.label[lang]}: ${v[lang]}`);
    }
  }
  return out.slice(0, 4);
}

/** The four packages priced from a price book (server: `commissionsFor(await getPriceBook())`). */
export function commissionsFor(book: PriceBook): Commission[] {
  return TIERS.map((t) => {
    const price = book.packages[t.id].price;
    return {
      id: t.id,
      numeral: t.numeral,
      name: t.name,
      summary: t.summary,
      price,
      priceLabel: usd(price),
      retainerLabel: usd(depositFor(book, price)),
      highlights: { en: highlightsFor(book, t.id, "en"), es: highlightsFor(book, t.id, "es") },
      recommended: t.recommended === true,
    };
  });
}

/** Price tokens for prose (fill with fillPrices / fillDeep at render time). */
export const commissionsFromLabel = PT.price.floor;
export const retainerPercentLabel = PT.deposit.percent;
/** The rest of the total is due this many days before the event. */
export const balanceDueDays = PT.balanceDays;
/** Days we hold the date while we review a signed agreement. */
export const reviewHoldDays = PT.holdDays;

/**
 * How booking works, in plain words — one paragraph per language, reused on
 * every page that explains booking or the deposit.
 */
export const bookingFlow = {
  en: `Pick a package, fill in your details, then review and sign the agreement online. We review and approve it within one day, and we hold your date for ${reviewHoldDays} days while we do. Once it's approved, you pay the ${retainerPercentLabel} deposit to lock in your date. No payment is taken before then. The rest is due ${balanceDueDays} days before the event.`,
  es: `Elige un paquete, llena tus datos, y revisa y firma el contrato en línea. Lo revisamos y aprobamos en un día, y mientras tanto te apartamos la fecha ${reviewHoldDays} días. Ya aprobado, pagas el depósito del ${retainerPercentLabel} para asegurar tu fecha. No se cobra nada antes. El resto se paga ${balanceDueDays} días antes del evento.`,
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
      body: `We review and approve it within one day. Then you pay the ${retainerPercentLabel} deposit to lock in your date. The rest is due ${balanceDueDays} days before the event.`,
    },
    {
      title: "Your day, captured",
      body: "From la misa to the last dance, we capture the whole day. The Duo and the Trio include a dress or save-the-date session, booked after your deposit, so we already know each other on the big day.",
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
      body: `Lo revisamos y aprobamos en un día. Luego pagas el depósito del ${retainerPercentLabel} para asegurar tu fecha. El resto se paga ${balanceDueDays} días antes del evento.`,
    },
    {
      title: "Tu día, para siempre",
      body: "De la misa al último baile, capturamos todo el día. El Dúo y el Trío incluyen una sesión con el vestido o de save the date, que se agenda después de tu depósito, así que ya nos conocemos cuando llega el gran día.",
    },
  ],
};
