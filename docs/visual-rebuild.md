# TX Quince visual rebuild

## Integration

This branch reconciles the visual redesign with the source deployed in Cloudflare Worker version `ecb07a4d-c622-4f8d-8982-43dccb732606` (`6778c0a` on `feat/booking-conversion-cloudflare`). It keeps the live inquiry, reservation, admin, media, R2, Spanish, venue, and vendor flows while changing the public presentation to muted eucalyptus, neutral surfaces, and smaller, lighter type.

The four source-controlled collections remain Moments $1,800, Essential $2,500, Signature $3,900, and Legacy $5,500. Collection cards, reservation options, metadata, and FAQs should all read from `src/content/packages.ts` rather than a separate price list.

Portfolio, homepage, and photo detail media continue to use `src/lib/content-db.ts` and the branded image route. Static photos under `public/portfolio` are visual fallback assets; cards without a database photo ID must not link to a photo detail URL that cannot resolve.

## Hosting and release

The live application runs on Cloudflare Workers. `db.txquince.com` identifies itself as the self-hosted TX Quince service on DigitalOcean, with a responding GoTrue auth health endpoint. The production Cloudflare Worker has the existing `SUPABASE_*` secret names for this self-hosted endpoint; these names and the client packages do not establish use of Supabase's hosted service. Portfolio media is bound to Cloudflare R2. The old `MIGRATION-off-supabase.md` and `DEPLOY.md` retain historical hosted-provider language and must not be used as evidence of the current hosting provider.

The admin AI suggestion routes contain optional Vercel AI Gateway code, but `AI_GATEWAY_API_KEY` is absent from the production Worker secrets, so those routes return a 503 before contacting that provider. No new Vercel or Supabase service is configured by this visual release. Verify the production deployment and public flows after publishing; authenticated admin and message-sending flows require separate credentials or controlled tests.

## Local verification, September 28, 2026

- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with two existing warnings in `cron-worker/src/index.ts` and `scripts/ingest-venues.mjs`.
- `node --experimental-strip-types --test src/components/gallery/gallery-model.test.mjs`: 3/3 passed.
- `npm run build`: passed. `npm run build:cloudflare`: passed after installing this branch's lockfile dependencies locally.
- Browser smoke on the local production build: homepage and investment page show all four collections; Moments selects correctly on `/reserve?collection=moments`; `/check-your-date?date=2030-01-01` prefills the date; empty portfolio renders an honest unavailable state. The local checkout has no production data credentials, so it cannot prove the populated gallery or authenticated admin flow. The current public portfolio showed 98 photos and seven films when checked, confirming the deployed source has media to preserve.

The earlier design-only screenshots and Lighthouse scores are historical evidence, not proof for this integration. No customer inquiry or reservation was submitted during smoke testing because those actions create records and can send external messages.
