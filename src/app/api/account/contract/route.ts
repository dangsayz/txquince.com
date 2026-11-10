/**
 * GET /api/account/contract?id=<booking> — the family downloads their signed
 * contract as a PDF. Only for a booking that belongs to the signed-in
 * account's verified email; anything else is a 404.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getSignedInUser } from "@/lib/clerk-user";
import { ownsBooking } from "@/lib/account-db";
import { getDb, isDbConfigured } from "@/lib/db";
import { signedContractPdf } from "@/lib/contract-file";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const notFound = () => NextResponse.json({ error: "Not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id) || !isDbConfigured()) return notFound();
  const user = await getSignedInUser();
  if (!user || !(await ownsBooking(user.verifiedEmails, id))) return notFound();
  const { data: b } = await getDb().from("bookings").select("id, paid_at, metadata").eq("id", id).maybeSingle();
  const file = b ? await signedContractPdf(b) : null;
  if (!file) return notFound();
  return new NextResponse(Buffer.from(file.content), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
