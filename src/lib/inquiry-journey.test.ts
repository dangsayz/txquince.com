import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ getDb: vi.fn(), isDbConfigured: () => false }));

import { buildJourney, type JourneyView } from "./inquiry-journey";

const v = (path: string, created_at: string, session_id = "s1"): JourneyView => ({ path, created_at, session_id, referrer: null, utm_source: null });

describe("buildJourney", () => {
  it("orders views, collapses repeats, marks new visits and counts days", () => {
    const j = buildJourney(
      [
        v("/packages", "2026-11-03T10:05:00Z", "s2"),
        v("/", "2026-11-01T09:00:00Z"),
        v("/gallery", "2026-11-01T09:01:00Z"),
        v("/gallery", "2026-11-01T09:02:00Z"),
        v("/budget", "2026-11-03T10:06:00Z", "s2"),
        v("/thank-you", "2026-11-03T10:08:00Z", "s2"),
        v("/later", "2026-11-04T10:00:00Z", "s3"),
      ],
      "2026-11-03T10:07:00Z",
    )!;
    expect(j.steps.map((s) => [s.path, s.count, s.newVisit])).toEqual([
      ["/", 1, true],
      ["/gallery", 2, false],
      ["/packages", 1, true],
      ["/budget", 1, false],
    ]);
    expect(j).toMatchObject({ visits: 2, pageViews: 5, daysToInquire: 2, hidden: 0 });
  });

  it("folds the middle of a long path", () => {
    const rows = Array.from({ length: 20 }, (_, i) => v(`/p${i}`, `2026-11-01T09:${String(i).padStart(2, "0")}:00Z`));
    const j = buildJourney(rows, "2026-11-01T10:00:00Z")!;
    expect(j.steps).toHaveLength(14);
    expect(j.hidden).toBe(6);
    expect(j.steps[0].path).toBe("/p0");
    expect(j.steps.at(-1)!.path).toBe("/p19");
  });

  it("is null without views before the inquiry", () => {
    expect(buildJourney([], "2026-11-01T10:00:00Z")).toBeNull();
  });
});
