import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAuthorizedAdminUser } from "@/lib/admin-auth";

/** True only if the current request is from an authenticated, allowlisted admin. */
export async function requireAdmin(): Promise<boolean> {
  return (await getAdminEmail()) !== null;
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
