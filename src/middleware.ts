import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Only runs on /admin/* — the public site stays untouched (and fast).
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
