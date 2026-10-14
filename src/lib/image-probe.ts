/**
 * image-probe.ts — read an uploaded image's real type, pixel size, and
 * whether it still carries EXIF/XMP metadata, from its bytes (never trusting
 * the declared content-type). Pure; used by the slot upload API.
 */

export type Sniffed = { type: "webp" | "jpeg"; width: number; height: number; hasMetadata: boolean };

const ascii = (b: Uint8Array, at: number, n: number) => String.fromCharCode(...b.subarray(at, at + n));

function sniffWebp(b: Uint8Array): Sniffed | null {
  if (b.length < 20 || ascii(b, 0, 4) !== "RIFF" || ascii(b, 8, 4) !== "WEBP") return null;
  let width = 0;
  let height = 0;
  let hasMetadata = false;
  let at = 12;
  while (at + 8 <= b.length) {
    const fourcc = ascii(b, at, 4);
    const size = b[at + 4] | (b[at + 5] << 8) | (b[at + 6] << 16) | (b[at + 7] << 24);
    const d = at + 8;
    if (size < 0 || d + size > b.length) break;
    if (fourcc === "VP8X" && size >= 10) {
      width = 1 + (b[d + 4] | (b[d + 5] << 8) | (b[d + 6] << 16));
      height = 1 + (b[d + 7] | (b[d + 8] << 8) | (b[d + 9] << 16));
      if (b[d] & 0x0c) hasMetadata = true; // EXIF (0x08) or XMP (0x04) flag
    } else if (fourcc === "VP8 " && size >= 10 && !width) {
      if (b[d + 3] !== 0x9d || b[d + 4] !== 0x01 || b[d + 5] !== 0x2a) return null;
      width = (b[d + 6] | (b[d + 7] << 8)) & 0x3fff;
      height = (b[d + 8] | (b[d + 9] << 8)) & 0x3fff;
    } else if (fourcc === "VP8L" && size >= 5 && !width) {
      if (b[d] !== 0x2f) return null;
      const bits = (b[d + 1] | (b[d + 2] << 8) | (b[d + 3] << 16) | (b[d + 4] << 24)) >>> 0;
      width = (bits & 0x3fff) + 1;
      height = ((bits >>> 14) & 0x3fff) + 1;
    } else if (fourcc === "EXIF" || fourcc === "XMP ") {
      hasMetadata = true;
    }
    at = d + size + (size & 1);
  }
  return width && height ? { type: "webp", width, height, hasMetadata } : null;
}

function sniffJpeg(b: Uint8Array): Sniffed | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let at = 2;
  let hasMetadata = false;
  while (at + 4 <= b.length) {
    if (b[at] !== 0xff) return null;
    const marker = b[at + 1];
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      at += 2;
      continue;
    }
    const len = (b[at + 2] << 8) | b[at + 3];
    const d = at + 4;
    if (marker === 0xe1) {
      const head = ascii(b, d, Math.min(29, Math.max(0, len - 2)));
      if (head.startsWith("Exif") || head.startsWith("http://ns.adobe.com/xap")) hasMetadata = true;
    }
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof && d + 5 <= b.length) {
      const height = (b[d + 1] << 8) | b[d + 2];
      const width = (b[d + 3] << 8) | b[d + 4];
      return width && height ? { type: "jpeg", width, height, hasMetadata } : null;
    }
    if (marker === 0xda || len < 2) return null; // image data before a size → malformed
    at += 2 + len;
  }
  return null;
}

export function probeImage(bytes: ArrayBuffer | Uint8Array): Sniffed | null {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return sniffWebp(b) ?? sniffJpeg(b);
}
