/**
 * TX Quince — follow-up cron Worker (Cloudflare).
 *
 * A tiny standalone Cloudflare Worker whose only job is to ping the app's
 * authenticated follow-up endpoint on a schedule. Platform-agnostic: it works
 * no matter where the Next app itself is hosted (Cloudflare Workers/OpenNext,
 * Pages, or elsewhere) because it just makes an authenticated HTTPS request.
 *
 * Deploy (from this folder):
 *   npx wrangler deploy
 *   npx wrangler secret put CRON_SECRET   # must match the app's CRON_SECRET env
 *
 * Schedule lives in wrangler.jsonc (triggers.crons). The app routes it calls
 * (/api/cron/followups, /api/cron/booking-recovery, /api/cron/review-requests)
 * 401 unless this exact secret is presented — so nothing sends until both
 * secrets are set.
 */
interface Env {
  TARGET_URL: string;
  CRON_SECRET: string;
  /** "on" also runs lead follow-ups + abandoned-booking recovery (emails leads). Owner's call; off until he says so. */
  LEAD_EMAILS?: string;
}

interface Ctx {
  waitUntil(promise: Promise<unknown>): void;
}

export default {
  async scheduled(_event: unknown, env: Env, ctx: Ctx): Promise<void> {
    const ping = async (path: string, tag: string): Promise<void> => {
      try {
        const res = await fetch(`${env.TARGET_URL}${path}`, {
          headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
        });
        const body = await res.text();
        if (!res.ok) {
          console.error(`[${tag}] failed`, res.status, body);
        } else {
          console.log(`[${tag}] ok`, body);
        }
      } catch (err) {
        console.error(`[${tag}] error`, err);
      }
    };

    ctx.waitUntil(
      Promise.all([
        // Paid bookings 30–60 days after the event get their own review link.
        // Once per booking (bookings.review_request_sent_at), max 50 per run.
        ping("/api/cron/review-requests", "review-requests-cron"),
        ...(env.LEAD_EMAILS === "on"
          ? [ping("/api/cron/followups", "followups-cron"), ping("/api/cron/booking-recovery", "booking-recovery-cron")]
          : []),
      ]).then(() => undefined),
    );
  },
};
