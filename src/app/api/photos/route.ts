/**
 * GET /api/photos?cursor=12&tag=party — one page (12) of the public Photo
 * dump feed: featured first, then newest. Powers "View more" on the homepage.
 */
import { NextResponse } from "next/server";
import { getFeedPage } from "@/lib/photo-dump";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const cursor = Math.max(0, Math.floor(Number(params.get("cursor")) || 0));
  const tag = params.get("tag");
  const page = await getFeedPage(cursor, tag);
  return NextResponse.json(page ?? { photos: [], next: null, total: 0, tags: [] }, {
    headers: { "cache-control": "public, max-age=60, s-maxage=60" },
  });
}
