/**
 * budget-lines.ts — the numbers behind the interactive budget chart.
 *
 * Every percent here is the one written in the budget post
 * (posts/quinceanera-budget-breakdown-texas.ts and its Spanish twin). The
 * chart only multiplies them by the total the reader picks. Change a percent
 * in the post and here together (budget-lines.test.ts checks they agree).
 * No server imports: used by the client chart and by tests.
 */
export type BudgetLine = {
  id: string;
  en: string;
  es: string;
  /** Share of the total, whole percent. A fixed share has low === high. */
  low: number;
  high: number;
};

export const BUDGET_LINES: readonly BudgetLine[] = [
  { id: "food", en: "Catering / food", es: "Comida / banquete", low: 30, high: 30 },
  { id: "venue", en: "Venue", es: "Salón", low: 15, high: 20 },
  { id: "photo", en: "Photography + video", es: "Fotografía y video", low: 8, high: 15 },
  { id: "dj", en: "DJ / entertainment", es: "DJ / entretenimiento", low: 12, high: 12 },
  { id: "dress", en: "Dress, court attire & accessories", es: "Vestido, corte y accesorios", low: 8, high: 12 },
  { id: "decor", en: "Decor & flowers", es: "Decoración y flores", low: 8, high: 12 },
  { id: "contingency", en: "Contingency", es: "Fondo para imprevistos", low: 10, high: 10 },
  { id: "cake", en: "Cake & dessert", es: "Pastel y postres", low: 3, high: 5 },
  { id: "invites", en: "Invitations & stationery", es: "Invitaciones y papelería", low: 2, high: 4 },
];

/** The post's ranges: most DFW parties $12,000–$25,000, luxury to $50,000. */
export const BUDGET_MIN = 12_000;
export const BUDGET_TYPICAL_MAX = 25_000;
export const BUDGET_MAX = 50_000;
export const BUDGET_STEP = 1_000;
export const BUDGET_START = 18_000;

/** Right edge of every bar's track, in dollars: the largest line at the largest total. */
export const AXIS_MAX_USD = (Math.max(...BUDGET_LINES.map((l) => l.high)) / 100) * BUDGET_MAX;

export type BudgetRow = BudgetLine & { lowUsd: number; highUsd: number };

export function clampTotal(total: number): number {
  if (!Number.isFinite(total)) return BUDGET_START;
  const stepped = Math.round(total / BUDGET_STEP) * BUDGET_STEP;
  return Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, stepped));
}

export function budgetRows(total: number): BudgetRow[] {
  const t = clampTotal(total);
  return BUDGET_LINES.map((l) => ({
    ...l,
    lowUsd: Math.round((t * l.low) / 100),
    highUsd: Math.round((t * l.high) / 100),
  }));
}

export type PackageFit = "below" | "in" | "above";

/** Where a package price sits against the photo + video share of this total. */
export function packageFit(priceUsd: number, total: number): PackageFit {
  const photo = budgetRows(total).find((r) => r.id === "photo")!;
  if (priceUsd < photo.lowUsd) return "below";
  if (priceUsd > photo.highUsd) return "above";
  return "in";
}

/** "$2,800" → 2800. Returns null for text with no dollar amount. */
export function parseUsd(text: string): number | null {
  const m = /\$\s?([\d,]+)/.exec(text);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export const fmtUsd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
