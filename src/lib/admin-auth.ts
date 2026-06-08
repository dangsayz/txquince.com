import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

/** Comma-separated allowlist of admin emails (ADMIN_EMAILS env). */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function isAuthorizedAdminUser(user?: User | null): boolean {
  return isAuthorizedAdminEmail(user?.email);
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
