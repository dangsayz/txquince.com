/** Runs the bell's real SQL against SQLite with the real migrations. */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sqliteD1 } from "@/lib/db/sqlite-d1.test-helper";

vi.mock("server-only", () => ({}));
let db: ReturnType<typeof sqliteD1>;
vi.mock("@/lib/d1", () => ({ getD1: async () => db }));
vi.mock("@/lib/clerk-config", () => ({ clerkServerEnabled: () => false }));
vi.mock("@/lib/clerk-user", () => ({ publicName: () => "Someone" }));

import { getSeenAt, listNotices, markSeen } from "./notifications-db";
import { unreadCount } from "./notifications";

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
const uuid = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;

describe("notifications-db", () => {
  beforeEach(() => {
    db = sqliteD1();
    const run = (sql: string, ...a: unknown[]) => db.raw.prepare(sql).run(...(a as never[]));
    run("INSERT INTO inquiries (id, created_at, name, email, message) VALUES (?, ?, 'Ana', 'a@example.com', 'Do you have my date?')", uuid(1), ago(50));
    run("INSERT INTO inquiries (id, created_at, name, email) VALUES (?, ?, 'Old', 'o@example.com')", uuid(2), ago(60 * 24 * 40));
    run("INSERT INTO quince_plans (id, slug, created_at, event_date, city, name, email) VALUES (?, 'abcdefghij', ?, '2027-05-01', 'Dallas', 'Bea', 'b@example.com')", uuid(3), ago(40));
    run(
      "INSERT INTO bookings (id, created_at, name, email, event_date, package, status, deposit_amount_cents, expires_at, paid_at) VALUES (?, ?, 'Cy', 'c@example.com', '2027-06-01', 'both', 'paid', 50000, ?, ?)",
      uuid(4), ago(500), ago(0), ago(30),
    );
    run(
      "INSERT INTO bookings (id, created_at, name, email, event_date, package, status, deposit_amount_cents, expires_at) VALUES (?, ?, 'Unpaid', 'u@example.com', '2027-07-01', 'photo', 'pending_payment', 50000, ?)",
      uuid(5), ago(5), ago(0),
    );
    run("INSERT INTO blog_comments (id, created_at, post_slug, user_id, author_name, body) VALUES (?, ?, 'no-such-post', 'user_1', 'Dee D.', 'Great post')", uuid(6), ago(20));
    run("INSERT INTO support_tickets (id, created_at, clerk_user, name, email, topic, message) VALUES (?, ?, 'user_2', 'Eve', 'e@example.com', 'payment', 'Where is my receipt?')", uuid(7), ago(10));
    run("INSERT INTO reviews (id, slug, invite_name, status, submitted_at, rating, body, display_name) VALUES (?, 'klmnopqrst', 'Fay', 'pending', ?, 5, 'Loved it', 'Fay F.')", uuid(8), ago(3));
  });

  it("lists what happened, newest first, and skips old rows and unpaid holds", async () => {
    const items = await listNotices();
    expect(items.map((n) => n.kind)).toEqual(["review", "support", "comment", "booking", "plan", "inquiry"]);
    expect(items.map((n) => n.title)).toEqual([
      "Fay F. left a 5-star review",
      "Eve needs help with payment",
      "Dee D. commented, waiting for approval",
      "Cy paid the deposit",
      "Bea made a free plan",
      "Ana sent an inquiry",
    ]);
    expect(items[5]).toMatchObject({ detail: "Do you have my date?", href: `/admin/inquiries/${uuid(1)}` });
    expect(items[4].detail).toBe("May 1, 2027 · Dallas");
  });

  it("remembers when the bell was opened", async () => {
    const items = await listNotices();
    expect(await getSeenAt()).toBeNull();
    expect(unreadCount(items, await getSeenAt())).toBe(6);
    await markSeen(ago(15));
    expect(unreadCount(items, await getSeenAt())).toBe(2);
    await markSeen();
    expect(unreadCount(items, await getSeenAt())).toBe(0);
  });
});
