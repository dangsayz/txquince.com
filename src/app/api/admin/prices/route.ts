/**
 * /api/admin/prices — the price book's only writer (admin only).
 *
 *   GET → { book, defaults, version, storage, corrupt, history }
 *   PUT JSON { book, baseVersion } → save a whole new book
 *
 * Guards (re-derived here, never trusted from the page): admin session,
 * same-site origin, strict zod validation of every number (priceBookSchema),
 * and optimistic concurrency — `baseVersion` must still be the stored
 * version, and the write is conditional on the etag just read. Every save
 * appends a history entry (who, when, what changed).
 *
 * Existing bookings are never touched: a signed agreement stores its own
 * total, deposit, deposit % and balance terms, and checkout charges the
 * stored deposit (see /api/booking/pay).
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminEmail } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { DEFAULT_PRICE_BOOK } from "@/lib/commission";
import { PricingError, listPriceHistory, readPriceBook, savePriceBook } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const bad = (message: string, status = 400, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ error: message, ...extra }, { status });

/** Same-site only: a form on another site cannot change prices. */
function crossSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}

async function guard(request: Request): Promise<{ email: string } | Response> {
  const email = await getAdminEmail();
  if (!email) return unauthorizedAdminResponse();
  if (crossSite(request)) return bad("Forbidden", 403);
  return { email };
}

async function snapshot() {
  const [current, history] = await Promise.all([readPriceBook(), listPriceHistory()]);
  return {
    book: current.book,
    defaults: DEFAULT_PRICE_BOOK,
    version: current.version,
    storage: current.storage,
    corrupt: current.corrupt,
    history,
  };
}

/** Every public page shows prices (copy, FAQ, JSON-LD, meta): refresh them all. */
function refreshPages() {
  try {
    revalidatePath("/", "layout");
  } catch {
    /* not fatal: pages also re-read the book within ~30s */
  }
  for (const p of ["/", "/es", "/quinceanera-guide", "/blog", "/es/blog"]) {
    try {
      revalidatePath(p);
    } catch {
      /* not fatal */
    }
  }
  for (const p of [
    "/quinceanera-photographer/[city]",
    "/es/fotografo-de-quinceaneras/[city]",
    "/blog/[slug]",
    "/es/blog/[slug]",
    "/venues/[slug]",
  ]) {
    try {
      revalidatePath(p, "page");
    } catch {
      /* not fatal */
    }
  }
}

export async function GET(request: Request) {
  const g = await guard(request);
  if (g instanceof Response) return g;
  try {
    return NextResponse.json(await snapshot(), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[admin/prices] read:", err);
    return bad("Couldn't read the prices. Please try again.", 500);
  }
}

export async function PUT(request: Request) {
  const g = await guard(request);
  if (g instanceof Response) return g;

  const body = (await request.json().catch(() => null)) as { book?: unknown; baseVersion?: unknown } | null;
  if (!body || typeof body !== "object" || typeof body.baseVersion !== "string") {
    return bad("Invalid request.");
  }
  try {
    const saved = await savePriceBook(body.book, body.baseVersion, g.email);
    refreshPages();
    return NextResponse.json({ ok: true, changes: saved.changes, historySaved: saved.historySaved, ...(await snapshot()) });
  } catch (err) {
    if (err instanceof PricingError) {
      return bad(err.message, err.status, { code: err.code, ...(err.code === "conflict" ? await snapshot() : {}) });
    }
    console.error("[admin/prices] save:", err);
    return bad("Something went wrong on the server. Nothing was changed.", 500);
  }
}
