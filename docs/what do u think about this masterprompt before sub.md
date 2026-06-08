<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# what do u think about this masterprompt before submitting to claude opus 4.8

ROLE: Senior Next.js engineer + conversion-focused frontend designer. Build a production-grade, premium quinceañera photography/videography website for a SOLD-OUT solo operator in Dallas–Fort Worth. Brand: TX Quince. Domain: txquince.com. We are starting from scratch. Execute this spec exactly.

═══════════════════════════════════════════════════════════════
[LAW 1] THE ONE JOB — every decision serves these, in order:

1. JUSTIFY a \$2,500–\$5,500 price (present work like a premium studio, not a \$1,500 one).
2. FILTER budget shoppers out BEFORE they reach a phone call (prices are visible; cheap inquiries self-select away).
3. CAPTURE qualified inquiries into an OWNED channel (own DB + own email), so the business survives a Facebook ban/outage.
THIS IS NOT A LEAD-GENERATION SITE. The operator is fully booked. Do NOT optimize for traffic volume. Optimize for premium perception, qualification, and ownership.

═══════════════════════════════════════════════════════════════
[LAW 2] BUILD EXACTLY THIS — 5 CONTENT pages (utility pages /thank-you and /not-found are expected and DO get built):
/                  Home (does ~70% of the selling)
/portfolio         Portfolio / Galleries
/investment        Packages (anchoring)
/about             About (trust engine)
/check-your-date   Qualifying inquiry form (owned capture)
/thank-you         Form-success target (utility)
/not-found         404 (utility)
SHIP ORDER: build /, /investment, /check-your-date FIRST as a launchable conversion spine. /portfolio and /about are fast-follows. The site must be deployable after the spine.

═══════════════════════════════════════════════════════════════
[LAW 3] NEVER BUILD (anti-sprawl — prohibitions):
✗ NO blog, NO location/SEO pages, NO programmatic content.
✗ NO client galleries / photo-delivery system (lives in other tools).
✗ NO online booking / checkout / payment in v1 (booking is a phone relationship).
✗ NO accounts / login / auth.
✗ NO marketplace / gig / vendor features.
✗ NO third-party CMS. Content is code (typed data files), so the operator keeps total control and cannot be locked out.
If a feature doesn't directly serve premium perception, qualification, or ownership — it does NOT go in v1.

═══════════════════════════════════════════════════════════════
[LAW 4] OWNERSHIP — every layer owned by the operator:
domain (own) · code (own repo) · media on own Cloudflare R2 · data in own Supabase · deploy on own Vercel.
ZERO dependence on any platform that can revoke access. This is the entire reason the site exists.

═══════════════════════════════════════════════════════════════
[LAW 5] CONSENT — minors:
Every subject is a 15-year-old. Display ONLY images the operator confirms have written parental release.
Repo README CONTENT NOTE: "Only publish imagery/testimonials with signed parental model release; ensure client contract grants marketing usage rights." Do not invent or scrape imagery; use only operator-supplied, release-cleared media + clearly-labeled placeholders.

═══════════════════════════════════════════════════════════════
THE BUYER (design around her):

- Mother of a 15-year-old, planning a once-in-a-lifetime, emotionally enormous, culturally sacred event.
- DFW Latino market; many bilingual or Spanish-preferred.
- High-trust, high-fear purchase (flaky/scam vendors common — reliability is a differentiator).
- Arrives FROM FACEBOOK, ON A PHONE. THE MOBILE EXPERIENCE IS THE SITE — design + build phone-first, then desktop.
- Decides on: visceral proof of beauty, social proof from other quince moms, reliability/trust, cultural understanding.

═══════════════════════════════════════════════════════════════
TECH STACK \& ARCHITECTURE:

- Next.js (App Router) + TypeScript + Tailwind CSS.
- Hosting: Vercel.
- CONTENT AS CODE: all copy, prices, packages, testimonials, gallery manifests, and the "booked-through month" live in typed files (/content/*.ts). No CMS.
- MEDIA: images + video on Cloudflare R2. next/image with remotePatterns configured for the R2 domain. Hero video = compressed MP4/WebM from R2 with a poster frame.
- INQUIRY CAPTURE (only backend): one server API route (/api/inquiry) → validate server-side → insert into Supabase `inquiries` via SERVICE-ROLE key (server only, never exposed) → send TWO emails via Resend.
- ENV VARS (Vercel, never committed): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, OPERATOR_NOTIFY_EMAIL, TURNSTILE_SECRET_KEY, NEXT_PUBLIC_TURNSTILE_SITE_KEY.
- Analytics: Vercel Analytics + custom "inquiry_submitted" event.

═══════════════════════════════════════════════════════════════
DATA MODEL — Supabase, ONE table, locked down:
table inquiries:
id uuid pk default gen_random_uuid()
created_at timestamptz default now()
name text not null
email text not null
phone text
event_date date
venue text
services text          // 'photo' | 'video' | 'both'
budget_range text      // lowest option = \$2,500 (the filter)
referral text
message text
[SECURITY — LAW] RLS ENABLED. Policy: anon role has NO select, NO update, NO delete. Inserts happen ONLY server-side via service-role key in /api/inquiry. The anon/public key must never touch this table.

═══════════════════════════════════════════════════════════════
FORM BEHAVIOR (/check-your-date → /api/inquiry):
FIELDS: name (req) · email (req) · phone · event_date (date picker, FUTURE dates only, sane max ~3 yrs out) · venue/city · services [photo/video/both] (req) · budget_range dropdown ["\$2,500–\$3,500" / "\$3,500–\$4,500" / "\$4,500–\$5,500+"] (req — lowest is \$2,500, THE FILTER) · referral ("how did you hear about us?") · message (optional).
CONSENT LINE under the form: "By submitting, you agree to be contacted about your event." Link /privacy.
ANTI-ABUSE [LAW]: hidden honeypot field + Cloudflare Turnstile (PRIMARY gate) + rate limiting (see RATE LIMITING section). Reject on honeypot fill or failed Turnstile.
VALIDATION: server-side (email format, required fields, date is future \& in range) — never trust the client.
FORM UX STATES (client) [LAW]: idle / submitting (disabled button + spinner) / success / inline error. Never leave the user unsure whether it sent.
ON SUCCESS:
1. Insert row to Supabase.
2. Resend email \#1 → operator (all fields + "reply within 24h" reminder).
3. Resend email \#2 → inquirer (branded auto-acknowledgment: "Thank you — I'll personally reach out within 24 hours to confirm whether your date is open.").
4. Redirect to /thank-you, fire "inquiry_submitted" analytics event.
[LOGIC — LAW] SOLD-OUT REALITY: operator is booked through [MONTH]. Frame the form as reserving LIMITED remaining dates + next-year booking + cancellation waitlist. Confirmation copy must NOT promise the date is available — it promises a personal reply confirming availability, and invites waitlist if taken.

═══════════════════════════════════════════════════════════════
DESIGN SYSTEM (this is what signals \$5K vs \$1.5K):
AESTHETIC: editorial, elegant, cinematic. Heavy whitespace, oversized imagery, restrained UI — let the PHOTOS carry color. Model on high-end wedding photographers, not budget quince sites.
TYPE: display/headings = refined serif (Cormorant Garamond or Playfair Display); body/UI = clean sans (Inter or Geist). Generous line-height, large headings, tight display letter-spacing.
COLOR: base warm ivory/cream (~\#FAF7F2), charcoal text (~\#1A1A1A), soft greige sections. ONE muted premium accent only — dusty rose/blush OR deep burgundy — used sparingly (buttons/accents). No loud pinks, no gratuitous gradients.
MOTION: subtle only — gentle fade/translate-up on scroll. Tasteful, never gimmicky.
[PERF + LAW] HERO MEDIA: poster still is the LCP element; lazy-load compressed looping muted+playsinline video AFTER; on mobile prefer the still (autoplay desktop-first). Never let the hero film block LCP.

═══════════════════════════════════════════════════════════════
LAYOUT DISCIPLINE (premium perception lives here — anti-generic):

- Editorial, NOT template. Magazine-spread feel. NOT card grids with shadows, NOT centered-hero-with-button, NOT 3 equal feature boxes.
- Scale contrast: oversized serif headings vs. small uppercase tracked labels. Dramatic size jumps, not uniform text.
- Full-bleed imagery alternating with text in a narrow, generously margined column (text max-width ~640–720px; images full-bleed).
- Asymmetry + intentional negative space. Few elements per viewport.
- One spacing scale, used everywhere. Large uniform section padding.
- Contained text (~1100–1280px), full-bleed media where it earns it.
- Restraint over decoration: no gratuitous shadows/borders/gradients/icon clutter. THE PHOTOS ARE THE DESIGN.

═══════════════════════════════════════════════════════════════
GLOBAL ELEMENTS:
SCARCITY BAR (sticky, thin, top): "Booked through [MONTH] · Now reserving limited [YEAR] dates" — value driven from /content (operator edits as he books).
NAV (minimal): logo · Portfolio · Investment · About · [Check Your Date] (accent button).
FOOTER: contact, Instagram/Facebook, "Serving Dallas–Fort Worth," /privacy link, copyright. EN/ES toggle placeholder.
[LAW] OG/SOCIAL CARDS: traffic is 100% Facebook. Every page needs a custom, beautiful OG image + title + description so pasted link previews look EXPENSIVE. A cheap preview kills premium perception before the click. Treat OG cards as hero assets.

═══════════════════════════════════════════════════════════════
PAGE 1 — HOME (section by section):
[HERO] full-viewport. Poster still (LCP) → lazy compressed highlight loop, subtle dark overlay. Headline (serif): "Her quinceañera, remembered exactly as it felt." Subline: "Cinematic quinceañera photography \& film across Dallas–Fort Worth." Scarcity microline. ONE CTA: "Check Your Date".
[SOCIAL PROOF STRIP] "Trusted by 100+ DFW families" · ★★★★★ · venues/featured-in.
[THE WORK — teaser grid] 6–9 best images (church/portraits/reception) → /portfolio. CTA "See full galleries →".
[THE EXPERIENCE] 3 points: "Two storytellers, one day" · "Your sneak-peek within the week" · "On time, every time" (reliability = anti-flaky-vendor differentiator).
[FILM] one strong embedded highlight reel (R2).
[PACKAGES TEASER] "Collections starting at \$2,500." 3 tier names + one line each → /investment.
[TESTIMONIALS] 2–3 real quotes w/ mom + daughter names + photo (release-cleared); video testimonial if available.
[FINAL CTA BAND] accent bg: "Only a few [YEAR] dates remain. Let's make sure yours is one of them." → Check Your Date.

PAGE 2 — /portfolio:
Sections: Save-the-Date · Church/Mass · Portraits · The Celebration · Films. Large fast images (next/image + R2), lightbox, one-line intro each. Persistent + sticky-mobile "Check Your Date" CTA. CURATE RUTHLESSLY — only the best; a weak image lowers the price ceiling.

PAGE 3 — /investment (CONVERSION-CRITICAL — good/better/best anchoring):
Intro: "Every collection includes a complimentary save-the-date session." (the hook)
THREE FIXED-PRICE TIERS, side by side (stack on mobile), middle highlighted "Most Popular":
TIER 1 — ESSENTIAL — \$2,500
Photo OR video (one service), single artist · up to 6 hrs (church + reception) · edited gallery OR highlight film · complimentary save-the-date.
ROLE: the FILTER + floor. Cheapest number on the page so budget shoppers leave. Not meant to be sold.
TIER 2 — SIGNATURE — \$3,900  ★ MOST POPULAR
Photo + video, TWO storytellers · up to 8 hrs full-day · highlight film + full gallery · same-week sneak-peek · complimentary save-the-date.
ROLE: THE TARGET SALE. Steer everyone here. Replaces the old \$1,500 two-person package at 2.6×.
TIER 3 — LEGACY — \$5,500
Everything in Signature + cinematic long-form film (1–3 hrs) + drone + extra hours/second session + premium album/print credit + priority calendar.
ROLE: the ANCHOR at market ceiling so \$3,900 reads as the sensible choice.
FAQ (3–4 Qs): "How far in advance should we book?" · "Church AND reception?" · "What if our date is taken?" (scarcity + waitlist) · "Payment plans?" (yes — deposit + installments; kills price objection without discounting).

PAGE 4 — /about (TRUST ENGINE):
Real warm photo of the operator. Story weaving the differentiator: got into this because families get let down by unreliable vendors — so reliability, communication, and protecting the once-in-a-lifetime day are the whole point (anti-flaky-vendor moat). Cultural fit: understands the tradition (la misa, el vals, la corte, el saludo, los padrinos) and works bilingually. Approach: candid, modern, timeless. End CTA: Check Your Date.

PAGE 5 — /check-your-date: (see FORM BEHAVIOR above)
Headline: "Let's see if your date is open." Subline: "Tell me about your celebration and I'll personally reply within 24 hours." → /thank-you confirmation.

UTILITY PAGES:
/thank-you: branded, scarcity-aware copy ("I'll personally reach out within 24 hours…"), link back to /portfolio.
/not-found (404): on-brand, single CTA home.
/privacy: simple honest policy — what's collected (name/email/phone), why, that it's used only to respond. Linked in footer + under form.

═══════════════════════════════════════════════════════════════
CONVERSION MECHANICS (checklist — enforce all):
☐ Scarcity everywhere (bar, hero, FAQ, final band).
☐ ONE primary CTA site-wide: "Check Your Date." No competing CTAs.
☐ Sticky thumb-reachable mobile CTA on every page.
☐ Prices ALWAYS visible (visible pricing = the filter).
☐ Good/better/best anchoring, Signature as target.
☐ Social proof above the fold + on every page.
☐ Premium OG cards (FB previews look expensive).
☐ Fast load (premium perception dies on a slow site).

═══════════════════════════════════════════════════════════════
BILINGUAL EN/ES (high-ROI; scoped):
Structure copy for i18n from the start (next-intl or two locale route trees) so adding Spanish is trivial. Ship EN first with architecture ready; add ES within the week. EN/ES toggle in nav/footer. Do NOT let bilingual scope delay launch.

SEO BASELINE (minimal — no leads needed, hygiene only):

```
Correct <title>/<meta> per page, LocalBusiness schema, sitemap.xml, robots.txt, custom OG/Twitter cards, ALT TEXT on every image (accessibility + image SEO). NOTHING else — no keyword pages, no blog.
```

HYGIENE: favicon + apple-touch-icon + web manifest + correct <html lang>.

ANALYTICS: Vercel Analytics + "inquiry_submitted" event. Track inquiries/week, % per budget tier, FB-click→submit rate.

PERFORMANCE BUDGET [LAW]: LCP < 2.5s mobile. Compress/lazy-load all media, hero compressed + poster. Lighthouse 90+ mobile before launch.

═══════════════════════════════════════════════════════════════
PRIVACY / PII: form collects name, email, phone. Ship /privacy + footer link + form consent line (above).

EMAIL DELIVERABILITY [SILENTLY FAILS WITHOUT THIS]:
Resend needs a VERIFIED SENDING DOMAIN (SPF/DKIM DNS records) to send from a branded address — otherwise email \#2 spams or never sends. README action note: verify domain + add DNS before relying on email. [onboarding@resend.dev](mailto:onboarding@resend.dev) is local-testing only.

RATE LIMITING [serverless nuance]:
In-memory rate limiting does NOT work on Vercel serverless (state doesn't persist across invocations). Use a real store (Vercel KV / Upstash) OR treat Turnstile as the PRIMARY abuse gate with rate-limit as best-effort. Turnstile is the real defense.

═══════════════════════════════════════════════════════════════
SUCCESS METRICS (how we know it converted — do not skip):
Instrument from day one: inquiry submissions (primary conversion), % of submissions at \$2,500+ tiers (proves the filter works), FB-click→submit rate. The site is WORKING when inquiries arrive pre-qualified at premium budgets and the operator can hold \$3,900+. NOT a success because it "looks done."

═══════════════════════════════════════════════════════════════
LAUNCH CHECKLIST:
☐ Own domain (txquince.com) on own Vercel.
☐ Release-cleared best work curated to Home + Portfolio (ruthless cull).
☐ Hero film + reel compressed on R2; next.config remotePatterns set.
☐ Real testimonials w/ names + photos (release-cleared).
☐ Prices live \& visible (\$2,500 / \$3,900 / \$5,500).
☐ Form → server validation → Supabase (RLS locked) → 2 Resend emails → /thank-you, tested end to end.
☐ Turnstile + honeypot + rate limit active.
☐ Resend sending domain verified (SPF/DKIM).
☐ /privacy live + linked; consent line under form.
☐ /thank-you + /not-found + favicon + manifest + <html lang> in place.
☐ ALT text on all images; form UX states working.
☐ Scarcity bar shows current booked-through month.
☐ OG cards verified by pasting link into Facebook.
☐ Tested on a real phone first.
☐ Analytics + inquiry event firing; Lighthouse mobile 90+.

PHASE 2 (DO NOT BUILD NOW — logged so it can't creep into v1):
Stripe deposit/retainer link · full ES translation · connect inquiries to the Facebook-group audience play.

Do not summarize. Build.

**TL;DR: This is one of the strongest masterprompts I've seen — 90/10. Fix 6 critical gaps before submitting or Claude will silently diverge.**

***

## What's Working Exceptionally Well

- **The "Laws" framing** forces Claude to treat constraints as non-negotiable rather than suggestions — correct architectural choice
- **Ship order specified** (`/`, `/investment`, `/check-your-date` first) — prevents Claude from building a beautiful `/about` while leaving the backend incomplete
- **Phase 2 lockout** explicitly logged — this is what separates senior prompts from amateur ones; feature creep is the \#1 LLM failure mode
- **Security architecture is correct**: service-role key server-only, RLS anon lockdown, Turnstile as primary gate, in-memory rate-limit caveat acknowledged
- **Data model is complete**: all fields typed, UUID PK, RLS policy described — Claude can generate the exact SQL migration
- **Conversion mechanics are coherent**: pricing as filter, single CTA, scarcity anchoring — internally consistent strategy
- **OG card treatment as hero assets** — most prompts forget this; you caught it because your traffic source is Facebook
- **LCP constraint specified with implementation detail** (poster still = LCP, lazy video after) — correct and actionable

***

## Critical Gaps to Fix Before Submitting

| \# | Gap | Risk | Fix |
| :-- | :-- | :-- | :-- |
| **1** | No file/folder structure specified | Claude invents its own structure; `/content/*.ts` is mentioned but not scaffolded | Add explicit tree: `content/packages.ts`, `content/testimonials.ts`, `content/gallery.ts`, `content/site.ts` (booked-through month lives here) |
| **2** | Turnstile client-side integration unspecified | Claude may use the wrong widget embed pattern or skip the server-side secret validation loop | Specify: `@marsidev/react-turnstile` for widget, server validates token against `https://challenges.cloudflare.com/turnstile/v0/siteverify` before any DB write |
| **3** | Email templates have no format spec | Claude will generate plain-text or generic HTML; this is a premium brand | Add: operator email = structured plain text with all fields; inquirer email = branded HTML with logo placeholder, warm tone, bilingual P.S. |
| **4** | `next-intl` vs route tree = ambiguous | These are architecturally very different; Claude will pick one arbitrarily | Decide now: **`next-intl` with `[locale]` route group** is cleaner for App Router. State it explicitly |
| **5** | Lightbox library unspecified for `/portfolio` | Claude may reach for `react-lightbox`, `yet-another-react-lightbox`, or build custom — inconsistent output | Specify `yet-another-react-lightbox` (actively maintained, next/image compatible, zero-bloat) |
| **6** | No `next.config.ts` remotePatterns example | Claude frequently misconfigures R2 hostname format, breaking `next/image` in prod | Add: `{ hostname: '*.r2.cloudflarestorage.com' }` or your specific R2 public bucket domain |


***

## Minor Refinements

- **`/privacy` page** — listed in footer + form consent but not in [LAW 2]'s page list. Add it or Claude may skip building it as a real route
- **Honeypot field name** — don't leave it unnamed; Claude will pick `website` or `company` which bad bots know. Specify an obscure name like `_trap` or `fax_number`
- **Supabase client file** — clarify: one `lib/supabase-server.ts` using service-role key (server components/routes only), zero client-side Supabase usage. Otherwise Claude may accidentally expose the service key in a client component
- **`content/site.ts` shape** — at minimum specify the `bookedThrough` field so the scarcity bar pulls from code, not a hardcoded string Claude buries in a component
- **Vercel KV vs Upstash** — you flagged in-memory rate limiting correctly, but left the decision open. If you want rate limiting at all, pick **Upstash Redis** (free tier, `@upstash/ratelimit` has a Vercel-native adapter, 5 lines of code)

***

## One Optional Power-Up

Add this block at the end before "Do not summarize. Build.":

```
OUTPUT FORMAT:
  Deliver in this order:
    1. /content/*.ts — all typed data files first (operator edits here)
    2. Database migration SQL (copy-paste into Supabase SQL editor)
    3. next.config.ts
    4. lib/ (supabase-server.ts, resend.ts)
    5. app/ routes in ship order: /, /investment, /check-your-date, /api/inquiry, /thank-you, /not-found, /portfolio, /about, /privacy
    6. components/ (shared: ScarcityBar, Nav, Footer, StickyMobileCTA, InquiryForm)
    7. README with operator onboarding steps (env vars, DNS, Resend domain verify, R2 setup)
  After each file, pause for confirmation before the next group. Do NOT front-load all code silently.
```

This forces Claude Opus to deliver in a reviewable, deployable sequence rather than dumping 3,000 lines at once with the critical backend buried at the end.

***

## Bottom Line

Submit as-is and you'll get a very good result with ~3 architectural decisions made arbitrarily. Add the 6 gap fixes and the output format block and you get a **deterministic, production-deployable scaffold on the first pass** — which is exactly what this operator needs since they're already sold out and time is the constraint.

