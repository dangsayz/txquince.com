/**
 * Price parity: the English and Spanish sites must never disagree on a price.
 *
 * /budget and /es/presupuesto render the same planner from the same live
 * price book, so the only ways they (or the city pages) can drift apart are a
 * price typed into copy instead of a token, or a Spanish answer quoting a
 * different package than its English twin. Both are caught here, before a
 * deploy. scripts/check-budget-parity.mjs checks the deployed pages.
 */
import { describe, expect, it } from "vitest";
import { getCityContent } from "@/content/city-content";
import { locations } from "@/content/locations";
import { INSPO_PLACES } from "@/content/inspo-places";
import { BUDGET_COPY } from "@/components/budget/budget-copy";

/** Prices typed as numbers ("$1,200"), not tokens. */
const TYPED_PRICE = /\$\s?\d/;
/** The one allowed typed range: what OTHER DFW studios charge (Frisco copy). */
const ALLOWED = [/\$1,500 (and|y) \$6,000/];
const PRICE_TOKENS = /\{\{(price|addon|extra|deposit|plan)\.[a-z]+\}\}/g;

function typedPrices(s: string): string[] {
  let t = s;
  for (const a of ALLOWED) t = t.replace(new RegExp(a.source, "g"), "");
  return TYPED_PRICE.test(t) ? [t.match(/.{0,40}\$\s?\d[\d,]*.{0,20}/)?.[0] ?? t.slice(0, 60)] : [];
}
const tokens = (s: string) => [...new Set(s.match(PRICE_TOKENS) ?? [])].sort();

describe("price parity, English vs Spanish", () => {
  it("city pages never type a price; they use tokens from the live book", () => {
    for (const l of locations) {
      const c = getCityContent(l.slug);
      if (!c) continue;
      expect(typedPrices(JSON.stringify(c)), l.slug).toEqual([]);
    }
  });

  it("each city's Spanish copy quotes the same prices as its English copy", () => {
    for (const l of locations) {
      const c = getCityContent(l.slug);
      if (!c) continue;
      const en = tokens(JSON.stringify(c.faqs) + c.intro.join(" "));
      const es = tokens(JSON.stringify(c.faqsEs) + c.introEs.join(" "));
      expect(es, l.slug).toEqual(en);
    }
  });

  it("photo-spot pages never type a price, and EN/ES quote the same ones", () => {
    for (const p of INSPO_PLACES) {
      expect(typedPrices(JSON.stringify(p.copy)), p.slug).toEqual([]);
      expect(tokens(JSON.stringify(p.copy.es)), p.slug).toEqual(tokens(JSON.stringify(p.copy.en)));
    }
  });

  it("the budget page copy has no typed prices in either language", () => {
    const flat = (o: unknown) =>
      JSON.stringify(o, (_k, v) => (typeof v === "function" ? String(v((1500 as never), (2 as never))) : v));
    expect(typedPrices(flat(BUDGET_COPY.en))).toEqual([]);
    expect(typedPrices(flat(BUDGET_COPY.es))).toEqual([]);
  });
});
