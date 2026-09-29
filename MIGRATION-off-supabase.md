# txquince.com — move off Supabase (DB + admin auth + storage → your own stack)

Scoped from the repo on 2026-06-24. txquince is a **real (if small) migration** — it
uses Supabase for THREE things, so all three move. Same shape as the 12img cutover,
much smaller. No big multi-agent review needed (single-admin content site, small data).

## What txquince actually uses Supabase for
1. **Database** — service-role + anon over PostgREST. Tables: `bookings`, `inquiries`,
   `lead_events`, `page_views`, `conversion_changes`, `portfolio`, `portfolio_images`,
   `site_settings`, `videos`. (`lib/supabase-server.ts` = service role; `lib/supabase/*` = auth)
2. **Admin auth** — Supabase Auth (email/password + reset), gating `/admin` only, via an
   `ADMIN_EMAILS` allowlist (`lib/admin-auth.ts`, `lib/supabase/middleware.ts`). Public
   visitors never log in.
3. **Storage** — the `portfolio` bucket (admin-managed photos). Static marketing media is
   ALREADY on R2 (`src/content/media.ts`); only the `portfolio` bucket is still on Supabase.

Deploys to **Cloudflare** (OpenNext / wrangler) — env lives in Worker vars/secrets, not Fly.

## Target (the box you already own)
- **DB** → a `txquince` database on the DO Postgres, served via PostgREST + Caddy at
  `db.txquince.com` (reuse the 12img `selfhost-cloud-init.sh` pattern; generate fresh
  anon + service-role JWTs for this DB).
- **Admin auth** → drop Supabase Auth; use a simple admin password gate (one admin,
  content site — no full auth vendor needed). *[Alt: Clerk single-user if you want
  email/password + reset back.]*
- **Storage** → move the `portfolio` bucket to R2 (R2 is already wired for media).

## Steps (your Claude Code runs these; I can do the repo edits)
0. **Back up first.** Dump the txquince Supabase DB — the working connection string
   (password and all) is in `txquince.com/.env.local`:
   `pg_dump "<conn>" | gzip > txquince-$(date +%Y%m%d).sql.gz`
1. **DB on the box.** Create database `txquince` on the DO Postgres; restore the dump;
   stand up PostgREST + Caddy for it at `db.txquince.com` (mirror `selfhost-cloud-init.sh`).
2. **Mirror the `portfolio` bucket → R2** (byte-for-byte), then repoint code:
   - `lib/content-db.ts` `storageUrl()` → R2 URL / branded proxy
   - `app/api/admin/images/route.ts` + `app/api/img/[slug]/route.ts`:
     `supabase.storage.from("portfolio")…` → R2 get/put/delete (reuse the 12img R2 helper).
3. **Admin auth → simple password gate.** Replace the Supabase-auth login:
   - `lib/admin-auth.ts`: authorize via a signed cookie set after a correct `ADMIN_PASSWORD` POST.
   - `lib/supabase/middleware.ts`: guard `/admin` via that cookie instead of `supabase.auth`.
   - `lib/supabase/client.ts` + `server.ts` (auth-only) become unused — delete.
   - `/admin/login` + `/admin/reset-password` → simple password form.
4. **Env (Cloudflare Worker vars/secrets):**
   - `NEXT_PUBLIC_SUPABASE_URL = https://db.txquince.com`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY = <new self-host anon>`
   - `SUPABASE_URL = https://db.txquince.com`
   - `SUPABASE_SERVICE_ROLE_KEY = <new self-host service role>`
   - `ADMIN_PASSWORD = <new>`  (retire `ADMIN_EMAILS`)
   - keep `R2_*`, Stripe, Resend, Turnstile, AI gateway as-is
5. **Deploy** (wrangler/OpenNext) + smoke-test:
   - homepage loads; portfolio photos render (from R2)
   - `/admin` login works with the password; can add/replace a portfolio image
   - a test inquiry/booking writes to the box DB
6. **Delete** the txquince Supabase project once verified (you still have the dump).

## Rollback
Revert the 5 env vars to the Supabase values + redeploy; the old Supabase project
stays alive ~7 days as the fallback.
