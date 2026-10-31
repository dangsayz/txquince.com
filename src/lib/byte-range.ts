/**
 * byte-range.ts — parse an HTTP `Range: bytes=…` header for one range.
 *
 * Safari (iOS and macOS) will not play a <video> unless the server answers
 * byte-range requests with 206 Partial Content, so the film route needs this.
 * Only a single range is supported (what browsers send for media); anything
 * else is treated as "no range" and the whole file is sent.
 *
 * Pure: safe for tests and any runtime.
 */

export type ByteRange = { offset: number; length: number };

/**
 * @returns the range to send, `null` for no (or an unsupported) range header,
 * or `"unsatisfiable"` when the range starts past the end of the file (416).
 */
export function parseByteRange(header: string | null, size: number): ByteRange | null | "unsatisfiable" {
  if (!header || size <= 0) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null;
  const [, a, b] = m;
  if (a === "" && b === "") return null;

  // Suffix range: the last N bytes.
  if (a === "") {
    const n = Number(b);
    if (!n) return "unsatisfiable";
    const length = Math.min(n, size);
    return { offset: size - length, length };
  }

  const start = Number(a);
  if (start >= size) return "unsatisfiable";
  const end = b === "" ? size - 1 : Math.min(Number(b), size - 1);
  if (end < start) return "unsatisfiable";
  return { offset: start, length: end - start + 1 };
}

/** `Content-Range` value for a range of a file of `size` bytes. */
export const contentRange = (r: ByteRange, size: number) => `bytes ${r.offset}-${r.offset + r.length - 1}/${size}`;
