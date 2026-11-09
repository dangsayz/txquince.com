/** Runs the real comment SQL against SQLite with the real migrations. */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sqliteD1 } from "@/lib/db/sqlite-d1.test-helper";

vi.mock("server-only", () => ({}));
let db: ReturnType<typeof sqliteD1>;
vi.mock("@/lib/d1", () => ({ getD1: async () => db, requireD1: async () => db }));

import { blockCommentAuthor, countCommentsByPost, createComment, isBlocked, listApprovedComments, listBlockedCommenters, moderateComment, unblockCommenter } from "./comments-db";

const post = (user_id: string, author_name: string, post_slug = "a-post") =>
  createComment({ post_slug, lang: "en", user_id, author_name, author_image: null, body: "A comment." });

describe("comments-db", () => {
  beforeEach(() => {
    db = sqliteD1();
  });

  it("blocks a commenter: hides all their comments and remembers the block", async () => {
    const a1 = await post("user_a", "Ana A.");
    const a2 = await post("user_a", "Ana A.", "b-post");
    const b1 = await post("user_b", "Bea B.");
    for (const c of [a1, a2, b1]) await moderateComment(c.id, { status: "approved" });

    expect(await isBlocked("user_a")).toBe(false);
    const done = await blockCommentAuthor(a1.id);
    expect(done?.who.author_name).toBe("Ana A.");
    expect(done?.hidden.map((c) => c.id).sort()).toEqual([a1.id, a2.id].sort());
    expect(await isBlocked("user_a")).toBe(true);
    expect(await isBlocked("user_b")).toBe(false);
    expect((await listApprovedComments("a-post", "en")).map((c) => c.id)).toEqual([b1.id]);
    expect((await listBlockedCommenters()).map((b) => b.user_id)).toEqual(["user_a"]);

    // Blocking twice is safe; unblocking lets them write again but keeps the comments hidden.
    expect((await blockCommentAuthor(a2.id))?.hidden).toEqual([]);
    expect(await unblockCommenter("user_a")).toBe(true);
    expect(await unblockCommenter("user_a")).toBe(false);
    expect(await isBlocked("user_a")).toBe(false);
    expect(await listApprovedComments("b-post", "en")).toEqual([]);
    expect(await blockCommentAuthor("00000000-0000-4000-8000-000000000000")).toBeNull();
  });

  it("counts comments per post, leaving hidden ones out", async () => {
    const a = await post("user_a", "Ana A.");
    await post("user_b", "Bea B.");
    const c = await post("user_c", "Cy C.");
    await moderateComment(a.id, { status: "approved" });
    await moderateComment(c.id, { status: "hidden" });
    expect(await countCommentsByPost("2000-01-01")).toEqual([{ post_slug: "a-post", lang: "en", total: 2, pending: 1, recent: 2 }]);
  });
});
