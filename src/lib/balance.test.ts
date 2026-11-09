import { describe, expect, it } from "vitest";
import { balanceCentsFrom, checkAmount, MIN_PART_CENTS, paidCents, parseDollarsToCents, remainingCents } from "./balance";

describe("balanceCentsFrom", () => {
  it("turns the signed dollars into cents", () => {
    expect(balanceCentsFrom(2250)).toBe(225000);
    expect(balanceCentsFrom(1234.56)).toBe(123456);
  });
  it("refuses anything that isn't a sane positive amount", () => {
    for (const bad of [0, -5, NaN, Infinity, "2250", null, undefined, 200_000]) expect(balanceCentsFrom(bad)).toBeNull();
  });
});

describe("paid / remaining", () => {
  const rows = [
    { status: "paid", amount_cents: 50000 },
    { status: "paid", amount_cents: 25000 },
    { status: "open", amount_cents: 99999 },
    { status: "expired", amount_cents: 99999 },
    { status: "refunded", amount_cents: 10000 },
    { status: "review", amount_cents: 10000 },
  ];
  it("counts only settled payments", () => {
    expect(paidCents(rows)).toBe(75000);
    expect(remainingCents(100000, rows)).toBe(25000);
  });
  it("never goes below zero", () => {
    expect(remainingCents(50000, rows)).toBe(0);
  });
});

describe("checkAmount", () => {
  it("no amount = everything left", () => {
    expect(checkAmount(undefined, 123456)).toEqual({ ok: true, cents: 123456 });
  });
  it("nothing left = refuse", () => {
    expect(checkAmount(undefined, 0)).toEqual({ ok: false, error: "nothingDue" });
  });
  it("can't pay more than what's left", () => {
    expect(checkAmount(100001, 100000)).toEqual({ ok: false, error: "tooBig" });
  });
  it("part payments have a floor (stops card testing)", () => {
    expect(checkAmount(MIN_PART_CENTS - 1, 100000)).toEqual({ ok: false, error: "tooSmall" });
    expect(checkAmount(100, 100000)).toEqual({ ok: false, error: "tooSmall" });
    expect(checkAmount(MIN_PART_CENTS, 100000)).toEqual({ ok: true, cents: MIN_PART_CENTS });
  });
  it("the last payment may be under the floor if that's all that's left", () => {
    expect(checkAmount(1500, 1500)).toEqual({ ok: true, cents: 1500 });
    expect(checkAmount(1000, 1500)).toEqual({ ok: false, error: "tooSmall" });
  });
  it("rejects fractions, zero, negatives", () => {
    for (const bad of [0, -100, 100.5, NaN]) expect(checkAmount(bad, 100000).ok).toBe(false);
  });
});

describe("parseDollarsToCents", () => {
  it("reads what people type", () => {
    expect(parseDollarsToCents("250")).toBe(25000);
    expect(parseDollarsToCents("$1,200.00")).toBe(120000);
    expect(parseDollarsToCents("99.5")).toBe(9950);
    expect(parseDollarsToCents(" 75.05 ")).toBe(7505);
  });
  it("rejects junk", () => {
    for (const bad of ["", "abc", "1.234", "-50", "1e5", "12.3.4", "9999999"]) expect(parseDollarsToCents(bad)).toBeNull();
  });
});
