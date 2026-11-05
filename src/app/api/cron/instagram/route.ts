/**
 * /api/cron/instagram — copy the latest @txquince posts into R2, hourly.
 *
 * Pinged by the standalone cron-worker (cron-worker/src/index.ts). Same
 * safety as the other cron routes: 401 unless CRON_SECRET is set AND the
 * request carries `Authorization: Bearer <CRON_SECRET>`. Without the
 * INSTAGRAM_ACCESS_TOKEN secret it does nothing (the section stays hidden).
 *
 * After a change the two homepages are revalidated, so a new post shows up
 * within about an hour of posting (the next cron tick) instead of up to two.
 * Failures keep the last good feed and email OPERATOR_NOTIFY_EMAIL (at most
 * once a day); details are in the Worker logs under "[instagram]".
 */
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getInstagramBucket } from "@/lib/instagram";
import { syncInstagram } from "@/lib/instagram-sync";
import { sendOperatorAlert } from "@/lib/resend";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // not configured → stays inert
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bucket = await getInstagramBucket();
  if (!bucket) {
    console.error("[instagram] PORTFOLIO bucket binding missing");
    return NextResponse.json({ ok: false, status: "no-bucket" }, { status: 503 });
  }
  const result = await syncInstagram({
    bucket,
    seedToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    alert: async (subject, body) => {
      const sent = await sendOperatorAlert(subject, body);
      if (!sent.ok) console.warn(`[instagram] alert not emailed (${sent.error}): ${subject}`);
    },
  });
  if (result.ok && result.status === "updated") {
    revalidatePath("/");
    revalidatePath("/es");
  }
  // 200 even on an Instagram failure: the job ran and handled it (cron-worker
  // logs non-2xx as its own failure). The body says what happened.
  return NextResponse.json(result);
}
