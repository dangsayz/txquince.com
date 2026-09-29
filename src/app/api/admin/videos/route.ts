import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { parseVideoUrl, isShortsUrl } from "@/lib/video";

export const dynamic = "force-dynamic";

function bust() {
  revalidatePath("/");
  revalidatePath("/portfolio");
}

// Add a video from a pasted link.
const AddSchema = z.object({
  url: z.string().url("Paste a valid link."),
  title: z.string().max(200).optional().default(""),
  poster_url: z.string().url().optional().or(z.literal("")),
  orientation: z.enum(["landscape", "vertical"]).optional(),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = AddSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }
  const { url, title, poster_url, orientation } = parsed.data;
  const v = parseVideoUrl(url);

  const supabase = getServiceSupabase();
  const { data: maxRow } = await supabase
    .from("videos")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("videos")
    .insert({
      url: v.url,
      provider: v.provider,
      video_id: v.videoId,
      title,
      poster_url: poster_url || v.posterUrl,
      orientation: orientation ?? (isShortsUrl(url) ? "vertical" : "landscape"),
      sort_order,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  bust();
  return NextResponse.json({ video: data });
}

const UpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(200).optional(),
  poster_url: z.string().url().optional().or(z.literal("")),
  is_feature: z.boolean().optional(),
  orientation: z.enum(["landscape", "vertical"]).optional(),
});

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = UpdateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { id, ...fields } = parsed.data;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("videos")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  bust();
  return NextResponse.json({ video: data });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  bust();
  return NextResponse.json({ ok: true });
}
