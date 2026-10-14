/**
 * cloudflare/worker.ts — the Worker entry (wrangler.jsonc "main").
 *
 * OpenNext generates .open-next/worker.js with only a `fetch` handler. This
 * wrapper re-exports it and adds `scheduled`, so a Cloudflare Cron Trigger
 * (wrangler.jsonc triggers.crons) runs the client journey's daily job
 * (/api/cron/daily) without pg_cron (audit M2) and without a second Worker.
 *
 * The cron calls the app IN-PROCESS through the same fetch handler (no public
 * round trip), authenticated with CRON_SECRET exactly like an outside caller,
 * so the route's own constant-time check is what guards it.
 *
 * See https://opennext.js.org/cloudflare/howtos/custom-worker
 */
// `.open-next/worker.js` only exists after `opennextjs-cloudflare build`, so the
// import can't be type-checked before then (and @ts-expect-error would fail after).
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore generated at build time
import { default as handler } from "../.open-next/worker.js";

type Env = { CRON_SECRET?: string; NEXT_PUBLIC_SITE_URL?: string } & Record<string, unknown>;
type Ctx = { waitUntil(p: Promise<unknown>): void; passThroughOnException?(): void };
type OpenNextHandler = { fetch(req: Request, env: Env, ctx: Ctx): Promise<Response> };

const app = handler as OpenNextHandler;

const worker = {
  fetch: app.fetch,

  async scheduled(controller: { cron: string; scheduledTime: number }, env: Env, ctx: Ctx) {
    if (!env.CRON_SECRET) {
      console.error("[cron] CRON_SECRET is not set; skipping the daily run");
      return;
    }
    const origin = (env.NEXT_PUBLIC_SITE_URL || "https://txquince.com").replace(/\/+$/, "");
    const run = async () => {
      const res = await app.fetch(
        new Request(`${origin}/api/cron/daily`, { headers: { authorization: `Bearer ${env.CRON_SECRET}`, "x-cron": controller.cron } }),
        env,
        ctx,
      );
      const body = await res.text();
      if (!res.ok) console.error("[cron] daily failed", res.status, body);
      else console.log("[cron] daily ok", body);
    };
    ctx.waitUntil(run());
  },
};

export default worker;
