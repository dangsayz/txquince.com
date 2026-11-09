import { describe, expect, it } from "vitest";
import en from "./blog/posts/quinceanera-budget-breakdown-texas";
import es from "./blog/posts/es/cuanto-cuesta-una-quinceanera-presupuesto-texas";
import {
  AXIS_MAX_USD,
  BUDGET_LINES,
  BUDGET_MAX,
  BUDGET_MIN,
  BUDGET_TYPICAL_MAX,
  budgetRows,
  clampTotal,
  packageFit,
  parseUsd,
} from "./budget-lines";

/** The percents each post writes for its cost lines, in list order. */
function percentsIn(post: typeof en): [number, number][] {
  const list = post.content.find((b) => b.type === "ul");
  if (!list || list.type !== "ul") throw new Error("cost list not found");
  return list.items.map((item) => {
    const head = item.slice(0, item.indexOf("."));
    const range = /(\d+)\s*(?:–|a)\s*(\d+)\s*%/.exec(head);
    if (range) return [Number(range[1]), Number(range[2])];
    const nums = [...head.matchAll(/(\d+)\s*%/g)].map((m) => Number(m[1]));
    if (!nums.length) throw new Error(`no percent in: ${head}`);
    return [nums[nums.length - 1], nums[nums.length - 1]];
  });
}

const sorted = (xs: [number, number][]) => xs.map((x) => x.join("-")).sort();

describe("budget chart numbers", () => {
  it("uses exactly the percents written in the English post", () => {
    expect(sorted(BUDGET_LINES.map((l) => [l.low, l.high]))).toEqual(sorted(percentsIn(en)));
  });

  it("uses exactly the percents written in the Spanish post", () => {
    expect(sorted(BUDGET_LINES.map((l) => [l.low, l.high]))).toEqual(sorted(percentsIn(es)));
  });

  it("uses the dollar range the post states", () => {
    const text = en.content.map((b) => ("text" in b ? b.text : "")).join(" ");
    expect(text).toContain("$12,000 and $25,000");
    expect(text).toContain("$25,000–$50,000");
    expect([BUDGET_MIN, BUDGET_TYPICAL_MAX, BUDGET_MAX]).toEqual([12_000, 25_000, 50_000]);
  });

  it("multiplies each share by the total", () => {
    const rows = budgetRows(20_000);
    expect(rows.find((r) => r.id === "food")).toMatchObject({ lowUsd: 6_000, highUsd: 6_000 });
    expect(rows.find((r) => r.id === "venue")).toMatchObject({ lowUsd: 3_000, highUsd: 4_000 });
    expect(rows.find((r) => r.id === "photo")).toMatchObject({ lowUsd: 1_600, highUsd: 3_000 });
  });

  it("keeps the total inside the slider and every bar inside its track", () => {
    expect(clampTotal(1)).toBe(BUDGET_MIN);
    expect(clampTotal(9e9)).toBe(BUDGET_MAX);
    expect(clampTotal(Number.NaN)).toBe(18_000);
    expect(clampTotal(18_400)).toBe(18_000);
    for (const r of budgetRows(BUDGET_MAX)) expect(r.highUsd).toBeLessThanOrEqual(AXIS_MAX_USD);
  });

  it("places a package price against the photo + video share", () => {
    expect(packageFit(1_000, 20_000)).toBe("below");
    expect(packageFit(1_600, 20_000)).toBe("in");
    expect(packageFit(3_000, 20_000)).toBe("in");
    expect(packageFit(3_001, 20_000)).toBe("above");
  });

  it("reads a dollar amount out of filled price text", () => {
    expect(parseUsd("$2,800")).toBe(2_800);
    expect(parseUsd("$400")).toBe(400);
    expect(parseUsd("{{price.trio}}")).toBeNull();
  });

  it("both posts carry the chart and the same poll", () => {
    for (const post of [en, es]) {
      expect(post.content.filter((b) => b.type === "budget-chart")).toHaveLength(1);
      expect(post.content.find((b) => b.type === "poll")).toEqual({ type: "poll", id: "guest-count" });
    }
  });
});
