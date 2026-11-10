import Link from "next/link";
import { ArrowIcon } from "@/components/admin/StudioIcons";
import type { MoneyRow, MoneySummary } from "@/lib/money-db";

const TZ = "America/Chicago";
export const usd = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents % 100 ? 2 : 0 });
const KIND: Record<MoneyRow["kind"], string> = { deposit: "Deposit", balance: "Balance payment", test: "Payment test" };

function paidWhen(iso: string, now: Date) {
  const d = new Date(iso);
  const day = (x: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(x);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
  if (day(d) === day(now)) return `Today, ${time}`;
  if (day(d) === day(new Date(now.getTime() - 86_400_000))) return `Yesterday, ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric", timeZone: TZ });
}
const eventDay = (isoDay: string) => new Date(`${isoDay}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** One payment: who, what for, when, how much. */
export function MoneyRows({ rows, now }: { rows: MoneyRow[]; now: Date }) {
  return (
    <ul className="m-0 list-none p-0">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-4 border-t border-[var(--tq-surface-2)] px-5 py-3 sm:px-6">
          <span className="min-w-0">
            <span className="block truncate text-[16px] font-semibold">{r.name}</span>
            <span className="mt-0.5 block text-[15px] text-[var(--tq-ink-mute)]">
              {KIND[r.kind]}
              {r.eventDate ? ` · event ${eventDay(r.eventDate)}` : ""} · <time dateTime={r.paidAt}>{paidWhen(r.paidAt, now)}</time>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            {r.state === "refunded" ? <span className="st-chip">Refunded</span> : r.state === "review" ? <span className="st-chip" data-tone="urgent">Check date</span> : null}
            <span className={`st-num whitespace-nowrap text-[18px] font-semibold ${r.state === "refunded" ? "text-[var(--tq-ink-mute)] line-through" : ""}`}>{usd(r.amountCents)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Today: the latest payments and this month's total. */
export function MoneyPanel({ money, now, className = "" }: { money: MoneySummary; now: Date; className?: string }) {
  const month = now.toLocaleDateString("en-US", { month: "long", timeZone: TZ });
  return (
    <section aria-labelledby="money-title" className={`st-card ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pb-3 pt-5 sm:px-6">
        <div>
          <h2 id="money-title" className="st-h2">Payments</h2>
          <p className="m-0 mt-1 text-[15px] text-[var(--tq-ink-mute)]">
            {money.monthCount
              ? `${usd(money.monthCents)} received in ${month}, from ${money.monthCount} ${money.monthCount === 1 ? "payment" : "payments"}.`
              : `No family payments in ${month} yet.`}
          </p>
        </div>
        <Link href="/admin/payments" className="st-link">
          All payments <ArrowIcon />
        </Link>
      </div>
      {money.rows.length ? (
        <MoneyRows rows={money.rows} now={now} />
      ) : (
        <p className="m-0 border-t border-[var(--tq-surface-2)] px-5 py-5 text-[16px] sm:px-6">When a family pays, it shows here within a minute.</p>
      )}
    </section>
  );
}
