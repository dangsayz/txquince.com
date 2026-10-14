# Local demo — the client journey with fictional families

Everything runs on 127.0.0.1: Postgres 16, PostgREST, a small Supabase-shaped front door with a fake login, a fake Stripe, and `next dev`. No real Stripe, no real email (mail sink), and only fictional `@example.com` families. Nothing is deployed.

## 0. One-time setup

```bash
npm install
# Postgres 16 must run as a non-root user. Example for a throwaway cluster:
#   initdb -D /tmp/txq-pg/data -U postgres --auth=trust
#   pg_ctl -D /tmp/txq-pg/data -o "-p 55432 -c listen_addresses=127.0.0.1" start
# PostgREST: download the static binary from github.com/PostgREST/postgrest/releases (v12.x).
```

## 1. Database + config

```bash
node scripts/local/db-reset.mjs txquince_local     # Supabase shim + ALL migrations 0001→latest
node scripts/local/write-env.mjs                    # .env.local + .local/postgrest.conf (random local secrets)
```

`db-reset` refuses anything that isn't localhost.

## 2. Start the stack (four terminals)

```bash
postgrest .local/postgrest.conf                                  # :54322
node --env-file=.env.local scripts/local/local-supabase.mjs      # :54321  (/rest/v1 → PostgREST, fake /auth/v1)
node --env-file=.env.local scripts/local/fake-stripe.mjs         # :54323  (test checkout page + signed webhooks)
npx next dev -p 3210 -H 127.0.0.1                                # the site
```

- **Admin login:** `owner@example.com` / `local-demo-only` at http://127.0.0.1:3210/admin/login. It is fictional and only works against the fake auth.
- **Emails:** open `.mail-sink/*.html` in a browser. The `.json` files hold the to/subject/text.
- **Signed PDFs:** written to `.contracts-local/contracts/<bookingId>/<sha>.pdf`.

## 3. Walk it by hand

1. **Request.** Use the homepage booking form (it still shows a signature box until the tabbed redesign lands; the server ignores it). Or post directly:
   ```bash
   curl -s -X POST http://127.0.0.1:3210/api/commission -H 'content-type: application/json' -d '{
     "event_date":"2027-04-17","city":"dfw","venue":"Hacienda Las Flores (fictional)","start_time":"6:00 PM",
     "scope":"both","tier":"production","add_ons":["sameday"],"hours":7,
     "name":"Rosa Martínez","honoree":"Valentina","email":"rosa@example.com","phone":"214-555-0100",
     "language":"en","share_permission":true}'
   ```
   The response includes `link`. Also see `.mail-sink/*request-received*` and `*owner-new-request*`.
2. **Family page:** open the link. It shows "We got your request" with a held-until date. Try "Ver en español". A made-up token gives a real **404**.
3. **Admin:** go to `/admin/bookings`. The **Bookings** nav item shows a badge. Open the record and click **Approve**; the family is emailed.
4. **Sign:** on the family page, tick the consent, type the name, draw (or "Use my typed name"), then **Sign my agreement**. The record now shows the documents, IP and SHA-256. The PDF is attached to both emails and downloadable.
5. **Deposit:** click **Pay deposit $1,400**. The fake checkout page says *TEST MODE*. Click **Pay**: it sends a signed `checkout.session.completed` to the webhook, and you land back with "You're booked!"
6. **Message:** from the family page, pick "Change the time" and send. The admin badge shows unread. Reply from the record; the family is emailed.
7. **Balance:** click **Send balance link**. Either the family pays from their page, or record **Zelle** for $4,200. The booking is now *Paid in full*.
8. **Refund:** under the Stripe deposit row, type an amount and **Refund…**. Try more than the charge: it is refused server-side. The fake Stripe also posts `refund.created`, which is a no-op because the refund is already recorded.
9. **Delivery:** add gallery/video/review links and the album status, then **Save & email family**, then **Mark completed**. The family page is now the delivery page.
10. **Daily run:**
    ```bash
    curl -s http://127.0.0.1:3210/api/cron/daily -H "authorization: Bearer $(grep ^CRON_SECRET .env.local | cut -d= -f2)"
    ```
    Run it twice; the second run sends nothing new. Without the header you get 401.
11. **Email me my link:** go to `/my/booking`, type `rosa@example.com` (you get one email in the sink) and then `nobody@example.com` (no email). The on-screen answer is identical.

## 4. Automated

```bash
npm test                         # unit + handler tests (in-memory db, fake Stripe)
JOURNEY_IT_URL=http://127.0.0.1:54321 \
JOURNEY_IT_SERVICE_KEY=$(grep ^SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2) \
JOURNEY_IT_ANON_KEY=$(grep ^NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2) \
  npx vitest run src/lib/journey/postgrest.integration.test.ts   # same journey on real Postgres + PostgREST

# Screenshots of every state, EN + ES, 390px + 1440px (needs the playwright package; not a dependency):
node scripts/local/db-reset.mjs txquince_local
NODE_PATH=/path/to/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers OUT=./.local/journey \
  node scripts/local/journey-screens.mjs
```

The screenshot run reports any horizontal overflow (design law, gate 1).
