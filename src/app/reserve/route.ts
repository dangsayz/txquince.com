import type { NextRequest } from "next/server";

// /reserve?collection=duo&src=instagram → /?collection=duo&src=instagram#intake,
// where the booking panel picks the package and the tracker credits ?src=.
// Not a next.config redirect: on Cloudflare, OpenNext appends the query AFTER a
// destination's hash (/#intake?collection=duo&src=instagram), which hides
// ?src= from the tracker. (Intake still reads `collection` from the hash, for
// browsers that cached that old permanent redirect.)
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const to = new URL("/", request.url);
  to.search = request.nextUrl.search;
  to.hash = "intake";
  return Response.redirect(to, 308);
}
