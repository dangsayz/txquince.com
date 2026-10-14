import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/require-admin";
import { journeyDeps } from "@/lib/journey/deps";
import { adminList, isStatusParam, LIST_VIEWS, type ListView } from "@/lib/journey/admin-read";
import { STATUS_LABEL } from "@/lib/journey/state";
import { refFor } from "@/lib/journey/ref";
import { TIER_NAME_EN, type TierId } from "@/lib/commission";

export const dynamic = "force-dynamic";

const VIEW_LABEL: Record<ListView, string> = {
  all: "All",
  requests: "New requests",
  upcoming: "Upcoming",
  balance: "Balance due (30 days)",
  unread: "Unread messages",
  review: "Needs review",
  closed: "Closed",
};

const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const day = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso.slice(0, 10)}T12:00:00Z`),
  );

/** Status chip: black text always; the box style carries the meaning. */
function Chip({ status }: { status: keyof typeof STATUS_LABEL }) {
  const strong = status === "requested" || status === "payment_review";
  const quiet = ["declined", "expired", "cancelled", "refunded"].includes(status);
  return (
    <span
      className={`inline-flex min-h-7 items-center whitespace-nowrap px-2.5 text-sm font-medium text-[#111110] ${
        strong ? "border-2 border-[#111110] bg-[#f2efe9]" : quiet ? "border border-dashed border-[#8c877f]" : "border border-[#8c877f] bg-white"
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default async function AdminBookings({ searchParams }: { searchParams: Promise<{ view?: string; status?: string }> }) {
  await requireAdminPage("/admin/bookings"); // server-side gate; middleware is not enough
  const sp = await searchParams;
  const view: ListView = (LIST_VIEWS as readonly string[]).includes(sp.view ?? "") ? (sp.view as ListView) : "all";
  const status = isStatusParam(sp.status) ? sp.status : null;
  const rows = await adminList(journeyDeps(), view, status).catch((err) => {
    console.error("[admin/bookings]", err);
    return [];
  });
  if (rows === null) redirect("/admin/login?next=/admin/bookings");

  return (
    <main className="mx-auto max-w-[86rem] px-4 pb-24 pt-8 text-[#111110] sm:px-8 lg:px-12 lg:pt-11">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[#e5e5e3] pb-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Client work / Bookings</p>
          <h1 className="mt-3 text-[clamp(1.7rem,2.5vw,2.25rem)] font-normal leading-tight tracking-[-0.035em]">Bookings</h1>
        </div>
        <Link href="/admin/bookings/contract" className="inline-flex min-h-11 items-center text-base underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111110]">
          Contract template
        </Link>
      </header>

      <nav aria-label="Filter bookings" className="mt-5 flex flex-wrap gap-2">
        {LIST_VIEWS.map((v) => (
          <Link
            key={v}
            href={v === "all" ? "/admin/bookings" : `/admin/bookings?view=${v}`}
            aria-current={v === view ? "page" : undefined}
            className={`inline-flex min-h-11 items-center whitespace-nowrap px-4 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111110] ${
              v === view ? "bg-[#111110] text-white" : "border border-[#8c877f] bg-white text-[#111110] hover:border-[#111110]"
            }`}
          >
            {VIEW_LABEL[v]}
          </Link>
        ))}
      </nav>
      {status && (
        <p className="mt-3 text-base">
          Status: <strong>{STATUS_LABEL[status]}</strong> ·{" "}
          <Link href="/admin/bookings" className="underline underline-offset-4">
            clear
          </Link>
        </p>
      )}

      {rows.length === 0 ? (
        <div className="mt-7 border-y border-[#e5e5e3] px-5 py-16 text-center">
          <h2 className="text-lg font-medium">Nothing here</h2>
          <p className="mx-auto mt-2 max-w-md text-base">New requests, upcoming dates and balances show up here.</p>
        </div>
      ) : (
        <ul aria-label="Bookings" className="mt-7 border-t border-[#e5e5e3]">
          {rows.map(({ b, ledger, unread }) => {
            const tier = b.request?.tier ?? (b.metadata?.tier as string | undefined);
            return (
              <li key={b.id} className="border-b border-[#e5e5e3]">
                <Link
                  href={`/admin/bookings/${b.id}`}
                  className="grid min-h-16 gap-2 px-1 py-4 hover:bg-[#f7f7f5] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#111110] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)] sm:items-center sm:gap-5 sm:px-4"
                >
                  <span className="min-w-0">
                    <span className="block break-words text-base font-medium">{b.name}</span>
                    <span className="block text-sm">
                      {refFor(b.id)}
                      {tier && tier in TIER_NAME_EN ? ` · ${TIER_NAME_EN[tier as TierId]}` : ""}
                      {b.lang === "es" ? " · ES" : ""}
                    </span>
                  </span>
                  <span className="text-base">{day(b.event_date)}</span>
                  <span className="text-base tabular-nums">
                    {money(ledger.totalCents)}
                    {ledger.remainingCents > 0 && ["approved", "confirmed", "payment_review"].includes(b.status) ? (
                      <span className="block text-sm">
                        {money(ledger.remainingCents)} left{b.balance_due_date && b.status === "confirmed" ? ` · due ${day(b.balance_due_date)}` : ""}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Chip status={b.status} />
                    {unread > 0 && (
                      <span className="inline-flex min-h-7 items-center whitespace-nowrap bg-[#111110] px-2.5 text-sm font-medium text-white">
                        {unread} unread
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
