# Personalized quince plan (/plan) and the DFW price guide

## What a family sees
1. You reply in a Facebook group with one link, for example
   `https://txquince.com/plan?date=2026-11-21&colors=fucsia,blanco,dorado&src=fb-group`.
   Add `&lang=es` for a Spanish group (otherwise the phone's language decides).
2. They fill six light fields: date, city, colors (tap chips), theme (optional),
   name, and one "phone or email" box. Preferred language is a toggle.
3. They land on `/plan/<slug>` (Spanish: `/es/plan/<slug>`), a private page with
   a random 10-character slug. It shows their date status, our work matched to
   their colors, the three event packages, a **Hold my date** deposit button and a
   free day-of timeline (`/plan/<slug>/timeline`, `/es/plan/<slug>/cronograma`).
   The page never shows their name or contact details and is `noindex`.

URL params are never personal: `date`, `colors` (any spelling, EN or ES), `src`, `lang`.

## Owner tools
- **/admin/plans**: every plan with date, city, colors, source, and a
  New / Replied / Booked / Lost status. A paid date hold marks the plan Booked
  automatically. The "By source" row shows plans and bookings per `src` tag.
- **/admin/availability**: mark a date (or a run of Saturdays) Limited or Booked.
  Unmarked dates are Available. A live hold or paid booking always shows Booked.
- **/admin/price-guide**: paste rows from the lead sheet (copy straight from
  Google Sheets), preview, replace.
- **Admin → Portfolio**: each photo has a Colors field ("fucsia, dorado").
  Untagged photos still match through color words in their alt/title/caption.

## Setup
1. Run `supabase/migrations/0023_quince_plans.sql` on the database.
2. Stripe: no new product or price. The hold uses `site.booking.depositCents`
   ($500) as an inline price, the same Checkout code as the admin deposit link.
   Confirm `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` belong to the TX Quince
   Stripe account. The webhook endpoint (`/api/stripe/webhook`) needs the
   `checkout.session.completed`, `checkout.session.expired` events (already used).
3. No new env vars. Resend, Turnstile and Supabase use the existing keys.
4. Tag colors on your best portfolio photos.
5. Paste the first price-guide rows; both guide pages stay `noindex` until then.
