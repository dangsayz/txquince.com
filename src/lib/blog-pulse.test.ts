import { describe, expect, it } from "vitest";
import { agoLabel, daysAgo, postPath, summarizeBlog } from "./blog-pulse";
import type { EventRow, ViewRow } from "./page-behavior";

const v = (path: string, sid: string): ViewRow => ({ path, session_id: sid, created_at: "2026-11-09T12:00:00.000Z" });
const e = (path: string, target: string): EventRow => ({ event_type: "engaged", path, target });

describe("blog pulse", () => {
  it("keeps post pages only", () => {
    expect(postPath("/blog/budget/?utm=x")).toBe("/blog/budget");
    expect(postPath("/es/blog/costo")).toBe("/es/blog/costo");
    expect(postPath("/blog")).toBeNull();
    expect(postPath("/budget")).toBeNull();
    expect(postPath(null)).toBeNull();
  });

  it("ranks posts by reads and adds time, finish rate and comments", () => {
    const views = [v("/blog/a", "s1"), v("/blog/a", "s2"), v("/blog/a", "s3"), v("/blog/b", "s1"), v("/", "s9"), v("/blog", "s9")];
    const events = [e("/blog/a", "t=60;d=95"), e("/blog/a", "t=120;d=50"), e("/blog/a", "t=90;d=100"), e("/", "t=500;d=100"), { event_type: "click", path: "/blog/a", target: "x" }];
    const titles = new Map([["/blog/a", "Post A"], ["/blog/b", "Post B"]]);
    const s = summarizeBlog(views, events, titles, [
      { path: "/blog/b", total: 2, pending: 1, recent: 2 },
      { path: "/es/blog/c", total: 1, pending: 0, recent: 0 },
    ]);
    expect(s.reads).toBe(4);
    expect(s.readers).toBe(3);
    expect(s.medianSeconds).toBe(90);
    expect(s.readToEnd).toBeCloseTo(2 / 3);
    expect(s.newComments).toBe(2);
    expect(s.pendingComments).toBe(1);
    expect(s.posts.map((p) => p.path)).toEqual(["/blog/a", "/blog/b", "/es/blog/c"]);
    expect(s.posts[0]).toMatchObject({ title: "Post A", reads: 3, medianSeconds: 90, comments: 0, spanish: false });
    expect(s.posts[1]).toMatchObject({ reads: 1, medianSeconds: null, readToEnd: null, comments: 2 });
    expect(s.posts[2]).toMatchObject({ title: "c", spanish: true, reads: 0, comments: 1 });
  });

  it("is empty without data", () => {
    const s = summarizeBlog([], [], new Map());
    expect(s).toMatchObject({ reads: 0, readers: 0, medianSeconds: null, readToEnd: null, posts: [] });
  });

  it("counts calendar days in Central time", () => {
    const now = new Date("2026-11-09T18:00:00Z"); // Mon noon in Dallas
    expect(daysAgo("2026-11-09T07:00:00Z", now)).toBe(0); // 1am Monday in Dallas
    expect(daysAgo("2026-11-09T04:00:00Z", now)).toBe(1); // 10pm Sunday in Dallas
    expect(daysAgo("2026-11-06T18:00:00Z", now)).toBe(3);
    expect([0, 1, 3].map(agoLabel)).toEqual(["Today", "Yesterday", "3 days ago"]);
  });
});
