/**
 * review-email.ts — tells the owner a mom just left a review (server-only).
 * Missing Resend env never throws: the review is already saved.
 */
import "server-only";
import { Resend } from "resend";
import { site } from "@/content/site";
import { escapeHtml as esc } from "@/lib/html-escape";
import { getSiteUrl } from "@/lib/site-url";
import type { ReviewRecord } from "@/lib/review";

const FROM = process.env.RESEND_FROM || `${site.brand} <hello@${site.domain}>`;

let cached: Resend | null = null;
function resend(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

export async function sendReviewReceivedEmail(
  review: Pick<ReviewRecord, "invite_name" | "rating" | "body"> & { photos?: string[]; updated?: boolean },
): Promise<{ ok: boolean; error?: string }> {
  const client = resend();
  const to = process.env.OPERATOR_NOTIFY_EMAIL;
  if (!client) return { ok: false, error: "resend-not-configured" };
  if (!to) return { ok: false, error: "operator-email-not-set" };

  const adminUrl = `${getSiteUrl()}/admin/reviews`;
  const stars = "★".repeat(review.rating ?? 0) + "☆".repeat(5 - (review.rating ?? 0));
  const photos = review.photos?.length ?? 0;
  const what = review.updated ? "updated her review" : "left you a review";
  const text = [
    `${review.invite_name} ${what} (${stars}${photos ? `, ${photos} photo${photos === 1 ? "" : "s"}` : ""}).`,
    "",
    review.body ?? "",
    "",
    review.updated
      ? `The update is not public yet; anything already live stays as it was. Approve it or keep the old one: ${adminUrl}`
      : `It is not public yet. Approve or hide it here: ${adminUrl}`,
  ].join("\n");
  const html = `
  <div style="font-family:ui-sans-serif,system-ui,Arial,sans-serif;color:#101010;max-width:560px;font-size:15px;line-height:1.6">
    <p style="margin:0 0 8px"><strong>${esc(review.invite_name)}</strong> ${what} · ${stars}${photos ? ` · ${photos} photo${photos === 1 ? "" : "s"}` : ""}</p>
    <blockquote style="margin:0 0 16px;padding:0 0 0 12px;border-left:2px solid #e6e6e6">${esc(review.body ?? "").replace(/\n/g, "<br>")}</blockquote>
    <p style="margin:0">${review.updated ? "The update is not public yet; anything already live stays as it was." : "It is not public yet."} <a href="${esc(adminUrl)}">${review.updated ? "Approve it or keep the old one" : "Approve or hide it"}</a>.</p>
  </div>`;
  try {
    const { error } = await client.emails.send({ from: FROM, to, subject: `${review.updated ? "Updated" : "New"} review from ${review.invite_name} · ${stars}`, text, html });
    if (error) return { ok: false, error: String(error.message ?? error) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
