import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { getDashboardStats } from "@/lib/analytics-db";

export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  title: z.string().min(1, "Give the change a title.").max(200),
  area: z.string().max(200).optional(),
  reason: z.string().max(2000).optional(),
  target_metric: z.string().max(120).optional(),
  notes: z.string().max(2000).optional(),
});

const PatchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "reviewed", "archived"]),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = CreateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  // Snapshot the current funnel so the lift is measurable later.
  const stats = await getDashboardStats(14);
  const baseline = {
    bookedValue: stats.bookedValue,
    pipelineValue: stats.pipelineValue,
    openLeads: stats.openLeads,
    inquiryToBooked: stats.inquiryToBooked,
    bounceRate: stats.bounceRate,
    uniqueSessions: stats.uniqueSessions,
    rangeViews: stats.rangeViews,
  };

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("conversion_changes")
    .insert({
      title: parsed.data.title,
      area: parsed.data.area ?? null,
      reason: parsed.data.reason ?? null,
      target_metric: parsed.data.target_metric ?? null,
      notes: parsed.data.notes ?? null,
      baseline,
      status: "active",
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/admin");
  return NextResponse.json({ change: data });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = PatchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }
  const { id, status } = parsed.data;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("conversion_changes")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/admin");
  return NextResponse.json({ change: data });
}
