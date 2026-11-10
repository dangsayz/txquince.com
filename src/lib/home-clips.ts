/**
 * home-clips.ts — SERVER-ONLY storage for the homepage's background film loops.
 *
 * R2 (PORTFOLIO bucket), no database:
 *   home-film/<slot>-<stamp>.mp4   the clip (served by /api/photos/film/<name>)
 *   config/home-clips.json         which clip plays in which slot
 *
 * Set in Studio → Website → Page imagery. With no clip the section keeps its photo.
 */
import "server-only";
import { getPortfolioBucket } from "@/lib/r2-portfolio";
import { clampFocus, clipName, isHomeClipSlot, type HomeClips, type HomeClipSlot } from "@/lib/home-clip-shared";

const MANIFEST = "config/home-clips.json";

/** The clips in use; empty when storage is unreachable (the page shows its photos). */
export async function getHomeClips(): Promise<HomeClips> {
  try {
    const bucket = await getPortfolioBucket();
    const obj = await bucket?.get(MANIFEST);
    if (!obj) return {};
    const raw: unknown = await new Response(obj.body).json();
    if (!raw || typeof raw !== "object") return {};
    const out: HomeClips = {};
    for (const [slot, v] of Object.entries(raw as Record<string, unknown>)) {
      const c = v as { name?: unknown; size?: unknown; updatedAt?: unknown; focusX?: unknown } | null;
      if (isHomeClipSlot(slot) && c && typeof c.name === "string" && /^[a-z0-9][a-z0-9-]{0,80}\.mp4$/.test(c.name)) {
        out[slot] = { name: c.name, size: Number(c.size) || 0, updatedAt: String(c.updatedAt ?? ""), focusX: clampFocus(c.focusX) };
      }
    }
    return out;
  } catch {
    return {};
  }
}

async function write(clips: HomeClips) {
  const bucket = await getPortfolioBucket();
  if (!bucket) throw new Error("Storage not available");
  const body = new TextEncoder().encode(JSON.stringify(clips));
  await bucket.put(MANIFEST, body.buffer as ArrayBuffer, { httpMetadata: { contentType: "application/json" } });
}

/** Store a new clip for a slot and retire the one it replaces. */
export async function saveHomeClip(slot: HomeClipSlot, bytes: ArrayBuffer): Promise<HomeClips> {
  const bucket = await getPortfolioBucket();
  if (!bucket) throw new Error("Storage not available");
  const clips = await getHomeClips();
  const previous = clips[slot]?.name;
  const name = clipName(slot, Date.now());
  await bucket.put(`home-film/${name}`, bytes, { httpMetadata: { contentType: "video/mp4" } });
  clips[slot] = { name, size: bytes.byteLength, updatedAt: new Date().toISOString() };
  await write(clips);
  if (previous && previous !== name) await bucket.delete(`home-film/${previous}`).catch(() => undefined);
  return clips;
}

/** Move the part of the clip kept in view; null when the slot has no clip. */
export async function setHomeClipFocus(slot: HomeClipSlot, focusX: number): Promise<HomeClips | null> {
  const clips = await getHomeClips();
  const clip = clips[slot];
  if (!clip) return null;
  clips[slot] = { ...clip, focusX: clampFocus(focusX) };
  await write(clips);
  return clips;
}

/** Back to the photo. */
export async function removeHomeClip(slot: HomeClipSlot): Promise<HomeClips> {
  const bucket = await getPortfolioBucket();
  if (!bucket) throw new Error("Storage not available");
  const clips = await getHomeClips();
  const previous = clips[slot]?.name;
  delete clips[slot];
  await write(clips);
  if (previous) await bucket.delete(`home-film/${previous}`).catch(() => undefined);
  return clips;
}
