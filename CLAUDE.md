@HOW-WE-WORK.md

@AGENTS.md

## Never use Supabase (standing rule from Dang, 2026-11-09)

Do not add, extend or depend on Supabase in any new work: no new tables, migrations, RPCs, auth or Storage there, and never ask Dang for a Supabase token or to run SQL in its editor. The stack is **Cloudflare** (Workers hosting, **D1** database, R2 files, Access login) + **Stripe** (payments) + Resend (email). Existing Supabase code is legacy and is being moved to D1 + Cloudflare Access; until that move ships, only touch it to keep the live site working or to migrate off it.

## SEO standard (shared across all Dang's sites)

Canonical Google Search rubric for any page built/audited/shipped here — the three gates (can Google process it · is it trying to trick Google · is it useful to a human) plus the **Gate-1 pre-deploy technical checklist** — lives at `Cowork-OS/SEO/google-search-playbook.md` (fact-checked against Google's live docs). The `/seo-page`, `/seo-audit`, `/seo-optimize`, `/aeo-audit` skills operationalize it.

## Web design standard — LAW (shared across all Dang's sites)

**Binding and non-negotiable for every page, component, and UI change.** Canonical doc: `Cowork-OS/Design/web-design-standard.md` (source: `danguiux/docs/web-design-standard.md`). This is mechanical law, not an aesthetic preference — its gates ALWAYS apply (you never "ask first" about them). It is the companion to the SEO standard: SEO governs whether a page can *rank*; this governs whether it is *usable* once someone arrives.

Every screen must clear **three gates**:

1. **Does it fit?** (responsive) — build mobile-first from **360px up**; **0px horizontal overflow at 360px**, ever; no fixed-px layout widths (use %, max-width, clamp); brand / CTA / pill labels get `white-space:nowrap` (a label wrapping to two lines means the element is being squeezed); full-height uses `dvh`/`svh`, never `vh`. Verify at 360 / 390 / 768 / 1024 / 1440.
2. **Can a thumb hit it?** (touch) — every interactive element is **≥44px tappable** (24px = WCAG floor, 44px = target, **48px for primary/money actions**); **≥8px between targets**; the primary action sits in the lower two-thirds, not a top corner; icon-only buttons need an `aria-label`.
3. **Is it legible and stable?** (legibility) — body / input font **≥16px** (under 16px on an input triggers iOS zoom-on-focus); contrast **≥4.5:1 text**, **≥3:1 large text / UI borders & icons**; **no layout shift** (reserve image width/height or aspect-ratio — it is the CLS ranking signal); respect `env(safe-area-inset-*)` and `prefers-reduced-motion`.

**Report the gate, not the symptom** ("Gate 2 fail: CTA is 32px, needs 44") — fix once, encode forever. Run the doc's **pre-ship checklist** before any page ships, and build new pages to its **reference header** + appendix from the start. Trigger phrase: **"check this against the web design standard."**

## Keep Grokbot's facts doc current (standing rule from Dang)

Grokbot runs TX Quince's social media and reads one Google Doc before every post:
**"TX Quince · Live facts for Grokbot (kept current by Claude)"**, Drive file id
`10aX4PbZVwBplX9X6grskMPNuYqCqS_fONfF9eus5Paw`, in the folder "TX Quince · Budget Page Promo"
(`103QV_AOXJhbO68Xg1MGz10--dwwNo3tq`). After every major update that ships (packages, prices,
what's included, links, policies, wording rules), rewrite that doc's facts and add a dated
"What's new" entry. Only true, live facts; never invent reviews, numbers or availability.
Prices and package wording are owner-editable at /admin/prices and /admin/packages, so tell
Grokbot to confirm numbers on txquince.com/budget before posting.

## Claude Duet's brief (standing rule from Dang, 2026-11-10)

Dang uses Claude Duet as his day-to-day agent. It reads one Google Doc: **"TX Quince · Brief for Claude Duet (kept current by Claude Code)"**, Drive file id `1iXD9yNLQfzZwRWfWsxBZ7LlylbNusDmEJZXDxwLa8ik`, in the same folder as Grokbot's doc. It lists who does what, what is live, what waits on Dang, what is scheduled, and his rules. When work ships that changes any of those (new pages, a finished or new item waiting on Dang, a new scheduled task), update that doc in the same session. Only true, live facts.

## Muse's blog feed (standing rule from Dang, 2026-11-10)

Muse posts TX Quince's Journal on Facebook. It reads one address that always lists every post, newest first, with summary, cover photo and the Spanish version: `https://txquince.com/blog/feed.json` (`src/app/blog/feed.json/route.ts`). A new post appears there when it deploys, so never hand Dang a list of links for Muse again. Keep that route working when the blog model changes, and end a report that ships new posts with one line saying they are in the feed.

## Photo releases (standing rule from Dang, 2026-11-10)

Dang, in his words: "moms put on contracts they agree all images can be release - this is how we get new clients." So faces, the court and family may be published, and a name that shows inside a photo (a DJ screen, a sign) does not block it. This narrows the "no client names or identifiable portraits in public assets" gate in HOW-WE-WORK.md: that gate now covers the words we write. Never put a girl's or family's name in a file name, slug, alt text or caption.

To pick a photo for a post, search the published albums by what they show: `node scripts/find-photo.cjs waltz father` (`--wide` for a cover, `--cat the-court` by category).

## Design workflow — every UI job (standing rule from Dang)

Claude is design + frontend lead for every page, template and rewrite here. Never ship generic AI UI. Run `scripts/install-design-stack.sh` at the start of a UI session (skills are gitignored; `skills-lock.json` pins them). Mobbin and frontend-design are Claude plugins/connectors, not repo files.

1. **Brand kit** — use `src/app/brand.css` (`--tq-*`), documented in `docs/brand-kit.md`. Don't invent per-page colors, radii, shadows or durations; extend the kit if something is truly missing.
2. **Taste / Impeccable preflight** — no purple gradients, Inter-only type, blob meshes, "empower/unlock/elevate" copy, fake social proof, identical 3-col icon grids.
3. **Mobbin** — pull 2–4 real web section refs (`search_sections`), cite them by `mobbin_url` in the PR/summary, build from them (or use refs Dang pastes).
4. **pick-ui-library** — one kit or none, with a reason. Default here: none (custom CSS + `motion`, already in deps).
5. **Build** with frontend-design against the brand kit + refs.
6. **Motion** — transitions.dev patterns only; `--tq-ease` / `--tq-dur-*`; honor `prefers-reduced-motion`; never `transition: all`.
7. **web-design-guidelines** (Vercel) on changed files: a11y, focus, forms, images, CLS. Plus the web design standard gates above.
8. **Impeccable critique** (`npx impeccable detect` on the running page) before done. If it still looks template, it doesn't ship.
Admin ("TX Quince Studio") pages use the same kit through `src/app/admin/studio.css`: `.st-card` (the only card), `.st-btn` (carbon pill, primary), `.st-btn-ghost` (outline pill), `.st-link`, `.st-h1`/`.st-h2`, `.st-tabs`, `.st-filter`, `.st-chip`, `.st-table`, `.st-input`, and `ArrowIcon`/`MenuIcon` from `components/admin/StudioIcons.tsx`. Every admin page wraps in `<StudioPage>` (title, one plain sentence, actions; no label above the title) and sections in `<StudioSection>`; charts use `<StudioBars>`. Today = what needs you; Insights = numbers + Ideas board; Website = hub of everything editable. The full process for a redesign is `/redesign`.

9. **Done** only when: brand kit used, Mobbin cited, guidelines clean, no AI slop. Never invent brand facts, prices or testimonials. If a skill fails, name it and continue.

## Merge your own PRs (standing rule from Dang)

Never ask Dang whether to merge. When a PR you opened is ready (no conflicts, checks not failing, tests pass locally), merge it yourself (squash, title ending in `(#NN)`), then say what you merged. If something blocks the merge, fix it or report the blocker, never "should I merge?".

## Always end with links (standing rule from Dang, 2026-11-09)

When work is done, give Dang the direct links to see it, so he can click instead of searching: the live page(s) that changed (full `https://txquince.com/...` URLs, the exact post or screen, not the homepage), the Studio page if there is one (`https://txquince.com/admin/...`), and the pull request. If he has to do a step in a dashboard, link the exact settings page.

## Secret shopper: test it yourself, do not ask Dang to (standing rule from Dang, 2026-11-09)

Dang does not want to click through the site to test it. After any change a family can see, and after every deploy, run `node scripts/secret-shopper.cjs` (live site; `--base http://localhost:3000` for a local build, `--all` for every page). It walks the key pages on a phone and a desktop, checks the three design gates, script errors, failed requests, broken images and links, and runs the flows a mom uses. It only looks and clicks; it never submits a form. Fix what it reports before you say done, and put its result line in your report. When you add a flow a family uses, add a step for it in the script. What it cannot do: anything that needs a real inbox or a real payment (log in by emailed code, checkout); say so instead of guessing.
