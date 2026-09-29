@AGENTS.md

## SEO standard (shared across all Dang's sites)

Canonical Google Search rubric for any page built/audited/shipped here — the three gates (can Google process it · is it trying to trick Google · is it useful to a human) plus the **Gate-1 pre-deploy technical checklist** — lives at `Cowork-OS/SEO/google-search-playbook.md` (fact-checked against Google's live docs). The `/seo-page`, `/seo-audit`, `/seo-optimize`, `/aeo-audit` skills operationalize it.

## Web design standard — LAW (shared across all Dang's sites)

**Binding and non-negotiable for every page, component, and UI change.** Canonical doc: `Cowork-OS/Design/web-design-standard.md` (source: `danguiux/docs/web-design-standard.md`). This is mechanical law, not an aesthetic preference — its gates ALWAYS apply (you never "ask first" about them). It is the companion to the SEO standard: SEO governs whether a page can *rank*; this governs whether it is *usable* once someone arrives.

Every screen must clear **three gates**:

1. **Does it fit?** (responsive) — build mobile-first from **360px up**; **0px horizontal overflow at 360px**, ever; no fixed-px layout widths (use %, max-width, clamp); brand / CTA / pill labels get `white-space:nowrap` (a label wrapping to two lines means the element is being squeezed); full-height uses `dvh`/`svh`, never `vh`. Verify at 360 / 390 / 768 / 1024 / 1440.
2. **Can a thumb hit it?** (touch) — every interactive element is **≥44px tappable** (24px = WCAG floor, 44px = target, **48px for primary/money actions**); **≥8px between targets**; the primary action sits in the lower two-thirds, not a top corner; icon-only buttons need an `aria-label`.
3. **Is it legible and stable?** (legibility) — body / input font **≥16px** (under 16px on an input triggers iOS zoom-on-focus); contrast **≥4.5:1 text**, **≥3:1 large text / UI borders & icons**; **no layout shift** (reserve image width/height or aspect-ratio — it is the CLS ranking signal); respect `env(safe-area-inset-*)` and `prefers-reduced-motion`.

**Report the gate, not the symptom** ("Gate 2 fail: CTA is 32px, needs 44") — fix once, encode forever. Run the doc's **pre-ship checklist** before any page ships, and build new pages to its **reference header** + appendix from the start. Trigger phrase: **"check this against the web design standard."**
