/** Test-only: minimal WebP / JPEG byte headers with a chosen size. */

function u32le(n: number): number[] {
  return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
}

const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

/** A lossless (VP8L) WebP header of `w`×`h`; `exif` appends an EXIF chunk. */
export function fakeWebp(w: number, h: number, opts: { exif?: boolean } = {}): Uint8Array<ArrayBuffer> {
  const bits = ((w - 1) & 0x3fff) | (((h - 1) & 0x3fff) << 14);
  const vp8l = [...ascii("VP8L"), ...u32le(5), 0x2f, ...u32le(bits >>> 0), 0];
  const exif = opts.exif ? [...ascii("EXIF"), ...u32le(4), ...ascii("GPS!")] : [];
  const body = [...ascii("WEBP"), ...vp8l, ...exif];
  return new Uint8Array([...ascii("RIFF"), ...u32le(body.length), ...body]);
}

/** A baseline JPEG header of `w`×`h`; `exif` adds an APP1 Exif segment. */
export function fakeJpeg(w: number, h: number, opts: { exif?: boolean } = {}): Uint8Array<ArrayBuffer> {
  const app1 = opts.exif ? [0xff, 0xe1, 0x00, 0x0a, ...ascii("Exif"), 0, 0, 0, 0] : [];
  const sof = [0xff, 0xc0, 0x00, 0x11, 8, (h >> 8) & 0xff, h & 0xff, (w >> 8) & 0xff, w & 0xff, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1];
  return new Uint8Array([0xff, 0xd8, ...app1, ...sof, 0xff, 0xd9]);
}
