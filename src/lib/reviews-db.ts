/**
 * reviews-db.ts — SERVER-ONLY data access for first-party reviews (service
 * role; the table is RLS-locked). Public reads degrade to [] when the
 * database isn't configured or migration 0027 hasn't run, so the homepage
 * never crashes on a missing table.
 */
import "server-only";
import { cache } from "react";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
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

const COLUMNS =
  "id, slug, created_at, status, invite_name, daughter_name, event_date, submitted_at, rating, body, display_name, city, language, photo_paths, consent_publish, consent_photos, approved_at, featured, show_photos, notes";

function toRecord(row: Record<string, unknown>): ReviewRecord {
  return {
    ...(row as unknown as ReviewRecord),
    status: REVIEW_STATUSES.includes(row.status as ReviewStatus) ? (row.status as ReviewStatus) : "invited",
    language: row.language === "es" ? "es" : "en",
    photo_paths: Array.isArray(row.photo_paths) ? (row.photo_paths as string[]) : [],
  };
}

export async function createInvite(input: InviteInput): Promise<ReviewRecord> {
  const supabase = getServiceSupabase();
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase
      .from("reviews")
      .insert({ slug: generatePlanSlug(), ...input })
      .select(COLUMNS)
      .single();
    if (!error && data) return toRecord(data);
    if (error?.code !== "23505") throw new Error(error?.message ?? "insert failed");
  }
  throw new Error("could not allocate a review link");
}

export async function getReviewBySlug(slug: string): Promise<ReviewRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await getServiceSupabase().from("reviews").select(COLUMNS).eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toRecord(data) : null;
}

export async function getReviewById(id: string): Promise<ReviewRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await getServiceSupabase().from("reviews").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toRecord(data) : null;
}

/**
 * The one-time step: only an 'invited' row can be submitted. The status filter
 * is in the UPDATE itself, so two taps (or a forwarded link) can't both win.
 */
export async function submitReview(slug: string, input: SubmitInput): Promise<boolean> {
  const { data, error } = await getServiceSupabase()
    .from("reviews")
    .update({
      status: "pending",
      submitted_at: new Date().toISOString(),
      rating: input.rating,
      body: input.body,
      display_name: input.display_name,
      daughter_name: input.daughter_name,
      city: input.city,
      language: input.language,
      photo_paths: input.photos,
      consent_publish: input.consent_publish,
      consent_photos: input.consent_photos,
    })
    .eq("slug", slug)
    .eq("status", "invited")
    .select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length === 1;
}

export async function listReviews(): Promise<ReviewRecord[]> {
  const { data, error } = await getServiceSupabase()
    .from("reviews")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toRecord);
}

export async function updateReview(
  id: string,
  fields: Partial<Pick<ReviewRecord, "status" | "featured" | "show_photos" | "notes">>,
): Promise<void> {
  const patch: Record<string, unknown> = { ...fields };
  if (fields.status === "approved") patch.approved_at = new Date().toISOString();
  // Only a submitted review can be moderated (an unused link has nothing to approve).
  const { data, error } = await getServiceSupabase().from("reviews").update(patch).eq("id", id).neq("status", "invited").select("id");
  if (error) throw new Error(error.message);
  if ((data ?? []).length !== 1) throw new Error("This review has not been submitted yet.");
}

/** Deletes an unused invite only (a submitted review is hidden, never deleted). */
export async function deleteInvite(id: string): Promise<boolean> {
  const { data, error } = await getServiceSupabase().from("reviews").delete().eq("id", id).eq("status", "invited").select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length === 1;
}

/** Approved reviews for public pages: featured first, then newest. */
export const getPublicReviews = cache(async (): Promise<PublicReview[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await getServiceSupabase()
      .from("reviews")
      .select(COLUMNS)
      .eq("status", "approved")
      .eq("consent_publish", true)
      .order("featured", { ascending: false })
      .order("submitted_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[reviews] public read failed:", error.message);
      return [];
    }
    return (data ?? []).map(toRecord).map(toPublicReview).filter((r): r is PublicReview => r !== null);
  } catch (err) {
    console.error("[reviews] public read crashed:", err);
    return [];
  }
});
