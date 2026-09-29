import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { parseVideoUrl } from "@/lib/video";
import { resolveHeroFocus } from "@/lib/hero-focus";

export const dynamic = "force-dynamic";

const KEY = "hero_media";

function bust() {
  revalidatePath("/");
}

const Schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("image"),
    imageUrl: z.string().url("Upload a photo first."),
    imageAlt: z.string().max(200).optional().default(""),
  }),
  z.object({
    kind: z.literal("video"),
    videoUrl: z.string().url("Paste a valid video link."),
  }),
]);

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  let value: Record<string, unknown>;
  if (parsed.data.kind === "image") {
    value = {
      kind: "image",
      imageUrl: parsed.data.imageUrl,
      imageAlt: parsed.data.imageAlt || "Quinceañera portrait",
      ...resolveHeroFocus({}),
    };
  } else {
    const v = parseVideoUrl(parsed.data.videoUrl);
    if (!v.embedUrl) {
      return NextResponse.json(
        { error: "That link can't be embedded. Use a YouTube, Vimeo, or direct .mp4 link." },
        { status: 400 },
      );
    }
    value = {
      kind: "video",
      videoUrl: v.url,
      provider: v.provider,
      videoId: v.videoId,
      posterUrl: v.posterUrl,
    };
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ key: KEY, value, updated_at: new Date().toISOString() })
    .select("updated_at")
    .single();
  if (error || !data) return NextResponse.json({ error: "Could not save the hero." }, { status: 500 });

  bust();
  return NextResponse.json({
    ok: true,
    value: {
      ...value,
      imageUrl: parsed.data.kind === "image" ? "/api/img/hero" : null,
      updatedAt: data.updated_at,
    },
  });
}

const FocusSchema = z.object({
  focusX: z.number().min(0).max(1),
  focusY: z.number().min(0).max(1),
  expectedUpdatedAt: z.string().datetime({ offset: true }),
});

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = FocusSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a point on the photo and try again." }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data: current, error: readError } = await supabase
    .from("site_settings")
    .select("value, updated_at")
    .eq("key", KEY)
    .maybeSingle();
  if (readError) return NextResponse.json({ error: "Could not load the hero." }, { status: 500 });
  if (!current || current.value?.kind !== "image") {
    return NextResponse.json({ error: "The homepage is no longer using this photo. Refresh and try again." }, { status: 409 });
  }
  if (current.updated_at !== parsed.data.expectedUpdatedAt) {
    return NextResponse.json({ error: "The hero changed in another tab. Refresh before saving." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("site_settings")
    .update({
      value: { ...current.value, focusX: parsed.data.focusX, focusY: parsed.data.focusY },
      updated_at: new Date().toISOString(),
    })
    .eq("key", KEY)
    .eq("updated_at", parsed.data.expectedUpdatedAt)
    .select("updated_at")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Could not save the focal point." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "The hero changed in another tab. Refresh before saving." }, { status: 409 });

  bust();
  return NextResponse.json({ ok: true, focusX: parsed.data.focusX, focusY: parsed.data.focusY, updatedAt: data.updated_at });
}

export async function DELETE() {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("site_settings").delete().eq("key", KEY);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  bust();
  return NextResponse.json({ ok: true });
}
