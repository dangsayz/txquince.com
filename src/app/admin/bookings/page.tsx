import Link from "next/link";
import { StudioPage } from "@/components/admin/StudioPage";
import { BookingsBoard, splitBookings } from "@/components/admin/BookingsBoard";
import { getBookings, countPaid } from "@/lib/clients-db";
import { MoneyPanel } from "@/components/admin/MoneyPanel";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { getMoney } from "@/lib/money-db";
import { getDb, isDbConfigured } from "@/lib/db";
import type { LedgerRow } from "@/components/admin/BookingsBoard";
import { requireAdminPage } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

/** Every received balance payment (card or recorded by hand), for the money column and the record form. */
async function getLedger(): Promise<LedgerRow[]> {
  if (!isDbConfigured()) return [];
  const { data } = await getDb().from("booking_payments").select("id, booking_id, amount_cents, method, paid_at, note").eq("status", "paid").order("paid_at", { ascending: false }).limit(2000);
  return (data ?? []) as LedgerRow[];
}

export default async function AdminBookings() {
  await requireAdminPage("/admin/bookings"); // server-side gate; middleware is not enough
  const [bookings, money, ledger] = await Promise.all([getBookings(), getMoney(6).catch(() => null), getLedger()]);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
  const { needs, upcoming } = splitBookings(bookings, today);

  return (
    <StudioPage
      title="Bookings"
      intro={`${countPaid(bookings)} paid · ${upcoming.length} coming up${needs.length ? ` · ${needs.length} need${needs.length === 1 ? "s" : ""} you` : ""}.`}
      actions={<Link href="/admin/payments" className="st-btn-ghost">Payments</Link>}
    >
      <AutoRefresh seconds={45} />
      {/* The same Payments section as Today, so money reads the same on every page. */}
      {money ? <MoneyPanel money={money} now={new Date()} /> : null}
      <BookingsBoard bookings={bookings} today={today} ledger={ledger} />
    </StudioPage>
  );
}
