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
   It runs **hourly** and pings both endpoints. Follow-ups are day-paced
   internally, so hourly only matters for recovery (fires within ~an hour of a
   hold expiring). Both 401 until the secret is set — nothing sends before that.

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
