/**
 * notifications.ts — the Studio bell (pure: types, wording, counting).
 *
 * One list of "something happened on the site", newest first: a family sent
 * an inquiry, made a free plan, paid for a package, wrote a comment, asked for
 * help, left a review, or made an account. The bell shows how many are newer
 * than the last time the owner opened it.
 */
export type NoticeKind = "inquiry" | "plan" | "booking" | "comment" | "support" | "review" | "account";

export type Notice = {
  /** "<kind>:<row id>", stable across reads. */
  id: string;
  kind: NoticeKind;
  /** When it happened (ISO). */
  at: string;
  title: string;
  detail: string;
  /** The Studio page where the owner handles it. */
  href: string | null;
};

export const KIND_LABEL: Record<NoticeKind, string> = {
  inquiry: "Inquiry",
  plan: "Free plan",
  booking: "Booking",
  comment: "Comment",
  support: "Support",
  review: "Review",
  account: "Account",
};

/** One line, no line breaks, cut at a word. */
export function excerpt(text: string | null | undefined, max = 90): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 40 ? cut.lastIndexOf(" ") : max).trimEnd()}…`;
}

/** Newest first, no duplicates, at most `limit`. */
export function mergeNotices(groups: Notice[][], limit = 30): Notice[] {
  const seen = new Set<string>();
  return groups
    .flat()
    .filter((n) => n.at && !seen.has(n.id) && seen.add(n.id))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

/** Notices newer than the last time the bell was opened. */
export function unreadCount(items: Pick<Notice, "at">[], seenAt: string | null): number {
  return seenAt ? items.filter((n) => n.at > seenAt).length : items.length;
}

/** "Just now", "5 min ago", "3 hr ago", "Yesterday", "4 days ago". */
export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)} hr ago`;
  const d = Math.floor(s / 86_400);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

/** "9+" past nine, so the red dot never grows wide. */
export const badgeText = (n: number) => (n > 9 ? "9+" : String(n));
