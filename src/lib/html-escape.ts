/**
 * Escape text for HTML/XML element content AND quoted attribute values.
 * Quotes matter: values land in href="tel:…" / href="mailto:…" attributes in
 * the emails, where an unescaped `"` would end the attribute.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
