import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getPortfolioBucket } from "@/lib/r2-portfolio";

export const dynamic = "force-dynamic";

// Receives optimized image bytes and writes them to the PORTFOLIO R2 bucket.
// Replaces the old Supabase signed-upload two-step: bytes now pass through the
// worker (admin-only, a few MB per photo — well within Workers limits).
export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();

  const rawExt = new URL(request.url).searchParams.get("ext")?.toLowerCase() ?? "jpg";
  const ext = /^(jpg|jpeg|png|webp|avif)$/.test(rawExt) ? rawExt : "jpg";

  const bucket = await getPortfolioBucket();
  if (!bucket) {
    return NextResponse.json({ error: "Storage not available" }, { status: 503 });
  }

  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength) {
    return NextResponse.json({ error: "Missing file body" }, { status: 400 });
  }

  const path = `portfolio/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const contentType =
    request.headers.get("content-type") ?? `image/${ext === "jpg" ? "jpeg" : ext}`;
  await bucket.put(path, bytes, { httpMetadata: { contentType } });
  return NextResponse.json({ path });
}
