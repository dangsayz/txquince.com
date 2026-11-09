/**
 * POST /api/comments — a signed-in TX Quince account leaves a comment on
 * a Journal post. It is saved as 'pending' and stays private until the owner
 * approves it at /admin/comments. The owner gets an email for each one.
 *
 * Who wrote it comes from the server session (Clerk), never from the body.
 */
import { NextResponse } from "next/server";
import { getSignedInUser } from "@/lib/clerk-user";
import { NewCommentSchema } from "@/lib/comments";
import { canPost, createComment } from "@/lib/comments-db";
import { getEsPost, getPost } from "@/content/blog";
import { sendCommentNoticeEmail } from "@/lib/resend";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

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

export async function POST(request: Request) {
  // Cookie-authenticated write: refuse cross-site posts outright.
  if (!sameOrigin(request)) return json({ error: "Bad origin" }, 403);

  const user = await getSignedInUser();
  if (!user) return json({ error: "Log in to comment." }, 401);

  const parsed = NewCommentSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    const msg = parsed.error.issues.find((i) => i.path[0] === "body")?.message ?? "Invalid comment.";
    return json({ error: msg }, 400);
  }
  const { post_slug, lang, body, website } = parsed.data;
  // Honeypot filled: pretend it worked, save nothing.
  if (website) return json({ ok: true, status: "pending" });

  const post = lang === "es" ? getEsPost(post_slug) : getPost(post_slug);
  if (!post) return json({ error: "That post does not exist." }, 404);

  try {
    if (!(await canPost(user.id))) {
      return json({ error: lang === "es" ? "Demasiados comentarios. Intenta en una hora." : "Too many comments. Try again in an hour." }, 429);
    }
    const comment = await createComment({
      post_slug,
      lang,
      user_id: user.id,
      author_name: user.displayName,
      author_image: user.imageUrl,
      body,
    });
    // Best effort: a mail hiccup never loses the comment (it is in /admin/comments).
    await sendCommentNoticeEmail({
      postTitle: post.title,
      postUrl: `${getSiteUrl()}${lang === "es" ? "/es" : ""}/blog/${post_slug}`,
      adminUrl: `${getSiteUrl()}/admin/comments`,
      author: comment.author_name,
      body: comment.body,
    }).catch(() => undefined);
    return json({ ok: true, status: "pending" });
  } catch {
    return json({ error: "Could not save your comment. Please try again." }, 500);
  }
}
