#!/usr/bin/env node
/**
 * check-up-to-date.mjs — runs before `npm run deploy:cloudflare`.
 *
 * Deploying from a checkout that is behind GitHub's main ships OLD code over
 * the live site (it happened on Nov 8, 2026). This stops the deploy and says
 * the one command that fixes it. Set ALLOW_STALE_DEPLOY=1 to skip on purpose.
 */
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" }).trim();

if (process.env.ALLOW_STALE_DEPLOY === "1") process.exit(0);

try {
  run("git fetch --quiet origin main");
} catch {
  console.warn("! Couldn't reach GitHub to check for newer code. Deploying anyway.");
  process.exit(0);
}

const branch = run("git rev-parse --abbrev-ref HEAD");
const behind = Number(run("git rev-list --count HEAD..origin/main"));
if (behind > 0) {
  console.error(`
✋ Stopped: this computer is ${behind} change(s) behind the website's code on GitHub.
   Deploying now would put OLD code on txquince.com.

   Fix it (copy and paste), then deploy again:

     git checkout main && git pull
`);
  process.exit(1);
}
if (branch !== "main") console.warn(`! You're on branch "${branch}", not main. Deploying it anyway.`);
