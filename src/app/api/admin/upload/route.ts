import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getPortfolioBucket } from "@/lib/r2-portfolio";
import { sniffImage, MAX_UPLOAD_BYTES } from "@/lib/image-sniff";

export const dynamic = "force-dynamic";

// Receives optimized image bytes and writes them to the PORTFOLIO R2 bucket.
// Replaces the old Supabase signed-upload two-step: bytes now pass through the
// worker (admin-only, a few MB per photo — well within Workers limits).
//
// Guards, in order: admin session, size cap, then the bytes themselves must be
// a JPEG/PNG/WebP/AVIF. The stored extension and Content-Type come from the
// sniffed bytes, never from the client's ?ext= or Content-Type header, so an
// HTML or SVG file can't be stored as an "image" and served from our origin.
export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();

  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const bucket = await getPortfolioBucket();
  if (!bucket) {
    return NextResponse.json({ error: "Storage not available" }, { status: 503 });
  }

  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength) {
    return NextResponse.json({ error: "Missing file body" }, { status: 400 });
  }
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const kind = sniffImage(new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 64)));
  if (!kind) {
    return NextResponse.json({ error: "Unsupported file type. Use JPEG, PNG, WebP or AVIF." }, { status: 415 });
  }

  const path = `portfolio/${Date.now()}-${crypto.randomUUID()}.${kind.ext}`;
  await bucket.put(path, bytes, { httpMetadata: { contentType: kind.type } });
  return NextResponse.json({ path });
}
