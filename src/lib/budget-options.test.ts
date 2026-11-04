import { describe, expect, it } from "vitest";
import { DEFAULT_PRICE_BOOK as B } from "@/lib/commission";
import { coverageForBudget, smallestCoverage } from "@/lib/budget-options";

describe("what a budget covers", () => {
  it("offers Just the Moments at the hours a small budget reaches, photos only first", () => {
    const r = coverageForBudget(B, 800, false);
    expect(r.fits[0]).toMatchObject({ tier: "moments", hours: 3, addOns: [], totalUsd: 750 });
    // The step up is the next package's starting coverage: the Solo, 5 hours.
    expect(r.stretch).toMatchObject({ tier: "solo", hours: 5, totalUsd: 1200 });
  });

  it("keeps only options with video when video matters", () => {
    const r = coverageForBudget(B, 800, true);
    expect(r.fits).toEqual([{ tier: "moments", hours: 2, addOns: ["momentsfilm"], totalUsd: 750, video: true }]);
  });

  it("caps Just the Moments at 4 hours and the Solo at 6", () => {
    const r = coverageForBudget(B, 1600, false);
    const byTier = Object.fromEntries(r.fits.map((o) => [o.tier, o]));
    expect(byTier.moments.hours).toBe(4);
    expect(byTier.solo).toMatchObject({ hours: 6, totalUsd: 1400 });
    expect(byTier.cinema).toBeUndefined();
  });

  it("says when nothing fits and what the smallest coverage is", () => {
    const r = coverageForBudget(B, 300, false);
    expect(r.fits).toEqual([]);
    expect(smallestCoverage(B, false)).toMatchObject({ tier: "moments", hours: 2, totalUsd: 500 });
    expect(smallestCoverage(B, true)?.totalUsd).toBe(750);
  });

  it("reads every number from the price book it's given", () => {
    const book = { ...B, packages: { ...B.packages, moments: { price: 600, hours: 2, extraHour: 300 } } };
    expect(coverageForBudget(book, 600, false).fits[0]).toMatchObject({ tier: "moments", totalUsd: 600 });
  });
});
