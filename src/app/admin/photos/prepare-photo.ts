/**
 * Browser-side photo prep before upload (ported from dnpixels prepare-upload):
 * turn the camera file the right way up (EXIF orientation), shrink it to at
 * most 2560px on the long edge (never enlarge), and save it as high-quality
 * WebP. Safari cannot make WebP in the browser, so it falls back to a JPEG and
 * the server converts it. Re-saving also strips GPS and other EXIF data.
 */
import { MAX_EDGE } from "@/lib/photo-dump-shared";

/** Phones decoding anything bigger risk running out of memory. */
export const MAX_SOURCE_BYTES = 80 * 1024 * 1024;

export type PreparedPhoto = { blob: Blob; w: number; h: number };

export function isHeic(file: File): boolean {
  return ["image/heic", "image/heif"].includes(file.type) || /\.hei[cf]$/i.test(file.name);
}

export function fileProblem(file: File): string | null {
  if (!file.size) return "This file is empty.";
  const looksLikePhoto = file.type.startsWith("image/") || /\.(jpe?g|png|webp|hei[cf]|avif|gif|tiff?)$/i.test(file.name);
  if (!looksLikePhoto) return "This is not a photo.";
  if (file.size > MAX_SOURCE_BYTES) return "This photo is over 80 MB. Save a smaller copy and try again.";
  return null;
}

async function decode(file: File, signal: AbortSignal): Promise<{ source: CanvasImageSource; w: number; h: number; done(): void }> {
  signal.throwIfAborted();
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bitmap, w: bitmap.width, h: bitmap.height, done: () => bitmap.close() };
  } catch {
    // Older Safari: let an <img> decode it (it also honours EXIF orientation).
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    signal.throwIfAborted();
    if (!img.naturalWidth || !img.naturalHeight) throw new Error("empty");
    return { source: img, w: img.naturalWidth, h: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error(
      isHeic(file)
        ? "This iPhone photo (HEIC) can't be opened in this browser. Upload it from your iPhone, or save it as JPEG first."
        : "This photo could not be opened. Save it as a JPEG and try again.",
    );
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function preparePhoto(file: File, signal: AbortSignal): Promise<PreparedPhoto> {
  const img = await decode(file, signal);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.w, img.h));
  const w = Math.max(1, Math.round(img.w * scale));
  const h = Math.max(1, Math.round(img.h * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not prepare this photo. Try another browser.");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img.source, 0, 0, w, h);
    signal.throwIfAborted();
    let blob = await toBlob(canvas, "image/webp", 0.9);
    // Safari hands back a PNG when asked for WebP; send a JPEG instead.
    if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", 0.92);
    signal.throwIfAborted();
    if (!blob || !blob.size) throw new Error("This photo could not be prepared. Try again.");
    return { blob, w, h };
  } finally {
    img.done();
    canvas.width = 0;
    canvas.height = 0;
  }
}

/** A long camera file name, shortened for a status line. */
export function shortName(name: string): string {
  if (name.length <= 32) return name;
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 && name.length - dot <= 6 ? name.slice(dot) : "";
  return `${name.slice(0, 24)}…${ext}`;
}
