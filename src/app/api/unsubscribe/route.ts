/**
 * /api/unsubscribe?id=<inquiry-uuid> — one-click opt-out from follow-ups.
 *
 * The inquiry id (an unguessable UUID) is the token. Sets unsubscribed_at +
 * status='unsubscribed' so the cron skips this lead forever, then redirects to a
 * friendly confirmation page. Honors both link clicks and RFC 8058 one-click
 * POST (List-Unsubscribe-Post) from email clients. Always succeeds quietly — we
 * never reveal whether an id exists.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function unsubscribe(id: string | null): Promise<void> {
  if (!id || !UUID_RE.test(id) || !isSupabaseConfigured()) return;
  try {
    const supabase = getServiceSupabase();
    await supabase
      .from("inquiries")
      .update({ unsubscribed_at: new Date().toISOString(), status: "unsubscribed" })
      .eq("id", id);
  } catch (err) {
    console.error("[unsubscribe] error:", err);
  }
}

export async function GET(req: NextRequest) {
  await unsubscribe(req.nextUrl.searchParams.get("id"));
  return NextResponse.redirect(new URL("/unsubscribed", req.nextUrl.origin));
}

// RFC 8058 one-click POST from email clients (List-Unsubscribe-Post).
export async function POST(req: NextRequest) {
  await unsubscribe(req.nextUrl.searchParams.get("id"));
  return NextResponse.json({ ok: true });
}
