import { describe, expect, it } from "vitest";
import { judgeMove, metricValue } from "./pulse-intel";

const stats = {
  range: 14,
  uniqueSessions: 700,
  uniqueVisitors: 600,
  rangeViews: 900,
  rangeLeads: 14,
  rangeBooked: 1,
  bounceRate: 60,
  flow: [
    { label: "Visits", value: 700 },
    { label: "Saw work or prices", value: 140 },
    { label: "Took action", value: 14 },
    { label: "Leads", value: 7 },
    { label: "Booked", value: 1 },
  ],
};

describe("metricValue", () => {
  it("measures a funnel step as the % of the step before, with its sample", () => {
    expect(metricValue(stats, "step:2")).toEqual({ value: 10, base: 140 });
  });
  it("measures counts per day", () => {
    expect(metricValue(stats, "visits")).toEqual({ value: 50, base: 700 });
  });
  it("rejects unknown keys", () => {
    expect(metricValue(stats, "nope")).toBeNull();
  });
});

describe("judgeMove", () => {
  it("won't judge before a week", () => {
    expect(judgeMove("step:2", 7, 20, 200, 5).state).toBe("measuring");
  });
  it("won't judge on too few people", () => {
    expect(judgeMove("step:2", 7, 20, 12, 10).state).toBe("measuring");
  });
  it("calls a real lift working", () => {
    const v = judgeMove("step:2", 7, 10, 140, 10);
    expect(v.state).toBe("working");
    expect(v.change).toBe(43);
  });
  it("treats a lower bounce rate as better", () => {
    expect(judgeMove("bounce", 90, 70, 500, 10).state).toBe("working");
    expect(judgeMove("bounce", 60, 80, 500, 10).state).toBe("not-working");
  });
  it("calls small changes flat after three weeks", () => {
    expect(judgeMove("step:1", 20, 21, 500, 10).state).toBe("measuring");
    expect(judgeMove("step:1", 20, 21, 500, 22).state).toBe("flat");
  });
});
