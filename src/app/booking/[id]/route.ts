/**
 * GET /booking/{id}?t={payToken} — links from approval emails sent before the
 * private booking page existed. A valid pay token younger than
 * LEGACY_PAY_TOKEN_DAYS gets a fresh private link and a 303 to it. Anything
 * else — bad id, wrong or old token — is a real 404 (a route handler, so the
 * status is never lost to streaming).
 */
import { journeyDeps } from "@/lib/journey/deps";
import { legacyRedirect } from "@/lib/journey/family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOT_FOUND_HTML = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Link not found · TX Quince</title>
<body style="margin:0;padding:48px 16px;background:#faf8f5;color:#111110;font:16px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<main style="max-width:36rem;margin:0 auto"><h1 style="font-weight:500">This link isn't valid anymore.</h1>
<p>Get a fresh link to your booking page by email: <a style="color:#111110" href="/my/booking">Find my booking</a>.</p>
<p lang="es">¿Tu enlace ya no funciona? <a style="color:#111110" href="/es/mi-reserva">Encuentra tu reservación</a>.</p></main></body></html>`;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = new URL(req.url).searchParams.get("t") ?? undefined;
  const url = await legacyRedirect(journeyDeps(), id, t).catch(() => null);
  if (!url) {
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
    });
  }
  return new Response(null, {
    status: 303,
    headers: { location: new URL(url).pathname, "cache-control": "no-store", "referrer-policy": "no-referrer" },
  });
}
