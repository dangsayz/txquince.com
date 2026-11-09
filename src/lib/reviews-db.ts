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
  type ModerateInput,
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
    edit: row.edit_submitted_at
      ? {
          submitted_at: String(row.edit_submitted_at),
          rating: Number(row.edit_rating),
          body: String(row.edit_body ?? ""),
          display_name: String(row.edit_display_name ?? ""),
          daughter_name: str("edit_daughter_name"),
          city: str("edit_city"),
          language: row.edit_language === "es" ? "es" : "en",
          photo_paths: parsePaths(row.edit_photo_paths),
          consent_photos: Boolean(Number(row.edit_consent_photos)),
        }
      : null,
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

/**
 * The mom updates her review from the same link. Not approved yet → the update
 * simply replaces it (still pending). Approved or hidden → it waits in the
 * edit_* columns and the live version stays until the owner decides.
 * Returns "replaced", "queued", or null when there is nothing to update.
 */
export async function updateFromMom(slug: string, input: SubmitInput): Promise<"replaced" | "queued" | null> {
  const db = await requireD1();
  const t = now();
  const photos = JSON.stringify(input.photos);
  const replaced = await db
    .prepare(
      `UPDATE reviews SET submitted_at = ?, updated_at = ?, rating = ?, body = ?, display_name = ?, daughter_name = ?,
         city = ?, language = ?, photo_paths = ?, consent_publish = 1, consent_photos = ?
       WHERE slug = ? AND status = 'pending'`,
    )
    .bind(t, t, input.rating, input.body, input.display_name, input.daughter_name, input.city, input.language, photos, input.consent_photos ? 1 : 0, slug)
    .run();
  if (replaced.meta.changes === 1) return "replaced";
  const queued = await db
    .prepare(
      `UPDATE reviews SET updated_at = ?, edit_submitted_at = ?, edit_rating = ?, edit_body = ?, edit_display_name = ?,
         edit_daughter_name = ?, edit_city = ?, edit_language = ?, edit_photo_paths = ?, edit_consent_photos = ?
       WHERE slug = ? AND status IN ('approved', 'hidden')`,
    )
    .bind(t, t, input.rating, input.body, input.display_name, input.daughter_name, input.city, input.language, photos, input.consent_photos ? 1 : 0, slug)
    .run();
  return queued.meta.changes === 1 ? "queued" : null;
}

const CLEAR_EDIT =
  "edit_submitted_at = NULL, edit_rating = NULL, edit_body = NULL, edit_display_name = NULL, edit_daughter_name = NULL, edit_city = NULL, edit_language = NULL, edit_photo_paths = NULL, edit_consent_photos = NULL";

/**
 * Owner changes. Only a submitted review can be changed (an unused link has
 * nothing to approve). The mom's words and stars change only through her own
 * update ("edit: approve"), never directly.
 */
export async function updateReview(id: string, fields: Partial<Omit<ModerateInput, "id">>): Promise<void> {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [now()];
  const set = (col: string, v: unknown) => {
    sets.push(`${col} = ?`);
    values.push(v);
  };
  if (fields.status !== undefined) {
    set("status", fields.status);
    if (fields.status === "approved") set("approved_at", now());
  }
  if (fields.featured !== undefined) set("featured", fields.featured ? 1 : 0);
  if (fields.show_photos !== undefined) set("show_photos", fields.show_photos ? 1 : 0);
  if (fields.notes !== undefined) set("notes", fields.notes);
  if (fields.display_name !== undefined) set("display_name", fields.display_name);
  if (fields.daughter_name !== undefined) set("daughter_name", fields.daughter_name);
  if (fields.city !== undefined) set("city", fields.city);
  if (fields.event_date !== undefined) set("event_date", fields.event_date);
  if (fields.edit === "approve") {
    sets.push(
      `rating = edit_rating, body = edit_body, display_name = edit_display_name, daughter_name = edit_daughter_name,
       city = edit_city, language = edit_language, photo_paths = edit_photo_paths, consent_photos = edit_consent_photos,
       submitted_at = edit_submitted_at, ${CLEAR_EDIT}`,
    );
  } else if (fields.edit === "reject") {
    sets.push(CLEAR_EDIT);
  }
  const db = await requireD1();
  const guard = fields.edit ? " AND edit_submitted_at IS NOT NULL" : "";
  const res = await db
    .prepare(`UPDATE reviews SET ${sets.join(", ")} WHERE id = ? AND status != 'invited'${guard}`)
    .bind(...values, id)
    .run();
  if (res.meta.changes !== 1) throw new Error(fields.edit ? "There is no update waiting on this review." : "This review has not been submitted yet.");
}

/** Deletes a review or link for good. Returns every photo key it held, for R2 cleanup. */
export async function deleteReview(id: string): Promise<string[] | null> {
  const db = await requireD1();
  const row = await db.prepare("DELETE FROM reviews WHERE id = ? RETURNING photo_paths, edit_photo_paths").bind(id).first<Row>();
  if (!row) return null;
  return [...new Set([...parsePaths(row.photo_paths), ...parsePaths(row.edit_photo_paths)])];
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
