# Security lockdown: what changed and what the owner needs to do

From the 2026-10-14 audit (`docs/AUDIT-BOOKING-2026-10-14.md`): findings H3, M3, M4 and M6, plus the
low-severity items. Most fixes ship with the code. **Two need a person with production access**:

1. **Database: lock the public API key out of the tables** (`supabase/sql/lockdown-anon.sql`). Done by hand, once.
2. **Cloudflare: nothing to create.** The rate-limit bindings deploy with `wrangler.jsonc`. Read the note below anyway.

Later, when the reports are clean:

3. Switch the Content-Security-Policy from report-only to enforcing.
4. Optionally add `includeSubDomains` to HSTS.

---

## 1. Database lockdown (M6)

### What the problem is, in plain words

`db.txquince.com` answers database queries from anyone who has the **anon key**. That key isn't
secret: it has to ship to the browser so the admin login works. Supabase gives that key
permission on every table by default. Today, the only thing stopping a stranger from reading
`bookings` or `inquiries` is Row Level Security (RLS), a second lock that has to be switched on
and configured correctly for every table, forever. If one table is missing it, its rows are public.

A local rehearsal of a database built the way Supabase builds one showed exactly that. With
the anon key, `portfolio_images` and `videos` (tables made in the dashboard, with RLS off) could
be read, a view over `inquiries` could be read (views skip RLS), and a `security definer`
function could be run.

### What the site actually needs from the anon key

**Nothing in the database tables.** I checked every use:

| Where | What it does with the anon key |
| --- | --- |
| `src/lib/supabase/client.ts` (browser) | Admin login only: sign in, reset password, exchange the reset code, get session, update password, sign out. These go to the **auth service** (`/auth/v1`), not to tables. |
| `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts` | `auth.getUser()` and `auth.signOut()`, also auth only. |
| Everything else (inquiries, bookings, photos, videos, venues, analytics, RPCs) | Uses the **service role** key on the server (`src/lib/supabase-server.ts`), which this script doesn't reduce. |

No migration defines an RLS policy for the `anon` or `authenticated` roles, so nothing was
relying on one.

### What the script does

`supabase/sql/lockdown-anon.sql` runs as **one transaction**, so it either does everything or nothing:

1. **Writes an undo log first** (schema `security_lockdown`), so the rollback puts back exactly what was there.
2. **Takes away all table, view, sequence and column permissions** in the `public` schema from `anon`, `authenticated` and `PUBLIC`.
3. **Takes away "run" permission on database functions** from those roles, and makes sure the service role keeps it.
4. **Stops future tables from being granted to the anon key automatically.**
5. **Switches RLS on** for any table that had it off, as a second lock. The website's server key bypasses RLS, so the site doesn't notice.
6. **Checks its own work.** If the anon key can still touch anything, or the service role lost anything, it raises an error and the database is left exactly as it was.

It does **not** touch the auth service, storage, cron, or anything outside `public`.

### How to apply it

You need shell access to the self-hosted Supabase database as `postgres`.

1. **Back up the permissions** (fast, schema only):
   ```sh
   pg_dump "$DATABASE_URL" --schema-only --schema=public > before-lockdown.sql
   ```
2. **Rehearse locally first (optional).** This needs Postgres 16 binaries and never touches production:
   ```sh
   bash supabase/sql/test/run.sh
   ```
   It builds a throwaway database from every migration, applies the lockdown, probes what each
   role can do, rolls back and confirms the database is identical. It should end with `PASS`.
3. **Apply it:**
   ```sh
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/sql/lockdown-anon.sql
   # or, inside the Supabase docker host:
   docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/sql/lockdown-anon.sql
   ```
   Expect `NOTICE: lockdown: verified. N undo statements recorded`. A `NOTICE: skipped default
   privileges of role supabase_admin` is fine. It means `postgres` can't change that role's
   defaults. Only tables created by `supabase_admin` would be affected, and none of the
   site's tables are.
4. **Confirm from outside** that the anon key is refused (use the anon key from the site's env):
   ```sh
   curl -s "https://db.txquince.com/rest/v1/inquiries?select=id&limit=1" \
     -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
   # expect: {"code":"42501", ... "permission denied for table inquiries"}
   ```
5. **Smoke-test the site**: sign in to `/admin`, open Bookings, Inquiries and Photos, then send a test inquiry.
   All of these use the service role, so they should work exactly as before.

### How to undo it

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/sql/lockdown-anon-rollback.sql
```

This replays the undo log, re-grants every permission that was removed, turns RLS back off
only where the lockdown turned it on, and drops the `security_lockdown` schema.

### After the lockdown, for future migrations

- New tables in `public` are **no longer** granted to the anon key automatically. Keep it that
  way; the site doesn't need them to be.
- Postgres still lets everyone run **new functions** by default. Keep doing what migration
  `0015` does: `revoke execute ... from anon, authenticated, public` and then
  `grant execute ... to service_role`.
- Worth considering: stop exposing `/rest/v1` and `/graphql/v1` through the Supabase gateway (Kong)
  entirely. The site never calls them from the browser.

---

## 2. Rate limiting (M3): Cloudflare bindings

`wrangler.jsonc` now declares two **Workers Rate Limiting** bindings:

| Binding | Limit | Used by |
| --- | --- | --- |
| `RATE_LIMIT_FORMS` (namespace `47101`) | 5 requests / 60 s per IP | `/api/commission`, `/api/inquiry` (separate counters) |
| `RATE_LIMIT_TRACK` (namespace `47102`) | 60 requests / 60 s per IP | `/api/track`, `/api/csp-report` |

**Nothing needs creating in the dashboard.** The binding is created on the next
`npm run deploy:cloudflare`. The only rule is that `namespace_id` must be unique in the
Cloudflare account. If another Worker in the account already uses `47101`/`47102` for
something else, the two would share counters, so pick other numbers.

Counters are kept per Cloudflare location and survive isolate restarts, which the old
in-memory counter did not. If the binding is ever missing, the app logs a warning once and
falls back to the old in-memory limit rather than failing.

The client IP now comes only from `CF-Connecting-IP`, which Cloudflare sets and clients can't
forge. This is also the IP stored on signed agreements. `X-Forwarded-For` is ignored in production.

---

## 3. Content-Security-Policy: when to enforce

The CSP ships as **`Content-Security-Policy-Report-Only`**, so it blocks nothing. Browsers report
anything it would have blocked to `/api/csp-report`, which logs one line per report
(`[csp-report] {...}`) in Workers Logs.

- **Expected, harmless:** one `script-src` / `eval` report per page from a `/_next/static` chunk.
  That's the zod validation library checking whether it can compile fast paths; it falls back
  safely when blocked.
- **Switch to enforcing** after about **two weeks of real traffic** with no other reports.
  Check especially for a booking, a pay-link visit (Stripe redirect), the homepage film player,
  and an admin session with photo uploads. To switch, in `src/lib/security-headers.ts`:
  rename the header to `Content-Security-Policy` and pass `enforce: true` (which adds
  `upgrade-insecure-requests`). Keep `report-uri` so new breakage still shows up.
- If you add a new third-party embed (another video host, a chat widget, a map), add its origin
  to `buildCsp()` first, or it will start appearing in the reports.

## 4. HSTS `includeSubDomains`

HSTS is on for two years for `txquince.com` itself. `includeSubDomains` is **not** set yet,
because it would force HTTPS on every `*.txquince.com` host. Add it once you've confirmed
every subdomain is served over HTTPS: `db`, `media`, and any email-tracking or
verification subdomains (Resend, Google). Change it in both `src/lib/security-headers.ts` and
`public/_headers`.
