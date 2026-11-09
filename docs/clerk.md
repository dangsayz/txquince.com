# Accounts on TX Quince (Clerk)

```
txquince.com — Clerk app "TX Quince" (app_3LsbmZ7P1ci9zz1YTrNcZQVwpSb)
   Frontend API: clerk.txquince.com   Account portal: accounts.txquince.com
   ├─ /login · /signup · /es/entrar · /es/registro   Clerk's form on our page
   ├─ header account button (icon by the menu on phones)
   └─ Journal comments     signed-in accounts write; owner approves at /admin/comments
```

The Studio (/admin) does NOT use Clerk. It has its own email-code login
(src/lib/admin-session.ts, D1 sessions), so the public sign-up system can never
open the Studio.

- Log in is by **emailed 6-digit code** (no passwords). First name required,
  last name optional (comments show "Maria G."). Google sign-in is off until
  Google OAuth credentials are added to the production instance.
- Accounts are **separate from Quince Network**. Sharing them later = Clerk Pro
  ($25/mo + $10/mo per satellite domain, Nov 2026 pricing) and txquince.com as a
  satellite of the Quince Network app. The satellite version of this code is
  in this branch's git history (commit "Accounts: replace Supabase admin login…").

## Files

- `src/lib/clerk-config.ts` — public settings (from env); Clerk is OFF with no key.
- `src/lib/clerk-user.ts` — the only server seam (`getSignedInUser`).
- `src/middleware.ts` — Clerk runs only on `CLERK_ROUTES` (login, signup,
  logout, Spanish twins, /api/comments). A new route that reads a public
  session must be added there AND to `config.matcher`.
- `src/components/auth/*` — login/signup pages, logout, `ClerkShell`
  (Clerk only where needed; Spanish via `@clerk/localizations` esMX).
- Comments: `migrations/0002_blog_comments.sql` (applied 2026-11-09 under this
  name; it shares the 0002 number with 0002_review_edits.sql — D1 tracks by
  file name, so never rename it), `src/lib/comments*.ts`,
  `POST /api/comments`, `/admin/comments`. New comments email
  `OPERATOR_NOTIFY_EMAIL` and stay hidden until approved.

## Gotchas

- Clerk's script loads only on /login, /signup, /logout and, on Journal
  posts, for visitors who are already signed in (cookie hint `__client_uat`).
- Production keys work only on txquince.com. Locally, use the DEVELOPMENT keys
  of the same app (pk_test_…) in `.env.local`.
- Turn on bot protection (Clerk → Attack protection → Bot sign-up protection)
  once the domain is verified; the API refused it before verification.
