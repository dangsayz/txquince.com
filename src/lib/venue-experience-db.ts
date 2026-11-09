/**
 * venue-experience-db.ts — SERVER-ONLY storage for the owner's venue accounts
 * (D1 table venue_experience, migrations/0008_venue_experience.sql).
 */
import "server-only";
import { getD1, requireD1 } from "@/lib/d1";
import type { SaveExperienceInput, VenueExperience } from "@/lib/venue-experience";

const COLS = "venue_slug, verdict, body_en, body_es, updated_at";

/** The saved account for a venue, or null (none yet, or no database here). */
export async function getVenueExperience(slug: string): Promise<VenueExperience | null> {
  try {
    const db = await getD1();
    if (!db) return null;
    return await db.prepare(`SELECT ${COLS} FROM venue_experience WHERE venue_slug = ?`).bind(slug).first<VenueExperience>();
  } catch {
    // A page never fails because this optional section could not load.
    return null;
  }
}

export async function saveVenueExperience(input: SaveExperienceInput, by: string | null): Promise<VenueExperience> {
  const db = await requireD1();
  await db
    .prepare(
      `INSERT INTO venue_experience (venue_slug, verdict, body_en, body_es, updated_by) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (venue_slug) DO UPDATE SET
         verdict = excluded.verdict, body_en = excluded.body_en, body_es = excluded.body_es,
         updated_by = excluded.updated_by, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    )
    .bind(input.slug, input.verdict, input.body_en, input.body_es ?? null, by)
    .run();
  const saved = await db.prepare(`SELECT ${COLS} FROM venue_experience WHERE venue_slug = ?`).bind(input.slug).first<VenueExperience>();
  if (!saved) throw new Error("Saved, but could not read it back.");
  return saved;
}

export async function deleteVenueExperience(slug: string): Promise<boolean> {
  const db = await requireD1();
  const r = await db.prepare("DELETE FROM venue_experience WHERE venue_slug = ?").bind(slug).run();
  return r.meta.changes > 0;
}
