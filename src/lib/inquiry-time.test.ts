import { describe, expect, it } from "vitest";
import { countdownLabel, daysUntil, formatPhone, hoursSince, phoneDigits, waitLabel } from "./inquiry-time";

const now = new Date("2026-11-06T02:10:00Z"); // Nov 5, 8:10 PM in Dallas

describe("inquiry-time", () => {
  it("labels how long a family has waited", () => {
    expect(waitLabel("2026-11-06T02:09:40Z", now)).toBe("Just now");
    expect(waitLabel("2026-11-06T02:05:00Z", now)).toBe("5 min");
    expect(waitLabel("2026-11-05T23:10:00Z", now)).toBe("3 h");
    expect(waitLabel("2026-10-31T06:24:00Z", now)).toBe("5 days");
    expect(hoursSince("2026-11-05T23:10:00Z", now)).toBe(3);
  });

  it("counts days to the celebration in Dallas time", () => {
    expect(daysUntil("2026-11-05", now)).toBe(0); // still Nov 5 in Dallas
    expect(daysUntil("2026-11-25", now)).toBe(20);
    expect(countdownLabel(20)).toBe("In 20 days");
    expect(countdownLabel(135)).toBe("In 4 months");
    expect(countdownLabel(-3)).toBe("3 days ago");
    expect(daysUntil("soon", now)).toBeNull();
  });

  it("normalizes US phone numbers", () => {
    expect(phoneDigits("14699880601")).toBe("14699880601");
    expect(phoneDigits("(469) 988-0601")).toBe("14699880601");
    expect(formatPhone("14699880601")).toBe("(469) 988-0601");
    expect(phoneDigits("")).toBeNull();
  });
});
