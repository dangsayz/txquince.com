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
