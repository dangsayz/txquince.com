/**
 * notifications-db.ts — SERVER-ONLY: reads the recent events behind the
 * Studio bell from D1 (and new accounts from Clerk), and remembers when the
 * owner last opened the bell (site_settings, key below). Read-only apart from
 * that one timestamp. A table that fails to read is skipped, never fatal.
 */
import "server-only";
import { getEsPost, getPost } from "@/content/blog";
import { packageLabel } from "@/lib/booking";
import { clerkServerEnabled } from "@/lib/clerk-config";
import { publicName } from "@/lib/clerk-user";
import { getD1, type D1Database } from "@/lib/d1";
import { excerpt, mergeNotices, type Notice } from "@/lib/notifications";

type Row = Record<string, unknown>;
const SEEN_KEY = "admin_notifications_seen";
const TOPIC: Record<string, string> = { booking: "booking or date", payment: "payment", contract: "agreement", other: "something else" };
const str = (v: unknown) => (v == null ? "" : String(v));
const day = (iso: string) => (iso ? new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "");

async function rows(db: D1Database, sql: string, ...args: unknown[]): Promise<Row[]> {
  try {
    return (await db.prepare(sql).bind(...args).all<Row>()).results;
  } catch {
    return [];
  }
}

/** New TX Quince accounts (Clerk). Empty when Clerk is off or unreachable. */
async function newAccounts(sinceMs: number): Promise<Notice[]> {
  if (!clerkServerEnabled()) return [];
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const res = await client.users.getUserList({ orderBy: "-created_at", limit: 10 });
    return res.data
      .filter((u) => u.createdAt >= sinceMs)
      .map((u) => ({
        id: `account:${u.id}`,
        kind: "account" as const,
        at: new Date(u.createdAt).toISOString(),
        title: `${publicName(u.firstName, u.lastName, u.username)} made an account`,
        detail: "They can now comment and see their booking.",
        href: null,
      }));
  } catch {
    return [];
  }
}

/** The newest events on the site, last `days` days. */
export async function listNotices(days = 14, limit = 30): Promise<Notice[]> {
  const db = await getD1();
  if (!db) return [];
  const sinceMs = Date.now() - days * 86_400_000;
  const since = new Date(sinceMs).toISOString();
  const [inquiries, plans, bookings, comments, tickets, reviews, edits, accounts] = await Promise.all([
    rows(db, "SELECT id, created_at, name, event_date, message FROM inquiries WHERE created_at >= ? ORDER BY created_at DESC LIMIT 20", since),
    rows(db, "SELECT id, created_at, name, event_date, city FROM quince_plans WHERE created_at >= ? ORDER BY created_at DESC LIMIT 20", since),
    rows(
      db,
      "SELECT id, COALESCE(paid_at, created_at) AS at, name, event_date, package, status FROM bookings WHERE status IN ('paid', 'payment_review', 'requested') AND COALESCE(paid_at, created_at) >= ? ORDER BY at DESC LIMIT 20",
      since,
    ),
    rows(db, "SELECT id, created_at, post_slug, lang, author_name, body, status FROM blog_comments WHERE created_at >= ? ORDER BY created_at DESC LIMIT 20", since),
    rows(db, "SELECT id, created_at, name, topic, message FROM support_tickets WHERE created_at >= ? ORDER BY created_at DESC LIMIT 20", since),
    rows(db, "SELECT id, submitted_at, invite_name, display_name, rating, body FROM reviews WHERE submitted_at >= ? ORDER BY submitted_at DESC LIMIT 20", since),
    rows(db, "SELECT id, edit_submitted_at, invite_name, edit_display_name, edit_rating, edit_body FROM reviews WHERE edit_submitted_at >= ? ORDER BY edit_submitted_at DESC LIMIT 20", since),
    newAccounts(sinceMs),
  ]);

  return mergeNotices(
    [
      inquiries.map((r) => ({
        id: `inquiry:${str(r.id)}`,
        kind: "inquiry" as const,
        at: str(r.created_at),
        title: `${str(r.name)} sent an inquiry`,
        detail: excerpt(str(r.message)) || (r.event_date ? `For ${day(str(r.event_date))}` : "No message"),
        href: `/admin/inquiries/${str(r.id)}`,
      })),
      plans.map((r) => ({
        id: `plan:${str(r.id)}`,
        kind: "plan" as const,
        at: str(r.created_at),
        title: `${str(r.name)} made a free plan`,
        detail: [day(str(r.event_date)), str(r.city)].filter(Boolean).join(" · "),
        href: "/admin/plans",
      })),
      bookings.map((r) => ({
        id: `booking:${str(r.id)}:${str(r.status)}`,
        kind: "booking" as const,
        at: str(r.at),
        title:
          r.status === "paid"
            ? `${str(r.name)} paid the deposit`
            : r.status === "payment_review"
              ? `${str(r.name)} paid, and the date needs your check`
              : `${str(r.name)} asked to reserve a date`,
        detail: [packageLabel(str(r.package)), day(str(r.event_date))].filter(Boolean).join(" · "),
        href: "/admin/bookings",
      })),
      comments.map((r) => {
        const post = r.lang === "es" ? getEsPost(str(r.post_slug)) : getPost(str(r.post_slug));
        return {
          id: `comment:${str(r.id)}`,
          kind: "comment" as const,
          at: str(r.created_at),
          title: `${str(r.author_name)} commented${r.status === "pending" ? ", waiting for approval" : ""}`,
          detail: excerpt(`${post ? `On “${post.title}”: ` : ""}${str(r.body)}`, 110),
          href: "/admin/comments",
        };
      }),
      tickets.map((r) => ({
        id: `support:${str(r.id)}`,
        kind: "support" as const,
        at: str(r.created_at),
        title: `${str(r.name)} needs help with ${TOPIC[str(r.topic)] ?? "something"}`,
        detail: excerpt(str(r.message)),
        href: "/admin/support",
      })),
      reviews.map((r) => ({
        id: `review:${str(r.id)}`,
        kind: "review" as const,
        at: str(r.submitted_at),
        title: `${str(r.display_name) || str(r.invite_name)} left a ${r.rating ? `${str(r.rating)}-star ` : ""}review`,
        detail: excerpt(str(r.body)),
        href: "/admin/reviews",
      })),
      edits.map((r) => ({
        id: `review-edit:${str(r.id)}:${str(r.edit_submitted_at)}`,
        kind: "review" as const,
        at: str(r.edit_submitted_at),
        title: `${str(r.edit_display_name) || str(r.invite_name)} updated their review`,
        detail: excerpt(str(r.edit_body)),
        href: "/admin/reviews",
      })),
      accounts,
    ],
    limit,
  );
}

/** When the owner last opened the bell; null = never. */
export async function getSeenAt(): Promise<string | null> {
  const db = await getD1();
  if (!db) return null;
  try {
    const row = await db.prepare("SELECT value FROM site_settings WHERE key = ?").bind(SEEN_KEY).first<{ value: string }>();
    const at = row ? (JSON.parse(row.value) as { at?: unknown }).at : null;
    return typeof at === "string" ? at : null;
  } catch {
    return null;
  }
}

export async function markSeen(at = new Date().toISOString()): Promise<string> {
  const db = await getD1();
  if (!db) throw new Error("Database not available (D1 binding DB is missing).");
  await db
    .prepare("INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at")
    .bind(SEEN_KEY, JSON.stringify({ at }), at)
    .run();
  return at;
}
