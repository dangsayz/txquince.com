import { describe, expect, it, vi } from "vitest";

// pricing.ts is server-only; the parser under test is pure.
vi.mock("server-only", () => ({}));
import {
  BASE_CREW,
  COORDINATOR_INCLUDED,
  DEFAULT_PRICE_BOOK,
  PUBLIC_TIER_IDS,
  isBookableTier,
  maxHoursFor,
  normalizeCrew,
  priceBookSchema,
  priceCeiling,
  priceFloor,
  quoteCommission,
} from "@/lib/commission";
import { parseStoredBook } from "@/lib/pricing";

describe("the Oct 31 2026 lineup", () => {
  it("offers four packages: the Portrait Session, the Solo (5 hrs), the Duo (6 hrs) and the Trio (7 hrs)", () => {
    expect(PUBLIC_TIER_IDS).toEqual(["study", "solo", "cinema", "trio"]);
    expect(DEFAULT_PRICE_BOOK.packages.solo).toEqual({ price: 1200, hours: 5, extraHour: 200 });
    const h = DEFAULT_PRICE_BOOK.packages;
    expect([h.cinema.hours, h.trio.hours]).toEqual([6, 7]);
    expect(isBookableTier("archive")).toBe(false);
    expect(isBookableTier("production")).toBe(false);
  });

  it("gives the Trio two photographers and one videographer, without a coordinator", () => {
    expect(BASE_CREW.trio).toBe(3);
    expect(normalizeCrew("trio")).toEqual({ photo: 2, motion: 1 });
    expect(COORDINATOR_INCLUDED.trio).toBe(false);
  });

  it("keeps the retired package out of the published price range", () => {
    const book = {
      ...DEFAULT_PRICE_BOOK,
      packages: { ...DEFAULT_PRICE_BOOK.packages, archive: { price: 99_000, hours: 7, extraHour: 0 }, production: { price: 98_000, hours: 7, extraHour: 0 } },
    };
    expect(priceCeiling(book)).toBe(DEFAULT_PRICE_BOOK.packages.trio.price);
    expect(priceFloor(book)).toBe(DEFAULT_PRICE_BOOK.packages.study.price);
  });

  it("prices the 8th hour and the Second Portrait Day on the server's book", () => {
    const q = quoteCommission(DEFAULT_PRICE_BOOK, "trio", ["secondday", "coordinator"], 8);
    const p = DEFAULT_PRICE_BOOK.packages.trio;
    expect(q.totalUsd).toBe(p.price + p.extraHour + DEFAULT_PRICE_BOOK.addOns.secondday + DEFAULT_PRICE_BOOK.addOns.coordinator);
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
    expect(book!.trioSpotsLeft).toBe(0);
    expect(book!.addOns.coordinator).toBe(DEFAULT_PRICE_BOOK.addOns.coordinator);
    expect(book!.packages.production.price).toBe(2000);
  });

  it("prices each extra only on the packages that offer it", () => {
    const b = DEFAULT_PRICE_BOOK;
    expect(quoteCommission(b, "cinema", ["highlight"]).addOnsUsd).toBe(b.addOns.highlight);
    expect(quoteCommission(b, "trio", ["highlight"]).addOnsUsd).toBe(0); // the Trio already includes one
    expect(quoteCommission(b, "study", ["highlight", "coordinator"]).addOnsUsd).toBe(0); // no video, no event day
    expect(quoteCommission(b, "trio", ["destination"]).addOnsUsd).toBe(0); // the dress session is included now
  });

  it("caps the Solo at 6 hours on the server, whatever the request asks for", () => {
    const b = DEFAULT_PRICE_BOOK;
    expect(maxHoursFor(b, "solo")).toBe(6);
    const q = quoteCommission(b, "solo", [], 8);
    expect(q.hours).toBe(6);
    expect(q.totalUsd).toBe(b.packages.solo.price + b.packages.solo.extraHour);
    expect(maxHoursFor(b, "cinema")).toBe(b.maxHours); // the cap is the Solo's alone
  });

  it("lets the Solo add only the Highlight Film and a Coordinator", () => {
    const b = DEFAULT_PRICE_BOOK;
    const q = quoteCommission(b, "solo", ["highlight", "coordinator", "secondday", "sameday", "super8", "parents", "destination"]);
    expect(q.addOnsUsd).toBe(b.addOns.highlight + b.addOns.coordinator);
  });

  it("staffs the Solo with one hybrid shooter and says so on the owner's summary", () => {
    expect(BASE_CREW.solo).toBe(1);
    expect(normalizeCrew("solo", { photo: 0, motion: 1 })).toEqual({ photo: 1, motion: 0 });
    expect(COORDINATOR_INCLUDED.solo).toBe(false);
  });

  it("gives a book saved before the Solo existed the Solo's default price", () => {
    const saved = { ...DEFAULT_PRICE_BOOK, packages: { ...DEFAULT_PRICE_BOOK.packages } } as Record<string, unknown>;
    delete (saved.packages as Record<string, unknown>).solo;
    const book = parseStoredBook(saved);
    expect(book!.packages.solo).toEqual(DEFAULT_PRICE_BOOK.packages.solo);
  });

  it("never lets the offer show more dates left than it started with", () => {
    const r = priceBookSchema.safeParse({ ...DEFAULT_PRICE_BOOK, trioSpotsTotal: 5, trioSpotsLeft: 6 });
    expect(r.success).toBe(false);
  });
});
