/**
 * Serialize structured data for <script type="application/ld+json">.
 *
 * JSON.stringify alone is NOT safe inside a <script>: a value containing
 * "</script>" ends the element early and whatever follows runs as HTML. Venue
 * copy, vendor names and blog text are admin- or content-supplied, so escape
 * every `<` (and, for good measure, `>`, `&`, and the two JavaScript line
 * terminators U+2028/U+2029) as JSON unicode escapes. The parsed JSON is
 * identical; only its text form changes.
 */
const ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  [String.fromCharCode(0x2028)]: "\\u2028",
  [String.fromCharCode(0x2029)]: "\\u2029",
};
const UNSAFE = new RegExp(`[<>&${String.fromCharCode(0x2028)}${String.fromCharCode(0x2029)}]`, "g");

export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(UNSAFE, (ch) => ESCAPES[ch]);
}
