import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Returns a signed upload token so the browser uploads image bytes DIRECTLY to
// Supabase Storage (no bytes pass through the server). Tiny JSON in/out.
export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();

  let ext = "jpg";
  try {
    const body = (await request.json()) as { ext?: string };
    if (body.ext && /^(jpg|jpeg|png|webp|avif)$/i.test(body.ext)) {
      ext = body.ext.toLowerCase();
    }
  } catch {
    /* default ext */
  }

  const path = `portfolio/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.storage
    .from("portfolio")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: `Could not start upload: ${error?.message ?? "unknown"}` },
      { status: 500 },
    );
  }
  return NextResponse.json({ path: data.path, token: data.token });
}
