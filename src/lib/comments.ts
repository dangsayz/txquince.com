/**
 * comments.ts — blog comment rules shared by the API, the admin and tests.
 * No server-only imports: pure validation and shapes.
 */
import { z } from "zod";

export const COMMENT_STATUSES = ["pending", "approved", "hidden"] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];
export type CommentLang = "en" | "es";

export const COMMENT_MAX = 2000;
/** A signed-in account may post this many comments per hour (pending ones count). */
export const COMMENTS_PER_HOUR = 5;

export type CommentRecord = {
  id: string;
  created_at: string;
  post_slug: string;
  lang: CommentLang;
  user_id: string;
  author_name: string;
  author_image: string | null;
  body: string;
  status: CommentStatus;
  approved_at: string | null;
  reply: string | null;
  replied_at: string | null;
};

/** What the public page shows: never the user id. */
export type PublicComment = {
  id: string;
  created_at: string;
  author_name: string;
  author_image: string | null;
  body: string;
  reply: string | null;
  replied_at: string | null;
};

export function toPublicComment(c: CommentRecord): PublicComment {
  return {
    id: c.id,
    created_at: c.created_at,
    author_name: c.author_name,
    author_image: c.author_image,
    body: c.body,
    reply: c.reply,
    replied_at: c.replied_at,
  };
}

/** Collapse runs of blank lines and trim; keeps line breaks the writer meant. */
export function cleanBody(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const NewCommentSchema = z.object({
  post_slug: z.string().regex(SLUG).max(200),
  lang: z.enum(["en", "es"]),
  body: z
    .string()
    .transform(cleanBody)
    .pipe(z.string().min(2, "Write a little more.").max(COMMENT_MAX, "Keep it under 2,000 characters.")),
  /** Honeypot: people never see it. Filled = a bot; the route drops it quietly. */
  website: z.string().max(500).optional(),
});

export const ModerateCommentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(COMMENT_STATUSES).optional(),
  /** The owner's answer; "" removes it. */
  reply: z.string().max(COMMENT_MAX).transform(cleanBody).optional(),
});

/** The public path of the post a comment sits on. */
export function commentPostPath(c: Pick<CommentRecord, "post_slug" | "lang">): string {
  return c.lang === "es" ? `/es/blog/${c.post_slug}` : `/blog/${c.post_slug}`;
}
