/**
 * commissions.ts — the luxury commission tiers, shaped for the SEO landing
 * pages (city, videographer, guide, venue, save-the-date). Prices come from the
 * price book (src/lib/commission.ts); names and deliverables from the homepage
 * matrix, so every page shows the same offer as the homepage and checkout.
 *
 * Replaces the retired Moments / Essential / Signature / Legacy collections for
 * anything public-facing. (content/packages.ts remains only so historic
 * bookings, analytics and admin tools can still label old rows.)
 */
import { MATRIX, TIERS, type L, type Lang } from "@/components/txq/data";
import { PRICE_FLOOR_USD, RETAINER, quoteCommission, usd, type TierId } from "@/lib/commission";

export type Commission = {
  id: TierId;
  numeral: string;
  name: L;
  summary: L;
  price: number;
  priceLabel: string;
  retainerLabel: string;
  /** Short deliverable lines, e.g. "8 hrs coverage" — first four non-empty matrix values. */
  highlights: { en: string[]; es: string[] };
  /** Recommended commission — gets the visual emphasis. */
  recommended: boolean;
};

const HIGHLIGHT_ROWS = [
  "Hours of coverage",
  "Second director",
  "4K feature cut",
  "Retouched selects",
  "Linen heirloom monograph",
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

/** Where to compare and where to book, per language. */
export const commissionLinks = {
  en: { compare: "/#commissions", book: "/#intake" },
  es: { compare: "/es#commissions", book: "/es#intake" },
} as const;
