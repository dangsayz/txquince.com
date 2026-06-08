import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAuthorizedAdminUser } from "@/lib/admin-auth";

/** True only if the current request is from an authenticated, allowlisted admin. */
export async function requireAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return isAuthorizedAdminUser(user);
  } catch {
    return false;
  }
}
