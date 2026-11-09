# Moving TX Quince off Supabase → Cloudflare D1 (runbook)

`worker.js` is a one-off copy tool. It is uploaded as a **preview version** of
the `txquince` worker (`wrangler versions upload`, never `versions deploy`),
so it can use the site's existing Supabase secrets without anyone handling
them, and it never takes live traffic. Responses carry counts and id
fingerprints only; customer data stays inside Cloudflare.

## Rehearsal (done 2026-11-09)
- `txquince-staging` D1 created, `migrations/` applied, full copy:
  15 tables, ~4,860 rows, 0 errors; `/verify` → `allMatch: true`.
- The new site was uploaded as a preview bound to staging and smoke-tested:
  public pages, photos, booking links, every Studio page signed in, admin
  APIs refuse missing/forged sessions, writes land in D1.

## Switch-over (production) — needs Dang's go
1. `npx wrangler d1 migrations apply txquince --remote` (adds the tables; the
   live site doesn't read them yet).
2. Upload `worker.js` as a preview of `txquince` with `DB` → `txquince`
   (production) and a fresh random `MIGRATE_TOKEN`; `POST /copy`, then
   `GET /verify` must say `allMatch: true`.
3. Merge the PR and deploy the site (`npm run deploy:cloudflare`).
4. Right after the deploy: `POST /copy?delta` (adds rows created in the
   minutes between step 2 and 3), then `GET /verify`.
5. Sign in to /admin with the emailed code; open Bookings and Inquiries.
6. After a few calm days: delete the Supabase secrets from the worker
   (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_*`)
   and shut down the self-hosted Supabase server (db.txquince.com).

Rollback: redeploy the previous worker version (`wrangler rollback`); the
old Supabase database is untouched by this move.
