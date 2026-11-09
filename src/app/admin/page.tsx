import { buildLeadWork } from "@/lib/admin-workflow";
import { getBookings, getInquiries, getInquiryActivity } from "@/lib/clients-db";
import { requireAdminPage } from "@/lib/require-admin";
import { getDayPulse } from "@/lib/day-pulse-db";
import { TodayView } from "@/components/admin/TodayView";
import { countPendingComments } from "@/lib/comments-db";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdminPage("/admin"); // server-side gate; middleware is not enough
  const [inquiries, activity, bookings, comments] = await Promise.all([getInquiries(), getInquiryActivity(), getBookings(), countPendingComments()]);
  const pulse = await getDayPulse(inquiries.map((i) => i.created_at));
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
  return (
    <TodayView
      pulse={pulse}
      comments={comments}
      work={buildLeadWork(inquiries, activity)}
      review={bookings.filter((b) => b.status === "payment_review")}
      upcoming={bookings.filter((b) => b.status === "paid" && b.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date))}
    />
  );
}
