# TX Quince visual rebuild evidence

## Scope and frozen contracts

This is a front-end rebuild. The existing `src/app/api`, `src/lib` server integrations, `supabase/migrations`, `cron-worker`, authentication, payment, email, environment, and deployment files are **FROZEN**. The public pages consume their present content and APIs. `src/lib/og.tsx` only renders social preview artwork; its colors and type treatment changed in the Mobbin visual correction without changing a backend contract. The initial branch is `origin/main` at `657a87c`.

| Frozen contract | Method or data | Current consumer and behavior |
| --- | --- | --- |
| `/api/inquiry` | POST `inquirySchema` (`name`, `email`, optional `phone`, optional `event_date`, optional `venue`, `services`, `budget_range`, optional `referral`, optional `message`), honeypot, Turnstile, attribution | `InquiryForm`; 422 field errors, 403 verification, 429 limit, 500 storage, `{ok:true}` success and `/thank-you` redirect. |
| `/api/reserve-request` | POST `bookingSchema` (`name`, `email`, optional `phone`, required `event_date`, `collection`, `package`, optional `notes`), honeypot, Turnstile, attribution | `BookingForm`; creates a requested hold, sends acknowledgment, displays success, no immediate payment. |
| `/api/availability` | GET `{ok:true,takenDates:string[]}` | `BookingForm`; read-only courtesy, final collision guard remains server-side. |
| `/api/booking` | POST booking schema, Stripe checkout | Existing direct booking path; keep endpoint and payload untouched. |
| `/api/img/[slug]` | GET branded, protected image bytes | Gallery, hero and share pages. Do not expose raw storage URLs. |
| `/api/track` | POST first-party analytics event | `Tracker`; preserve `cta_clicked`, `form_started`, `date_checked`, inquiry and booking events. |
| `/api/unsubscribe` | GET/POST unsubscribe token | Existing email unsubscribe page. |
| `/api/stripe/webhook` | POST Stripe signature and event | Payment fulfillment; no front-end changes. |
| `/api/cron/followups`, `/api/cron/booking-recovery` | GET authorized scheduled jobs | Follow-up and recovery; no front-end changes. |
| `/api/admin/me`, `/api/admin/signout` | GET/POST session state | Admin sign-in, edit overlay and sign-out. |
| `/api/admin/images`, `/api/admin/images/reorder`, `/api/admin/sign-upload` | POST/PATCH/DELETE image CRUD, POST reorder, POST signed upload | Admin portfolio and on-page editor. |
| `/api/admin/hero` | POST/DELETE hero media | Admin hero manager. |
| `/api/admin/videos`, `/api/admin/videos/reorder` | POST/PATCH/DELETE video CRUD, POST reorder | Admin video manager. |
| `/api/admin/bookings`, `/api/admin/bookings/deposit-link` | PATCH booking, POST deposit link | Admin bookings and payment request. |
| `/api/admin/changes`, `/api/admin/describe` | POST/PATCH activity and AI description | Admin logs and portfolio manager. |
| `getPortfolioImages`, `getFeaturedImages`, `getImageBySlug`, `getVideos`, `getHeroMedia` | Server read models in `src/lib/content-db.ts` | Public gallery, home, photo detail and films. Empty values are valid; UI must render honest empty states. |
| Auth and data | Supabase SSR/service client and middleware | Admin only. Existing server dependency is a portfolio migration blocker under parent `AGENTS.md`; the visual branch cannot alter it. |
| Payment and mail | Stripe, Resend, Turnstile | No change to charging, sends, or abuse defenses. |

Routes to retain: `/`, `/portfolio`, `/photos/[category]`, `/photos/[category]/[slug]`, `/investment`, `/check-your-date`, `/reserve`, `/reserve/success`, `/about`, `/blog`, `/blog/[slug]`, `/privacy`, `/links`, `/thank-you`, `/unsubscribed`, `/quinceanera-photographer`, `/quinceanera-photographer/[city]`, `/es/fotografo-de-quinceaneras`, `/es/fotografo-de-quinceaneras/[city]`, `/es/blog`, `/es/blog/[slug]`, `/admin`, `/admin/login`, `/admin/reset-password`, `/admin/bookings`, `/admin/inquiries`, `/admin/portfolio`, `/admin/videos`, `/admin/hero`, and the 404 page. Existing canonical, Open Graph, JSON-LD, sitemap, robots, Spanish alternates, and tracking remain.

## Content inventory

The public homepage now offers a quinceañera hero, date inquiry, real portfolio media and films when configured, three collection teasers from `src/content/packages.ts`, three booking steps, FAQs, city links, Instagram, and repeated reservation actions. `/portfolio` reads images and videos from the database and falls back to ten existing public TX Quince photographs when the database has no media. `/photos/[category]/[slug]` provides a branded share page for a single existing image. `/investment` has the three source-controlled collections Essential $2,500, Signature $3,900, and Legacy $5,500. The current live site advertises a fourth Moments collection; that differs from `origin/main` and must not be invented in this branch. `/check-your-date` and `/reserve` are distinct no-payment requests. `src/content/testimonials.ts` has no released quotes. `src/content/about.ts` has no configured operator name or portrait; the profile uses neutral studio copy and no invented founder story. `src/content/site.ts` supplies contact, Instagram, service area, CTA, and scarcity copy; the rebuild does not display unverified scarcity. Blog and location pages contain source-controlled guides and local copy. The ten fallback photographs were downloaded from public `txquince.com/api/img` responses on 2026-09-28, re-encoded as smaller WebP files without changing composition, and stored under `public/portfolio/`; the portfolio database remains the first source.

## Behance observations

Observed on Mobbin 2026-09-28 in the [Behance Web Screens, UI Elements, and Flows tabs](https://mobbin.com/apps/behance-web-5cac025a-0195-4424-ab02-61fb8406bd29/_/screens). The listing reports 387 screens, 387 UI elements, and 99 flows. Representative screens were inspected across discovery, search/filter, project detail, profile, and moodboard states. The UI Elements tab exposes screenshots rather than a distinct primitive inventory, so the patterns below are visual inferences. Mobbin sections search returned unrelated sites, so it is not used as Behance evidence.

| Pattern observed | Source | TX Quince interpretation |
| --- | --- | --- |
| Thin utility navigation, broad search, compact filters, four-column image grid, small caption/meta rows | [Discovery feed](https://mobbin.com/screens/822b6b28-de8c-4936-a3c6-b73425f290a3), [search grid](https://mobbin.com/screens/78e31b7f-68ae-46f5-8ec4-4735dda6d22d) | Restrained white shell and image-led galleries with booking in the utility area. |
| Fixed filter rail and removable applied-filter chip; sort control above cards | [Filtered results](https://mobbin.com/screens/71bf1d91-60dd-4a28-9dcf-817951fea531), [sort menu](https://mobbin.com/screens/d0efdaa4-c9b9-47fa-a35e-de6255fbf807) | Quince moment categories and client-side search/sort over real portfolio data. |
| Large project canvas with a vertical action rail and related work | [Project view](https://mobbin.com/screens/a7c7d920-dac5-410b-979b-eaf9aae59726), [project flow](https://mobbin.com/flows/ebfb91fc-5196-4f7a-aaa8-acbecfc08f10) | Photo detail with visible share and date-request actions, then related released images. |
| Profile banner, portrait, compact identity card, tab row, grid | [Profile](https://mobbin.com/screens/fbc91be3-8ad8-43d7-af3c-40b6d368b453) | About page identity panel only when real name and portrait exist. |
| Modal has a focused selection list, create state, and explicit empty state | [Save dialog](https://mobbin.com/screens/4ad4bcf4-2aa9-48aa-9edc-90f6ebb6959c), [empty dialog](https://mobbin.com/screens/a1d37736-4b8b-4e35-9fb8-9c8c7ab3cbd7) | Local saved-photo collection, with an honest empty state and no account claim. |
| Journey moves from feed to search, filters, detail and save | [Search flow](https://mobbin.com/flows/f35c8549-9a10-4baf-b655-5fdafeac8c6f), [project flow](https://mobbin.com/flows/ebfb91fc-5196-4f7a-aaa8-acbecfc08f10) | Browse quince moments, view image, save inspiration, request date with one visible action per screen. |

Inferred tokens for implementation, subject to browser verification: white canvas; light-gray surfaces; near-black text; muted gray metadata; a vivid blue action color; bold sans headings with compact tracking; 8px base spacing with 16/24/32px major gutters; 3/4 and 4/3 image ratios; 12-16px corner radii; 1px borders; 150-250ms control transitions. These are estimates from image evidence, not extracted Mobbin source tokens. [Behance discovery](https://mobbin.com/screens/e89601be-98b6-4e7f-95bb-3046a75786b6), [filtered results](https://mobbin.com/screens/f83d8866-d925-4113-a82e-68c33e74b890), and [profile](https://mobbin.com/screens/fbc91be3-8ad8-43d7-af3c-40b6d368b453) anchor the revised palette and typography. TX Quince keeps its own name, text, and released photography. Inter is the available sans approximation; the screenshots do not expose a reusable font file or exact type specification.

## Component map

`N/A` means the reference requires a product/backend capability that a single-studio booking site does not have. Built means the component was implemented; browser and performance evidence are recorded below.

| Behance pattern | TX Quince equivalent | Target file | Status |
| --- | --- | --- | --- |
| Global navigation and search | Booking-first responsive nav and portfolio search | `src/components/Nav.tsx` | Built; mobile menu browser tested |
| Category/filter controls | Moment chips and filters | `src/components/PortfolioGallery.tsx` | Built; portrait filter browser tested |
| Project cards | Real-photo cards with detail, save, and share | `src/components/PortfolioGallery.tsx` | Built; save browser tested |
| Discovery home | Booking hero, selected work, packages, process, inquiry | `src/app/page.tsx` | Built; mobile screenshot reviewed |
| Project detail and action rail | Branded photo page | `src/app/photos/[category]/[slug]/page.tsx` | Built |
| Profile header | About studio section | `src/app/about/page.tsx` | Built; avoids unverified identity and founder claims |
| Save/moodboard | Local favorites with empty state | `src/app/saved/page.tsx` | Built; local persistence browser tested |
| Modal/lightbox | Accessible gallery lightbox and share | `src/components/PortfolioGallery.tsx`, `src/components/ShareModal.tsx` | Built; arrows and Escape browser tested |
| Buttons, chips, fields, modal, drawer, tooltip, toast, tabs, avatar, badge, skeleton, divider, lightbox | TX Quince primitives and styleguide | `src/components/ui/`, `src/app/styleguide/page.tsx` | Built |
| Multi-column footer | TX Quince navigation, contact, service areas | `src/components/Footer.tsx` | Built |
| Hire/contact flow | Existing inquiry and reserve forms | `src/components/InquiryForm.tsx`, `src/components/BookingForm.tsx` | Built; validation browser tested, invalid endpoint responses verified |
| Logged-in social feed and follow state | No social accounts for families | N/A | N/A: single studio, no customer auth or follows |
| Creator upload/editor and freelance market | Existing admin tools stay under frozen contracts | N/A | N/A: no public uploads or freelancer marketplace |
| Paid assets, jobs, Pro upsell, messaging | No matching product or backend | N/A | N/A: outside quince booking task |

## Verification gates

The code diff contains no changes to `src/app/api`, `src/lib` backend integrations, migrations, `cron-worker`, middleware/proxy, auth implementation, package and lockfiles, environment or deployment configuration. The only modified file under `src/lib` is the presentational social-image renderer `src/lib/og.tsx`. Check the boundary against `origin/main` with `git diff --name-only` on those paths and review that file separately. The frozen contracts above are still in force.

| Check | Result |
| --- | --- |
| TypeScript | `npx tsc --noEmit` passed. |
| Lint | `npm run lint` passed with one existing warning in untouched `cron-worker/src/index.ts:26` (`import/no-anonymous-default-export`). |
| Gallery model | `node --experimental-strip-types --test src/components/gallery/gallery-model.test.mjs` passed 3/3 tests covering search, category/sort, and saved keys. |
| Production build | Final `npm run build` passed and generated 78 pages. |
| Browser interaction | Mobile menu open/Escape close; desktop search suggestion to filtered results; portfolio portrait filter; lightbox arrow, zoom/fit and Escape; saving a photograph and seeing it persist on `/saved`; inquiry step validation; sticky navigation shrink. Final production-build gallery rendered all ten fallback photographs. |
| Mobbin visual revision | The final production preview was visually reviewed on mobile home and portfolio and desktop home and portfolio. The portfolio selected filter is blue; mobile portfolio, About, Investment, and Check Your Date each had one H1 and no document horizontal overflow at 390px. The revised social preview was rendered and inspected at 1200 × 630. |
| API failure paths | Local POST `{}` to `/api/inquiry` and `/api/reserve-request` returned 422 with field errors; GET `/api/availability` returned 200 with `takenDates:[]`. No successful real submission was sent. |
| Responsive | Screenshots of 23 public route templates at 390, 768, 1280, 1536 px; one H1 and no document horizontal overflow on the checked templates at those widths. `/photos/[category]` redirected to `/portfolio#portraits` as designed. Generated city and blog slugs were represented by one page per template, not every slug. |
| Admin | `/admin/login` and `/admin/reset-password` could not render in the local browser: existing Supabase middleware requires URL/key absent from this checkout. Other authenticated admin routes were not verified. No credentials or backend files were changed. |
| Lighthouse mobile portfolio | Streamed gallery run scored 99 / 100 / 100 / 100 (Performance / Accessibility / Best Practices / SEO), LCP 1.9 s and TBT 90 ms. A final-build repeat scored 81 / 100 / 100 / 100, LCP 3.6 s and TBT 390 ms. CLS was 0 in both. Consistent 90+ Performance is not verified. |
| Lighthouse mobile home | Earlier local runs varied from 70 to 95 Performance. The Mobbin revision scored 85 / 100 / 100 / 100 (Performance / Accessibility / Best Practices / SEO), LCP 4.4 s, TBT 60 ms, CLS 0. The hero image received `fetchpriority=high`; consistent 90+ Performance and LCP under 2.5 s are **not verified**. |

The initial responsive screenshots are stored under `/Users/walkaway/.codex/visualizations/2026/09/28/01a0ea44-d1ff-70b3-bc88-b685bf45bf62/txquince-screenshots/`. The Mobbin color, type, and copy revision has its own updated screenshots under `txquince-mobbin-revision/`. The `admin-login` and `admin-reset` images show the environment blocker, not the rebuilt auth UI. Do not submit a real inquiry or reservation during local smoke testing: those endpoints can send external messages and create records. A valid end-to-end submission and live deployment remain pending because the inherited runtime still depends on retired Supabase, which the parent operating standard forbids configuring or deploying.

## Content and capability gaps

- No released testimonials, verified photographer portrait/name, live Instagram feed API, or measured appreciation counts are present in the source data. The interface shows honest empty or studio states instead of inventing them. The About copy no longer includes an unverified first-person origin story.
- The published site currently shows a fourth Moments collection, while this branch's source of truth defines only Essential, Signature, and Legacy. A content decision is needed before publishing this visual rebuild.
- The existing portfolio schema has broad sections for save-the-date, church, portraits, celebration, and films. More granular Behance-inspired categories such as Court of Honor, Dress and Details, and Outdoor would need authored tagging/content before a truthful filter could expose them.
- Authenticated admin UI and a valid request success path require a safe test environment with the current server dependencies. The front-end branch deliberately kept those contracts frozen.
