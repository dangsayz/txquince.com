import { buildLeadWork, countDue } from "@/lib/admin-workflow";
import { getBookings, getInquiries, getInquiryActivity } from "@/lib/clients-db";
import { requireAdminPage } from "@/lib/require-admin";
import { getPriceBook } from "@/lib/pricing";
import { getDashboardStats } from "@/lib/analytics-db";
import { getPulseMoves } from "@/lib/pulse-moves";
import { getSocialSheet } from "@/lib/social";
import { PULSE_RANGES } from "@/components/admin/charts/StudioPulse";
import { TodayView } from "@/components/admin/TodayView";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAdminPage("/admin"); // server-side gate; middleware is not enough
  const { range: rangeParam } = await searchParams;
  const range = (PULSE_RANGES as readonly number[]).includes(Number(rangeParam)) ? Number(rangeParam) : 14;
  const [inquiries, activity, bookings, book, stats, moves, social] = await Promise.all([getInquiries(), getInquiryActivity(), getBookings(), getPriceBook(), getDashboardStats(range), getPulseMoves(), getSocialSheet()]);
  const work = buildLeadWork(inquiries, activity);
  const paid = bookings.filter((booking) => booking.status === "paid");
  const today = new Date().toISOString().slice(0, 10);
  return (
    <TodayView
      work={work}
      due={countDue(work)}
      unreplied={work.filter((item) => item.priority === "unreplied").length}
      paid={paid}
      review={bookings.filter((booking) => booking.status === "payment_review")}
      upcoming={paid.filter((booking) => booking.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date))}
      book={book}
      stats={stats}
      range={range}
      moves={moves}
      social={social}
    />
  );
}
