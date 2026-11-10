# TX Quince brand kit

**Locked 2026-11-05.** Source of truth: `src/app/brand.css` (imported by `src/app/globals.css`). Every value was measured from CSS that already ships. None were invented. Reuse these tokens on every page. Don't make up new ones for a single page.

## The look in one line

Warm gallery neutrals, carbon ink, hairlines over shadows, pill CTAs, Inter for reading, Jost uppercase for labels. No brand hue, no gradients, no glow.

## Tokens

| Group | Tokens | Notes |
|---|---|---|
| Color | `--tq-canvas` #faf8f5 · `--tq-paper` #ffffff · `--tq-surface` #f2efe9 · `--tq-surface-2` #e2ddd5 · `--tq-ink` #111110 · `--tq-ink-on` · `--tq-stone` #8c877f · `--tq-hover` #d4cfc7 · `--tq-cinema` #0d0d0c · `--tq-status-open` #2e6f40 · `--tq-status-limited` #b85d19 · `--tq-status-down` #a14f12 · `--tq-notify` #c8102e | `--tq-stone` is 3.4:1 on canvas. Use it for borders and icons only, never for body text. `--tq-status-limited` is 4.3:1, so use it for dots and rules; use `--tq-status-down` (5.4:1, added 2026-11-06 for the studio) when the warning is text. `--tq-notify` (added 2026-11-09) is only for the unread count and dot on the Studio bell; white text on it is 5.9:1. |
| Type | `--tq-font-sans` (Inter) · `--tq-font-label` (Jost 500) · `--tq-font-mono` (Geist Mono) · weights 400/510/590 · `--tq-text-body` 16px floor · `--tq-text-h1..h3` clamp scale | Fonts load in `src/app/_shell/root.tsx`. Inputs are never under 16px. |
| Spacing | `--tq-space-1..12` (4px base) · `--tq-space-section` 5rem · `--tq-space-section-lg` 7rem · `--tq-tap` 44px · `--tq-tap-primary` 48px | Leave at least `--tq-space-2` (8px) between tap targets. |
| Radius | `--tq-radius-xs` 6 · `-sm` 14 · `-md` 20 · `-lg` 24 · `-pill` 999 | Pill is the dominant shape (38 uses). |
| Shadow | `--tq-shadow-card` · `--tq-shadow-lift` · `--tq-shadow-overlay` · `--tq-ring` | Hairlines (`--tq-surface-2`) do most of the separation. |
| Motion | `--tq-ease` cubic-bezier(.22,1,.36,1) · `--tq-dur-fast` 160 · `-base` 250 · `-slow` 400 · `-theme` 900 | Durations drop to ~0 under `prefers-reduced-motion`. Always name the property. Never write `transition: all`. |

## Legacy aliases

Older names still resolve: `--color-*` (Tailwind `@theme`), `--bg-*`/`--text-*`/`--accent-*` (`.txq` scope in `components/txq/txq.css`), and `--g-*` (`booking-glass.css`). When you edit a file that uses them, move it to `--tq-*`. Don't rewrite everything at once.

## Banned (taste/impeccable preflight)

- Purple or blue gradients, blob meshes, glow, and glassy "AI" cards.
- Inter alone with no second voice. We pair it with Jost labels and Geist Mono.
- Copy words like "empower", "unlock", "elevate", "seamless" or "transform".
- Invented testimonials, review counts, "500+ families" style numbers, prices or availability. Prices come from the live price book (`/admin/prices`).
- A grid of three identical icon cards.

## Baseline (2026-11-05)

`impeccable detect src/app src/components` (regex pass) found 0 anti-patterns. There is 1 advisory: a hairline grid background in `components/admin/charts/hud.css`, which is admin only and was left alone. A full pass needs a running server: `npx impeccable detect http://localhost:3000`.

## Studio colors (admin only, added 2026-11-10)

The public site stays warm neutrals and carbon ink. The Studio (`/admin`) sits on a pure white page and adds seven colors, defined on `.studio-skin` in `src/app/admin/studio.css`. Each color means one thing everywhere, so a color is information, never decoration.

| Token | Value | Tint | Means |
| --- | --- | --- | --- |
| `--st-rose` | #a3264f | #fbe9ef | Families: inquiries, free plans, new families |
| `--st-green` | #2e6f40 | #e8f0ea | Money, booked, live, went on |
| `--st-blue` | #1d5a9e | #e6eff9 | Traffic and reading (charts, scroll bars); `--st-blue-soft` #6b97cc for past days |
| `--st-amber` | #a14f12 | #fbeee2 | Waiting on you, visits lost |
| `--st-gold` | #7a5c00 | #f8f0d8 | Reviews |
| `--st-teal` | #0f6b6b | #e0f1f0 | Comments |
| `--st-slate` | #44506b | #eceef3 | Neutral facts (accounts, language) |

Use them through `data-hue="rose|green|blue|amber|gold|teal|slate"` on `.st-chip`, `.st-pill` (a count beside a title) and `.st-key` (a label's color key). Every dark value is 5:1 or more on white and on its own tint. `--st-line` #d6d1c8 is the card edge on the white page. Do not use these on public pages.


## Quince tints (booking cards only, added 2026-11-10)

Dang asked for soft quinceañera colors on the booking package cards. This is the one place the "no brand hue, no gradients" line is relaxed. Five washes with a line color each, in `brand.css`: `--tq-quince-rose`, `-champagne`, `-lilac`, `-sage`, `-sky` (+ `-line`). Each package has its own pattern in the line color (rings, sun rays, pleats, dots, waves), masked to fade out; the total card takes the chosen package's tint and pattern. Rules: text on a wash stays `--tq-ink`; never set text in a line color; decoration sits under the text and is never the only signal; scroll motion is CSS scroll-driven and is off under `prefers-reduced-motion`. Do not use the tints on other pages without asking.
