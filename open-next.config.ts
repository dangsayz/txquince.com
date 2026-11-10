import {
  defineCloudflareConfig,
  type OpenNextConfig,
} from "@opennextjs/cloudflare";

/**
 * OpenNext → Cloudflare Workers adapter for TX Quince.
 *
 * Force the webpack builder: Next 16 builds with Turbopack by default, which the
 * OpenNext Cloudflare adapter doesn't yet consume. `--webpack` produces the
 * standalone output OpenNext needs. (Same approach as quincenetwork.com.)
 *
 * Skew protection: a tab opened before a deploy keeps asking for the old
 * build's files. With this on, those requests (tagged with the old deployment
 * id by Next) are served by the old Worker version through its preview URL,
 * so clicks never 404. It needs an API token that can read Worker versions;
 * the CLOUDFLARE_API_TOKEN used to deploy works. Without one (e.g. a deploy
 * signed in through `wrangler login`) it stays off and the deploy still runs;
 * the error page then reloads the tab instead (src/components/useStaleBuildReload.ts).
 * CF_WORKER_NAME and CF_PREVIEW_DOMAIN are vars in wrangler.jsonc.
 */
const token = process.env.CF_WORKERS_SCRIPTS_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CF_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
const skew = Boolean(token && accountId);
if (skew) {
  process.env.CF_WORKERS_SCRIPTS_API_TOKEN = token;
  process.env.CF_ACCOUNT_ID = accountId;
}

const base = defineCloudflareConfig();

export default {
  ...base,
  buildCommand: "npx next build --webpack",
  cloudflare: {
    ...base.cloudflare,
    skewProtection: { enabled: skew, maxVersionAgeDays: 7, maxNumberOfVersions: 20 },
  },
} satisfies OpenNextConfig;
