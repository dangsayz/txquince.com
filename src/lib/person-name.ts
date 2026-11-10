/**
 * person-name.ts — what counts as a person's name on a signed agreement.
 * Letters (any language, accents included), spaces, apostrophes, hyphens and
 * periods. No digits, symbols or emoji. A signature name needs a first and a
 * last name. Used by the form (as she types) and by the server (the rule).
 */
const NAME_CHARS = /[^\p{L}\p{M} '’.\-]/gu;
const FULL_NAME = /^\p{L}[\p{L}\p{M}'’.\-]*(?: \p{L}[\p{L}\p{M}'’.\-]*)+$/u;
export const NAME_MAX = 80;

/** Strips what a name can't contain and squeezes spaces, as she types. */
export function cleanNameInput(v: string): string {
  return v.replace(NAME_CHARS, "").replace(/\s{2,}/g, " ").replace(/^\s+/, "").slice(0, NAME_MAX);
}

/** "Maria Garcia", "Ana María de la O", "Mary-Jo O'Neil": yes. "dfdf43", "Maria", "x y": no. */
export function isFullName(v: string): boolean {
  const s = v.trim();
  if (s.length < 5 || s.length > NAME_MAX || !FULL_NAME.test(s)) return false;
  return s.split(" ").filter((w) => w.replace(/[^\p{L}]/gu, "").length >= 2).length >= 2;
}

const SMALL = new Set(["de", "del", "la", "las", "los", "y", "da", "do", "dos", "van", "von"]);
/**
 * "vida" → "Vida", "MARIA DE LA O" → "Maria de la O", "o'neil" → "O'Neil".
 * Only fixes words typed all in one case; "McKenna" or "DeShawn" stay as typed.
 */
export function tidyName(v: string): string {
  return v
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w, i) => {
      if (!w || (w !== w.toLowerCase() && w !== w.toUpperCase())) return w;
      const low = w.toLowerCase();
      if (i > 0 && SMALL.has(low)) return low;
      return low.replace(/(^|[-'’])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
    })
    .join(" ");
}
