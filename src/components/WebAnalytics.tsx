import Script from "next/script";

/**
 * Cloudflare Web Analytics beacon — privacy-first, cookieless, no consent banner
 * needed. Replaces @vercel/analytics, which silently reports nothing on a
 * Cloudflare Workers deploy. Renders only when NEXT_PUBLIC_CF_BEACON_TOKEN is
 * set, so local dev and unconfigured builds stay clean.
 */
export function WebAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  if (!token) return null;
  return (
    <Script
      id="cf-web-analytics"
      strategy="afterInteractive"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token, spa: true })}
    />
  );
}
