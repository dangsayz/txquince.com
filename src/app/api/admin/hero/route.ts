import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { parseVideoUrl } from "@/lib/video";

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
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: KEY, value, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  bust();
  return NextResponse.json({ ok: true, value });
}

export async function DELETE() {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("site_settings").delete().eq("key", KEY);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  bust();
  return NextResponse.json({ ok: true });
}
