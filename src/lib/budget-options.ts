/**
 * budget-options.ts — what a family's budget covers (client + server, pure).
 *
 * The budget page asks for a number and whether video matters, then shows the
 * coverage that fits, built only from the live price book: each package at the
 * most hours the budget reaches. Nothing here is a benchmark or an estimate.
 */
import {
  addOnAllowed,
  hourSteps,
  quoteCommission,
  type AddOnId,
  type PriceBook,
  type TierId,
} from "@/lib/commission";

/** Event packages, smallest first (the Portrait Session is a separate pre-quince shoot). */
export const EVENT_TIERS = ["moments", "solo", "cinema", "trio"] as const satisfies readonly TierId[];
export type EventTier = (typeof EVENT_TIERS)[number];

export type CoverageOption = {
  tier: EventTier;
  hours: number;
  addOns: AddOnId[];
  totalUsd: number;
  /** Includes some video (a film or a videographer). */
  video: boolean;
};

/** The video that comes with (or is added to) a package, if any. */
function videoAddOns(tier: EventTier): AddOnId[] {
  return tier === "moments" ? ["momentsfilm"] : [];
}

/** Every configuration of a package: each hour from included to max, with and without its film. */
function configs(book: PriceBook, tier: EventTier): CoverageOption[] {
  const out: CoverageOption[] = [];
  for (const h of hourSteps(book, tier)) {
    const variants: AddOnId[][] = tier === "moments" ? [[], videoAddOns(tier)] : [[]];
    for (const addOns of variants) {
      if (!addOns.every((a) => addOnAllowed(tier, a))) continue;
      out.push({
        tier,
        hours: h,
        addOns,
        totalUsd: quoteCommission(book, tier, addOns, h).totalUsd,
        video: tier !== "moments" || addOns.includes("momentsfilm"),
      });
    }
  }
  return out;
}

export type BudgetResult = {
  /** Up to one option per package, the most coverage within budget, closest to the budget first. */
  fits: CoverageOption[];
  /** The next step up that doesn't fit yet (the smallest one over budget), if any. */
  stretch: CoverageOption | null;
};

/**
 * What a budget covers. `wantVideo` keeps only options with video; without it,
 * a photos-only option is preferred when the package offers one.
 */
export function coverageForBudget(book: PriceBook, budgetUsd: number, wantVideo: boolean): BudgetResult {
  const all = EVENT_TIERS.flatMap((t) => configs(book, t)).filter((o) => !wantVideo || o.video);
  const fits: CoverageOption[] = [];
  for (const tier of EVENT_TIERS) {
    const mine = all.filter((o) => o.tier === tier && o.totalUsd <= budgetUsd);
    if (!mine.length) continue;
    // Most hours first; then (photos-only shoppers) without the film, else with it.
    mine.sort((a, b) => b.hours - a.hours || (wantVideo ? 0 : Number(a.video) - Number(b.video)) || b.totalUsd - a.totalUsd);
    fits.push(mine[0]);
  }
  // Closest to the budget first. At the same price the bigger package leads: its
  // starting price is the number she tapped, so that is the one she expects to see.
  fits.sort((a, b) => b.totalUsd - a.totalUsd || EVENT_TIERS.indexOf(b.tier) - EVENT_TIERS.indexOf(a.tier));
  // The step up: the next package's starting coverage (what a little more buys),
  // else the smallest option over budget.
  const over = all.filter((o) => o.totalUsd > budgetUsd).sort((a, b) => a.totalUsd - b.totalUsd);
  const topFit = fits[0] ? EVENT_TIERS.indexOf(fits[0].tier) : -1;
  const nextTier = EVENT_TIERS.slice(topFit + 1).find((t) => over.some((o) => o.tier === t));
  const stretch = (nextTier && over.find((o) => o.tier === nextTier && o.hours === book.packages[nextTier].hours)) || over[0] || null;
  return { fits: fits.slice(0, 3), stretch };
}

/** The smallest event coverage there is (for "our shortest coverage is …"). */
export function smallestCoverage(book: PriceBook, wantVideo: boolean): CoverageOption | null {
  const all = EVENT_TIERS.flatMap((t) => configs(book, t)).filter((o) => !wantVideo || o.video);
  return all.sort((a, b) => a.totalUsd - b.totalUsd)[0] ?? null;
}
