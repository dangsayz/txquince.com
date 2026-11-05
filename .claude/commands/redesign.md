---
description: Structural design pass on one page (keeps the look) — install stack, impeccable critique, Mobbin refs, fix, verify gates, PR, optional deploy
argument-hint: <route, e.g. / or /budget or /es/blog> [deploy]
---

Run the TX Quince design pass on the page at route: **$ARGUMENTS**

This is the same process used on the homepage in PR #73. Keep the page's existing direction. This is refinement and restructuring, not a new look, unless Dang asks for a redesign. Follow `CLAUDE.md` (web design standard gates, design workflow, Grokbot rule) throughout.

1. **Set up**
   - Run `scripts/install-design-stack.sh`. Skills are gitignored, so they are reinstalled each session.
   - Run `npm ci` if `node_modules` is missing.
   - Find the route's source in `src/app/` and the components it renders.
   - Start `npx next dev -p 3000` in the background.
   - Stop the server, and `rm -rf .next`, before any build or deploy.
2. **Brand kit:** use `src/app/brand.css` (`--tq-*`) and `docs/brand-kit.md`. Don't invent per-page colors, radii, shadows or durations.
3. **Critique:** run the `impeccable` skill as `critique` on the route's main component, following its reference exactly.
   - Two isolated sub-agents: A is the design review (no detector), B is the detector plus browser evidence at 360/390/768/1024/1440, in EN and in ES where `/es` has the page.
   - Then synthesize, scoring Nielsen heuristics and ranking issues P0–P3.
4. **Mobbin:** run `search_sections` for each section you will restructure, using 2–4 refs. Cite them by `mobbin_url` in the summary and the PR.
5. **Fix:** load impeccable's `polish` reference and `craft-floor.md` first.
   - Fix every gate failure and every P0/P1 that keeps the direction.
   - **Ask Dang, using AskUserQuestion, before** anything structural or copy-changing: removing or moving sections, duplicate flows, claims or wording, the font, site-wide chrome (header, dock, footer).
   - Scope changes to this page when a component is shared, using a prop or a page-scoped selector.
   - Never invent prices, reviews or availability.
6. **Verify**
   - Rerun `impeccable detect` on the live page; report what is left and why.
   - At 360/390/768/1024/1440, in EN and ES, check: 0px horizontal overflow (also check content clipped by `overflow: clip`), targets ≥44px (48px for money actions), inputs ≥16px, text contrast ≥4.5:1.
   - Look at the screenshots yourself.
   - Click through any booking or form flow on the page.
   - Run `npx tsc --noEmit`, `npx eslint` on changed files, and `npm test`. Don't run prettier on whole files: this repo doesn't use it.
   - Run the `web-design-guidelines` rules on the changed files.
7. **Ship**
   - Commit and push to the session's branch.
   - Report to Dang in plain words: what changed, scores before and after, gate results, Mobbin refs, decisions left for him.
   - Open a PR only if he asks, or if `$ARGUMENTS` includes `deploy`.
   - If `$ARGUMENTS` includes `deploy`, or he says to: open the PR, squash-merge to `main`, `rm -rf .next .open-next`, run `npm run deploy:cloudflare` from `main` (the `CLOUDFLARE_API_TOKEN` in the env is his), then verify the live page on txquince.com.
   - Update Grokbot's facts doc if prices, packages, links or policies changed.
