import { StudioPage } from "@/components/admin/StudioPage";
import { BookingsBoard, splitBookings } from "@/components/admin/BookingsBoard";
import { getBookings, countPaid } from "@/lib/clients-db";
import { requireAdminPage } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminBookings() {
  await requireAdminPage("/admin/bookings"); // server-side gate; middleware is not enough
  const bookings = await getBookings();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
  const { needs, upcoming } = splitBookings(bookings, today);

  return (
    <StudioPage
      title="Bookings"
      intro={`${countPaid(bookings)} paid · ${upcoming.length} coming up${needs.length ? ` · ${needs.length} need${needs.length === 1 ? "s" : ""} you` : ""}.`}
    >
      <BookingsBoard bookings={bookings} today={today} />
    </StudioPage>
  );
}
