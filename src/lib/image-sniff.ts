/**
 * Identify an uploaded image by its first bytes (magic numbers), not by the
 * file name or the Content-Type the browser claims.
 */

/** Admin uploads are pre-optimized in the browser; the raw fallback stays well under this. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export type ImageKind = { ext: "jpg" | "png" | "webp" | "avif"; type: string };

const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.slice(from, to));

export function sniffImage(b: Uint8Array): ImageKind | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (b.length >= 8 && b[0] === 0x89 && ascii(b, 1, 4) === "PNG" && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) {
    return { ext: "png", type: "image/png" };
  }
  if (b.length >= 12 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  // ISO-BMFF: [size]["ftyp"][brand] — AVIF still images use "avif", sequences "avis".
  if (b.length >= 12 && ascii(b, 4, 8) === "ftyp" && /^avi[fs]$/.test(ascii(b, 8, 12))) return { ext: "avif", type: "image/avif" };
  return null;
}
