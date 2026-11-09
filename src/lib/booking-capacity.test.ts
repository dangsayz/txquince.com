import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BOOKINGS_PER_DATE, fullDates } from "@/lib/booking-capacity";

describe("bookings per date", () => {
  it("matches the number the database enforces", () => {
    // D1 triggers bookings_capacity_insert / _update (migrations/0002_core.sql).
    const sql = readFileSync("migrations/0002_core.sql", "utf8");
    const caps = [...sql.matchAll(/status IN \('requested', 'pending_payment', 'paid'\)(?: AND id <> NEW\.id)?\) >= (\d+)/g)].map((m) => m[1]);
    expect(caps).toEqual([String(BOOKINGS_PER_DATE), String(BOOKINGS_PER_DATE)]);
  });

  it("calls a date full only once it holds as many bookings as the capacity", () => {
    const d = "2027-05-15";
    expect(fullDates([d, d])).toEqual([]);
    expect(fullDates([d, d, d])).toEqual([d]);
    expect(fullDates([d, "2027-05-22", d, d, "2027-05-22"])).toEqual([d]);
  });
});
