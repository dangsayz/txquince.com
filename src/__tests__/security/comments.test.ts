/**
 * Blog comments: who may write, what gets stored, and what stays private.
 * Calls the real route handler with Clerk, D1 and email mocked.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanBody, NewCommentSchema, toPublicComment, type CommentRecord } from "@/lib/comments";

vi.mock("server-only", () => ({}));

const state = vi.hoisted(() => ({
  user: null as null | { id: string; verifiedEmails: string[]; displayName: string; imageUrl: string | null },
  saved: [] as Record<string, unknown>[],
  allowed: true,
  mails: 0,
}));
vi.mock("@/lib/clerk-user", () => ({ getSignedInUser: async () => state.user }));
vi.mock("@/lib/comments-db", () => ({
  canPost: async () => state.allowed,
  createComment: async (input: Record<string, unknown>) => {
    state.saved.push(input);
    return { ...input, id: "c1", status: "pending", created_at: "2026-11-09T00:00:00Z" };
  },
}));
vi.mock("@/lib/resend", () => ({
  sendCommentNoticeEmail: async () => {
    state.mails++;
    return { ok: true };
  },
}));

const post = async (body: unknown, origin = "https://txquince.com") => {
  const { POST } = await import("@/app/api/comments/route");
  return POST(
    new Request("https://txquince.com/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json", ...(origin ? { origin } : {}) },
      body: JSON.stringify(body),
    }),
  );
};

const SLUG = "what-is-the-last-doll-quinceanera";
const good = { post_slug: SLUG, lang: "en", body: "Can the doll match her gown?" };

beforeEach(() => {
  state.user = { id: "user_9", verifiedEmails: ["mom@example.com"], displayName: "Maria G.", imageUrl: null };
  state.saved = [];
  state.allowed = true;
  state.mails = 0;
});

describe("POST /api/comments", () => {
  it("refuses a signed-out visitor", async () => {
    state.user = null;
    expect((await post(good)).status).toBe(401);
    expect(state.saved).toHaveLength(0);
  });

  it("refuses a cross-site post (and one with no Origin)", async () => {
    expect((await post(good, "https://evil.example")).status).toBe(403);
    expect((await post(good, "")).status).toBe(403);
    expect(state.saved).toHaveLength(0);
  });

  it("refuses a post that does not exist", async () => {
    expect((await post({ ...good, post_slug: "no-such-post" })).status).toBe(404);
  });

  it("saves a pending comment under the SESSION's identity, not the body's", async () => {
    const res = await post({ ...good, user_id: "user_admin", author_name: "TX Quince" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, status: "pending" });
    expect(state.saved).toEqual([
      { post_slug: SLUG, lang: "en", user_id: "user_9", author_name: "Maria G.", author_image: null, body: good.body, quote: null },
    ]);
    expect(state.mails).toBe(1);
  });

  it("keeps a highlighted passage, cleaned to one line; drops one that is too short or too long", async () => {
    await post({ ...good, quote: "  the last doll\n stands for   childhood " });
    await post({ ...good, quote: "hi" });
    await post({ ...good, quote: "x".repeat(400) });
    expect(state.saved.map((s) => s.quote)).toEqual(["the last doll stands for childhood", null, null]);
  });

  it("drops a honeypot hit silently", async () => {
    const res = await post({ ...good, website: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(state.saved).toHaveLength(0);
  });

  it("slows down an account that posts too much", async () => {
    state.allowed = false;
    expect((await post(good)).status).toBe(429);
    expect(state.saved).toHaveLength(0);
  });

  it("rejects an empty or oversized comment", async () => {
    expect((await post({ ...good, body: "   " })).status).toBe(400);
    expect((await post({ ...good, body: "x".repeat(2001) })).status).toBe(400);
  });
});

describe("comment rules", () => {
  it("cleans control characters and long blank runs, keeps line breaks", () => {
    expect(cleanBody("  hi\u0007\r\n\r\n\r\n\r\nthere  ")).toBe("hi\n\nthere");
  });

  it("only accepts a real slug shape", () => {
    expect(NewCommentSchema.safeParse({ ...good, post_slug: "../admin" }).success).toBe(false);
    expect(NewCommentSchema.safeParse({ ...good, lang: "fr" }).success).toBe(false);
  });

  it("never exposes the commenter's account id publicly", () => {
    const rec: CommentRecord = {
      id: "c1", created_at: "x", post_slug: SLUG, lang: "en", user_id: "user_9", author_name: "Maria G.",
      author_image: null, body: "b", quote: null, status: "approved", approved_at: "x", reply: null, replied_at: null,
    };
    expect(toPublicComment(rec)).not.toHaveProperty("user_id");
    expect(toPublicComment(rec)).not.toHaveProperty("status");
  });
});
