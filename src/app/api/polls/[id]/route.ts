/**
 * /api/polls/<id> — a blog quick poll (src/content/polls.ts).
 *
 * GET  → { ok, total, results, voted }: counters as whole percents, shown only
 *        after POLL_MIN_TO_SHOW answers; `voted` is this browser's own answer.
 * POST → { option }: adds one to that answer's counter.
 *
 * Nothing about the person is stored. One answer per browser is kept with a
 * cookie that holds only the chosen option; a per-IP rate limit slows scripts.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getPoll, pollCookieName, pollResults } from "@/content/polls";
import { addPollVote, getPollCounts } from "@/lib/polls-db";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const rateLimited = rateLimiter("poll");
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = getPoll(id);
  if (!poll) return json({ ok: false, error: "not-found" }, 404);
  let counts;
  try {
    counts = await getPollCounts(poll.id);
  } catch {
    counts = null;
  }
  if (!counts) return json({ ok: false, error: "server" }, 503);
  const mine = req.cookies.get(pollCookieName(poll.id))?.value;
  const voted = poll.options.some((o) => o.id === mine) ? mine : null;
  return json({ ok: true, ...pollResults(poll, counts), voted });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = getPoll(id);
  if (!poll) return json({ ok: false, error: "not-found" }, 404);
  if (!sameOrigin(req)) return json({ ok: false, error: "origin" }, 403);
  if (await rateLimited(clientIp(req))) return json({ ok: false, error: "rate" }, 429);

  const body = (await req.json().catch(() => null)) as { option?: unknown } | null;
  const option = poll.options.find((o) => o.id === body?.option);
  if (!option) return json({ ok: false, error: "invalid" }, 400);

  const cookie = pollCookieName(poll.id);
  const mine = req.cookies.get(cookie)?.value;
  const already = poll.options.some((o) => o.id === mine) ? mine! : null;

  try {
    // A browser that already answered gets the results again, not a second vote.
    if (!already) await addPollVote(poll.id, option.id);
    const counts = (await getPollCounts(poll.id)) ?? {};
    const res = json({ ok: true, ...pollResults(poll, counts), voted: already ?? option.id });
    if (!already) {
      res.cookies.set(cookie, option.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: true,
        httpOnly: true,
      });
    }
    return res;
  } catch {
    return json({ ok: false, error: "server" }, 503);
  }
}
