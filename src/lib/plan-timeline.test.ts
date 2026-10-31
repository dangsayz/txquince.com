import { describe, expect, it } from "vitest";
import { buildQuinceTimeline, clock, sunsetUtc } from "./plan-timeline";

/** Sunset in Dallas as "H:MM" 24h local time. */
const local = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit", hourCycle: "h23" }).format(sunsetUtc(iso)!);
const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

describe("sunset in DFW", () => {
  // Published Dallas sunsets (timeanddate.com): Nov 21 ≈ 5:22 PM CST, Jun 21 ≈ 8:37 PM CDT.
  it("lands within a few minutes of published times", () => {
    expect(Math.abs(minutes(local("2026-11-21")) - minutes("17:22"))).toBeLessThanOrEqual(4);
    expect(Math.abs(minutes(local("2027-06-21")) - minutes("20:37"))).toBeLessThanOrEqual(4);
  });
});

describe("timeline", () => {
  it("puts golden-hour portraits before the reception in November", () => {
    const t = buildQuinceTimeline("2026-11-21", "en", "2026-10-31");
    expect(t.portraitsDuringReception).toBe(false);
    expect(t.day.some((r) => r.title === "Golden-hour portraits")).toBe(true);
    expect(t.sunset).toMatch(/^5:\d{2} PM$/);
    // Rows are in time order.
    expect(t.day.map((r) => r.minutes)).toEqual([...t.day.map((r) => r.minutes)].sort((a, b) => a - b));
  });

  it("steps outside during the reception in June, in Spanish", () => {
    const t = buildQuinceTimeline("2027-06-19", "es", "2026-10-31");
    expect(t.portraitsDuringReception).toBe(true);
    expect(t.day.some((r) => r.title.startsWith("Retratos al atardecer"))).toBe(true);
    expect(t.dateLabel).toContain("junio");
  });

  it("dates the checklist back from the event and flags what is already late", () => {
    const t = buildQuinceTimeline("2026-11-21", "en", "2026-10-31");
    const venue = t.checklist[0];
    expect(venue.overdue).toBe(true);
    expect(venue.by).toBe("As soon as you can");
    const lastWeek = t.checklist[t.checklist.length - 1];
    expect(lastWeek.overdue).toBe(false);
    expect(lastWeek.by).toBe("November 14, 2026");
  });

  it("formats clock times per language", () => {
    expect(clock(17 * 60 + 22, "en")).toBe("5:20 PM");
    expect(clock(9 * 60, "es")).toBe("9:00 a. m.");
    expect(clock(24 * 60 - 1, "en")).toBe("12:00 AM");
  });
});
