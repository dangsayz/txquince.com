/**
 * Browser-side: make the slot renditions from one chosen photo.
 *
 *  · decoded the right way up (EXIF orientation honoured)
 *  · one copy per width in renditionWidths(original width) — 480, 960, 1600,
 *    2400, each capped at the original, so nothing is ever enlarged
 *  · re-encoded through a canvas as WebP. A canvas holds only pixels, so the
 *    output carries no EXIF, GPS or camera data. Safari can't encode WebP and
 *    hands back PNG; then every copy is JPEG instead (also metadata-free).
 */
import { MAX_RENDITION_BYTES, renditionWidths } from "@/lib/image-slot-shared";

export type Rendition = { w: number; h: number; blob: Blob };
export type Encoded = { w: number; h: number; type: "image/webp" | "image/jpeg"; renditions: Rendition[] };

/** Phones decoding anything bigger risk running out of memory. */
export const MAX_SOURCE_BYTES = 80 * 1024 * 1024;

export function sourceProblem(file: File): string | null {
  if (!file.size) return "This file is empty.";
  const photo = file.type.startsWith("image/") || /\.(jpe?g|png|webp|hei[cf]|avif|gif)$/i.test(file.name);
  if (!photo) return "This is not a photo.";
  if (file.size > MAX_SOURCE_BYTES) return "This photo is over 80 MB. Save a smaller copy and try again.";
  return null;
}

export type Decoded = { source: CanvasImageSource; w: number; h: number; done(): void };

export async function decodePhoto(file: File): Promise<Decoded> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bitmap, w: bitmap.width, h: bitmap.height, done: () => bitmap.close() };
  } catch {
    /* older Safari: let an <img> decode it (it honours orientation too) */
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    if (!img.naturalWidth) throw new Error("empty");
    return { source: img, w: img.naturalWidth, h: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error(
      /\.hei[cf]$/i.test(file.name) || /hei[cf]/.test(file.type)
        ? "This iPhone photo (HEIC) can't be opened in this browser. Choose it from the Photos app on the iPhone, or save it as JPEG."
        : "This photo could not be opened. Save it as a JPEG and try again.",
    );
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function encodeRenditions(
  decoded: Decoded,
  onProgress?: (done: number, total: number) => void,
  /** "jpeg" for spots whose consumer can't read WebP (link previews). */
  prefer: "webp" | "jpeg" = "webp",
): Promise<Encoded> {
  const widths = renditionWidths(decoded.w);
  const out: Rendition[] = [];
  let type: Encoded["type"] = prefer === "jpeg" ? "image/jpeg" : "image/webp";
  // Largest first: draw each smaller copy from the original for best quality.
  for (const [i, w] of [...widths].reverse().entries()) {
    const h = Math.max(1, Math.round((decoded.h * w) / decoded.w));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("This browser could not prepare the photo. Try another browser.");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(decoded.source, 0, 0, w, h);
      let blob = type === "image/webp" ? await toBlob(canvas, "image/webp", 0.86) : null;
      if (!blob || blob.type !== "image/webp") {
        type = "image/jpeg";
        blob = await toBlob(canvas, "image/jpeg", 0.9);
      }
      if (!blob?.size) throw new Error("This photo could not be prepared. Try again.");
      if (blob.size > MAX_RENDITION_BYTES) throw new Error("This photo is too detailed to upload. Try a smaller copy.");
      out.push({ w, h, blob });
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
    onProgress?.(i + 1, widths.length);
  }
  // If Safari fell back to JPEG part-way, redo the earlier copies as JPEG too.
  if (type === "image/jpeg" && out.some((r) => r.blob.type !== "image/jpeg")) {
    for (const r of out) {
      if (r.blob.type === "image/jpeg") continue;
      const canvas = document.createElement("canvas");
      canvas.width = r.w;
      canvas.height = r.h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(decoded.source, 0, 0, r.w, r.h);
      r.blob = (await toBlob(canvas, "image/jpeg", 0.9)) ?? r.blob;
    }
  }
  return { w: decoded.w, h: decoded.h, type, renditions: out.sort((a, b) => a.w - b.w) };
}
