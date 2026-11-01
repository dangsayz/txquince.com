/**
 * plan-slug.ts — the short, unguessable id in /plan/<slug> (pure).
 *
 * The plan link gets pasted into public Facebook threads, so the slug must
 * carry NOTHING about the family (no name, date or city) and must not be
 * guessable. 10 characters from a 31-letter alphabet ≈ 49.5 bits of
 * randomness from the platform CSPRNG (crypto.getRandomValues), with
 * rejection sampling so every letter is equally likely. The alphabet drops
 * look-alikes (0/o, 1/l/i) so a slug read aloud or retyped still works.
 */

export const SLUG_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
export const SLUG_LENGTH = 10;
export const SLUG_RE = new RegExp(`^[${SLUG_ALPHABET}]{${SLUG_LENGTH}}$`);

type RandomSource = (bytes: Uint8Array) => Uint8Array;

const cryptoRandom: RandomSource = (bytes) => globalThis.crypto.getRandomValues(bytes);

/** A fresh slug. `random` is injectable for tests only. */
export function generatePlanSlug(random: RandomSource = cryptoRandom): string {
  const n = SLUG_ALPHABET.length; // 31
  const ceiling = 256 - (256 % n); // 248: bytes at or above this would bias the result
  let out = "";
  while (out.length < SLUG_LENGTH) {
    const buf = random(new Uint8Array(SLUG_LENGTH * 2));
    for (const b of buf) {
      if (b >= ceiling) continue;
      out += SLUG_ALPHABET[b % n];
      if (out.length === SLUG_LENGTH) break;
    }
  }
  return out;
}

export function isPlanSlug(v: unknown): v is string {
  return typeof v === "string" && SLUG_RE.test(v);
}
