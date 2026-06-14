import "server-only";
import { cache } from "react";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { packages, type Package } from "@/content/packages";

/**
 * collections-db.ts — admin-editable pricing collections.
 *
 * Stored as a single `site_settings` row (key = "collections", value =
 * { items: Package[] }) so it's CRUD-able with the service key — no dedicated
 * table, no migration. This is the SINGLE SOURCE for both the public display
 * AND the per-collection deposit, so a card and its checkout can never disagree.
 *
 * If the row is missing, malformed, or the DB is unconfigured, everything falls
 * back to the static collections in packages.ts — the site never breaks and
 * looks identical until the operator makes their first edit.
 */

const KEY = "collections";

/** Canonical seed + ultimate fallback. */
export const STATIC_COLLECTIONS: Package[] = packages;

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** Validate + normalize a stored array into Package[]. Returns null if unusable. */
function coerce(items: unknown): Package[] | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const out: Package[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== "string" || !r.id || typeof r.name !== "string") return null;
    const price = Number(r.price) || 0;
    const depositCents = Math.max(0, Math.round(Number(r.depositCents) || 0));
    out.push({
      id: r.id,
      name: r.name,
      price,
      priceLabel:
        typeof r.priceLabel === "string" && r.priceLabel ? r.priceLabel : money(price),
      hours: Math.max(0, Math.round(Number(r.hours) || 0)),
      singleCraft: Boolean(r.singleCraft),
      tagline: typeof r.tagline === "string" ? r.tagline : "",
      role: "",
      highlight: Boolean(r.highlight),
      badge: typeof r.badge === "string" && r.badge ? r.badge : undefined,
      includes: Array.isArray(r.includes)
        ? r.includes.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        : [],
      teaser: typeof r.teaser === "string" ? r.teaser : "",
      depositCents,
      depositLabel:
        typeof r.depositLabel === "string" && r.depositLabel
          ? r.depositLabel
          : money(depositCents / 100),
    });
  }
  // Only one tier may be highlighted.
  let seenHighlight = false;
  for (const c of out) {
    if (c.highlight && seenHighlight) c.highlight = false;
    if (c.highlight) seenHighlight = true;
  }
  return out;
}

/** Public read — DB collections if set, else the static fallback. Per-request cached. */
export const getCollections = cache(async (): Promise<Package[]> => {
  if (!isSupabaseConfigured()) return STATIC_COLLECTIONS;
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", KEY)
      .maybeSingle();
    if (error || !data?.value) return STATIC_COLLECTIONS;
    const items = (data.value as { items?: unknown }).items;
    return coerce(items) ?? STATIC_COLLECTIONS;
  } catch {
    return STATIC_COLLECTIONS;
  }
});

/** Single collection by id (DB-aware). Used in the booking/deposit path. */
export async function getCollection(id: string): Promise<Package | undefined> {
  return (await getCollections()).find((c) => c.id === id);
}

/** Replace the full ordered set (admin only — caller must check auth). */
export async function writeCollections(items: Package[]): Promise<void> {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: KEY, value: { items }, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  if (error) throw new Error(error.message);
}
