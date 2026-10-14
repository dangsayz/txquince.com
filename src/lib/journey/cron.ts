/**
 * cron.ts — the once-a-day run (GET /api/cron/daily, Cloudflare Cron Trigger).
 * Safe to run any number of times: transitions are guarded and every email is
 * claimed in booking_reminders (unique booking+kind) BEFORE it is sent.
 *
 *  1. expire lapsed holds (requested / approved) and their Stripe sessions
 *  2. close Stripe sessions left open on bookings that are no longer active
 *  3. balance reminders: 30 / 14 / 7 / 1 days before the due date, and overdue
 *  4. owner digest: requests unapproved > 24h, approved-but-unpaid > 48h, lapsed holds
 *  5. one nudge to a family approved > 48h ago that hasn't signed
 *
 * It never charges, never refunds, never approves.
 */
import "server-only";
import { balanceReminderEmail } from "@/lib/emails/balance-reminder";
import { holdExpiredEmail } from "@/lib/emails/hold-expired";
import { ownerNudgeEmail, type NudgeItem } from "@/lib/emails/owner-nudge";
import { unsignedNudgeEmail } from "@/lib/emails/unsigned-nudge";
import { adminUrl, closeOpenSessions, familyCtx, logEvent, mailFamily, mailOwner, transition } from "./core";
import type { JourneyDeps } from "./deps";
import { ledgerFor } from "./ledger";
import { daysBetween, FAMILY_UNSIGNED_HOURS, OWNER_UNAPPROVED_HOURS, OWNER_UNPAID_HOURS, todayInDallas } from "./policy";
import { refFor } from "./tokens";
import type { BookingRow, ReminderKind } from "./types";

export type DailyReport = {
  expired: number;
  sessionsClosed: number;
  reminders: number;
  ownerNudged: number;
  familyNudged: number;
  errors: number;
};

const HOUR = 3600_000;

/** Which balance reminder applies today (null = none yet). */
export function balanceReminderKind(daysLeft: number): ReminderKind | null {
  if (daysLeft < 0) return "balance_overdue";
  if (daysLeft <= 1) return "balance_1";
  if (daysLeft <= 7) return "balance_7";
  if (daysLeft <= 14) return "balance_14";
  if (daysLeft <= 30) return "balance_30";
  return null;
}

/** Claim, send, and un-claim if the send failed (so tomorrow retries). */
async function sendOnce(deps: JourneyDeps, b: BookingRow, kind: ReminderKind, send: () => Promise<{ ok: boolean }>): Promise<boolean> {
  if (!(await deps.db.claimReminder(b.id, kind))) return false;
  const r = await send().catch(() => ({ ok: false }));
  if (!r.ok) {
    await deps.db.releaseReminder(b.id, kind);
    return false;
  }
  return true;
}

export async function runDaily(deps: JourneyDeps): Promise<DailyReport> {
  const report: DailyReport = { expired: 0, sessionsClosed: 0, reminders: 0, ownerNudged: 0, familyNudged: 0, errors: 0 };
  const now = deps.now();
  const nowIso = now.toISOString();
  const today = todayInDallas(now);
  const expiredItems: NudgeItem[] = [];
  const item = (b: BookingRow): NudgeItem => ({ name: b.name, ref: refFor(b.id), eventDate: b.event_date, adminUrl: adminUrl(deps, b.id), totalCents: b.total_cents });

  // 1. lapsed holds
  for (const b of await deps.db.listBookings({ statuses: ["requested", "approved"], expiresBefore: nowIso })) {
    try {
      const closed = await closeOpenSessions(deps, b.id);
      report.sessionsClosed += closed.expired;
      if (closed.inFlight) continue; // money is landing; the webhook decides
      const l = ledgerFor(b, await deps.db.listPayments(b.id));
      if (l.paidCents > 0) continue; // something was paid offline — leave it to the owner
      const r = await transition(deps, b.id, [b.status], "expired", {});
      if (!r.ok) continue;
      report.expired++;
      expiredItems.push(item(b));
      await logEvent(deps, b.id, "expired", "system", { detail: `hold ended ${b.expires_at}` });
      if (b.status === "approved") {
        await sendOnce(deps, r.booking, "hold_expired", async () =>
          mailFamily(deps, r.booking, holdExpiredEmail(await familyCtx(deps, r.booking)), "hold-expired"),
        );
      }
    } catch (err) {
      report.errors++;
      console.error("[cron] expire", b.id, err);
    }
  }

  // 2. sessions still open on bookings that can't take money any more
  for (const b of await deps.db.listBookings({ statuses: ["declined", "expired", "cancelled"], eventFrom: today, limit: 500 })) {
    try {
      const open = await deps.db.listSessions(b.id, { status: ["open"] });
      if (!open.length) continue;
      const closed = await closeOpenSessions(deps, b.id);
      report.sessionsClosed += closed.expired;
    } catch (err) {
      report.errors++;
      console.error("[cron] close sessions", b.id, err);
    }
  }

  // 3. balance reminders
  for (const b of await deps.db.listBookings({ statuses: ["confirmed"], eventFrom: today })) {
    try {
      if (!b.balance_due_date) continue;
      const l = ledgerFor(b, await deps.db.listPayments(b.id));
      if (l.remainingCents <= 0) continue;
      const daysLeft = daysBetween(today, b.balance_due_date);
      const kind = balanceReminderKind(daysLeft);
      if (!kind) continue;
      const sent = await sendOnce(deps, b, kind, async () =>
        mailFamily(
          deps,
          b,
          balanceReminderEmail({ ...(await familyCtx(deps, b)), remainingCents: l.remainingCents, dueDate: b.balance_due_date!, daysLeft }),
          `reminder-${kind}`,
        ),
      );
      if (sent) report.reminders++;
    } catch (err) {
      report.errors++;
      console.error("[cron] reminder", b.id, err);
    }
  }

  // 4 + 5. nudges
  const unapproved: NudgeItem[] = [];
  const unpaid: NudgeItem[] = [];
  const claimed: { id: string; kind: ReminderKind }[] = [];
  for (const b of await deps.db.listBookings({ statuses: ["requested"] })) {
    if (now.getTime() - Date.parse(b.created_at) < OWNER_UNAPPROVED_HOURS * HOUR) continue;
    if (await deps.db.claimReminder(b.id, "owner_unapproved")) {
      unapproved.push(item(b));
      claimed.push({ id: b.id, kind: "owner_unapproved" });
    }
  }
  for (const b of await deps.db.listBookings({ statuses: ["approved"] })) {
    const since = Date.parse(b.approved_at ?? b.updated_at);
    try {
      if (now.getTime() - since >= OWNER_UNPAID_HOURS * HOUR && (await deps.db.claimReminder(b.id, "owner_unpaid"))) {
        unpaid.push(item(b));
        claimed.push({ id: b.id, kind: "owner_unpaid" });
      }
      if (!b.signed_at && now.getTime() - since >= FAMILY_UNSIGNED_HOURS * HOUR) {
        const sent = await sendOnce(deps, b, "family_unsigned", async () =>
          mailFamily(deps, b, unsignedNudgeEmail({ ...(await familyCtx(deps, b)), holdUntil: b.expires_at.slice(0, 10) }), "unsigned-nudge"),
        );
        if (sent) report.familyNudged++;
      }
    } catch (err) {
      report.errors++;
      console.error("[cron] nudge", b.id, err);
    }
  }
  if (unapproved.length || unpaid.length || expiredItems.length) {
    const r = await mailOwner(
      deps,
      null,
      ownerNudgeEmail({ unapproved, unpaid, expired: expiredItems, adminUrl: `${deps.siteUrl()}/admin/bookings` }),
      "owner-nudge",
    );
    if (!r.ok) {
      for (const c of claimed) await deps.db.releaseReminder(c.id, c.kind);
    } else report.ownerNudged = unapproved.length + unpaid.length;
  }

  return report;
}
