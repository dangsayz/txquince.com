import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BOOKINGS_PER_DATE, fullDates } from "@/lib/booking-capacity";

describe("bookings per date", () => {
  it("matches the number the database enforces", () => {
    const sql = readFileSync("supabase/migrations/0024_bookings_per_date.sql", "utf8");
    const m = sql.match(/function public\.bookings_per_date\(\)[\s\S]*?\$\$\s*select\s+(\d+)\s*\$\$/);
    expect(m?.[1]).toBe(String(BOOKINGS_PER_DATE));
  });

  it("calls a date full only once it holds as many bookings as the capacity", () => {
    const d = "2027-05-15";
    expect(fullDates([d, d])).toEqual([]);
    expect(fullDates([d, d, d])).toEqual([d]);
    expect(fullDates([d, "2027-05-22", d, d, "2027-05-22"])).toEqual([d]);
  });
});
