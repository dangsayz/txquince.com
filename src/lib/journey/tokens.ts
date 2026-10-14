/**
 * tokens.ts — the family's private link.
 *
 * 32 random bytes, base64url (43 chars). Only sha256(token) is stored, so a
 * database leak can't be turned into working links. Lookups are by hash, and
 * the stored hash is compared to the computed one in constant time.
 */
import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const TOKEN_BYTES = 32;
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

export function newToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** Shape check only — never a reason to skip the hash compare. */
export function looksLikeToken(v: unknown): v is string {
  return typeof v === "string" && TOKEN_RE.test(v);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Constant-time equality of two hex digests (false on any length mismatch). */
export function hashesEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length !== bb.length || ab.length === 0) {
    // Burn the same work so a miss doesn't return measurably faster.
    timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32));
    return false;
  }
  return timingSafeEqual(ab, bb);
}

/** Constant-time compare of two secrets of any length (cron secret, legacy pay token). */
export function secretsEqual(expected: string | undefined | null, given: string | undefined | null): boolean {
  const e = createHash("sha256").update(expected ?? "", "utf8").digest();
  const g = createHash("sha256").update(given ?? "", "utf8").digest();
  return Boolean(expected) && Boolean(given) && timingSafeEqual(e, g);
}

export { refFor } from "./ref";
