/** device.ts — coarse device class for analytics (no fingerprinting). */

/** Phone / tablet / desktop from the User-Agent (bots are dropped upstream by volume). */
export function deviceOf(ua: string | null): "phone" | "tablet" | "desktop" | null {
  if (!ua) return null;
  if (/iPad|Tablet|Nexus (7|9|10)|SM-T|Kindle|Silk/i.test(ua)) return "tablet";
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua)) return "phone";
  return "desktop";
}
