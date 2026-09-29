# TX Quince visual rebuild

## Integration

This branch reconciles the visual redesign with the source deployed in Cloudflare Worker version `ecb07a4d-c622-4f8d-8982-43dccb732606` (`6778c0a` on `feat/booking-conversion-cloudflare`). It keeps the live inquiry, reservation, admin, media, R2, Spanish, venue, and vendor flows while changing the public presentation to muted eucalyptus, neutral surfaces, and smaller, lighter type.

The four source-controlled collections remain Moments $1,800, Essential $2,500, Signature $3,900, and Legacy $5,500. Collection cards, reservation options, metadata, and FAQs should all read from `src/content/packages.ts` rather than a separate price list.

Portfolio, homepage, and photo detail media continue to use `src/lib/content-db.ts` and the branded image route. Static photos under `public/portfolio` are visual fallback assets; cards without a database photo ID must not link to a photo detail URL that cannot resolve.

## Release gate

This integration does **not** complete the portfolio infrastructure migration required by the parent `AGENTS.md`. The code still contains `@supabase/ssr`, `@supabase/supabase-js`, GoTrue admin authentication, and `SUPABASE_*` configuration. Admin AI descriptions also still route through the Vercel AI Gateway. The observed `db.txquince.com` endpoint identifies itself as self-hosted, but the repository rule requires verified replacement database, authentication, and storage paths before deployment. Do not merge or deploy this branch until those migrations, admin access verification, and a production smoke test are complete.

## Local verification, September 28, 2026

- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with two existing warnings in `cron-worker/src/index.ts` and `scripts/ingest-venues.mjs`.
- `node --experimental-strip-types --test src/components/gallery/gallery-model.test.mjs`: 3/3 passed.
- `npm run build`: passed. `npm run build:cloudflare`: passed after installing this branch's lockfile dependencies locally.
- Browser smoke on the local production build: homepage and investment page show all four collections; Moments selects correctly on `/reserve?collection=moments`; `/check-your-date?date=2030-01-01` prefills the date; empty portfolio renders an honest unavailable state. The local checkout has no production data credentials, so it cannot prove the populated gallery or authenticated admin flow. The current public portfolio showed 98 photos and seven films when checked, confirming the deployed source has media to preserve.

The earlier design-only screenshots and Lighthouse scores are historical evidence, not proof for this integration. No customer inquiry or reservation was submitted during smoke testing because those actions create records and can send external messages.
