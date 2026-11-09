import "server-only";
import { redirect } from "next/navigation";
import { getSignedInUser } from "@/lib/clerk-user";
import { getAdminEmails } from "@/lib/admin-auth";

/** True only if the current request is from a signed-in, allowlisted admin. */
export async function requireAdmin(): Promise<boolean> {
  return (await getAdminEmail()) !== null;
}

/**
 * Page guard for every protected /admin page. Middleware also redirects, but a
 * gate that lives only in middleware is not a gate: each page re-checks here,
 * on the server, before it reads any data. Returns the admin's email.
 */
export async function requireAdminPage(next = "/admin"): Promise<string> {
  const email = await getAdminEmail();
  if (!email) redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  return email;
}

/**
 * The admin's email, or null. Anyone can make an account, so the gate is: a VERIFIED email on the Clerk account
 * that is on the ADMIN_EMAILS allowlist. An account with the right address
 * typed in but never verified gets nothing.
 */
export async function getAdminEmail(): Promise<string | null> {
  const user = await getSignedInUser();
  if (!user) return null;
  const allow = getAdminEmails();
  return user.verifiedEmails.find((e) => allow.includes(e)) ?? null;
}
