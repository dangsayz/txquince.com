/**
 * reviews-db.ts — SERVER-ONLY data access for first-party reviews, on
 * Cloudflare D1 (migrations/0001_reviews.sql). Public reads degrade to []
 * when the binding is missing or the migration hasn't run, so the homepage
 * never crashes on a missing table.
 */
import "server-only";
import { cache } from "react";
import { getD1, requireD1 } from "@/lib/d1";
import { generatePlanSlug } from "@/lib/plan-slug";
import {
  REVIEW_STATUSES,
  toPublicReview,
  type InviteInput,
  type PublicReview,
  type ReviewRecord,
  type ReviewStatus,
  type SubmitInput,
} from "@/lib/review";

type Row = Record<string, unknown>;

const now = () => new Date().toISOString();

function parsePaths(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((p): p is string => typeof p === "string");
  if (typeof v !== "string") return [];
  try {
    return parsePaths(JSON.parse(v));
  } catch {
    return [];
  }
}

export function toRecord(row: Row): ReviewRecord {
  const str = (k: string) => (row[k] == null ? null : String(row[k]));
  return {
    id: String(row.id),
    slug: String(row.slug),
    created_at: String(row.created_at),
    status: REVIEW_STATUSES.includes(row.status as ReviewStatus) ? (row.status as ReviewStatus) : "invited",
    invite_name: String(row.invite_name ?? ""),
    daughter_name: str("daughter_name"),
    event_date: str("event_date"),
    submitted_at: str("submitted_at"),
    rating: row.rating == null ? null : Number(row.rating),
    body: str("body"),
    display_name: str("display_name"),
    city: str("city"),
    language: row.language === "es" ? "es" : "en",
    photo_paths: parsePaths(row.photo_paths),
    consent_publish: Boolean(Number(row.consent_publish)),
    consent_photos: Boolean(Number(row.consent_photos)),
    approved_at: str("approved_at"),
    featured: Boolean(Number(row.featured)),
    show_photos: Boolean(Number(row.show_photos)),
    notes: str("notes"),
  };
}

export async function createInvite(input: InviteInput): Promise<ReviewRecord> {
  const db = await requireD1();
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const row = await db
        .prepare("INSERT INTO reviews (id, slug, invite_name, daughter_name, event_date) VALUES (?, ?, ?, ?, ?) RETURNING *")
        .bind(crypto.randomUUID(), generatePlanSlug(), input.invite_name, input.daughter_name, input.event_date)
        .first<Row>();
      if (row) return toRecord(row);
    } catch (err) {
      // Retry only the (astronomically rare) slug collision.
      if (!String(err).includes("UNIQUE")) throw err;
    }
  }
  throw new Error("could not allocate a review link");
}

export async function getReviewBySlug(slug: string): Promise<ReviewRecord | null> {
  const db = await getD1();
  if (!db) return null;
  const row = await db.prepare("SELECT * FROM reviews WHERE slug = ?").bind(slug).first<Row>();
  return row ? toRecord(row) : null;
}

export async function getReviewById(id: string): Promise<ReviewRecord | null> {
  const db = await getD1();
  if (!db) return null;
  const row = await db.prepare("SELECT * FROM reviews WHERE id = ?").bind(id).first<Row>();
  return row ? toRecord(row) : null;
}

/**
 * The one-time step: only an 'invited' row can be submitted. The status check
 * is in the UPDATE itself, so two taps (or a forwarded link) can't both win.
 */
export async function submitReview(slug: string, input: SubmitInput): Promise<boolean> {
  const db = await requireD1();
  const t = now();
  const res = await db
    .prepare(
      `UPDATE reviews SET status = 'pending', submitted_at = ?, updated_at = ?, rating = ?, body = ?, display_name = ?,
         daughter_name = ?, city = ?, language = ?, photo_paths = ?, consent_publish = ?, consent_photos = ?
       WHERE slug = ? AND status = 'invited'`,
    )
    .bind(
      t,
      t,
      input.rating,
      input.body,
      input.display_name,
      input.daughter_name,
      input.city,
      input.language,
      JSON.stringify(input.photos),
      input.consent_publish ? 1 : 0,
      input.consent_photos ? 1 : 0,
      slug,
    )
    .run();
  return res.meta.changes === 1;
}

export async function listReviews(): Promise<ReviewRecord[]> {
  const db = await requireD1();
  const { results } = await db.prepare("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 1000").all<Row>();
  return results.map(toRecord);
}

export async function updateReview(
  id: string,
  fields: Partial<Pick<ReviewRecord, "status" | "featured" | "show_photos" | "notes">>,
): Promise<void> {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [now()];
  if (fields.status !== undefined) {
    sets.push("status = ?");
    values.push(fields.status);
    if (fields.status === "approved") {
      sets.push("approved_at = ?");
      values.push(now());
    }
  }
  if (fields.featured !== undefined) {
    sets.push("featured = ?");
    values.push(fields.featured ? 1 : 0);
  }
  if (fields.show_photos !== undefined) {
    sets.push("show_photos = ?");
    values.push(fields.show_photos ? 1 : 0);
  }
  if (fields.notes !== undefined) {
    sets.push("notes = ?");
    values.push(fields.notes);
  }
  const db = await requireD1();
  // Only a submitted review can be moderated (an unused link has nothing to approve).
  const res = await db
    .prepare(`UPDATE reviews SET ${sets.join(", ")} WHERE id = ? AND status != 'invited'`)
    .bind(...values, id)
    .run();
  if (res.meta.changes !== 1) throw new Error("This review has not been submitted yet.");
}

/** Deletes an unused invite only (a submitted review is hidden, never deleted). */
export async function deleteInvite(id: string): Promise<boolean> {
  const db = await requireD1();
  const res = await db.prepare("DELETE FROM reviews WHERE id = ? AND status = 'invited'").bind(id).run();
  return res.meta.changes === 1;
}

/** Approved reviews for public pages: featured first, then newest. */
export const getPublicReviews = cache(async (): Promise<PublicReview[]> => {
  const db = await getD1();
  if (!db) return [];
  try {
    const { results } = await db
      .prepare("SELECT * FROM reviews WHERE status = 'approved' AND consent_publish = 1 ORDER BY featured DESC, submitted_at DESC LIMIT 200")
      .all<Row>();
    return results.map(toRecord).map(toPublicReview).filter((r): r is PublicReview => r !== null);
  } catch (err) {
    console.error("[reviews] public read failed:", err);
    return [];
  }
});
