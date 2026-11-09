import "server-only";
import { redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/admin-session";

/** True only if the current request is from an authenticated, allowlisted admin. */
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

export async function getAdminEmail(): Promise<string | null> {
  try {
    return await getSessionEmail();
  } catch {
    return null;
  }
}
