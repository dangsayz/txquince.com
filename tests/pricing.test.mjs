// Run: node --conditions=react-server --import ./tests/helpers/register-ts-resolve.mjs --test tests/pricing.test.mjs
// (react-server lets "server-only" load outside Next, so the real writer is tested.)
import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_PRICE_BOOK,
  describeChanges,
  normalizeHours,
  priceBookSchema,
  quoteCommission,
  quoteWithDefaults,
} from "../src/lib/commission.ts";
import { PT, fillDeep, fillPrices, hasPriceToken } from "../src/lib/price-text.ts";

const clone = (b) => structuredClone({ ...b });

test("defaults reproduce the launch quote", () => {
  // The Trio (7 hrs included) + an 8th hour + Same-Day Edit.
  const q = quoteWithDefaults("trio", ["sameday"], 8);
  assert.equal(q.totalUsd, 2800 + 450 + 600);
  assert.equal(q.retainerUsd, Math.round(3850 * 0.25));
  assert.equal(q.balanceUsd, 3850 - Math.round(3850 * 0.25));
  assert.equal(DEFAULT_PRICE_BOOK.balanceDueDays, 14);
});

test("a changed book changes every number", () => {
  const b = clone(DEFAULT_PRICE_BOOK);
  b.packages.trio.price = 5555;
  b.packages.trio.extraHour = 111;
  b.addOns.sameday = 333;
  b.depositPercent = 30;
  const q = quoteCommission(b, "trio", ["sameday", "sameday"], 8);
  assert.equal(q.totalUsd, 5555 + 111 + 333);
  assert.equal(q.retainerUsd, Math.round(5999 * 0.3));
  assert.equal(q.depositPercent, 30);
});

test("hours are clamped to the package; $0 extra hour means none can be added", () => {
  const b = clone(DEFAULT_PRICE_BOOK);
  assert.equal(normalizeHours(b, "cinema", 99), 8);
  assert.equal(normalizeHours(b, "cinema", 1), 6);
  b.packages.cinema.extraHour = 0;
  assert.equal(normalizeHours(b, "cinema", 8), 6);
});

test("schema refuses nonsense", () => {
  const ok = priceBookSchema.safeParse(clone(DEFAULT_PRICE_BOOK));
  assert.ok(ok.success);
  for (const mutate of [
    (b) => (b.packages.study.price = 10),
    (b) => (b.packages.study.price = 1200.5),
    (b) => (b.depositPercent = 3),
    (b) => (b.balanceDueDays = 0),
    (b) => (b.packages.archive.hours = 9), // more than maxHours (8)
    (b) => (b.addOns.extra = 5), // unknown key
  ]) {
    const b = clone(DEFAULT_PRICE_BOOK);
    mutate(b);
    assert.equal(priceBookSchema.safeParse(b).success, false);
  }
});

test("tokens fill from the book, deeply, leaving functions alone", () => {
  const b = clone(DEFAULT_PRICE_BOOK);
  b.packages.production.price = 5555;
  b.balanceDueDays = 21;
  const text = `Full ${PT.price.production}, ${PT.deposit.percent} down, rest ${PT.balanceDays} days before, deposit ${PT.deposit.production}`;
  assert.equal(fillPrices(text, b), "Full $5,555, 25% down, rest 21 days before, deposit $1,389");
  const fn = () => 1;
  const out = fillDeep({ a: [text], f: fn, n: 3, u: new URL("https://x.test") }, b);
  assert.equal(out.f, fn);
  assert.equal(out.n, 3);
  assert.ok(out.u instanceof URL);
  assert.equal(hasPriceToken(out.a[0]), false);
});

test("describeChanges lists only what moved", () => {
  const b = clone(DEFAULT_PRICE_BOOK);
  b.packages.cinema.price = 3600;
  b.holdDays = 10;
  assert.deepEqual(describeChanges(DEFAULT_PRICE_BOOK, b), [
    "The Duo price: $2,000 → $3,600",
    "Date hold while reviewing: 7 → 10 days",
  ]);
});

test("savePriceBook (called directly): validates, refuses stale versions, records history", async () => {
  const dir = await mkdtemp(join(tmpdir(), "txq-pricing-"));
  process.env.PRICING_LOCAL_DIR = dir;
  const { savePriceBook, readPriceBook, listPriceHistory, PricingError } = await import("../src/lib/pricing.ts");

  const start = await readPriceBook();
  assert.equal(start.version, "none");
  assert.equal(start.storage, "local");

  // Invalid numbers never reach storage.
  const bad = clone(DEFAULT_PRICE_BOOK);
  bad.depositPercent = 500;
  await assert.rejects(savePriceBook(bad, "none", "owner@test"), (e) => e instanceof PricingError && e.code === "invalid");

  const next = clone(DEFAULT_PRICE_BOOK);
  next.packages.trio.price = 5200;
  const saved = await savePriceBook(next, "none", "owner@test");
  assert.equal(saved.book.packages.trio.price, 5200);
  assert.equal(saved.book.updatedBy, "owner@test");
  assert.deepEqual(saved.changes, ["The Trio price: $2,800 → $5,200"]);

  // A form loaded before that save (baseVersion "none") is refused — nothing written.
  const stale = clone(DEFAULT_PRICE_BOOK);
  stale.packages.trio.price = 9999;
  await assert.rejects(savePriceBook(stale, "none", "other@test"), (e) => e instanceof PricingError && e.code === "conflict");
  const after = await readPriceBook();
  assert.equal(after.book.packages.trio.price, 5200);

  const history = await listPriceHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].by, "owner@test");
  const files = await readdir(join(dir, "config", "pricing-history"));
  assert.equal(files.filter((f) => f.endsWith(".json")).length, 1);
  const live = JSON.parse(await readFile(join(dir, "config", "pricing.json"), "utf8"));
  assert.equal(live.packages.trio.price, 5200);
});
