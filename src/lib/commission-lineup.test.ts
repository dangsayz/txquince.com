import { describe, expect, it, vi } from "vitest";

// pricing.ts is server-only; the parser under test is pure.
vi.mock("server-only", () => ({}));
import {
  BASE_CREW,
  COORDINATOR_INCLUDED,
  DEFAULT_PRICE_BOOK,
  PUBLIC_TIER_IDS,
  isBookableTier,
  normalizeCrew,
  priceBookSchema,
  priceCeiling,
  priceFloor,
  quoteCommission,
} from "@/lib/commission";
import { parseStoredBook } from "@/lib/pricing";

describe("the Oct 2026 lineup", () => {
  it("offers four packages, each event package one hour longer than the last", () => {
    expect(PUBLIC_TIER_IDS).toEqual(["study", "cinema", "trio", "production"]);
    const h = DEFAULT_PRICE_BOOK.packages;
    expect([h.cinema.hours, h.trio.hours, h.production.hours]).toEqual([5, 6, 7]);
    expect(isBookableTier("archive")).toBe(false);
  });

  it("gives the Trio two photographers and one videographer, without a coordinator", () => {
    expect(BASE_CREW.trio).toBe(3);
    expect(normalizeCrew("trio")).toEqual({ photo: 2, motion: 1 });
    expect(COORDINATOR_INCLUDED.trio).toBe(false);
  });

  it("keeps the retired package out of the published price range", () => {
    const book = { ...DEFAULT_PRICE_BOOK, packages: { ...DEFAULT_PRICE_BOOK.packages, archive: { price: 99_000, hours: 7, extraHour: 0 } } };
    expect(priceCeiling(book)).toBe(DEFAULT_PRICE_BOOK.packages.production.price);
    expect(priceFloor(book)).toBe(DEFAULT_PRICE_BOOK.packages.study.price);
  });

  it("prices the 8th hour and the Second Portrait Day on the server's book", () => {
    const q = quoteCommission(DEFAULT_PRICE_BOOK, "production", ["secondday"], 8);
    const p = DEFAULT_PRICE_BOOK.packages.production;
    expect(q.totalUsd).toBe(p.price + p.extraHour + DEFAULT_PRICE_BOOK.addOns.secondday);
  });

  it("reads a book saved before the Trio existed, filling the new fields from defaults", () => {
    const old = {
      packages: { study: { price: 400, hours: 1, extraHour: 150 }, cinema: { price: 1500, hours: 5, extraHour: 300 }, production: { price: 2000, hours: 6, extraHour: 400 }, archive: { price: 2500, hours: 7, extraHour: 0 } },
      addOns: { destination: 400, sameday: 300, super8: 600, parents: 550 },
      maxHours: 8,
      depositPercent: 25,
      balanceDueDays: 14,
      holdDays: 7,
    };
    const book = parseStoredBook(old);
    expect(book).not.toBeNull();
    expect(book!.packages.trio).toEqual(DEFAULT_PRICE_BOOK.packages.trio);
    expect(book!.addOns.secondday).toBe(DEFAULT_PRICE_BOOK.addOns.secondday);
    expect(book!.trioSpotsLeft).toBe(5);
    expect(book!.packages.production.price).toBe(2000);
  });

  it("offers the Highlight Film on the Duo and Trio only, and never prices it elsewhere", () => {
    const b = DEFAULT_PRICE_BOOK;
    expect(quoteCommission(b, "trio", ["highlight"]).addOnsUsd).toBe(b.addOns.highlight);
    expect(quoteCommission(b, "production", ["highlight"]).addOnsUsd).toBe(0);
    expect(quoteCommission(b, "study", ["highlight"]).addOnsUsd).toBe(0);
  });

  it("never lets the offer show more dates left than it started with", () => {
    const r = priceBookSchema.safeParse({ ...DEFAULT_PRICE_BOOK, trioSpotsTotal: 5, trioSpotsLeft: 6 });
    expect(r.success).toBe(false);
  });
});
