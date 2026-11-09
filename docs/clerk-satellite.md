# Shared accounts: TX Quince × Quince Network (Clerk)

```
quincenetwork.com  (PRIMARY: owns accounts, hosts /sign-in and /sign-up)
   │  same Clerk app, same users, one session
txquince.com       (SATELLITE: reads the session via clerk.txquince.com)
   ├─ /login, /es/entrar     log in / create account (header button)
   ├─ Journal comments       signed-in accounts write; owner approves
   └─ /admin                 verified email on ADMIN_EMAILS only
```

## The one change Quince Network needs

In the quincenetwork.com codebase, where `<ClerkProvider>` is set up (root
layout), allow the redirect back to TX Quince after sign-in/sign-up:

```tsx
<ClerkProvider allowedRedirectOrigins={["https://txquince.com", "https://www.txquince.com"]}>
```

Without it, a TX Quince visitor who logs in on quincenetwork.com is not sent
back to txquince.com.

## How TX Quince uses it

- `src/lib/clerk-config.ts` — public settings (from env); Clerk is OFF with no key.
- `src/lib/clerk-user.ts` — the only server seam (`getSignedInUser`).
- `src/lib/require-admin.ts` — admin = verified email ∩ `ADMIN_EMAILS`.
- `src/middleware.ts` — Clerk runs only on the routes in `config.matcher`.
  Any new route that checks a session must be added there.
- Clerk's script loads only on /login, /logout, /admin and, on Journal posts,
  for visitors who are already signed in (the comment box). Everyone else
  gets static pages.
- Comments: `migrations/0002_blog_comments.sql`, `src/lib/comments*.ts`,
  `POST /api/comments`, `/admin/comments`. New comments email
  `OPERATOR_NOTIFY_EMAIL` and stay hidden until approved.

## Gotchas

- Sign-in links must come from `clerk.buildSignInUrl()` (they carry the
  satellite sync flag). Hardcoded links leave the visitor signed out on return.
- Return paths always go through a middleware-covered page (/login?next=…),
  so the session sync finishes on the server.
- Passkeys do not work across the two domains (Clerk limitation).
