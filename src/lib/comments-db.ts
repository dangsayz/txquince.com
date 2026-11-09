/**
 * comments-db.ts — SERVER-ONLY data access for blog comments on Cloudflare D1
 * (migrations/0002_blog_comments.sql). Public reads degrade to [] when the
 * binding is missing or the migration hasn't run, so a post never crashes.
 */
import "server-only";
import { getD1, requireD1 } from "@/lib/d1";
import {
  COMMENT_STATUSES,
  COMMENTS_PER_HOUR,
  toPublicComment,
  type CommentLang,
  type CommentRecord,
  type CommentStatus,
  type PublicComment,
} from "@/lib/comments";

type Row = Record<string, unknown>;
const now = () => new Date().toISOString();

export function toCommentRecord(row: Row): CommentRecord {
  const str = (k: string) => (row[k] == null ? null : String(row[k]));
  return {
    id: String(row.id),
    created_at: String(row.created_at),
    post_slug: String(row.post_slug),
    lang: row.lang === "es" ? "es" : "en",
    user_id: String(row.user_id),
    author_name: String(row.author_name ?? ""),
    author_image: str("author_image"),
    body: String(row.body ?? ""),
    quote: str("quote"),
    status: COMMENT_STATUSES.includes(row.status as CommentStatus) ? (row.status as CommentStatus) : "pending",
    approved_at: str("approved_at"),
    reply: str("reply"),
    replied_at: str("replied_at"),
  };
}

/** Approved comments on one post, oldest first. */
export async function listApprovedComments(postSlug: string, lang: CommentLang): Promise<PublicComment[]> {
  const db = await getD1();
  if (!db) return [];
  try {
    const { results } = await db
      .prepare("SELECT * FROM blog_comments WHERE post_slug = ? AND lang = ? AND status = 'approved' ORDER BY created_at ASC LIMIT 200")
      .bind(postSlug, lang)
      .all<Row>();
    return results.map((r) => toPublicComment(toCommentRecord(r)));
  } catch {
    return [];
  }
}

/** Comments this account has posted in the last hour (spam brake). */
export async function recentCountForUser(userId: string): Promise<number> {
  const db = await requireD1();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM blog_comments WHERE user_id = ? AND created_at >= ?")
    .bind(userId, since)
    .first<{ n: number }>();
  return Number(row?.n ?? 0);
}

export async function canPost(userId: string): Promise<boolean> {
  return (await recentCountForUser(userId)) < COMMENTS_PER_HOUR;
}

export async function createComment(input: {
  post_slug: string;
  lang: CommentLang;
  user_id: string;
  author_name: string;
  author_image: string | null;
  body: string;
  quote?: string | null;
}): Promise<CommentRecord> {
  const db = await requireD1();
  const row = await db
    .prepare(
      "INSERT INTO blog_comments (id, post_slug, lang, user_id, author_name, author_image, body, quote) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *",
    )
    .bind(crypto.randomUUID(), input.post_slug, input.lang, input.user_id, input.author_name, input.author_image, input.body, input.quote ?? null)
    .first<Row>();
  if (!row) throw new Error("could not save the comment");
  return toCommentRecord(row);
}

/** Everything for /admin/comments: waiting first, then newest. */
export async function listCommentsForAdmin(limit = 300): Promise<CommentRecord[]> {
  const db = await getD1();
  if (!db) return [];
  try {
    const { results } = await db
      .prepare("SELECT * FROM blog_comments ORDER BY (status = 'pending') DESC, created_at DESC LIMIT ?")
      .bind(limit)
      .all<Row>();
    return results.map(toCommentRecord);
  } catch {
    return [];
  }
}

export async function countPendingComments(): Promise<number> {
  const db = await getD1();
  if (!db) return 0;
  try {
    const row = await db.prepare("SELECT COUNT(*) AS n FROM blog_comments WHERE status = 'pending'").first<{ n: number }>();
    return Number(row?.n ?? 0);
  } catch {
    return 0;
  }
}

/** Per post: comments all time, waiting, and written since `sinceIso` (hidden left out). */
export async function countCommentsByPost(sinceIso: string): Promise<{ post_slug: string; lang: CommentLang; total: number; pending: number; recent: number }[]> {
  const db = await getD1();
  if (!db) return [];
  try {
    const { results } = await db
      .prepare(
        "SELECT post_slug, lang, COUNT(*) AS total, SUM(status = 'pending') AS pending, SUM(created_at >= ?) AS recent FROM blog_comments WHERE status != 'hidden' GROUP BY post_slug, lang",
      )
      .bind(sinceIso)
      .all<Row>();
    return results.map((r) => ({
      post_slug: String(r.post_slug),
      lang: r.lang === "es" ? "es" : "en",
      total: Number(r.total ?? 0),
      pending: Number(r.pending ?? 0),
      recent: Number(r.recent ?? 0),
    }));
  } catch {
    return [];
  }
}

export async function getComment(id: string): Promise<CommentRecord | null> {
  const db = await requireD1();
  const row = await db.prepare("SELECT * FROM blog_comments WHERE id = ?").bind(id).first<Row>();
  return row ? toCommentRecord(row) : null;
}

export async function moderateComment(
  id: string,
  change: { status?: CommentStatus; reply?: string },
): Promise<CommentRecord | null> {
  const db = await requireD1();
  const sets: string[] = ["updated_at = ?"];
  const vals: unknown[] = [now()];
  if (change.status) {
    sets.push("status = ?");
    vals.push(change.status);
    if (change.status === "approved") {
      sets.push("approved_at = COALESCE(approved_at, ?)");
      vals.push(now());
    }
  }
  if (change.reply !== undefined) {
    sets.push("reply = ?", "replied_at = ?");
    vals.push(change.reply || null, change.reply ? now() : null);
  }
  const row = await db
    .prepare(`UPDATE blog_comments SET ${sets.join(", ")} WHERE id = ? RETURNING *`)
    .bind(...vals, id)
    .first<Row>();
  return row ? toCommentRecord(row) : null;
}

export async function deleteComment(id: string): Promise<CommentRecord | null> {
  const db = await requireD1();
  const row = await db.prepare("DELETE FROM blog_comments WHERE id = ? RETURNING *").bind(id).first<Row>();
  return row ? toCommentRecord(row) : null;
}

/* ---------------- Blocked commenters (migrations/0007) ---------------- */

export type BlockedCommenter = { user_id: string; author_name: string; created_at: string };

/** True when the owner blocked this account. False if the table is not there yet. */
export async function isBlocked(userId: string): Promise<boolean> {
  const db = await getD1();
  if (!db) return false;
  try {
    return (await db.prepare("SELECT 1 AS x FROM blocked_commenters WHERE user_id = ?").bind(userId).first()) !== null;
  } catch {
    return false;
  }
}

/**
 * Block the person who wrote this comment: no new comments from the account,
 * and every comment it wrote goes to 'hidden'. Returns the comments it hid so
 * the caller can refresh their posts; null when the comment does not exist.
 */
export async function blockCommentAuthor(commentId: string): Promise<{ who: BlockedCommenter; hidden: CommentRecord[] } | null> {
  const db = await requireD1();
  const c = await getComment(commentId);
  if (!c) return null;
  await db
    .prepare("INSERT INTO blocked_commenters (user_id, author_name) VALUES (?, ?) ON CONFLICT (user_id) DO UPDATE SET author_name = excluded.author_name")
    .bind(c.user_id, c.author_name)
    .run();
  const { results } = await db
    .prepare("UPDATE blog_comments SET status = 'hidden', updated_at = ? WHERE user_id = ? AND status != 'hidden' RETURNING *")
    .bind(now(), c.user_id)
    .all<Row>();
  return { who: { user_id: c.user_id, author_name: c.author_name, created_at: now() }, hidden: results.map(toCommentRecord) };
}

/** Let the account comment again. Its hidden comments stay hidden. */
export async function unblockCommenter(userId: string): Promise<boolean> {
  const db = await requireD1();
  const res = await db.prepare("DELETE FROM blocked_commenters WHERE user_id = ?").bind(userId).run();
  return res.meta.changes > 0;
}

export async function listBlockedCommenters(): Promise<BlockedCommenter[]> {
  const db = await getD1();
  if (!db) return [];
  try {
    const { results } = await db.prepare("SELECT user_id, author_name, created_at FROM blocked_commenters ORDER BY created_at DESC LIMIT 200").all<Row>();
    return results.map((r) => ({ user_id: String(r.user_id), author_name: String(r.author_name), created_at: String(r.created_at) }));
  } catch {
    return [];
  }
}
