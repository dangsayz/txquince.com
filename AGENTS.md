<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design rules (non-negotiable)

## NO rounded card corners — sharp, editorial (Vogue/Apple) only
- Cards, tiles, image frames, panels, modals, inputs, and buttons use **SHARP, square (0-radius) edges**. This is a hard rule — the brand is editorial/fashion-masthead, not a soft "rounded card" SaaS look.
- The radius scale is flattened to `0` in `src/app/globals.css` (`@theme` → `--radius-xs … --radius-4xl`), so `rounded-sm/md/lg/xl/2xl/3xl` all render square automatically.
- **Do not** reintroduce rounding via arbitrary values either — no `rounded-[1rem]`, `rounded-[12px]`, `rounded-xl`, etc. on cards/tiles/panels.
- The ONLY allowed rounding is `rounded-full` for genuine pills, dots, and thin progress meters (e.g. CTA pill buttons, badges, the coverage meter). Never use `rounded-full` to fake a rounded card.
- If a design needs separation, use hairline borders, background tone changes, and spacing — never corner radius.
