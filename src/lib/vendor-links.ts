/**
 * Public link helpers for vendor records. Email/phone are NEVER turned into
 * public links — those stay admin-only by deliberate omission here.
 */

/** Full Instagram URL from a bare handle ("rosasblooms" → instagram.com/…). */
export function igUrl(handle: string | null | undefined): string | null {
  const h = (handle ?? "").trim().replace(/^@+/, "");
  return h ? `https://www.instagram.com/${h}/` : null;
}

/** Normalize a website to an absolute URL (prepend https:// if missing). */
export function websiteUrl(site: string | null | undefined): string | null {
  const s = (site ?? "").trim();
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

/** Pretty display form of a website ("https://rosas.com/" → "rosas.com"). */
export function websiteLabel(site: string | null | undefined): string | null {
  const u = websiteUrl(site);
  if (!u) return null;
  return u.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}
