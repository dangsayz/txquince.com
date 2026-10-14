/**
 * /api/admin/images/<slotId>/undo — POST {} steps back to the previous photo
 * (or the original); POST {versionId} shows that saved version; POST
 * {versionId: "original"} shows the page's own photo. Admin only.
 */
import { handleUndo } from "@/lib/image-slot-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request, ctx: { params: Promise<{ slot: string }> }) {
  return handleUndo(request, (await ctx.params).slot);
}
