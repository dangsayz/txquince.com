# Booking system audit — 2026-10-14 (read-only, before the client-journey build)

Scope: the committed booking flow (sign → request hold → admin approve → pay link → Stripe → webhook),
read-only GETs against txquince.com, `npm audit`. Nothing was changed.
Not verifiable from here: CRON_SECRET on the cron worker, pg_cron (migration 0004) on the self-hosted
database, Stripe webhook registration, database RLS flags / function grants.

## Verdict
Not finished. Request → sign → approve → 25% deposit is built and mostly solid. Nothing collects the
remaining balance; in rare cases a captured deposit can go unrecorded; expired holds likely never release
unless pg_cron runs; paid bookings can't be cancelled/refunded from admin. Security basics are good
(admin auth, unguessable pay links, server-side pricing, verified webhook); gaps are missing security
headers, a Next.js version with known advisories, date-blocking by fake requests, a spoofable stored IP,
and the public PostgREST endpoint relying on RLS alone.

## Missing / incomplete (by business impact)
1. Remaining balance is never collected — no reminder, final payment link, paid-in-full status or receipt.
2. A paid deposit can go unrecorded (H1/H2).
3. Hold expiry probably isn't running (only pg_cron calls `release_expired_booking_holds`; availability ignores `expires_at`).
4. Paid bookings have no cancel/refund path in admin; partial refunds and disputes aren't synced; no cancellation email.
5. Silent lapses: no reminders when the owner hasn't approved or the family hasn't paid; approval email has no deadline.
6. Admin can't see balance/due date, hold/pay deadlines, pay link, email delivery status, Stripe ids; expired bookings can't be re-approved from the UI.
7. Recovery cron is effectively dead for this flow (7-day lookback == hold length); review-requests cron isn't pinged.
8. Paid confirmation email is English-first and omits total/balance; "25%"/"48 hours" are hard-coded in several places.
9. No minimum lead time (tomorrow is bookable).
10. Privacy page doesn't cover signature, IP, user-agent, payments or analytics.

## Security findings
High
- H1 `src/lib/booking-fulfillment.ts:35-51` swallows RPC/read errors and the webhook returns 200 → Stripe never retries → captured deposit unrecorded. Fix: throw → 500.
- H2 `src/app/api/booking/pay/route.ts:48-90` overwrites the stored session id; a payment on an older session (e.g. slow ACH) can't be matched (`confirm_booking_payment` looks up by session id only) → lost record or double charge. Fix: match by `client_reference_id`/`metadata.booking_id`; refuse a new session while one is complete/processing; expire superseded sessions.
- H3 next 16.2.7 has advisories (critical incl. next/og ImageResponse RCE GHSA-vcvr-r3jv-pc5j). Fix: upgrade next.
Medium
- M1 anyone passing Turnstile can hold any date for 7 days with an unverified email.
- M2 hold release depends on unverified pg_cron; app never releases holds.
- M3 client IP from first X-Forwarded-For (spoofable; stored on signed agreements); per-isolate in-memory rate limit. Fix: `cf-connecting-ip`, Cloudflare rate limiting.
- M4 no security headers (HSTS, CSP/frame-ancestors, nosniff, Referrer-Policy); admin frameable.
- M5 decline/expiry don't expire an open Stripe session; RPC flips cancelled/expired → paid.
- M6 public PostgREST at db.txquince.com: anon role still has table privileges on bookings/inquiries (RLS appears to be the only barrier). Re-apply the revokes from 0001/0002/0015; verify RLS + function grants; consider not exposing /rest/v1.
Low
- Admin pages rely on middleware only (add `requireAdmin()` in the admin layout); no allowed-transition checks on admin status PATCH;
  email `esc()` doesn't escape quotes (tel: hrefs); pay token never expires and travels in URLs; `/api/admin/upload` has no type/size checks;
  unescaped JSON-LD on venue pages; deleted photos stay edge-cached; `/booking/<bad>` returns 200; re-signing with someone's email+date expires their hold.

## Done well
Server re-pricing + server-built agreement; frozen deposit; amount/currency check on fulfilment; HMAC webhook with replay window and
source filter; idempotent locked confirm RPC; partial unique index on event_date; requireAdmin on every admin API; Turnstile fails closed;
zod limits; token pages noindex/no-store; React escaping; photo uploads validated by magic bytes; secrets server-side.
