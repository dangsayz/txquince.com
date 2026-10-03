import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { parseVideoUrl } from "@/lib/video";
import { heroMediaFromSetting } from "@/lib/content-db";
import { getPortfolioBucket } from "@/lib/r2-portfolio";
import { HeroFocusSchema, HeroImageInfoSchema, HeroPublishSchema, HeroResetSchema } from "@/lib/hero-cover";

export const dynamic = "force-dynamic";
const KEY = "hero_media";
const conflict = () => NextResponse.json({ error: "The cover changed in another tab. Load the latest cover before saving your draft." }, { status: 409 });

function bust() {
  revalidatePath("/");
  revalidatePath("/es");
  revalidatePath("/admin/hero");
}

function nextRevision(previous: string | null): string {
  return new Date(Math.max(Date.now(), previous ? Date.parse(previous) + 1 : 0)).toISOString();
}

interface ImageInspector {
  info(stream: ReadableStream): Promise<unknown>;
}

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  try {
    const { data, error } = await getServiceSupabase().from("site_settings").select("value, updated_at").eq("key", KEY).maybeSingle();
    if (error) return NextResponse.json({ error: "Could not load the cover. Try again." }, { status: 500 });
    return NextResponse.json({ value: data ? heroMediaFromSetting(data.value, data.updated_at) : null });
  } catch {
    return NextResponse.json({ error: "Could not load the cover. Try again." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = HeroPublishSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the cover details and try again." }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();
    let value: Record<string, unknown>;
    if (parsed.data.kind === "image") {
      let storagePath: string;
      if (parsed.data.source.kind === "portfolio") {
        const { data, error } = await supabase.from("portfolio_images").select("storage_path").eq("slug", parsed.data.source.slug).maybeSingle();
        if (error) return NextResponse.json({ error: "Could not load this photograph. Try again." }, { status: 500 });
        if (!data?.storage_path || typeof data.storage_path !== "string") {
          return NextResponse.json({ error: "That photograph is no longer in your portfolio. Choose another photograph." }, { status: 400 });
        }
        storagePath = data.storage_path;
      } else {
        storagePath = parsed.data.source.storagePath;
      }
      const bucket = await getPortfolioBucket();
      let inspector: ImageInspector | undefined;
      try {
        const { getCloudflareContext } = await import("@opennextjs/cloudflare");
        inspector = (getCloudflareContext().env as { IMAGES?: ImageInspector }).IMAGES;
      } catch {
        inspector = undefined;
      }
      if (!bucket || !inspector) {
        return NextResponse.json({ error: "Photo publishing is temporarily unavailable. Keep your draft and try again later." }, { status: 503 });
      }
      const object = await bucket.get(storagePath);
      if (!object) return NextResponse.json({ error: "The photo upload could not be found. Select the file again or choose another photograph." }, { status: 400 });
      if (!object.size || object.size > 20_000_000) {
        return NextResponse.json({ error: "Choose a photograph smaller than 20 MB." }, { status: 400 });
      }
      let decoded: unknown;
      try {
        decoded = await inspector.info(object.body);
      } catch {
        return NextResponse.json({ error: "This file could not be read as a photograph. Use a JPEG, PNG, WebP, or AVIF image." }, { status: 400 });
      }
      const info = HeroImageInfoSchema.safeParse(decoded);
      if (!info.success) return NextResponse.json({ error: "Use a JPEG, PNG, WebP, or AVIF photograph." }, { status: 400 });
      value = {
        kind: "image",
        storage_path: storagePath,
        imageAlt: parsed.data.imageAlt,
        focusX: parsed.data.focusX,
        focusY: parsed.data.focusY,
        width: info.data.width,
        height: info.data.height,
      };
    } else {
      const video = parseVideoUrl(parsed.data.videoUrl);
      if (!video.embedUrl) return NextResponse.json({ error: "Use a YouTube, Vimeo, or direct video file link." }, { status: 400 });
      value = { kind: "video", videoUrl: video.url, provider: video.provider, videoId: video.videoId, posterUrl: video.posterUrl };
    }
    const expected = parsed.data.expectedUpdatedAt;
    const row = { key: KEY, value, updated_at: nextRevision(expected) };
    const result = expected === null
      ? await supabase.from("site_settings").insert(row).select("value, updated_at").maybeSingle()
      : await supabase.from("site_settings").update({ value, updated_at: row.updated_at }).eq("key", KEY).eq("updated_at", expected).select("value, updated_at").maybeSingle();
    if (result.error?.code === "23505") return conflict();
    if (result.error) return NextResponse.json({ error: "Could not publish the cover. Your draft is still available to retry." }, { status: 500 });
    if (!result.data) return conflict();
    const media = heroMediaFromSetting(result.data.value, result.data.updated_at);
    if (!media) return NextResponse.json({ error: "Could not load the published cover. Load the latest cover before trying again." }, { status: 500 });
    bust();
    return NextResponse.json({ ok: true, value: media });
  } catch {
    return NextResponse.json({ error: "Could not publish the cover. Your draft is still available to retry." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = HeroFocusSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Choose a focal point and check the photo description." }, { status: 400 });
  try {
    const supabase = getServiceSupabase();
    const { data: current, error: readError } = await supabase.from("site_settings").select("value, updated_at").eq("key", KEY).maybeSingle();
    if (readError) return NextResponse.json({ error: "Could not load the cover. Try again." }, { status: 500 });
    if (!current || current.value?.kind !== "image" || !heroMediaFromSetting(current.value, current.updated_at) || current.updated_at !== parsed.data.expectedUpdatedAt) return conflict();
    const value = { ...current.value, focusX: parsed.data.focusX, focusY: parsed.data.focusY, ...(parsed.data.imageAlt ? { imageAlt: parsed.data.imageAlt } : {}) };
    const { data, error } = await supabase.from("site_settings").update({ value, updated_at: nextRevision(parsed.data.expectedUpdatedAt) }).eq("key", KEY).eq("updated_at", parsed.data.expectedUpdatedAt).select("value, updated_at").maybeSingle();
    if (error) return NextResponse.json({ error: "Could not save the focal point. Try again." }, { status: 500 });
    if (!data) return conflict();
    const media = heroMediaFromSetting(data.value, data.updated_at);
    if (!media) return NextResponse.json({ error: "Could not confirm the saved cover. Load the latest cover before trying again." }, { status: 500 });
    bust();
    return NextResponse.json({ ok: true, value: media });
  } catch {
    return NextResponse.json({ error: "Could not save the focal point. Try again." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = HeroResetSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Load the latest cover before resetting it." }, { status: 400 });
  try {
    const { data, error } = await getServiceSupabase().from("site_settings").delete().eq("key", KEY).eq("updated_at", parsed.data.expectedUpdatedAt).select("key").maybeSingle();
    if (error) return NextResponse.json({ error: "Could not reset the cover. Try again." }, { status: 500 });
    if (!data) return conflict();
    bust();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not reset the cover. Try again." }, { status: 500 });
  }
}
