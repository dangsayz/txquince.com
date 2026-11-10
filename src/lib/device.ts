/** device.ts — coarse device class for analytics (no fingerprinting). */

/** Phone / tablet / desktop from the User-Agent (bots are dropped upstream by volume). */
export function deviceOf(ua: string | null): "phone" | "tablet" | "desktop" | null {
  if (!ua) return null;
  if (/iPad|Tablet|Nexus (7|9|10)|SM-T|Kindle|Silk/i.test(ua)) return "tablet";
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua)) return "phone";
  return "desktop";
}

/**
 * True for a visit that is not a person: crawlers, link previews, uptime
 * monitors, scripts, and automated browsers (the site's own test runs
 * included). These never count as visitors. An empty User-Agent is a script.
 */
const AUTOMATED_UA =
  /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|playwright|puppeteer|selenium|phantomjs|webdriver|python-requests|python-urllib|curl\/|wget\/|axios|node-fetch|undici|go-http-client|okhttp|facebookexternalhit|whatsapp\/|preview|monitor|uptime|pingdom|chatgpt-user|gptbot|claudebot|claude-web|perplexity|bytespider|semrush|ahrefs|scrapy/i;
export function isAutomatedUA(ua: string | null | undefined): boolean {
  return !ua || !ua.trim() || AUTOMATED_UA.test(ua);
}
