import { buildLeadWork } from "@/lib/admin-workflow";
import { getBookings, getInquiries, getInquiryActivity } from "@/lib/clients-db";
import { requireAdminPage } from "@/lib/require-admin";
import { getDayPulse } from "@/lib/day-pulse-db";
import { TodayView } from "@/components/admin/TodayView";
import { countPendingComments } from "@/lib/comments-db";
import { getPageBehavior } from "@/lib/analytics-db";
import { getBlogPulse } from "@/lib/blog-pulse-db";
import { listReviews } from "@/lib/reviews-db";
import { listOpenTickets } from "@/lib/support-db";
import { headers } from "next/headers";
import { rememberOwnerNetwork } from "@/lib/own-traffic-db";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdminPage("/admin"); // server-side gate; middleware is not enough
  const [inquiries, activity, bookings, behavior, comments, tickets, reviews, blog] = await Promise.all([
    getInquiries(),
    getInquiryActivity(),
    getBookings(),
    getPageBehavior(14),
    countPendingComments(),
    listOpenTickets(),
    listReviews().catch(() => []),
    getBlogPulse(14).catch(() => undefined),
  ]);
  const pulse = await getDayPulse(inquiries.map((i) => i.created_at));
  // The owner is here: this network (home wifi) stops counting as visitors.
  const networkExcluded = await rememberOwnerNetwork({ headers: await headers() });
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
  return (
    <TodayView
      comments={comments}
      tickets={tickets}
      reviews={reviews}
      blog={blog}
      pulse={pulse}
      networkExcluded={networkExcluded}
      work={buildLeadWork(inquiries, activity)}
      review={bookings.filter((b) => b.status === "payment_review")}
      behavior={behavior}
      upcoming={bookings.filter((b) => b.status === "paid" && b.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date))}
    />
  );
}
