import { StudioPage, StudioSection } from "@/components/admin/StudioPage";
import { requireAdminPage } from "@/lib/require-admin";
import { listAvailability, listBookedDates, type AvailabilityRow } from "@/lib/plan-db";
import { formatPlanDate, todayInDallas } from "@/lib/plan";
import { AvailabilityEditor, ClearDateButton } from "@/components/admin/AvailabilityEditor";
import { BOOKINGS_PER_DATE } from "@/lib/booking-capacity";

export const dynamic = "force-dynamic";

const TONE: Record<string, "good" | "urgent" | undefined> = { available: "good", limited: "urgent", booked: "urgent" };

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
    <StudioPage
      title="Date availability"
      back={{ href: "/admin/plans", label: "Plans" }}
      intro={<>Every date shows as Available unless you mark it here. A date with {BOOKINGS_PER_DATE} live holds or paid bookings always shows as Booked.</>}
    >
      {loadError ? <p role="alert" className="st-card m-0 px-5 py-4 text-[15px] text-[var(--tq-status-down)]">{loadError}</p> : null}

      <StudioSection title="Mark a date">
        <AvailabilityEditor minDate={todayInDallas()} />
      </StudioSection>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <StudioSection title={`Marked dates (${rows.length})`} id="marked" flush>
          {rows.length ? (
            <ul className="m-0 list-none divide-y divide-[var(--tq-surface-2)] border-t border-[var(--tq-surface-2)] p-0">
              {rows.map((r) => (
                <li key={r.event_date} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-[15px] sm:px-6">
                  <span className="min-w-0">
                    <span className="font-medium">{formatPlanDate(r.event_date, "en")}</span>
                    {r.note ? <span className="block text-[13px] text-[var(--tq-ink-mute)]">{r.note}</span> : null}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="st-chip capitalize" data-tone={TONE[r.status]}>{r.status}</span>
                    <ClearDateButton date={r.event_date} />
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="st-note px-5 pb-5 sm:px-6">No dates marked. Every date shows as Available.</p>}
        </StudioSection>

        <StudioSection title={`Held or booked (${booked.length})`} id="held" intro="From Bookings. You can't change these here." flush>
          {booked.length ? (
            <ul className="m-0 list-none divide-y divide-[var(--tq-surface-2)] border-t border-[var(--tq-surface-2)] p-0">
              {booked.map((b) => (
                <li key={`${b.event_date}-${b.status}`} className="flex min-h-12 items-center justify-between gap-3 px-5 py-3 text-[15px] sm:px-6">
                  <span className="font-medium">{formatPlanDate(b.event_date, "en")}</span>
                  <span className="st-chip" data-tone={b.status === "paid" ? "good" : "urgent"}>{b.status === "paid" ? "Booked (paid)" : "On hold"}</span>
                </li>
              ))}
            </ul>
          ) : <p className="st-note px-5 pb-5 sm:px-6">No upcoming holds or paid bookings.</p>}
        </StudioSection>
      </div>
    </StudioPage>
  );
}
