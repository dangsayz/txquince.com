# TX Quince — Go-Live Checklist

Single source of truth for taking txquince.com from "built" to "booking."
Hosting is **Cloudflare Workers via OpenNext** (mirrors quincenetwork.com).

---

## 1. Cloudflare deploy

```bash
npx wrangler login                 # auth to the Cloudflare account (one time)
npm run preview:cloudflare         # optional: local Workers preview before shipping
npm run deploy:cloudflare          # installs packages, builds + deploys to Cloudflare
```

- Worker name: `txquince` (see `wrangler.jsonc`).
- Custom domains `txquince.com` + `www.txquince.com` are pre-configured in
  `wrangler.jsonc` `routes` — the domain must be on this Cloudflare account.
- `next/image` uses the **Cloudflare Images** binding (`IMAGES`). Enable
  Cloudflare Images on the account, or images won't optimize.

## 2. Environment variables & secrets

Two kinds — they go in different places:

**Build-time public vars** (inlined into the bundle during `deploy:cloudflare`,
so they must be in `.env.local` / CI env at build, AND in `wrangler.jsonc` vars
for runtime where noted):

- `NEXT_PUBLIC_SITE_URL` — already in `wrangler.jsonc` (`https://txquince.com`)
- `NEXT_PUBLIC_CLERK_*` (publishable key + satellite settings) — already in
  `.env.production` and `wrangler.jsonc` vars; see "Accounts (Clerk)" below
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `NEXT_PUBLIC_R2_BASE_URL`

**Server-only secrets** (set via `wrangler secret put <NAME>`, never committed):

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ADMIN_EMAILS            # dangzr1@gmail.com,txquince@gmail.com (Studio login allowlist)
npx wrangler secret put CLERK_SECRET_KEY        # Quince Network app, PRODUCTION secret (sk_live_…)
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put OPERATOR_NOTIFY_EMAIL
npx wrangler secret put RESEND_FROM
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put STRIPE_SECRET_KEY        # see §4
npx wrangler secret put STRIPE_WEBHOOK_SECRET    # see §4
npx wrangler secret put CRON_SECRET              # see §5
```

## 3. Database migrations (Supabase, project `yeazpzmuyjmkinrhtarx`)

| File | What | Status |
|------|------|--------|
| `0001_inquiries.sql` | inquiries table | ✅ applied |
| `0002_bookings.sql` | bookings + atomic hold RPCs | ✅ applied |
| `0003_inquiry_followups.sql` | follow-up columns | ✅ applied |
| `0004_booking_holds_cron.sql` | pg_cron hold cleanup | ⬜ optional — apply if you want the safety net |

### Cloudflare D1 (`txquince`, binding `DB`)

Reviews and blog comments live in D1, not Postgres. Schema files are in
`migrations/`. The database and `0001_reviews.sql` are already created and
applied (2026-11-09). `0002_blog_comments.sql` is applied too (2026-11-09).
For a later migration:

```
npx wrangler d1 migrations apply txquince --remote
```

### Public accounts (Clerk)

TX Quince's own Clerk app "TX Quince" (`app_3LsbmZ7P1ci9zz1YTrNcZQVwpSb`),
production on txquince.com, for the public log in / sign up and Journal
comments. Set up 2026-11-09: the 5 DNS records (clerk, accounts, clkmail,
clk._domainkey, clk2._domainkey; DNS only) are verified and the Worker
secret `CLERK_SECRET_KEY` is set. The Studio (/admin) keeps its own
email-code login and does not use Clerk. See `docs/clerk.md`.

## 4. Stripe (commission retainers)

Checkout prices every retainer inline from `src/lib/commission.ts`, so there are no Stripe products or prices to create.

1. Copy the **secret** key into the Worker: `npx wrangler secret put STRIPE_SECRET_KEY`.
2. Create the webhook endpoint, with every event the app handles:
   ```
   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs https://txquince.com
   ```
   It prints the signing secret once; store it with `npx wrangler secret put STRIPE_WEBHOOK_SECRET`. Run it again with the live key at launch, since test and live endpoints are separate. Re-running is safe: it updates the existing endpoint's events.
3. Dashboard → Settings → Payment methods: enable **ACH Direct Debit**, so large retainers aren't charged card fees, plus **Affirm/Klarna**. Checkout shows whatever is enabled.
4. Test: `stripe listen --forward-to localhost:3000/api/stripe/webhook`, then book on the homepage with card `4242 4242 4242 4242`.
- Until the key is set, "Reserve now" answers with a friendly "online retainers aren't live yet" message, and "Consultation first" still works.

## 5. Lead nurture + booking recovery (optional but recommended)

Two revenue-saving jobs, both built and inert until activated:
- **Lead follow-ups** — 3-touch nurture for inquiries that haven't booked
  (`/api/cron/followups`); each email carries a one-click unsubscribe.
- **Abandoned-booking recovery** — one "your date is still open" email when a
  hold expires unpaid and the date is still free (`/api/cron/booking-recovery`);
  single send, guarded by `recovery_sent_at` (migration `0006`).

1. Set `CRON_SECRET` on the app (§2) **and** on the cron worker.
2. Deploy the cron worker (separate, in `cron-worker/`):
   ```bash
   cd cron-worker
   npx wrangler deploy
   npx wrangler secret put CRON_SECRET     # same value as the app's
   ```
   It runs **hourly**. As of 2026-11-09 it calls only the **review email**
   (`/api/cron/review-requests`: paid bookings 30–60 days after the event get
   their own review link, once). Follow-ups and recovery run only when
   `LEAD_EMAILS` is `"on"` in `cron-worker/wrangler.jsonc` (off for now).
   Everything 401s until the secret is set on BOTH workers.

## 6. Content unlocks (convert "built" → "booking")

- Upload one real photographer **portrait** → set `about.portraitKey` in
  `src/content/about.ts` (fills the About hero + the credibility signal).
- Add at least one **release-cleared testimonial** in `src/content/testimonials.ts`
  (`released: true`). Reviews slots on `/reserve` + `/investment` light up.
- Verify the **Resend sending domain** (SPF/DKIM) so emails send from
  `hello@txquince.com` instead of the sandbox sender.

## 7. Domain — connect www.txquince.com (registered at GoDaddy)

Cloudflare Workers custom domains require the DNS **zone on Cloudflare**. You keep
the registration at GoDaddy; you only re-point its nameservers (a delegation, not
a transfer).

1. **Cloudflare dashboard → Add a site →** `txquince.com` → Free plan. Cloudflare
   scans your GoDaddy DNS and gives you **2 nameservers** (e.g. `dana.ns.cloudflare.com`).
2. **GoDaddy → your domain → Nameservers → Change → "I'll use my own" →** paste the
   2 Cloudflare nameservers. Save.
3. Wait for activation (~10 min–2 hrs; Cloudflare emails you).
4. `npm run deploy:cloudflare` — wrangler reads the `routes` in `wrangler.jsonc`
   and **auto-creates** the proxied DNS + SSL certs for `txquince.com` and
   `www.txquince.com`. No manual A/CNAME needed.

**⚠️ Don't lose these in the nameserver move:**
- **Email DNS.** Moving nameservers moves *all* DNS. After Cloudflare imports your
  records, confirm **MX + the Resend SPF/DKIM** records are present in Cloudflare
  DNS, or email (and `hello@txquince.com` sending) breaks. Re-add if missing.
- **Canonical = apex.** `site.ts` canonicalizes to `https://txquince.com` (apex).
  Add a Cloudflare **Redirect Rule**: `www.txquince.com/*` → `https://txquince.com/$1`
  (301) so www and apex don't split SEO. (Change the canonical in `site.ts` first if
  you'd rather standardize on www.)

---

### Smoke test after deploy
- [ ] Home, /portfolio, /investment, /reserve, /check-your-date all render
- [ ] Inquiry form submits → operator + client emails arrive
- [ ] `/admin/login` works (no spinner hang), reaches the dashboard
- [ ] Once Stripe live: a test reservation completes + booking confirmation fires
