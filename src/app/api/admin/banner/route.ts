/**
 * /api/admin/banner — the sale line on the public banner (admin only).
 *   PUT JSON { en, es, ends } → show this line (until `ends`, Dallas time)
 *   DELETE                     → no sale line; the banner keeps the payment line
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { isRealIsoDate, todayInDallas } from "@/lib/plan";
import { bannerSaleSchema } from "@/lib/site-banner-shared";
import { saveBannerSale } from "@/lib/site-banner";

export const dynamic = "force-dynamic";

/** Same-site only: a form on another site cannot change the banner. */
function crossSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}

function refresh() {
  try {
    revalidatePath("/", "layout");
  } catch {
    /* not fatal: the banner is read on every request */
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  if (crossSite(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = bannerSaleSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the form." }, { status: 400 });
  const { ends } = parsed.data;
  if (ends && (!isRealIsoDate(ends) || ends < todayInDallas())) {
    return NextResponse.json({ error: "The last day must be today or later." }, { status: 400 });
  }
  try {
    await saveBannerSale(parsed.data);
  } catch {
    return NextResponse.json({ error: "Storage not available. Try again." }, { status: 503 });
  }
  refresh();
  return NextResponse.json({ ok: true, sale: parsed.data });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  if (crossSite(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await saveBannerSale(null);
  } catch {
    return NextResponse.json({ error: "Storage not available. Try again." }, { status: 503 });
  }
  refresh();
  return NextResponse.json({ ok: true, sale: null });
}
