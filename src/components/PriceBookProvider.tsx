"use client";

/**
 * PriceBookProvider — the live price book on the client.
 *
 * The server loads the book (getPriceBook(), src/lib/pricing.ts) in the root
 * layout and hands it down; nothing on the client ever has its own prices.
 * UI-independent on purpose: any component (package table, booking form, a
 * future tabbed panel) reads prices and quotes through usePriceBook(), and the
 * server re-prices everything it charges with its own book anyway.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_PRICE_BOOK,
  canAddHours,
  maxHoursFor,
  normalizeHours,
  quoteCommission,
  type AddOnId,
  type PriceBook,
  type Quote,
  type TierId,
} from "@/lib/commission";
import { fillDeep, fillPrices } from "@/lib/price-text";

export type PriceBookApi = {
  book: PriceBook;
  /** Full quote for a selection (total, deposit, rest, hours). */
  quote: (tier: TierId, addOns: readonly AddOnId[], hours?: number | null) => Quote;
  /** Fit requested hours to a package. */
  normalizeHours: (tier: TierId, hours?: number | null) => number;
  maxHours: (tier: TierId) => number;
  canAddHours: (tier: TierId) => boolean;
  /** Fill price tokens in a string. */
  fill: (text: string) => string;
  /** Fill price tokens anywhere inside a value (copy objects, FAQ lists). */
  fillDeep: <T>(value: T) => T;
  /**
   * Switch this page to a newer book the server just sent (e.g. a booking was
   * refused with `prices_changed`), so the family sees the real price before
   * signing again. Display only — the server always re-prices.
   */
  adopt: (book: PriceBook) => void;
};

export function priceBookApi(book: PriceBook, adopt: (book: PriceBook) => void = () => {}): PriceBookApi {
  return {
    adopt,
    book,
    quote: (tier, addOns, hours) => quoteCommission(book, tier, addOns, hours),
    normalizeHours: (tier, hours) => normalizeHours(book, tier, hours),
    maxHours: (tier) => maxHoursFor(book, tier),
    canAddHours: (tier) => canAddHours(book, tier),
    fill: (text) => fillPrices(text, book),
    fillDeep: (value) => fillDeep(value, book),
  };
}

const Ctx = createContext<PriceBookApi | null>(null);

export function PriceBookProvider({ book, children }: { book: PriceBook; children: ReactNode }) {
  // A newer book adopted on this page wins over the one it was served with
  // (keyed to the served book, so a fresh server render resets it).
  const [adopted, setAdopted] = useState<{ from: PriceBook; book: PriceBook } | null>(null);
  const live = adopted && adopted.from === book ? adopted.book : book;
  const value = useMemo(
    () => priceBookApi(live, (next) => setAdopted({ from: book, book: next })),
    [live, book],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const fallback = priceBookApi(DEFAULT_PRICE_BOOK);

/**
 * The live book and book-aware helpers. Outside a provider (e.g. an isolated
 * test render) it falls back to the launch defaults — display only; the server
 * never accepts a client price.
 */
export function usePriceBook(): PriceBookApi {
  return useContext(Ctx) ?? fallback;
}
