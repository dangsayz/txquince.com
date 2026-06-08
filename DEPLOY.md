# TX Quince — Go-Live Checklist

Single source of truth for taking txquince.com from "built" to "booking."
Hosting is **Cloudflare Workers via OpenNext** (mirrors quincenetwork.com).

---

## 1. Cloudflare deploy

```bash
npx wrangler login                 # auth to the Cloudflare account (one time)
npm run preview:cloudflare         # optional: local Workers preview before shipping
npm run deploy:cloudflare          # builds + deploys to Cloudflare
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
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `NEXT_PUBLIC_R2_BASE_URL`

**Server-only secrets** (set via `wrangler secret put <NAME>`, never committed):

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ADMIN_EMAILS            # dangzr1@gmail.com,dangxaoj@gmail.com
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

## 4. Stripe (deposit booking)

1. Create / choose the Stripe account; copy the **secret** key → `STRIPE_SECRET_KEY`.
2. Add webhook endpoint: `https://txquince.com/api/stripe/webhook`, event
   `checkout.session.completed`. Copy signing secret → `STRIPE_WEBHOOK_SECRET`.
3. Dashboard → Settings → Payment methods: enable **Card + Affirm/Klarna/Afterpay**
   (auto-surfaces "pay $500 now or in installments").
- Until both secrets are set, `/reserve` shows a graceful "deposits not live yet"
  notice and steers to the inquiry form. Nothing breaks.

## 5. Lead follow-up nurture (optional but recommended)

The 3-touch sequence is built and inert until activated:

1. Set `CRON_SECRET` on the app (§2) **and** on the cron worker.
2. Deploy the cron worker (separate, in `cron-worker/`):
   ```bash
   cd cron-worker
   npx wrangler deploy
   npx wrangler secret put CRON_SECRET     # same value as the app's
   ```
   It pings `/api/cron/followups` daily (16:00 UTC). Every email carries a
   one-click unsubscribe.

## 6. Content unlocks (convert "built" → "booking")

- Upload one real photographer **portrait** → set `about.portraitKey` in
  `src/content/about.ts` (fills the About hero + the credibility signal).
- Add at least one **release-cleared testimonial** in `src/content/testimonials.ts`
  (`released: true`). Reviews slots on `/reserve` + `/investment` light up.
- Verify the **Resend sending domain** (SPF/DKIM) so emails send from
  `hello@txquince.com` instead of the sandbox sender.

---

### Smoke test after deploy
- [ ] Home, /portfolio, /investment, /reserve, /check-your-date all render
- [ ] Inquiry form submits → operator + client emails arrive
- [ ] `/admin/login` works (no spinner hang), reaches the dashboard
- [ ] Once Stripe live: a test reservation completes + booking confirmation fires
