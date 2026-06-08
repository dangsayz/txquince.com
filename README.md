# TX Quince — txquince.com

Premium quinceañera photography & film site for a **sold-out** solo operator in
Dallas–Fort Worth. The site exists to (1) justify a $2,500–$5,500 price, (2)
filter out budget shoppers before a phone call, and (3) capture qualified
inquiries into an **owned** channel (own DB + own email) so the business survives
a Facebook outage or ban.

> **CONTENT NOTE (consent):** Only publish imagery/testimonials with a signed
> parental model release, and ensure the client contract grants marketing usage
> rights. Every subject is a 15-year-old. Do not scrape or invent imagery — use
> only release-cleared media. The site ships with clearly-labeled placeholders
> until real, cleared media is added.

## Stack

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**
- **Vercel** hosting · **Cloudflare R2** media · **Supabase** inquiry storage ·
  **Resend** email · **Cloudflare Turnstile** anti-abuse · **Vercel Analytics**
- **Content as code** — all copy, prices, packages, testimonials, galleries, and
  the "booked-through" month live in `src/content/*.ts`. No CMS, no lock-out.

## Pages

| Route             | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `/`               | Home (does ~70% of the selling)                 |
| `/investment`     | Packages — good/better/best anchoring           |
| `/check-your-date`| Qualifying inquiry form (owned capture)         |
| `/portfolio`      | Galleries (lightbox)                            |
| `/about`          | Trust engine                                    |
| `/thank-you`      | Form success                                    |
| `/privacy`        | Privacy policy                                  |
| `404`             | On-brand not-found                              |

---

## Local development

```bash
npm install
cp .env.example .env.local   # fill in what you have; the site runs without keys
npm run dev
```

Without any env vars the site still runs: media shows tasteful placeholders,
Turnstile is skipped, and the form will report that storage isn't configured.

---

## Where the operator edits content

Everything is plain TypeScript in `src/content/`:

- **`site.ts`** — brand, contact, social links, and **scarcity** values. Update
  `scarcity.bookedThrough` / `barText` as you book out — every scarcity surface
  (top bar, hero, form, final band) reads from here.
- **`packages.ts`** — the three tiers + FAQ. Prices live here.
- **`testimonials.ts`** — real quotes. Each must have `released: true` (signed
  release) or it will **not** render.
- **`gallery.ts`** — portfolio manifests + the home teaser. Reference each image
  by its R2 key.
- **`media.ts`** — hero poster/video keys and the home film.
- **`home.ts` / `about.ts`** — page copy.

---

## Setup checklist (do these before launch)

### 1. Cloudflare R2 (media)
1. Create a bucket and enable public access (custom domain recommended, e.g.
   `media.txquince.com`).
2. Set `NEXT_PUBLIC_R2_BASE_URL` to that public URL.
3. Upload compressed media and reference keys in `media.ts` / `gallery.ts`.
   - Hero: a compressed **poster** (LCP) + a short muted **MP4/WebM** loop.
   - Keep images < ~400 KB and the hero video < ~3 MB (PERFORMANCE BUDGET).
   - `next.config.ts` derives the allowed image host from `NEXT_PUBLIC_R2_BASE_URL`.

### 2. Supabase (inquiry storage)
1. Create a project.
2. Run `supabase/migrations/0001_inquiries.sql` in the SQL editor. This creates
   the `inquiries` table with **RLS enabled and no policies** — anon is fully
   blocked; only the server (service-role key) can insert.
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API).
   The service-role key is **server-only** — never expose it client-side.

### 3. Resend (email) — **silently fails without domain verification**
1. Add and **verify your sending domain** in Resend (add the SPF + DKIM DNS
   records they give you). Without this, the confirmation email to the inquirer
   will land in spam or never send.
2. Set `RESEND_API_KEY`, `OPERATOR_NOTIFY_EMAIL`, and `RESEND_FROM`
   (e.g. `"TX Quince <hello@txquince.com>"`).
3. `onboarding@resend.dev` is for local testing only.

### 4. Cloudflare Turnstile (anti-abuse — the primary gate)
1. Create a Turnstile widget.
2. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
   - If the secret is unset, server verification is **skipped** (dev only) — set
     it in production so the gate is live.

### 5. Vercel (deploy)
1. Import the repo, add all env vars (Production + Preview), deploy.
2. Point `txquince.com` at the project.

---

## Inquiry flow (the only backend)

`/check-your-date` → `POST /api/inquiry`:

1. Honeypot check (`fax_number` hidden field) → drop bots.
2. Best-effort rate limit (Turnstile is the real defense — see below).
3. **Turnstile** verified server-side before any write.
4. Server-side **zod** validation (`src/lib/inquiry.ts`) — never trusts client.
5. Insert into Supabase `inquiries` (service role, RLS-locked).
6. Two Resend emails: operator notification + branded inquirer acknowledgment
   (does **not** promise the date is open — promises a personal reply + waitlist).
7. Client redirects to `/thank-you` and fires the `inquiry_submitted` analytics
   event (with budget tier + services, to prove the filter works).

### Rate limiting note
The in-memory limiter in `route.ts` is **best-effort** — serverless instances
don't share memory. **Turnstile is the primary abuse gate.** For durable limits,
add Upstash Redis + `@upstash/ratelimit` and swap it into `route.ts`.

---

## Analytics — success metrics

Track from day one: inquiry submissions (primary conversion), **% of submissions
at each budget tier** (proves the filter works), and FB-click→submit rate. The
site is working when inquiries arrive pre-qualified at premium budgets and the
operator can hold $3,900+ — not because it "looks done."

---

## Pre-launch checklist

- [ ] R2 set; hero poster + reel compressed; gallery keys filled.
- [ ] Release-cleared best work curated to Home + Portfolio (ruthless cull).
- [ ] Real testimonials with names + photos, `released: true`.
- [ ] Prices live & visible ($2,500 / $3,900 / $5,500).
- [ ] Form → validation → Supabase (RLS) → 2 Resend emails → /thank-you, tested.
- [ ] Turnstile + honeypot active; Resend domain verified (SPF/DKIM).
- [ ] `/privacy` linked; consent line under the form.
- [ ] Scarcity bar shows the current booked-through month.
- [ ] OG cards verified by pasting the link into Facebook.
- [ ] Tested on a real phone first; Lighthouse mobile 90+.

## Phase 2 (not in v1)

Stripe deposit/retainer link · full Spanish (ES) translation · connecting
inquiries to the Facebook-group audience play. The codebase keeps copy
centralized so adding ES is straightforward.
