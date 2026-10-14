# TX Quince: DFW luxury pricing, search demand and booking system

Researched October 2026. Prices live in one place, `src/lib/commission.ts`. Change a number there and the homepage, the calculator, the FAQ, the structured data and Stripe checkout all update together.

---

## 1. Pricing for the top of the Dallas–Fort Worth market

### What the market publishes

| Segment | Published range | Source |
|---|---|---|
| DFW quince, photo only | $1,500–3,000 | Quinceañeras Magazine DFW guide; New Dawn Photo 2026 cost guide |
| DFW quince, photo + video | $3,000–5,500 | same |
| DFW quince, "luxury" packages | $5,500–8,000+ | Quinceañeras Magazine. The highest *published* package is New Dawn Ruby at **$5,999** (8 h, 3–5 min film, acrylic album) |
| Fotolilly, Fort Worth (2 photographers + 1 videographer) | $3,500–4,500, $500 deposit | fotolillyphotography.com/quinceanera-packages |
| Dallas wedding photographers, median start (39 studios) | $2,600; top published $5,500–7,500 | theweddingdossier.com (Dallas) |
| Luxury Dallas wedding photo + film, average | about $10,000 | lavishlylux.com |
| Luxury Dallas wedding film alone | $6,900–10,000 | danielkfilms.com |
| DFW quince total budgets | most $12–25K; luxury $25–50K+ | Quinceañeras Magazine; New Dawn (80 real budgets) |
| Hotel-tier venues (Rosewood Mansion, The Adolphus, Ritz-Carlton) | $50–150K+ for venue + food and beverage. Rosewood's Saturday F&B minimum is $17.5K | thedesibride.com, weddingwire.com |
| Photo + film share of a quince budget | 8–15% | planner guides (thin sources) |
| Affluent DFW households | Highland Park / University Park median household income $250K+ (Census top-code); Westlake mean about $527K; Southlake about $240K+ | homesnacks.com, suburbs101.com. Check against Census ACS before quoting publicly |

**The reality:** most DFW quince budgets are $12–25K all-in, and photo + film takes 8–15% of that, about $1–3.75K. The highest package any DFW quince studio publishes is about $6K. Pricing above that band (the earlier $2.5K–18.5K ladder) prices out the families who actually book. Revised October 2026.

### Commissions (now live in the price book)

| Commission | Price | Retainer (30%) | Role |
|---|---|---|---|
| I. Portrait Study (photo, editorial session) | **$1,200** | $350 | Entry. Mid-band for DFW pre-quince sessions ($800–1,800). |
| II. Cinema & Stills (8 h, 1 photo + 1 film) | **$3,500** | $1,050 | Photo + video, in the market's $3–5.5K band. |
| III. The Full Production (11 h, 4 crew + coordinator, portrait session, linen monograph) | **$4,900** | $1,450 | **The commission to sell.** Under the highest published package, with more crew than any of them. |
| IV. Multi-Day Editorial Archive (5 crew + coordinator) | **$6,900** | $2,050 | The luxury anchor, inside the market's $5.5–8K top band. |

| Enhancement | Price | Market reference |
|---|---|---|
| Pre-event destination portrait session | $650 | Pre-quince sessions $800–1,800 standalone |
| Same-day reception edit | $900 | No DFW price published |
| Super 8mm film roll | $600 | Flat add-on |
| Fine art parent albums (pair) | $550 | $400–600 each elsewhere |

**Crew and coordinator are included, not sold.** Every commission names its full crew on the day. Families choose the mix of photographers and videographers with a swap control, and the total never changes. Production and Archive also include a day-of coordinator. Nothing about the crew changes the price:

| Commission | Directors on the day | Default mix | Day-of coordinator |
|---|---|---|---|
| I. Portrait Study | 1 photographer | 1 photo | — |
| II. Cinema & Stills | 2 | 1 photo · 1 film | — |
| III. The Full Production | 4 | 2 photo · 2 film | Included |
| IV. Multi-Day Editorial Archive | 5 | 3 photo · 2 film | Included |

Event commissions keep at least one photographer and one videographer. `BASE_CREW`, `DEFAULT_MIX`, `MIN_ROLE` and `COORDINATOR_INCLUDED` are in `src/lib/commission.ts`. The server normalizes the mix that arrives (`normalizeCrew`) and stores it on the booking's metadata, so the crew sheet matches what the family chose.

**Retainer:** 30% of the commission, minimum $350, rounded to $50, applied in full. The balance is due 30 days before the celebration. Texas norms are 25–50% with the balance 14–30 days out. Local quince studios take a flat $500; 30% lands close to that on the Portrait Study and scales with the commission.

**Old pricing retired (done):**
- **Permanent redirects:**
  - `/investment` and `/payment-plans` go to `/#commissions`.
  - `/reserve` goes to `/#intake`.
  - `/es/paquetes` and `/es/planes-de-pago` go to `/es#commissions`.
  - `/quinceanera-save-the-date` goes to `/quinceanera-photoshoot` (Spanish to `/es/sesion-de-fotos-quinceanera`).
- **`/es`** is now the new site, rendered in Spanish.
- **New prices everywhere else:** city pages (now including Frisco, Plano and McKinney), hubs, videographer pages, the guide, venues, photo pages, all 41 blog posts, the inquiry budget options, emails and structured data. Prices are read from the price book wherever possible.
- **Old booking flow removed:** `/api/booking`, `/api/reserve-request` and their forms are deleted, replaced by `/api/commission`. `/reserve/success` stays so old Stripe receipts still resolve.
- These prices are 2–3× the current business. Expect fewer, larger bookings, and that portfolio, delivery quality and the client experience will have to visibly match the number.

---

## 2. What high-end DFW families search for, and how to capture them

**Data caveat:** Semrush returned "no API units" and Ahrefs returned "insufficient plan", so there are **no search volumes, keyword difficulty or cost-per-click figures**. The signals below come from Google Autocomplete (proves a phrase is searched, not how often) and DuckDuckGo results (Bing, not Google). For real numbers, connect Google Search Console, use Google Keyword Planner, or add Semrush API units.

### Query clusters

| Cluster | Example queries (Autocomplete-confirmed) | Target page |
|---|---|---|
| Core local, EN | quinceanera photographer dallas · …dallas fort worth · quince photographer near me · quinceanera photographer and videographer | `/` (new title) + `/quinceanera-photographer` hub |
| Price and packages | how much is a quinceanera photographer · quinceanera photography packages / prices · photo and video packages | `/` commissions + FAQ #1, `/investment` (reprice) |
| Video | quinceanera videographer dallas / prices | `/quinceanera-videographer` (already #1 on DDG) |
| City | …fort worth · frisco · plano · mckinney · arlington | `/quinceanera-photographer/[city]`. **Add Frisco, Plano and McKinney**, which the main competitor ranks for. Southlake shows no Autocomplete demand. |
| Pre-quince session | pre quince photoshoot · quinceanera photoshoot only dallas fort worth · sesión de fotos quinceañera · sesión pre quince | **New page, the biggest gap:** `/quinceanera-photoshoot` + `/es/sesion-de-fotos-quinceanera` |
| Locations | places to take quinceanera pictures in dallas · dallas arboretum quinceanera / photography fee · klyde warren / highland park village photoshoot | Locations blog hub, plus **single-location pages** (Arboretum with fee/permit FAQ, Stockyards, Highland Park Village) |
| Spanish | fotógrafo de quinceañeras dallas · fotógrafo para quinceañera · cuánto cobra un fotógrafo para una quinceañera | `/es/fotografo-de-quinceaneras` (already #1 on DDG) |
| Premium modifiers | best / most trusted quinceanera photographer dallas fort worth · luxury quinceanera | "Luxury" returns dresses and venues, not photographers, so use it in copy rather than as a target. "Best / most trusted" is won by reviews and the Google Business Profile. |

Avoid: "quince fort worth" (a restaurant), and "video de quinceañera" (mostly viral and invitation videos).

### Questions parents ask (answered on the homepage FAQ with FAQPage structured data)
Cost in DFW · whether photo and film come together · how many hours of coverage · how far ahead to book · whether you cover the misa, vals and surprise dance · whether you work in Spanish · how the retainer works · where to take pre-quince portraits around Dallas · whether you travel outside DFW.

### Where TX Quince already stands (DDG / Bing)
- #1 for "quinceanera videographer dallas" and "fotografo de quinceañeras dallas"
- #3–4 for "quinceanera photographer dallas"
- #2 for photoshoot locations
- **Main competitor:** New Dawn Photo, with EN and ES city pages carrying "From $X" titles, a Spanish photoshoot page that ranks #1, and one page per location.

### Done in this change
- Homepage title: *"Quinceañera Photographer & Videographer in Dallas–Fort Worth | TX Quince"*, with a description naming Highland Park and Southlake, the starting price and live availability.
- A bilingual, answer-first FAQ section on the homepage, with matching FAQPage structured data. Prices in the answers come from the price book.
- Service + OfferCatalog structured data with the four commissions. The site-wide ProfessionalService `priceRange` now reads $1,200–$6,900.

### Next, in priority order
_(Done: the `/quinceanera-photoshoot` + `/es/sesion-de-fotos-quinceanera` pages, Frisco, Plano and McKinney, and repricing `/investment` (now a redirect).)_
1. **Google Business Profile.** It decides "near me" and the local pack. Link it to the hub page, add the new commissions as Products, and ask every client for a review that names the city and venue.
2. Build `/quinceanera-photoshoot` and the Spanish mirror.
3. Add Frisco, Plano and McKinney city pages, carrying the new pricing.
4. Single-location pages: Arboretum (confirm the fee policy with them first), Highland Park Village, Stockyards.
5. Retire or reprice `/investment` and `/es/paquetes`. Consider a "From $1,200" title, as competitors do.
6. Venue pages for the hotel tier (Rosewood Mansion, The Adolphus, Hotel Crescent Court, Four Seasons Las Colinas), because affluent families search their venue by name. Only show venues you've actually worked.
7. Connect Search Console so the next pricing and content pass runs on real impressions.

---

## 3. Booking system: real-time calendar and Stripe checkout

```
Calendar (homepage)                 /api/availability (taken dates)
  polls every 60s while visible ───►  bookings: requested | pending_payment | paid
  re-checks on tab focus
            │
Intake step 3: choose a path
  ├─ "Reserve now" ───► POST /api/commission {path:"retainer"}
  │                      honeypot → rate limit → Turnstile → zod
  │                      price recomputed from src/lib/commission.ts
  │                      create_booking_hold() — atomic, 30-min hold
  │                      Stripe Checkout (retainer, EN/ES locale) ──► Stripe
  │                                                                 │
  │   /?commission=confirmed ◄── success redirect ◄─────────────────┤
  │   GET /api/commission/session → "Your date is reserved."        │
  │   /api/stripe/webhook (existing) ◄── checkout.session.completed ┘
  │     confirm_booking_payment() → 'paid' → confirmation emails
  │
  └─ "Consultation first" ─► POST /api/commission {path:"consult"}
                             'requested' booking holds the date for 7 days
                             operator + family emails; retainer link follows
```

**Guarantees:**
- **No double-booking, even under concurrency.** A partial unique index on `bookings.event_date` covers `requested`, `pending_payment` and `paid` (migrations 0002 and 0007).
- **The client never sets the price.** The server re-prices every request. The webhook re-checks the amount Stripe collected and routes any mismatch to `payment_review`.
- **Dead holds free the date automatically.** Expired or declined checkouts release it via the webhook, and the existing cron covers anything left over.
- **Retrying isn't blocked.** A family who closes checkout and tries again releases their own unpaid hold first. Their details are restored from `sessionStorage`, and the form returns to step 3.
- **Conflicts are handled gracefully.** If someone takes the date mid-flow, the server returns 409. The form marks the date reserved, returns to the calendar on the same month, and asks the family to pick another.
- **Everything is stored on the booking.** Commission details (tier, add-ons, total, city, venue, language, honoree) are saved in `bookings.metadata`, and as a readable summary in `bookings.notes` for the operator email. **No migration is needed.**

**To go live:**
1. Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, the Supabase keys and the Resend keys (see `.env.example`).
2. In the Stripe Dashboard, add the webhook `https://txquince.com/api/stripe/webhook` with these events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`.
3. Payment methods: enable **ACH Direct Debit**, so large retainers aren't paid on cards at 2.9%, plus **Affirm** and Klarna. Checkout shows whatever is enabled, and the webhook already handles payments that settle late. Set the statement descriptor to `TX QUINCE`.
4. Test end to end in Stripe test mode: `stripe listen --forward-to localhost:3000/api/stripe/webhook`, then book with card `4242 4242 4242 4242`.
5. Update the confirmation email templates (`src/lib/resend.ts`). They still say "deposit" and "Collection: —". The commission summary appears in Notes.

**Deliberately not built yet:**
- Automated balance invoicing at 30 days out (Stripe Invoices or a payment link from `/admin`).
- Contract e-signature before payment.
- Live calendar push via Supabase Realtime. The 60-second poll plus the atomic hold is accurate enough for a one-event-per-day calendar.
