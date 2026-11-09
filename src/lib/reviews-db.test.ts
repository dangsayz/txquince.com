/**
 * Runs the real reviews-db SQL against SQLite (node:sqlite), the engine D1 is
 * built on, with the real migration — so a typo in a column or a broken
 * one-time rule fails here, not in production.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it, vi } from "vitest";

let sqlite: DatabaseSync;

function fakeD1() {
  return {
    prepare(sql: string) {
      let args: unknown[] = [];
      const stmt = {
        bind(...values: unknown[]) {
          args = values.map((v) => (v === undefined ? null : v));
          return stmt;
        },
        async first() {
          return (sqlite.prepare(sql).get(...(args as never[])) as Record<string, unknown>) ?? null;
        },
        async all() {
          return { results: sqlite.prepare(sql).all(...(args as never[])), meta: { changes: 0 } };
        },
        async run() {
          const r = sqlite.prepare(sql).run(...(args as never[]));
          return { results: [], meta: { changes: Number(r.changes) } };
        },
      };
      return stmt;
    },
  };
}

vi.mock("server-only", () => ({}));
vi.mock("@/lib/d1", () => ({ getD1: async () => fakeD1(), requireD1: async () => fakeD1() }));

const db = await import("./reviews-db");

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(join(__dirname, "../../migrations/0001_reviews.sql"), "utf8"));
});

const submission = {
  rating: 5,
  body: "Beautiful photos, thank you!",
  display_name: "Maria G.",
  daughter_name: "Ana",
  city: "Fort Worth",
  language: "en" as const,
  photos: ["reviews/x/1.webp"],
  consent_publish: true as const,
  consent_photos: true,
};

describe("reviews on D1", () => {
  it("makes a link, takes one submission, and refuses a second", async () => {
    const invite = await db.createInvite({ invite_name: "Maria Garcia", daughter_name: "Ana", event_date: "2026-03-14" });
    expect(invite.status).toBe("invited");
    expect(invite.slug).toMatch(/^[a-z2-9]{10}$/);

    expect(await db.submitReview(invite.slug, submission)).toBe(true);
    expect(await db.submitReview(invite.slug, submission)).toBe(false);

    const saved = (await db.getReviewBySlug(invite.slug))!;
    expect(saved).toMatchObject({ status: "pending", rating: 5, photo_paths: ["reviews/x/1.webp"], consent_publish: true, consent_photos: true, featured: false, show_photos: true });
  });

  it("shows nothing publicly until approved, then features it", async () => {
    const invite = await db.createInvite({ invite_name: "Maria Garcia", daughter_name: null, event_date: null });
    await db.submitReview(invite.slug, submission);
    expect(await db.getPublicReviews()).toHaveLength(0);

    await db.updateReview(invite.id, { status: "approved", featured: true });
    const [pub] = await db.getPublicReviews();
    expect(pub).toMatchObject({ name: "Maria G.", rating: 5, photoCount: 1, featured: true });
    expect((await db.getReviewById(invite.id))!.approved_at).toBeTruthy();
  });

  it("cannot approve an unused link, and only deletes unused links", async () => {
    const invite = await db.createInvite({ invite_name: "Rosa", daughter_name: null, event_date: null });
    await expect(db.updateReview(invite.id, { status: "approved" })).rejects.toThrow();
    expect(await db.deleteInvite(invite.id)).toBe(true);

    const used = await db.createInvite({ invite_name: "Claudia", daughter_name: null, event_date: null });
    await db.submitReview(used.slug, submission);
    expect(await db.deleteInvite(used.id)).toBe(false);
    expect((await db.listReviews()).map((r) => r.invite_name)).toEqual(["Claudia"]);
  });
});
