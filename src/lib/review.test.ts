import { describe, expect, it } from "vitest";
import { InviteSchema, SubmitSchema, inviteMessage, isOwnPhotoKey, isReviewSlug, shortName, toPublicReview, type ReviewRecord } from "./review";

const SLUG = "abc23defgh";
const KEY = `reviews/${SLUG}/0b6f2f8e-6b1f-4a7e-9f39-2b7c1c0a9d11.webp`;

const base: ReviewRecord = {
  id: "11111111-2222-4333-8444-555555555555",
  slug: SLUG,
  created_at: "2026-11-01T00:00:00Z",
  status: "approved",
  invite_name: "Maria Garcia",
  daughter_name: "Ana",
  event_date: "2026-03-14",
  submitted_at: "2026-11-02T00:00:00Z",
  rating: 5,
  body: "He was wonderful from start to finish.",
  display_name: "Maria G.",
  city: "Fort Worth",
  language: "en",
  photo_paths: [KEY],
  consent_publish: true,
  consent_photos: true,
  approved_at: "2026-11-03T00:00:00Z",
  featured: false,
  show_photos: true,
  notes: "private",
  edit: null,
};

const submit = { rating: 5, body: "Beautiful photos, thank you!", display_name: "Maria G.", consent_publish: true };

describe("review links", () => {
  it("accepts only the random slug format", () => {
    expect(isReviewSlug(SLUG)).toBe(true);
    expect(isReviewSlug("maria-garcia")).toBe(false);
    expect(isReviewSlug("ABC23DEFGH")).toBe(false);
  });

  it("only accepts photo keys this link uploaded", () => {
    expect(isOwnPhotoKey(SLUG, KEY)).toBe(true);
    expect(isOwnPhotoKey("zzz23defgh", KEY)).toBe(false);
    expect(isOwnPhotoKey(SLUG, "portfolio/123.webp")).toBe(false);
    expect(isOwnPhotoKey(SLUG, `reviews/${SLUG}/../portfolio/x.webp`)).toBe(false);
  });

  it("builds the copy-paste message with the link in it, in both languages", () => {
    const msg = inviteMessage({ invite_name: "maria Garcia", daughter_name: "ana" }, "https://txquince.com/review/abc23defgh");
    expect(msg).toContain("Hi Maria!");
    expect(msg).toContain("¡Hola Maria!");
    expect(msg).toContain("Ana’s quinceañera");
    expect(msg).toContain("https://txquince.com/review/abc23defgh");
  });

  it("signs with first name + last initial by default", () => {
    expect(shortName("Maria  de la Garcia")).toBe("Maria G.");
    expect(shortName("Maria")).toBe("Maria");
    expect(shortName("yvonne sierra")).toBe("Yvonne S.");
  });

  it("needs a name for a new link; daughter and date are optional", () => {
    expect(InviteSchema.safeParse({ invite_name: "" }).success).toBe(false);
    expect(InviteSchema.parse({ invite_name: "Maria", event_date: "" })).toEqual({ invite_name: "Maria", daughter_name: null, event_date: null });
  });
});

describe("submitting", () => {
  it("requires stars, words and permission to publish", () => {
    expect(SubmitSchema.safeParse(submit).success).toBe(true);
    expect(SubmitSchema.safeParse({ ...submit, rating: 0 }).success).toBe(false);
    expect(SubmitSchema.safeParse({ ...submit, body: "ok" }).success).toBe(false);
    expect(SubmitSchema.safeParse({ ...submit, consent_publish: false }).success).toBe(false);
  });

  it("requires photo permission only when photos are attached", () => {
    expect(SubmitSchema.safeParse({ ...submit, photos: [KEY] }).success).toBe(false);
    expect(SubmitSchema.safeParse({ ...submit, photos: [KEY], consent_photos: true }).success).toBe(true);
  });
});

describe("what goes public", () => {
  it("shows an approved review without the slug or private notes", () => {
    const pub = toPublicReview(base)!;
    expect(pub).toMatchObject({ name: "Maria G.", rating: 5, photoCount: 1, when: "March 2026" });
    expect(JSON.stringify(pub)).not.toContain(SLUG);
    expect(JSON.stringify(pub)).not.toContain("private");
  });

  it("never shows pending, hidden or unconsented reviews", () => {
    expect(toPublicReview({ ...base, status: "pending" })).toBeNull();
    expect(toPublicReview({ ...base, status: "hidden" })).toBeNull();
    expect(toPublicReview({ ...base, consent_publish: false })).toBeNull();
  });

  it("drops photos the mom or owner did not clear", () => {
    expect(toPublicReview({ ...base, consent_photos: false })!.photoCount).toBe(0);
    expect(toPublicReview({ ...base, show_photos: false })!.photoCount).toBe(0);
  });
});
