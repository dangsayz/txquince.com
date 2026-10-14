/**
 * image-slot-store.ts — SERVER-ONLY reads and writes of slot overrides.
 *
 * Reads are cheap: one query fetches every `image:*` row (only slots the
 * admin has actually changed have a row), memoised per request with React
 * `cache`, so a page with twenty <SlotImage>s still makes one round trip. Any
 * failure — Supabase down, not configured at build time, a malformed row —
 * reads as "no override" and the page renders its normal photo.
 *
 * Writes are read-modify-write with optimistic concurrency on `updated_at`,
 * the same contract as /api/admin/hero, so two saves at once never lose one.
 */
import "server-only";
import { cache } from "react";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getPortfolioBucket } from "@/lib/r2-portfolio";
import { getSlot } from "@/lib/image-slots";
import { parseSlotValue, EMPTY_VALUE, type SlotValue, type Version } from "@/lib/image-slot-state";
import { resolveSlotImage, type ResolvedSlotImage, type SlotFallback } from "@/lib/image-slot-resolve";
import { devSettings, devSlotBucket, isDev } from "@/lib/image-slot-dev";

const PREFIX = "image:";
export const settingsKey = (slotId: string) => `${PREFIX}${slotId}`;

/* ------------------------------- reads ------------------------------- */

/** Every stored slot value, keyed by slot id. One query per request. */
export const getAllSlotValues = cache(async (): Promise<Map<string, SlotValue>> => {
  const map = new Map<string, SlotValue>();
  try {
    let rows: { key: string; value: unknown }[] = [];
    if (isSupabaseConfigured()) {
      const { data, error } = await getServiceSupabase()
        .from("site_settings")
        .select("key, value")
        .like("key", `${PREFIX}%`);
      if (error || !data) return map;
      rows = data as { key: string; value: unknown }[];
    } else if (isDev()) {
      rows = await devSettings.readAll(PREFIX);
    }
    for (const row of rows) map.set(row.key.slice(PREFIX.length), parseSlotValue(row.value));
  } catch {
    /* fall back to the original photos */
  }
  return map;
});

export async function getSlotVersion(slotId: string): Promise<Version | null> {
  return (await getAllSlotValues()).get(slotId)?.current ?? null;
}

/** What a slot renders right now. Unknown ids throw (a programming error). */
export async function resolveSlot(slotId: string, fallback?: SlotFallback | null): Promise<ResolvedSlotImage> {
  const def = getSlot(slotId);
  if (!def) throw new Error(`Unknown image slot "${slotId}"`);
  return resolveSlotImage(def, await getSlotVersion(slotId), fallback);
}

/** Resolve several slots in one go (one shared read). */
export async function resolveSlots(
  entries: Record<string, SlotFallback | null | undefined>,
): Promise<Record<string, ResolvedSlotImage>> {
  const out: Record<string, ResolvedSlotImage> = {};
  await Promise.all(Object.entries(entries).map(async ([id, fb]) => void (out[id] = await resolveSlot(id, fb))));
  return out;
}

/* ------------------------------- writes ------------------------------ */

export class SlotStoreError extends Error {
  constructor(message: string, readonly status = 500) {
    super(message);
  }
}

type Row = { value: SlotValue; updatedAt: string | null };

async function readRow(slotId: string): Promise<Row> {
  const key = settingsKey(slotId);
  if (isSupabaseConfigured()) {
    const { data, error } = await getServiceSupabase()
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", key)
      .maybeSingle();
    if (error) throw new SlotStoreError("Could not read the saved photo. Try again.");
    if (!data) return { value: EMPTY_VALUE, updatedAt: null };
    return { value: parseSlotValue(data.value), updatedAt: (data.updated_at as string) ?? null };
  }
  if (isDev()) {
    const r = await devSettings.read(key);
    return r ? { value: parseSlotValue(r.value), updatedAt: r.updated_at } : { value: EMPTY_VALUE, updatedAt: null };
  }
  throw new SlotStoreError("Photo settings are not available here.", 503);
}

/** A fresh revision stamp, always later than the previous one. */
function nextStamp(prev: string | null): string {
  const now = Date.now();
  const before = prev ? Date.parse(prev) : 0;
  return new Date(Math.max(now, (Number.isFinite(before) ? before : 0) + 1)).toISOString();
}

async function writeRow(slotId: string, value: SlotValue, expected: string | null): Promise<boolean> {
  const key = settingsKey(slotId);
  const updated_at = nextStamp(expected);
  if (isSupabaseConfigured()) {
    const supabase = getServiceSupabase();
    const res =
      expected === null
        ? await supabase.from("site_settings").insert({ key, value, updated_at }).select("key").maybeSingle()
        : await supabase
            .from("site_settings")
            .update({ value, updated_at })
            .eq("key", key)
            .eq("updated_at", expected)
            .select("key")
            .maybeSingle();
    // A unique-key clash on insert or zero rows on update = someone else wrote first.
    if (res.error) {
      if (expected === null && (res.error as { code?: string }).code === "23505") return false;
      throw new SlotStoreError("Could not save. Try again.");
    }
    return Boolean(res.data);
  }
  if (isDev()) return devSettings.write(key, value, expected, updated_at);
  throw new SlotStoreError("Photo settings are not available here.", 503);
}

/**
 * Apply `change` to the stored value and save it. Re-reads and retries when
 * another save landed in between. `change` may throw to refuse.
 */
export async function updateSlotValue(slotId: string, change: (v: SlotValue) => SlotValue): Promise<SlotValue> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const row = await readRow(slotId);
    const next = change(row.value);
    if (await writeRow(slotId, next, row.updatedAt)) return next;
  }
  throw new SlotStoreError("Someone else changed this photo at the same time. Reload and try again.", 409);
}

/** Read one slot fresh (no request cache) — for the admin API. */
export async function readSlotValue(slotId: string): Promise<SlotValue> {
  return (await readRow(slotId)).value;
}

/* ------------------------------- storage ----------------------------- */

export interface SlotBucket {
  get(key: string): Promise<{ body: ReadableStream; size: number; httpMetadata?: { contentType?: string } } | null>;
  put(
    key: string,
    value: ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ): Promise<unknown>;
}

/** The PORTFOLIO R2 bucket on Workers; a temp folder in `next dev`; else null. */
export async function getSlotBucket(): Promise<SlotBucket | null> {
  const bucket = await getPortfolioBucket();
  if (bucket) return bucket as unknown as SlotBucket;
  return devSlotBucket();
}
