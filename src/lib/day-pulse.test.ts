import { describe, expect, it } from "vitest";
import { summarizeDays, texasDay } from "./day-pulse";

// 2026-11-06 15:00 in Dallas (CST, UTC-6) = 21:00Z.
const now = Date.parse("2026-11-06T21:00:00Z");

describe("summarizeDays", () => {
  it("counts today in Texas time, not UTC", () => {
    const views = [
      { session_id: "a", visitor_id: "va", created_at: "2026-11-06T05:30:00Z" }, // Nov 5, 11:30pm Dallas
      { session_id: "b", visitor_id: "vb", created_at: "2026-11-06T06:30:00Z" }, // Nov 6, 12:30am Dallas
      { session_id: "b", visitor_id: "vb", created_at: "2026-11-06T07:00:00Z" },
    ];
    const p = summarizeDays(views, [], now);
    expect(p.visitorsToday).toBe(1);
    expect(p.viewsToday).toBe(2);
    expect(p.week.at(-1)?.date).toBe("2026-11-06");
    expect(p.week.at(-2)?.visitors).toBe(1);
    expect(p.week).toHaveLength(7);
  });

  it("compares with yesterday only up to the same time", () => {
    const views = [
      { session_id: "a", created_at: "2026-11-05T15:00:00Z" }, // yesterday 9am
      { session_id: "b", created_at: "2026-11-05T23:00:00Z" }, // yesterday 5pm, after now's time
    ];
    const p = summarizeDays(views, [], now);
    expect(p.visitorsYesterdaySoFar).toBe(1);
    expect(p.week.at(-2)?.visitors).toBe(2);
  });

  it("counts live sessions and new families today", () => {
    const views = [
      { session_id: "x", created_at: "2026-11-06T20:57:00Z" },
      { session_id: "y", created_at: "2026-11-06T20:40:00Z" },
    ];
    const p = summarizeDays(views, ["2026-11-06T18:00:00Z", "2026-11-06T04:00:00Z"], now);
    expect(p.liveNow).toBe(1);
    expect(p.newFamiliesToday).toBe(1);
    expect(p.week.at(-2)?.families).toBe(1);
  });

  it("formats Texas days", () => {
    expect(texasDay("2026-11-06T05:59:00Z")).toBe("2026-11-05");
  });
});
