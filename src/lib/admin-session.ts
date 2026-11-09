/**
 * admin-session.ts — Studio (/admin) sign-in with a one-time email code.
 * Replaces Supabase Auth. No passwords to leak or reset.
 *
 *   1. Owner types their email → if it's on ADMIN_EMAILS, we email a 6-digit
 *      code (valid 10 minutes, 5 tries, single use). Anyone else gets the
 *      same "check your email" answer, so the form can't be used to find out
 *      which emails are admins.
 *   2. Owner types the code → we set an HttpOnly, Secure, SameSite=Lax session
 *      cookie (random 256-bit token), valid 30 days, revocable.
 *
 * Only HASHES of codes and tokens are stored in D1 (admin_login_codes,
 * admin_sessions). Every page and API re-checks the session on the server
 * (require-admin.ts); the email must still be on ADMIN_EMAILS each time.
 */
import "server-only";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { getDb, isDbConfigured } from "@/lib/db";
import { isAuthorizedAdminEmail } from "@/lib/admin-auth";
import { site } from "@/content/site";

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-txq_admin" : "txq_admin";
const SESSION_DAYS = 30;
const CODE_MINUTES = 10;
const CODE_TRIES = 5;
const CODES_PER_15_MIN = 5;

const enc = new TextEncoder();
async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
/** Codes are short, so they're hashed with a server-side pepper and their row id. */
const hashCode = (id: string, code: string) => sha256(`${process.env.ADMIN_SESSION_SECRET ?? "txq"}:${id}:${code}`);
const hashToken = (token: string) => sha256(`session:${token}`);

function randomCode(): string {
  // Uniform 6 digits (rejection sampling, no modulo bias).
  const a = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(a);
    if (a[0] < 4_294_000_000) return String(a[0] % 1_000_000).padStart(6, "0");
  }
}
function randomToken(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const normEmail = (e: string) => e.trim().toLowerCase();
const isoIn = (ms: number) => new Date(Date.now() + ms).toISOString();

/** Step 1. Always resolves the same way for the caller (no admin-email probing). */
export async function requestLoginCode(rawEmail: string): Promise<void> {
  const email = normEmail(rawEmail);
  if (!isAuthorizedAdminEmail(email) || !isDbConfigured()) return;
  const db = getDb();

  const since = isoIn(-15 * 60_000);
  const { count } = await db.from("admin_login_codes").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", since);
  if ((count ?? 0) >= CODES_PER_15_MIN) return;

  // Older unused codes die when a new one is issued.
  await db.from("admin_login_codes").update({ used_at: new Date().toISOString() }).eq("email", email).is("used_at", null);

  const id = crypto.randomUUID();
  const code = randomCode();
  const { error } = await db.from("admin_login_codes").insert({
    id,
    email,
    code_hash: await hashCode(id, code),
    expires_at: isoIn(CODE_MINUTES * 60_000),
  });
  if (error) {
    console.error("[admin-login] code insert:", error.message);
    return;
  }
  await sendCodeEmail(email, code);
}

/** Step 2. Returns a session token on success (caller sets the cookie). */
export async function verifyLoginCode(rawEmail: string, code: string, userAgent: string): Promise<string | null> {
  const email = normEmail(rawEmail);
  if (!/^\d{6}$/.test(code) || !isAuthorizedAdminEmail(email) || !isDbConfigured()) return null;
  const db = getDb();
  const now = new Date().toISOString();

  const { data: row } = await db
    .from("admin_login_codes")
    .select("id, code_hash, attempts")
    .eq("email", email)
    .is("used_at", null)
    .gte("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row || row.attempts >= CODE_TRIES) return null;

  // Count the try BEFORE comparing, and only if it's still under the cap (no race past 5).
  const { data: counted } = await db
    .from("admin_login_codes")
    .update({ attempts: row.attempts + 1 })
    .eq("id", row.id)
    .eq("attempts", row.attempts)
    .is("used_at", null)
    .select("id");
  if (!counted?.length) return null;

  if (!safeEqual(await hashCode(row.id, code), row.code_hash)) return null;

  // Single use: only the request that flips used_at wins.
  const { data: used } = await db.from("admin_login_codes").update({ used_at: now }).eq("id", row.id).is("used_at", null).select("id");
  if (!used?.length) return null;

  const token = randomToken();
  const { error } = await db.from("admin_sessions").insert({
    token_hash: await hashToken(token),
    email,
    expires_at: isoIn(SESSION_DAYS * 86_400_000),
    user_agent: userAgent.slice(0, 300),
  });
  if (error) {
    console.error("[admin-login] session insert:", error.message);
    return null;
  }
  return token;
}

export function sessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  };
}

/** The signed-in admin's email for this request, or null. */
export async function getSessionEmail(): Promise<string | null> {
  // Read the cookie FIRST: it marks every admin page as per-request (dynamic).
  // Returning before it would let Next pre-render a page as "signed out" at build.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!isDbConfigured()) return null;
  if (!token || token.length < 40 || token.length > 64) return null;
  const { data } = await getDb()
    .from("admin_sessions")
    .select("email")
    .eq("token_hash", await hashToken(token))
    .is("revoked_at", null)
    .gte("expires_at", new Date().toISOString())
    .maybeSingle();
  const email = data?.email as string | undefined;
  return email && isAuthorizedAdminEmail(email) ? email : null;
}

/** Revoke this browser's session (sign out). */
export async function revokeSession(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !isDbConfigured()) return;
  await getDb()
    .from("admin_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", await hashToken(token))
    .is("revoked_at", null);
}

async function sendCodeEmail(to: string, code: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[admin-login] RESEND_API_KEY missing; can't send code");
    return;
  }
  const from = process.env.RESEND_FROM ?? `${site.brand} <hello@${site.domain}>`;
  const text = `Your TX Quince Studio sign-in code is ${code}.\n\nIt works once and expires in ${CODE_MINUTES} minutes. If you didn't ask for it, ignore this email.`;
  try {
    const { error } = await new Resend(key).emails.send({
      from,
      to,
      subject: `${code} is your TX Quince Studio code`,
      text,
      html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#111110">
        <p>Your TX Quince Studio sign-in code:</p>
        <p style="font-size:32px;letter-spacing:.2em;font-weight:600;margin:8px 0 16px">${code}</p>
        <p>It works once and expires in ${CODE_MINUTES} minutes. If you didn't ask for it, ignore this email.</p></div>`,
    });
    if (error) console.error("[admin-login] email:", error.message);
  } catch (err) {
    console.error("[admin-login] email:", err);
  }
}
