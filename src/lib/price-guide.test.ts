import { describe, expect, it } from "vitest";
import { parsePriceGuideSheet, parseUsd, priceGuideFaq } from "./price-guide";

const TODAY = "2026-10-31";

describe("parsePriceGuideSheet", () => {
  it("reads rows copied from Google Sheets with a header", () => {
    const text = "Category\tCategoría\tLow\tTypical\tHigh\tSamples\tUpdated\nPhotography\tFotografía\t$900\t$1,800\t$3,500\t42\t10/30/2026\nVenue\tSalón\t2000\t4500\t9000\t31\t";
    const { rows, errors } = parsePriceGuideSheet(text, TODAY);
    expect(errors).toEqual([]);
    expect(rows).toEqual([
      { category: "Photography", category_es: "Fotografía", low_usd: 900, typical_usd: 1800, high_usd: 3500, sample_count: 42, last_updated: "2026-10-30", sort_order: 0 },
      { category: "Venue", category_es: "Salón", low_usd: 2000, typical_usd: 4500, high_usd: 9000, sample_count: 31, last_updated: TODAY, sort_order: 1 },
    ]);
  });

  it("matches columns by header name in any order", () => {
    const text = "typical,low,high,category,muestras\n1800,900,3500,Photography,12";
    const { rows } = parsePriceGuideSheet(text, TODAY);
    expect(rows[0]).toMatchObject({ category: "Photography", low_usd: 900, typical_usd: 1800, high_usd: 3500, sample_count: 12, category_es: null });
  });

  it("reads headerless CSV with quoted commas", () => {
    const { rows, errors } = parsePriceGuideSheet('"Hair, makeup",Peinado y maquillaje,150,300,600,9', TODAY);
    expect(errors).toEqual([]);
    expect(rows[0].category).toBe("Hair, makeup");
  });

  it("reports bad rows instead of guessing", () => {
    const { rows, errors } = parsePriceGuideSheet("Cake\t\t500\t300\t900\t4\n\t\t1\t2\t3\nDJ\t\tabc\t2\t3", TODAY);
    expect(rows).toEqual([]);
    expect(errors).toHaveLength(3);
    expect(errors[0]).toMatch(/low ≤ typical ≤ high/);
  });

  it("parses money", () => {
    expect(parseUsd("$1,250")).toBe(1250);
    expect(parseUsd("1.2k")).toBe(1200);
    expect(parseUsd("n/a")).toBeNaN();
  });
});

describe("priceGuideFaq", () => {
  const rows = [
    { category: "Photography", category_es: "Fotografía", low_usd: 900, typical_usd: 1800, high_usd: 3500, sample_count: 42, last_updated: "2026-10-30" },
    { category: "DJ", category_es: null, low_usd: 400, typical_usd: 800, high_usd: 1500, sample_count: 3, last_updated: "2026-10-01" },
  ];
  it("writes answers from the numbers, most-quoted first, in both languages", () => {
    const en = priceGuideFaq(rows, "en", "October 30, 2026");
    expect(en[0].q).toContain("photography");
    expect(en[0].a).toContain("$1,800");
    expect(en[0].a).toContain("42 real quotes");
    expect(en.at(-1)?.a).toContain("45 in all");
    const es = priceGuideFaq(rows, "es", "30 de octubre de 2026");
    expect(es[0].q).toContain("fotografía");
    expect(es[1].q).toContain("dj"); // falls back to the English category
  });
  it("is empty without rows", () => {
    expect(priceGuideFaq([], "en", "")).toEqual([]);
  });
});
