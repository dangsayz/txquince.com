/**
 * POST /api/account/support — a support ticket from a signed-in family.
 * Saved in D1 (support_tickets) and emailed to the owner. Who they are comes
 * from the Clerk session (verified email), never from the request body; a
 * booking id is kept only if that booking belongs to them.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { getSignedInUser } from "@/lib/clerk-user";
import { getDb, isDbConfigured } from "@/lib/db";
import { ownsBooking } from "@/lib/account-db";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";
import { sameOriginRequest } from "@/lib/same-origin";
import { escapeHtml as esc } from "@/lib/html-escape";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/content/site";

export const dynamic = "force-dynamic";
const rateLimited = rateLimiter("support");

const Schema = z
  .object({
    topic: z.enum(["booking", "payment", "contract", "other"]),
    message: z.string().trim().min(5).max(4000),
    phone: z.string().trim().max(40).regex(/^[0-9+()\-.\s]*$/).optional(),
    bookingId: z.string().uuid().optional(),
    lang: z.enum(["en", "es"]).default("en"),
  })
  .strict();

const json = (status: number, body: Record<string, unknown>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req)) return json(403, { error: "Not allowed." });
  if (await rateLimited(clientIp(req))) return json(429, { error: "Too many messages. Please wait a minute." });
  const user = await getSignedInUser();
  const email = user?.verifiedEmails[0];
  if (!user || !email) return json(401, { error: "Please log in again." });
  if (await rateLimited(`user:${user.id}`)) return json(429, { error: "Too many messages. Please wait a minute." });

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json(400, { error: "Please check your message and try again." });
  if (!isDbConfigured()) return json(503, { error: "Messages are briefly unavailable. Please text or call us." });
  const d = parsed.data;
  const bookingId = d.bookingId && (await ownsBooking(user.verifiedEmails, d.bookingId)) ? d.bookingId : null;

  const { data: row, error } = await getDb()
    .from("support_tickets")
    .insert({
      clerk_user: user.id,
      name: user.displayName.slice(0, 120),
      email,
      phone: d.phone || null,
      topic: d.topic,
      message: d.message,
      booking_id: bookingId,
      language: d.lang,
    })
    .select("id")
    .single();
  if (error || !row) {
    console.error("[support] insert:", error?.message);
    return json(503, { error: "Messages are briefly unavailable. Please text or call us." });
  }

  // Email the owner. A failed email never loses the ticket (it is saved above).
  const to = process.env.OPERATOR_NOTIFY_EMAIL;
  const key = process.env.RESEND_API_KEY;
  if (to && key) {
    const lines = [
      `From: ${user.displayName} <${email}>${d.phone ? ` · ${d.phone}` : ""}`,
      `About: ${d.topic}${bookingId ? ` · booking ${bookingId}` : ""} · language: ${d.lang}`,
      "",
      d.message,
      "",
      bookingId ? `${getSiteUrl()}/admin/bookings` : "",
    ].filter((l, i) => l !== "" || i === 2 || i === 4);
    try {
      const { error: mailError } = await new Resend(key).emails.send({
        from: process.env.RESEND_FROM ?? `${site.brand} <hello@${site.domain}>`,
        to,
        replyTo: email,
        subject: `Support ticket (${d.topic}) — ${user.displayName}`,
        text: lines.join("\n"),
        html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#111110">${lines
          .map((l) => `<p style="margin:0 0 10px;white-space:pre-wrap">${esc(l)}</p>`)
          .join("")}</div>`,
      });
      if (mailError) console.error("[support] email:", mailError.message);
    } catch (err) {
      console.error("[support] email:", err);
    }
  }
  return json(200, { ok: true });
}
