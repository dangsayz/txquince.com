import Link from "next/link";
import { requireAdminPage } from "@/lib/require-admin";
import { listAvailability, listBookedDates, type AvailabilityRow } from "@/lib/plan-db";
import { formatPlanDate, todayInDallas } from "@/lib/plan";
import { AvailabilityEditor, ClearDateButton } from "@/components/admin/AvailabilityEditor";

export const dynamic = "force-dynamic";

const CHIP: Record<string, string> = {
  available: "bg-[#e9f1e9] text-[#365c43]",
  limited: "bg-[#fdf1dd] text-[#76520f]",
  booked: "bg-[#f8e8e7] text-[#8f4039]",
};

export default async function AdminAvailability() {
  await requireAdminPage("/admin/availability");
  let rows: AvailabilityRow[] = [];
  let loadError: string | null = null;
  try {
    rows = await listAvailability();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load availability.";
  }
  const booked = await listBookedDates().catch(() => []);

  return (
    <main className="mx-auto max-w-[60rem] px-5 pb-24 pt-8 text-[#252525] sm:px-8 lg:pt-11">
      <div className="border-b border-[#e5e5e3] pb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#62625f]"><Link href="/admin/plans" className="underline">Plans</Link> / Availability</p>
        <h1 className="mt-3 text-[clamp(1.7rem,2.5vw,2.25rem)] font-normal leading-tight tracking-[-0.035em]">Date availability</h1>
        <p className="mt-3 max-w-[60ch] text-sm leading-6 text-[#575753]">
          Every date is <strong>Available</strong> unless you mark it here. Dates with a live hold or a paid booking always show as <strong>Booked</strong> on plan pages, no matter what this list says.
        </p>
      </div>

      {loadError ? <p role="alert" className="mt-6 rounded-sm border border-[#f0c9c5] bg-[#f8e8e7] px-4 py-3 text-sm text-[#8f4039]">{loadError}</p> : null}

      <section aria-labelledby="set-date" className="mt-8 grid gap-3">
        <h2 id="set-date" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#62625f]">Set a date</h2>
        <AvailabilityEditor minDate={todayInDallas()} />
      </section>

      <section aria-labelledby="marked" className="mt-10">
        <h2 id="marked" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#62625f]">Marked dates ({rows.length})</h2>
        {rows.length ? (
          <ul className="mt-3 divide-y divide-[#ededeb] border-y border-[#e5e5e3] bg-white">
            {rows.map((r) => (
              <li key={r.event_date} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="font-medium">{formatPlanDate(r.event_date, "en")}</span>
                  {r.note ? <span className="block text-xs text-[#696965]">{r.note}</span> : null}
                </span>
                <span className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${CHIP[r.status]}`}>{r.status}</span>
                  <ClearDateButton date={r.event_date} />
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-[#696965]">No dates marked. Everything shows as Available.</p>}
      </section>

      <section aria-labelledby="held" className="mt-10">
        <h2 id="held" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#62625f]">Held or booked in Bookings ({booked.length})</h2>
        {booked.length ? (
          <ul className="mt-3 divide-y divide-[#ededeb] border-y border-[#e5e5e3] bg-white">
            {booked.map((b) => (
              <li key={`${b.event_date}-${b.status}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-medium">{formatPlanDate(b.event_date, "en")}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${CHIP.booked}`}>{b.status === "paid" ? "Booked (paid)" : "On hold"}</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-[#696965]">No upcoming holds or paid bookings.</p>}
      </section>
    </main>
  );
}
