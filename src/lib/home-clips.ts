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
import { clampFocus, clipName, isHomeClipSlot, type ClipVariant, type HomeClips, type HomeClipSlot } from "@/lib/home-clip-shared";

const NAME_RE = /^[a-z0-9][a-z0-9-]{0,80}\.mp4$/;

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
      const c = v as { name?: unknown; size?: unknown; updatedAt?: unknown; focusX?: unknown; phone?: { name?: unknown; size?: unknown } | null } | null;
      if (isHomeClipSlot(slot) && c && typeof c.name === "string" && NAME_RE.test(c.name)) {
        out[slot] = { name: c.name, size: Number(c.size) || 0, updatedAt: String(c.updatedAt ?? ""), focusX: clampFocus(c.focusX) };
        const p = c.phone;
        if (p && typeof p.name === "string" && NAME_RE.test(p.name)) out[slot]!.phone = { name: p.name, size: Number(p.size) || 0 };
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

/**
 * Store a new clip for a slot and retire what it replaces. A new wide clip is
 * a new loop, so the tall cut of the old one goes with it. The tall cut needs
 * a wide clip first (null when there is none): every screen must have a file.
 */
export async function saveHomeClip(slot: HomeClipSlot, bytes: ArrayBuffer, variant: ClipVariant = "wide"): Promise<HomeClips | null> {
  const bucket = await getPortfolioBucket();
  if (!bucket) throw new Error("Storage not available");
  const clips = await getHomeClips();
  const current = clips[slot];
  if (variant === "phone" && !current) return null;
  const name = clipName(slot, Date.now(), variant);
  await bucket.put(`home-film/${name}`, bytes, { httpMetadata: { contentType: "video/mp4" } });
  const retired: string[] = [];
  if (variant === "phone" && current) {
    if (current.phone) retired.push(current.phone.name);
    clips[slot] = { ...current, phone: { name, size: bytes.byteLength } };
  } else {
    if (current) retired.push(current.name);
    if (current?.phone) retired.push(current.phone.name);
    clips[slot] = { name, size: bytes.byteLength, updatedAt: new Date().toISOString() };
  }
  await write(clips);
  for (const old of retired) if (old !== name) await bucket.delete(`home-film/${old}`).catch(() => undefined);
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

/** Back to the photo; with "phone", only the tall cut goes and phones play the wide clip again. */
export async function removeHomeClip(slot: HomeClipSlot, variant: ClipVariant = "wide"): Promise<HomeClips> {
  const bucket = await getPortfolioBucket();
  if (!bucket) throw new Error("Storage not available");
  const clips = await getHomeClips();
  const current = clips[slot];
  const retired: string[] = [];
  if (current?.phone) retired.push(current.phone.name);
  if (variant === "phone") {
    if (current) clips[slot] = { name: current.name, size: current.size, updatedAt: current.updatedAt, focusX: current.focusX };
  } else {
    if (current) retired.push(current.name);
    delete clips[slot];
  }
  await write(clips);
  for (const old of retired) await bucket.delete(`home-film/${old}`).catch(() => undefined);
  return clips;
}
