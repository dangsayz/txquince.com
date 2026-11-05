import Link from "next/link";
import { getDashboardStats, getConversionChanges, type RangedStats } from "@/lib/analytics-db";
import { ChangeLog } from "@/components/admin/ChangeLog";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { requireAdminPage } from "@/lib/require-admin";
import { StudioPulse, PULSE_RANGES } from "@/components/admin/charts/StudioPulse";

function mins(s: number) {
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
}

export const dynamic = "force-dynamic";

const RANGES = PULSE_RANGES;

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function InsightPanel({ insights }: { insights: RangedStats["insights"] }) {
  const tone = {
    success: "text-emerald-700",
    warning: "text-amber-700",
    info: "text-ink-soft",
  };
  return (
    <div className="border border-line bg-white p-5">
      <p className="text-sm font-medium text-ink">What to do next</p>
      <ul className="mt-4 space-y-3">
        {insights.length === 0 ? (
          <li className="text-base text-ink-faint">Insights appear as data comes in.</li>
        ) : (
          insights.map((ins, i) => (
            <li key={i} className={`flex gap-2.5 text-base leading-relaxed ${tone[ins.type]}`}>
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
              {ins.text}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAdminPage("/admin/insights"); // server-side gate; middleware is not enough
  const { range: rangeParam } = await searchParams;
  const range = RANGES.includes(Number(rangeParam) as (typeof RANGES)[number])
    ? (Number(rangeParam) as number)
    : 14;
  const [s, changes] = await Promise.all([getDashboardStats(range), getConversionChanges()]);

  return (
    <main className="mx-auto max-w-[90rem] px-5 pb-20 pt-8 md:px-10 md:pt-12 lg:px-16">
      <AutoRefresh seconds={30} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">Studio / Business</p>
          <h1 className="mt-3 text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.04em] text-ink">Insights</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {s.configured
              ? `Live traffic, bookings, and what to do next — last ${range} days.`
              : "Live analytics will appear when the data connection is available."}
          </p>
        </div>
      </div>

      {/* payment-review alert — money collected but NOT auto-confirmed. Must never
          be silently missed: a family paid and may be owed their date or a refund. */}
      {s.paymentReview > 0 ? (
        <Link
          href="/admin/bookings"
          className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-amber-400 bg-amber-50 p-5 transition-colors hover:border-amber-600"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Needs review</p>
            <p className="mt-1 text-base text-ink">
              {s.paymentReview} payment{s.paymentReview === 1 ? "" : "s"} collected but not auto-confirmed
              {s.paymentReviewValue ? ` · ${money(s.paymentReviewValue)} held` : ""} — verify the date or refund.
            </p>
          </div>
          <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-amber-700">Open →</span>
        </Link>
      ) : null}

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
            On the site right now
          </p>
          <span className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span aria-hidden className={`h-2 w-2 rounded-full ${s.liveNow.length ? "bg-emerald-500" : "bg-line"}`} />
            {s.liveNow.length} visitor{s.liveNow.length === 1 ? "" : "s"}
          </span>
        </div>
        {s.liveNow.length ? (
          <ul className="mt-3 divide-y divide-line">
            {s.liveNow.map((v, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 py-2 text-base">
                <span className="truncate text-ink">{v.path === "/" ? "Homepage" : v.path}</span>
                <span className="shrink-0 tabular-nums text-ink-soft">
                  {v.pages} pg · {mins(v.seconds)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-base text-ink-faint">Quiet right now — refreshes every 30s.</p>
        )}
      </section>

      <StudioPulse s={s} basePath="/admin/insights" range={range} />

      <section className="mt-4">
        <InsightPanel insights={s.insights} />
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
          Page behavior · time on page &amp; exits
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-base">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">
                <th className="pb-2 font-medium">Page</th>
                <th className="pb-2 text-right font-medium">Views</th>
                <th className="pb-2 text-right font-medium">Avg time</th>
                <th className="pb-2 text-right font-medium">Exit %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {s.engagement.map((p) => (
                <tr key={p.path}>
                  <td className="max-w-[14rem] truncate py-2 text-ink">
                    {p.path === "/" ? "Homepage" : p.path}
                  </td>
                  <td className="py-2 text-right tabular-nums text-ink-soft">{p.views}</td>
                  <td className="py-2 text-right tabular-nums text-ink-soft">
                    {p.avgSeconds ? mins(p.avgSeconds) : "—"}
                  </td>
                  <td className={`py-2 text-right tabular-nums ${p.exitRate >= 70 ? "font-medium text-accent-strong" : "text-ink-soft"}`}>
                    {p.exitRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          High exit % on a money page (investment, reserve) = the leak to fix. High exit on
          blog posts is normal.
        </p>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
          This week&apos;s flywheel · computed from live data
        </p>
        <ul className="mt-4 space-y-3">
          {s.flywheel.map((f) => (
            <li key={f.label} className="flex gap-3">
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sm ${
                  f.done ? "bg-emerald-600 text-white" : "border border-accent text-accent"
                }`}
              >
                {f.done ? "✓" : "!"}
              </span>
              <span className="text-base leading-snug">
                <span className={f.done ? "text-ink-soft line-through decoration-ink/30" : "font-medium text-ink"}>
                  {f.label}
                </span>
                <span className="block text-xs text-ink-faint">{f.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
          Revenue &amp; leads by source
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          Where each booking &amp; lead came from: the link tag when there is one (tag links you share
          outside the site with <code className="text-ink">?src=</code>: instagram, facebook, tiktok, youtube,
          pinterest or quora, e.g. <code className="text-ink">?src=pinterest</code>; links between our own
          pages get no tag), otherwise the site they first came from.
        </p>
        {s.bySource.length === 0 ? (
          <p className="mt-4 text-base text-ink-faint">
            No attributed leads or bookings yet — they&apos;ll appear here as inquiries and date
            requests come in.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 text-right font-medium">Leads</th>
                  <th className="pb-2 text-right font-medium">Requests</th>
                  <th className="pb-2 text-right font-medium">Booked&nbsp;$</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {s.bySource.map((r) => (
                  <tr key={r.source}>
                    <td className="py-2 capitalize text-ink">{r.source}</td>
                    <td className="py-2 text-right tabular-nums text-ink-soft">{r.leads}</td>
                    <td className="py-2 text-right tabular-nums text-ink-soft">{r.requests}</td>
                    <td className="py-2 text-right tabular-nums font-medium text-ink">
                      {r.bookedValue ? money(r.bookedValue) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-4">
        <ChangeLog initial={changes} />
      </section>

      {!s.configured ? (
        <p className="mt-8 text-base text-ink-faint">Analytics tables are ready; data will populate as visitors browse the live site.</p>
      ) : null}
    </main>
  );
}
