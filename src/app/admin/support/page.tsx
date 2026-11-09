import Link from "next/link";
import { requireAdminPage } from "@/lib/require-admin";
import { getDb, isDbConfigured } from "@/lib/db";
import { StudioPage } from "@/components/admin/StudioPage";
import { TicketStatusButton } from "@/components/admin/TicketStatusButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Support · TX Quince Studio" };

type Ticket = {
  id: string; created_at: string; name: string; email: string; phone: string | null;
  topic: string; message: string; booking_id: string | null; language: string; status: "open" | "closed";
};
const TOPIC: Record<string, string> = { booking: "Booking or date", payment: "Payment", contract: "Agreement", other: "Other" };
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

/** /admin/support — messages families send from their account page. */
export default async function AdminSupport({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  await requireAdminPage("/admin/support");
  const view = (await searchParams).view === "done" ? "closed" : "open";
  let tickets: Ticket[] = [];
  let loadError: string | null = null;
  if (isDbConfigured()) {
    const { data, error } = await getDb().from("support_tickets").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) loadError = error.message;
    else tickets = data as Ticket[];
  }
  const open = tickets.filter((t) => t.status === "open").length;
  const shown = tickets.filter((t) => t.status === view);

  return (
    <StudioPage
      title="Support"
      intro={`Messages families send from their account page. ${open ? `${open} waiting for an answer.` : "Nothing is waiting."}`}
    >
      {loadError ? <p role="alert" className="st-card m-0 px-5 py-4 text-[15px] text-[var(--tq-status-down)]">{loadError}</p> : null}
      <div className="grid gap-4">
        <nav aria-label="Support views" className="st-tabs">
          <Link href="/admin/support" aria-current={view === "open" ? "page" : undefined} className="st-tab">Open<span className="st-count">{open}</span></Link>
          <Link href="/admin/support?view=done" aria-current={view === "closed" ? "page" : undefined} className="st-tab">Done<span className="st-count">{tickets.length - open}</span></Link>
        </nav>
        {shown.length === 0 ? (
          <p className="st-empty">{view === "open" ? "No open messages. New ones also reach you by email." : "No finished messages yet."}</p>
        ) : (
          shown.map((t) => (
            <article key={t.id} className="st-card grid gap-3 px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="m-0 text-[17px] font-medium text-[var(--tq-ink)]">{t.name}</h2>
                <span className="st-chip">{TOPIC[t.topic] ?? t.topic}</span>
                {t.language === "es" ? <span className="st-chip">Spanish</span> : null}
                <span className="text-[15px] text-[var(--tq-ink-mute)]">{when(t.created_at)}</span>
              </div>
              <p className="m-0 max-w-[70ch] whitespace-pre-wrap text-[16px] leading-relaxed text-[var(--tq-ink)]">{t.message}</p>
              <div className="flex flex-wrap items-center gap-3">
                <a href={`mailto:${t.email}?subject=${encodeURIComponent("Re: your message to TX Quince")}`} className="st-btn">Reply by email</a>
                {t.phone ? <a href={`sms:${t.phone}`} className="st-btn-ghost">Text {t.phone}</a> : null}
                {t.booking_id ? <Link href="/admin/bookings" className="st-btn-ghost">Their booking</Link> : null}
                <TicketStatusButton id={t.id} status={t.status} />
              </div>
              <p className="m-0 text-[15px] text-[var(--tq-ink-mute)]">{t.email}</p>
            </article>
          ))
        )}
      </div>
    </StudioPage>
  );
}
