import { describe, expect, it } from "vitest";
import { fmtSeconds, parseEngaged, summarizeBehavior, type EventRow, type ViewRow } from "./page-behavior";

const v = (path: string, sid: string, min: number): ViewRow => ({ path, session_id: sid, created_at: new Date(Date.UTC(2026, 10, 9, 12, min)).toISOString() });

describe("page behavior", () => {
  it("parses engaged targets and caps silly values", () => {
    expect(parseEngaged("t=45;d=80")).toEqual({ seconds: 45, depth: 80 });
    expect(parseEngaged("t=99999;d=140")).toEqual({ seconds: 1800, depth: 100 });
    expect(parseEngaged("nonsense")).toBeNull();
  });

  it("counts visits, exits (last page of a session), time, scroll and top taps", () => {
    const views: ViewRow[] = [];
    // 16 sessions land on Home; 11 go on to /budget; 3 of those go on to /check-your-date.
    for (let i = 0; i < 16; i++) {
      views.push(v("/", `s${i}`, 0));
      if (i < 11) views.push(v("/budget", `s${i}`, 1));
      if (i < 3) views.push(v("/check-your-date", `s${i}`, 2));
    }
    const events: EventRow[] = [
      { event_type: "engaged", path: "/", target: "t=10;d=40" },
      { event_type: "engaged", path: "/", target: "t=30;d=100" },
      { event_type: "engaged", path: "/", target: "t=20;d=95" },
      { event_type: "click", path: "/", target: "See packages" },
      { event_type: "click", path: "/", target: "See packages" },
      { event_type: "click", path: "/", target: "WhatsApp" },
    ];
    const s = summarizeBehavior(views, events);
    const home = s.pages.find((p) => p.path === "/")!;
    expect(home.label).toBe("Home");
    expect(home.visits).toBe(16);
    expect(home.exitRate).toBeCloseTo(5 / 16);
    expect(home.medianSeconds).toBe(20);
    expect(home.avgDepth).toBe(78);
    expect(home.readToEnd).toBeCloseTo(2 / 3);
    expect(home.topClicks[0]).toEqual({ label: "See packages", count: 2 });
    const budget = s.pages.find((p) => p.path === "/budget")!;
    expect(budget.exitRate).toBeCloseTo(8 / 11);
    expect(budget.medianSeconds).toBeNull();
    // Leak = most visits lost (10+ visits only): Home loses 5, Budget loses 8 → Budget.
    expect(s.leak?.path).toBe("/budget");
    expect(s.measuredTotal).toBe(3);
  });

  it("formats seconds", () => {
    expect(fmtSeconds(45)).toBe("45s");
    expect(fmtSeconds(125)).toBe("2m 05s");
  });
});
