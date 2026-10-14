/**
 * /api/admin/images/<slotId> — the photo in one image slot (admin only).
 *   GET   current version + history
 *   POST  multipart: upload new renditions (r480, r960, …) + `meta` JSON
 *         JSON {alt, focal}: new description / focal point for the photo showing
 * The admin session is re-checked here on every call.
 */
import { handleGetOne, handleReplace } from "@/lib/image-slot-admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(_request: Request, ctx: { params: Promise<{ slot: string }> }) {
  return handleGetOne((await ctx.params).slot);
}

export async function POST(request: Request, ctx: { params: Promise<{ slot: string }> }) {
  return handleReplace(request, (await ctx.params).slot);
}
