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
 * Schedule lives in wrangler.jsonc (triggers.crons). The matching app route is
 * /api/cron/followups, which 401s unless this exact secret is presented — so
 * nothing sends until both secrets are set.
 */
interface Env {
  TARGET_URL: string;
  CRON_SECRET: string;
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
        ping("/api/cron/followups", "followups-cron"),
        ping("/api/cron/booking-recovery", "booking-recovery-cron"),
      ]).then(() => undefined),
    );
  },
};
