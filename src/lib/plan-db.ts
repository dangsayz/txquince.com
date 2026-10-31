/**
 * plan-db.ts — SERVER-ONLY data access for quince plans, date availability
 * and the DFW price guide (service role; every table is RLS-locked).
 *
 * Mirrors clients-db.ts / content-db.ts: reads degrade to empty/safe values
 * when the database isn't configured or a migration hasn't run yet, so a
 * public page never crashes on a missing table.
 */
import "server-only";
import { cache } from "react";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { generatePlanSlug } from "@/lib/plan-slug";
import { isColorId } from "@/lib/quince-colors";
import {
  DATE_STATUSES,
  PLAN_STATUSES,
  resolveDateStatus,
  todayInDallas,
  type DateStatus,
  type PlanContact,
  type PlanInput,
  type PlanRecord,
  type PlanStatus,
} from "@/lib/plan";

const PLAN_COLUMNS =
  "id, slug, created_at, event_date, city, colors, theme, name, email, phone, language, source, attribution, status, booking_id, notes";

function toPlan(row: Record<string, unknown>): PlanRecord {
  const status = PLAN_STATUSES.includes(row.status as PlanStatus) ? (row.status as PlanStatus) : "new";
  return {
    ...(row as unknown as PlanRecord),
    colors: Array.isArray(row.colors) ? (row.colors as unknown[]).filter(isColorId) : [],
    language: row.language === "es" ? "es" : "en",
    status,
  };
}

/** Save a new plan and return it. Retries on the (astronomically rare) slug collision. */
export async function createPlan(
  input: PlanInput,
  contact: PlanContact,
  extra: { source: string | null; attribution: Record<string, string> | null },
): Promise<PlanRecord> {
  const supabase = getServiceSupabase();
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase
      .from("quince_plans")
      .insert({
        slug: generatePlanSlug(),
        event_date: input.event_date,
        city: input.city,
        colors: input.colors,
        theme: input.theme || null,
        name: input.name,
        email: contact.email,
        phone: contact.phone,
        language: input.language,
        source: extra.source,
        attribution: extra.attribution,
      })
      .select(PLAN_COLUMNS)
      .single();
    if (!error && data) return toPlan(data);
    if (error?.code !== "23505") throw new Error(error?.message ?? "insert failed");
  }
  throw new Error("could not allocate a plan slug");
}

export const getPlanBySlug = cache(async (slug: string): Promise<PlanRecord | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await getServiceSupabase()
      .from("quince_plans")
      .select(PLAN_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return toPlan(data);
  } catch {
    return null;
  }
});

/** Every plan, newest first (admin). */
export async function listPlans(): Promise<PlanRecord[]> {
  if (!isSupabaseConfigured()) throw new Error("The client database is not configured.");
  const { data, error } = await getServiceSupabase()
    .from("quince_plans")
    .select(PLAN_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error("Could not load plans. Has migration 0023 been applied?");
  return (data ?? []).map(toPlan);
}

export async function updatePlan(id: string, fields: { status?: PlanStatus; notes?: string | null }): Promise<void> {
  const { error } = await getServiceSupabase().from("quince_plans").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/* Date availability                                                    */
/* ------------------------------------------------------------------ */

export type AvailabilityRow = { event_date: string; status: DateStatus; note: string | null; updated_at: string };

const ACTIVE_BOOKING = ["requested", "pending_payment", "paid"];

/** True when a live hold or paid booking already claims this date. */
async function isDateTaken(date: string): Promise<boolean> {
  const { data, error } = await getServiceSupabase()
    .from("bookings")
    .select("id")
    .eq("event_date", date)
    .in("status", ACTIVE_BOOKING)
    .limit(1);
  if (error) return false;
  return (data ?? []).length > 0;
}

/** The status a family sees for one date (see resolveDateStatus). Never throws. */
export const getDateStatus = cache(async (date: string): Promise<DateStatus> => {
  const today = todayInDallas();
  if (!isSupabaseConfigured()) return resolveDateStatus({ date, today });
  try {
    const [override, taken] = await Promise.all([
      getServiceSupabase()
        .from("date_availability")
        .select("status")
        .eq("event_date", date)
        .maybeSingle()
        .then(({ data }) => (DATE_STATUSES.includes(data?.status as DateStatus) ? (data!.status as DateStatus) : null)),
      isDateTaken(date),
    ]);
    return resolveDateStatus({ date, override, taken, today });
  } catch {
    return resolveDateStatus({ date, today });
  }
});

/** Owner-set statuses from today on (admin). */
export async function listAvailability(): Promise<AvailabilityRow[]> {
  if (!isSupabaseConfigured()) throw new Error("The client database is not configured.");
  const { data, error } = await getServiceSupabase()
    .from("date_availability")
    .select("event_date, status, note, updated_at")
    .gte("event_date", todayInDallas())
    .order("event_date", { ascending: true });
  if (error) throw new Error("Could not load availability. Has migration 0023 been applied?");
  return (data ?? []) as AvailabilityRow[];
}

/** Future dates held or booked in the bookings table (admin context, no PII). */
export async function listBookedDates(): Promise<{ event_date: string; status: string }[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await getServiceSupabase()
    .from("bookings")
    .select("event_date, status")
    .in("status", ACTIVE_BOOKING)
    .gte("event_date", todayInDallas())
    .order("event_date", { ascending: true });
  return (data ?? []) as { event_date: string; status: string }[];
}

export async function setAvailability(date: string, status: DateStatus, note: string | null): Promise<void> {
  const supabase = getServiceSupabase();
  // "Available" with no note is the default: store nothing.
  if (status === "available" && !note) {
    const { error } = await supabase.from("date_availability").delete().eq("event_date", date);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase
    .from("date_availability")
    .upsert({ event_date: date, status, note, updated_at: new Date().toISOString() }, { onConflict: "event_date" });
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/* Price guide                                                          */
/* ------------------------------------------------------------------ */

export type PriceGuideRow = {
  id: string;
  category: string;
  category_es: string | null;
  low_usd: number;
  typical_usd: number;
  high_usd: number;
  sample_count: number;
  last_updated: string;
  sort_order: number;
  published: boolean;
};

const GUIDE_COLUMNS = "id, category, category_es, low_usd, typical_usd, high_usd, sample_count, last_updated, sort_order, published";

/** Published rows in display order. Empty when not configured / not migrated. */
export const getPriceGuide = cache(async (): Promise<PriceGuideRow[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await getServiceSupabase()
      .from("price_guide")
      .select(GUIDE_COLUMNS)
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("category", { ascending: true });
    if (error || !data) return [];
    return data as PriceGuideRow[];
  } catch {
    return [];
  }
});

export async function listPriceGuide(): Promise<PriceGuideRow[]> {
  if (!isSupabaseConfigured()) throw new Error("The client database is not configured.");
  const { data, error } = await getServiceSupabase()
    .from("price_guide")
    .select(GUIDE_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("category", { ascending: true });
  if (error) throw new Error("Could not load the price guide. Has migration 0023 been applied?");
  return (data ?? []) as PriceGuideRow[];
}

/** Replace the whole guide with freshly pasted rows (the lead sheet is the source of truth). */
export async function replacePriceGuide(rows: Omit<PriceGuideRow, "id" | "published">[]): Promise<void> {
  const supabase = getServiceSupabase();
  // Insert first, then delete the old rows by id, so a failed insert never
  // leaves the public page empty.
  const { data: old, error: readErr } = await supabase.from("price_guide").select("id");
  if (readErr) throw new Error(readErr.message);
  if (rows.length) {
    const { error } = await supabase.from("price_guide").insert(rows.map((r) => ({ ...r, published: true })));
    if (error) throw new Error(error.message);
  }
  const oldIds = (old ?? []).map((r) => r.id as string);
  if (oldIds.length) {
    const { error } = await supabase.from("price_guide").delete().in("id", oldIds);
    if (error) throw new Error(error.message);
  }
}
