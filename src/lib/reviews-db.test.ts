/**
 * Runs the real reviews-db SQL against SQLite (node:sqlite), the engine D1 is
 * built on, with the real migration — so a typo in a column or a broken
 * one-time rule fails here, not in production.
 */
import { readdirSync, readFileSync } from "node:fs";
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
  const dir = join(__dirname, "../../migrations");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) sqlite.exec(readFileSync(join(dir, f), "utf8"));
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

  it("an update before approval simply replaces the review", async () => {
    const invite = await db.createInvite({ invite_name: "Maria", daughter_name: null, event_date: null });
    await db.submitReview(invite.slug, submission);
    expect(await db.updateFromMom(invite.slug, { ...submission, body: "Even better than I said." })).toBe("replaced");
    const r = (await db.getReviewById(invite.id))!;
    expect(r).toMatchObject({ status: "pending", body: "Even better than I said.", edit: null });
  });

  it("an update after approval waits; the live version stays until the owner decides", async () => {
    const invite = await db.createInvite({ invite_name: "Maria", daughter_name: null, event_date: null });
    await db.submitReview(invite.slug, submission);
    await db.updateReview(invite.id, { status: "approved" });

    expect(await db.updateFromMom(invite.slug, { ...submission, rating: 4, body: "Changed my words.", photos: [] , consent_photos: false })).toBe("queued");
    let r = (await db.getReviewById(invite.id))!;
    expect(r.body).toBe(submission.body);
    expect(r.edit).toMatchObject({ rating: 4, body: "Changed my words.", photo_paths: [] });
    expect((await db.getPublicReviews())[0].body).toBe(submission.body);

    await db.updateReview(invite.id, { edit: "reject" });
    r = (await db.getReviewById(invite.id))!;
    expect(r.edit).toBeNull();
    expect(r.body).toBe(submission.body);

    await db.updateFromMom(invite.slug, { ...submission, body: "Second try, approved." });
    await db.updateReview(invite.id, { edit: "approve" });
    r = (await db.getReviewById(invite.id))!;
    expect(r).toMatchObject({ status: "approved", body: "Second try, approved.", edit: null });
    expect((await db.getPublicReviews())[0].body).toBe("Second try, approved.");
    await expect(db.updateReview(invite.id, { edit: "approve" })).rejects.toThrow();
  });

  it("an unused link can't be updated", async () => {
    const invite = await db.createInvite({ invite_name: "Rosa", daughter_name: null, event_date: null });
    expect(await db.updateFromMom(invite.slug, submission)).toBeNull();
  });

  it("the owner edits details but never her words, and can delete with photo cleanup", async () => {
    const invite = await db.createInvite({ invite_name: "Maria", daughter_name: null, event_date: null });
    await db.submitReview(invite.slug, submission);
    await db.updateReview(invite.id, { display_name: "Maria Garcia", city: null, event_date: "2026-03-14", notes: "met at Las Lomas" });
    const r = (await db.getReviewById(invite.id))!;
    expect(r).toMatchObject({ display_name: "Maria Garcia", city: null, event_date: "2026-03-14", notes: "met at Las Lomas", body: submission.body });

    await db.updateReview(invite.id, { status: "approved" });
    await db.updateFromMom(invite.slug, { ...submission, photos: ["reviews/x/2.webp"] });
    expect((await db.deleteReview(invite.id))!.sort()).toEqual(["reviews/x/1.webp", "reviews/x/2.webp"]);
    expect(await db.getReviewById(invite.id)).toBeNull();
    expect(await db.deleteReview(invite.id)).toBeNull();
  });
});
