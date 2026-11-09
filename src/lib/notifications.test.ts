import { describe, expect, it } from "vitest";
import { badgeText, excerpt, mergeNotices, timeAgo, unreadCount, type Notice } from "./notifications";

const n = (id: string, at: string): Notice => ({ id, kind: "comment", at, title: id, detail: "", href: null });

describe("notifications", () => {
  it("merges newest first, drops duplicates and caps the list", () => {
    const out = mergeNotices([[n("a", "2026-11-09T10:00:00Z"), n("b", "2026-11-09T12:00:00Z")], [n("c", "2026-11-09T11:00:00Z"), n("a", "2026-11-09T10:00:00Z")]], 2);
    expect(out.map((x) => x.id)).toEqual(["b", "c"]);
  });

  it("counts what is newer than the last open", () => {
    const items = [n("a", "2026-11-09T10:00:00Z"), n("b", "2026-11-09T12:00:00Z")];
    expect(unreadCount(items, null)).toBe(2);
    expect(unreadCount(items, "2026-11-09T11:00:00Z")).toBe(1);
    expect(unreadCount(items, "2026-11-09T12:00:00Z")).toBe(0);
  });

  it("says how long ago", () => {
    const now = Date.parse("2026-11-09T12:00:00Z");
    expect(timeAgo("2026-11-09T11:59:40Z", now)).toBe("Just now");
    expect(timeAgo("2026-11-09T11:55:00Z", now)).toBe("5 min ago");
    expect(timeAgo("2026-11-09T09:00:00Z", now)).toBe("3 hr ago");
    expect(timeAgo("2026-11-08T11:00:00Z", now)).toBe("Yesterday");
    expect(timeAgo("2026-11-05T11:00:00Z", now)).toBe("4 days ago");
  });

  it("keeps text to one short line and the badge narrow", () => {
    expect(excerpt("  two\n lines ")).toBe("two lines");
    expect(excerpt("word ".repeat(40)).endsWith("…")).toBe(true);
    expect(excerpt("word ".repeat(40)).length).toBeLessThanOrEqual(91);
    expect([1, 9, 10, 250].map(badgeText)).toEqual(["1", "9", "9+", "9+"]);
  });
});
