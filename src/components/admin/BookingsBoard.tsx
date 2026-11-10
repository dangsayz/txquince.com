import type { BookingRow } from "@/lib/clients-db";
import { formatMoney, packageLabel } from "@/lib/booking";
import { BookingActions } from "@/components/admin/BookingActions";
import { TIER_NAME_EN, type TierId } from "@/lib/commission";
import { isSignedAgreement } from "@/lib/agreement";
import { BookingTidy } from "@/components/admin/BookingTidy";
import { canArchive, canRemove, isArchived } from "@/lib/booking-tidy";

/**
 * The Bookings ledger. Each booking reads like a line in a date book:
 * the celebration date first (a calendar tile), then the family, then the
 * money (total, deposit, balance, with a bar for how much is in), then status.
 * Pure: takes rows + today's date (America/Chicago, YYYY-MM-DD) so it can be
 * rendered without the database.
 */

const COLLECTION_LABEL: Record<string, string> = {
  moments: "Moments",
  essential: "Essential",
  signature: "Signature",
  legacy: "Legacy",
};

type Tone = "good" | "urgent" | "ink" | undefined;

function statusPill(status: string, signed: boolean): { label: string; tone: Tone } {
  switch (status) {
    case "requested": return signed
      ? { label: "Signed, needs approval", tone: "ink" }
      : { label: "Requested", tone: "ink" };
    case "paid": return { label: "Paid", tone: "good" };
    case "pending_payment": return signed
      ? { label: "Approved, awaiting deposit", tone: "urgent" }
      : { label: "Awaiting deposit", tone: "urgent" };
    case "payment_review": return { label: "Check payment", tone: "urgent" };
    case "refunded": return { label: "Refunded", tone: "urgent" };
    case "cancelled": return { label: "Cancelled", tone: undefined };
    case "expired": return { label: "Expired", tone: undefined };
    default: return { label: status, tone: undefined };
  }
}

function shortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" });
}

function dayParts(ymd: string) {
  const d = new Date(`${ymd}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const f = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-US", { ...o, timeZone: "UTC" });
  return { month: f({ month: "short" }), day: f({ day: "numeric" }), weekday: f({ weekday: "short" }), year: f({ year: "numeric" }), long: f({ weekday: "long", month: "long", day: "numeric", year: "numeric" }) };
}

function daysBetween(fromYmd: string, toYmd: string): number | null {
  const a = Date.parse(`${fromYmd}T00:00:00Z`);
  const b = Date.parse(`${toYmd}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

function relativeDay(days: number | null): string | null {
  if (days === null) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return days > 0 ? `In ${days} days` : `${-days} days ago`;
}

/** Total in cents when the booking carries one (homepage commissions). */
function totalCents(b: BookingRow): number | null {
  const t = b.metadata?.total_usd;
  return typeof t === "number" && t > 0 ? Math.round(t * 100) : null;
}

function collectionName(b: BookingRow): string | null {
  const tier = b.metadata?.tier;
  if (typeof tier === "string" && tier in TIER_NAME_EN) return TIER_NAME_EN[tier as TierId];
  return b.collection ? COLLECTION_LABEL[b.collection] ?? b.collection : null;
}

function DateTile({ ymd, muted }: { ymd: string; muted: boolean }) {
  const p = dayParts(ymd);
  if (!p) return <div className="bk-tile" data-muted={muted || undefined}><span className="bk-tile-day">?</span></div>;
  return (
    <div className="bk-tile" data-muted={muted || undefined} aria-hidden="true">
      <span className="bk-tile-month">{p.month}</span>
      <span className="bk-tile-day">{p.day}</span>
      <span className="bk-tile-wd">{p.weekday} · {p.year}</span>
    </div>
  );
}

function Ledger({ b, closed }: { b: BookingRow; closed: boolean }) {
  const total = totalCents(b);
  const deposit = b.deposit_amount_cents;
  const paid = b.status === "paid";
  const money = (c: number) => formatMoney(c, b.currency);
  const pct = total ? Math.min(100, Math.round((deposit / total) * 100)) : null;
  return (
    <div className="min-w-0">
      {total !== null ? (
        <p className="m-0 flex items-baseline justify-between gap-3 text-[15px]">
          <span className="text-[var(--tq-ink-mute)]">Total</span>
          <span className="st-num font-medium">{money(total)}</span>
        </p>
      ) : null}
      {pct !== null && (
        <div className="bk-bar mt-2" data-state={paid ? "in" : closed ? "off" : "due"} aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
      )}
      <dl className="m-0 mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-[var(--tq-ink-mute)]">{paid ? "Deposit in" : closed ? "Deposit" : "Deposit due"}</dt>
        <dd className="st-num m-0 text-right">{money(deposit)}</dd>
        {total !== null && (
          <>
            <dt className="text-[var(--tq-ink-mute)]">{paid && !closed ? "Balance due" : "Balance"}</dt>
            <dd className="st-num m-0 text-right">{money(Math.max(0, total - deposit))}</dd>
          </>
        )}
      </dl>
      {b.paid_at && <p className="st-note mt-1 text-[13px]">Paid {shortDate(b.paid_at)}</p>}
    </div>
  );
}

function BookingRecord({ booking: b, today, closed }: { booking: BookingRow; today: string; closed: boolean }) {
  const agreement = isSignedAgreement(b.metadata?.agreement) ? b.metadata.agreement : null;
  const pill = statusPill(b.status, Boolean(agreement));
  const parts = dayParts(b.event_date);
  const when = relativeDay(daysBetween(today, b.event_date));
  const name = collectionName(b);
  const firstName = b.name.trim().split(/\s+/)[0] || b.name;
  const noteLines = b.notes?.split("\n").map((l) => l.trim()).filter(Boolean) ?? [];

  return (
    <article id={b.id} className="bk-row scroll-mt-6" aria-label={`${b.name}, ${parts?.long ?? b.event_date}`}>
      <DateTile ymd={b.event_date} muted={closed} />

      <div className="bk-who min-w-0">
        <p className="m-0 break-words text-[17px] font-semibold leading-6">{b.name}</p>
        <p className="m-0 mt-0.5 text-sm text-[var(--tq-ink-mute)]">
          {parts?.long ?? b.event_date}
          {when && <> · <span className={closed ? "" : "text-[var(--tq-ink)]"}>{when}</span></>}
        </p>
        <p className="m-0 mt-2 text-sm">
          {name ?? "No collection"}<span className="text-[var(--tq-ink-mute)]"> · {packageLabel(b.package)}</span>
        </p>
        <p className="m-0 mt-1 text-[13px] text-[var(--tq-ink-mute)]">Reserved {shortDate(b.created_at)}</p>
      </div>

      <div className="bk-money">
        <Ledger b={b} closed={closed} />
      </div>

      <div className="bk-status">
        <span className="st-chip" data-tone={pill.tone}>{pill.label}</span>
      </div>

      <div className="bk-foot">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <a href={`mailto:${b.email}`} className="st-link" title={b.email}>Email {firstName}</a>
          {b.phone && <a href={`tel:${b.phone}`} className="st-link">Call {b.phone}</a>}
        </div>

        {noteLines.length > 0 && (
          <details className="bk-more">
            <summary>
              <span className="font-medium">Notes</span>
              <span className="min-w-0 truncate text-[var(--tq-ink-mute)]">{noteLines[0]}</span>
            </summary>
            <p className="m-0 mt-2 max-w-3xl whitespace-pre-wrap break-words text-sm leading-6 text-[var(--tq-ink-mute)]">{b.notes}</p>
          </details>
        )}

        {agreement && (
          <details className="bk-more">
            <summary>
              <span className="font-medium">Signed agreement</span>
              <span className="min-w-0 truncate text-[var(--tq-ink-mute)]">
                {agreement.signedName} · {shortDate(agreement.signedAt)}
                {agreement.approvedAt ? ` · approved ${shortDate(agreement.approvedAt)}` : ""}
              </span>
            </summary>
            <div className="mt-3 max-w-3xl space-y-4 text-sm text-[var(--tq-ink)]">
              <p className="font-medium">{agreement.title}</p>
              <p>{agreement.intro}</p>
              {agreement.sections.map((sec) => (
                <div key={sec.title}>
                  <p className="font-semibold">{sec.title}</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">{sec.lines.map((l) => <li key={l}>{l}</li>)}</ul>
                </div>
              ))}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={agreement.signature} alt={`Signature of ${agreement.signedName}`} width={300} height={100} className="border border-[var(--tq-surface-2)] bg-white" />
              <p className="text-[13px] text-[var(--tq-ink-mute)]">Signed {new Date(agreement.signedAt).toUTCString()} · IP {agreement.ip} · version {agreement.version}</p>
            </div>
          </details>
        )}

        <BookingActions id={b.id} status={b.status} signed={Boolean(agreement)} />
        {isArchived(b) || canArchive(b, today) ? <BookingTidy id={b.id} name={firstName} archived={isArchived(b)} removable={canRemove(b)} /> : null}
      </div>
    </article>
  );
}

export function splitBookings(all: BookingRow[], today: string) {
  // Archived rows leave every list and total; they sit in their own group.
  const archived = all.filter(isArchived).sort((a, b) => b.event_date.localeCompare(a.event_date));
  const bookings = all.filter((b) => !isArchived(b));
  const needs = bookings
    .filter((b) => ["payment_review", "requested", "pending_payment"].includes(b.status))
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const upcoming = bookings
    .filter((b) => b.status === "paid" && b.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = bookings
    .filter((b) => !needs.includes(b) && !upcoming.includes(b))
    .sort((a, b) => b.event_date.localeCompare(a.event_date));
  return { needs, upcoming, past, archived };
}

/** Three numbers the owner actually asks: what's in, what's still owed, what's next. */
function Summary({ bookings, upcoming, today }: { bookings: BookingRow[]; upcoming: BookingRow[]; today: string }) {
  const currency = bookings[0]?.currency ?? "usd";
  const collected = bookings.filter((b) => b.status === "paid").reduce((s, b) => s + b.deposit_amount_cents, 0);
  const owed = upcoming.reduce((s, b) => {
    const t = totalCents(b);
    return t === null ? s : s + Math.max(0, t - b.deposit_amount_cents);
  }, 0);
  const next = upcoming[0];
  const nextParts = next ? dayParts(next.event_date) : null;
  const nextWhen = next ? relativeDay(daysBetween(today, next.event_date)) : null;
  return (
    <dl className="bk-summary st-card">
      <div>
        <dt>Deposits in</dt>
        <dd className="st-num">{formatMoney(collected, currency)}</dd>
      </div>
      <div>
        <dt>Balance still due</dt>
        <dd className="st-num">{formatMoney(owed, currency)}</dd>
      </div>
      <div>
        <dt>Next celebration</dt>
        <dd>
          {next && nextParts ? (
            <a href={`#${next.id}`} className="bk-next">
              <span className="st-num">{nextParts.month} {nextParts.day}</span>
              <span className="text-[15px] font-normal text-[var(--tq-ink-mute)]"> · {next.name.split(" ")[0]}{nextWhen ? `, ${nextWhen.toLowerCase()}` : ""}</span>
            </a>
          ) : (
            <span className="text-[var(--tq-ink-mute)]">None booked</span>
          )}
        </dd>
      </div>
    </dl>
  );
}

export function BookingsBoard({ bookings, today }: { bookings: BookingRow[]; today: string }) {
  if (bookings.length === 0) {
    return (
      <div className="st-card st-empty">
        <p className="m-0 text-lg font-medium">No bookings yet.</p>
        <p className="st-note mt-1">When a family reserves a date, their package, deposit and contact details show up here.</p>
      </div>
    );
  }
  const { needs, upcoming, past, archived } = splitBookings(bookings, today);
  const live = bookings.filter((b) => !isArchived(b));
  const groups = [
    { id: "needs", title: "Needs you", intro: "Check the date, approve, or wait for the deposit. Soonest first.", rows: needs },
    { id: "upcoming", title: "Coming up", intro: "Paid celebrations, soonest first.", rows: upcoming },
    { id: "past", title: "Past and closed", intro: "Finished, refunded, cancelled or expired. Archive to hide one; Remove deletes one that was never paid.", rows: past },
    { id: "archived", title: "Archived", intro: "Hidden from the lists above. Restore one at any time.", rows: archived },
  ].filter((g) => g.rows.length);
  const onlyPast = needs.length === 0 && upcoming.length === 0;
  const nothingLive = live.length === 0;

  return (
    <>
      <Summary bookings={live} upcoming={upcoming} today={today} />
      {nothingLive ? <p className="st-card m-0 px-5 py-5 text-base sm:px-6">No open bookings. Everything here is archived.</p> : null}
      {groups.map((g) => {
        const closed = g.id === "past" || g.id === "archived";
        const rows = (
          <div className="border-t border-[var(--tq-surface-2)]">
            {g.rows.map((b) => <BookingRecord key={b.id} booking={b} today={today} closed={closed} />)}
          </div>
        );
        const heading = (
          <>
            <h2 id={`b-${g.id}`} className="st-h2">{g.title} <span className="st-num text-[var(--tq-ink-mute)]">{g.rows.length}</span></h2>
            <p className="st-note mt-1">{g.intro}</p>
          </>
        );
        if (g.id === "archived" || (closed && !onlyPast)) {
          return (
            <section key={g.id} aria-labelledby={`b-${g.id}`} className="st-card overflow-hidden">
              <details className="bk-group">
                <summary className="px-5 py-5 sm:px-6">
                  <div className="min-w-0">{heading}</div>
                  <span className="bk-caret" aria-hidden="true" />
                </summary>
                {rows}
              </details>
            </section>
          );
        }
        return (
          <section key={g.id} aria-labelledby={`b-${g.id}`} className="st-card overflow-hidden">
            <div className="px-5 py-5 sm:px-6">{heading}</div>
            {rows}
          </section>
        );
      })}
    </>
  );
}
