/**
 * /api/admin/home-clip?slot=feature — read (GET), upload (POST, raw MP4 bytes)
 * or remove (DELETE) a homepage background film loop. Admin only. The bytes themselves
 * must be an MP4; the size cap keeps a loop a loop.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { isHomeClipSlot, isMp4, MAX_CLIP_BYTES } from "@/lib/home-clip-shared";
import { getHomeClips, removeHomeClip, saveHomeClip } from "@/lib/home-clips";

export const dynamic = "force-dynamic";

const TOO_LARGE = `That file is too large. A loop is 8 to 12 seconds and under ${MAX_CLIP_BYTES / 1024 / 1024} MB.`;

function refresh() {
  revalidatePath("/");
  revalidatePath("/es");
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const slot = new URL(request.url).searchParams.get("slot");
  if (!isHomeClipSlot(slot)) return NextResponse.json({ error: "Unknown place for a clip." }, { status: 400 });
  return NextResponse.json({ clip: (await getHomeClips())[slot] ?? null });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const slot = new URL(request.url).searchParams.get("slot");
  if (!isHomeClipSlot(slot)) return NextResponse.json({ error: "Unknown place for a clip." }, { status: 400 });
  if (Number(request.headers.get("content-length") || 0) > MAX_CLIP_BYTES) {
    return NextResponse.json({ error: TOO_LARGE }, { status: 413 });
  }
  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength) return NextResponse.json({ error: "Missing file body" }, { status: 400 });
  if (bytes.byteLength > MAX_CLIP_BYTES) return NextResponse.json({ error: TOO_LARGE }, { status: 413 });
  if (!isMp4(new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 16)))) {
    return NextResponse.json({ error: "Use an MP4 file (H.264)." }, { status: 415 });
  }
  try {
    const clips = await saveHomeClip(slot, bytes);
    refresh();
    return NextResponse.json({ ok: true, clip: clips[slot] ?? null });
  } catch {
    return NextResponse.json({ error: "Storage not available. Try again." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const slot = new URL(request.url).searchParams.get("slot");
  if (!isHomeClipSlot(slot)) return NextResponse.json({ error: "Unknown place for a clip." }, { status: 400 });
  try {
    await removeHomeClip(slot);
    refresh();
    return NextResponse.json({ ok: true, clip: null });
  } catch {
    return NextResponse.json({ error: "Storage not available. Try again." }, { status: 503 });
  }
}
