import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAuthorizedAdminUser } from "@/lib/admin-auth";

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
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return isAuthorizedAdminUser(user) ? user?.email ?? null : null;
  } catch {
    return null;
  }
}
