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
 */
export default {
  ...defineCloudflareConfig(),
  buildCommand: "npx next build --webpack",
} satisfies OpenNextConfig;
