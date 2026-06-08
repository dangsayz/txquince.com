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
    const run = async (): Promise<void> => {
      try {
        const res = await fetch(`${env.TARGET_URL}/api/cron/followups`, {
          headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
        });
        const body = await res.text();
        if (!res.ok) {
          console.error("[followups-cron] failed", res.status, body);
        } else {
          console.log("[followups-cron] ok", body);
        }
      } catch (err) {
        console.error("[followups-cron] error", err);
      }
    };
    ctx.waitUntil(run());
  },
};
