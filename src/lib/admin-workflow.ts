import type { InquiryActivityRow, InquiryRow } from "@/lib/clients-db";

export type LeadWorkItem = {
  inquiry: InquiryRow;
  nextReminder: InquiryActivityRow | null;
  lastContact: InquiryActivityRow | null;
  priority: "overdue" | "due_today" | "unreplied" | "scheduled" | "keep_warm";
};

const dallasDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dayKey(iso: string): string {
  const parts = dallasDate.formatToParts(new Date(iso));
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

export function buildLeadWork(inquiries: InquiryRow[], activity: InquiryActivityRow[], now = new Date()): LeadWorkItem[] {
  const today = dayKey(now.toISOString());
  const reminders = new Map<string, InquiryActivityRow[]>();
  const contacts = new Map<string, InquiryActivityRow>();

  for (const row of activity) {
    if (row.kind === "reminder" && !row.completed_at) {
      const rows = reminders.get(row.inquiry_id) ?? [];
      rows.push(row);
      reminders.set(row.inquiry_id, rows);
    }
    if (row.kind === "contact") {
      const prior = contacts.get(row.inquiry_id);
      if (!prior || prior.created_at < row.created_at) contacts.set(row.inquiry_id, row);
    }
  }

  const rank = { overdue: 0, due_today: 1, unreplied: 2, scheduled: 3, keep_warm: 4 };
  return inquiries
    .filter((inquiry) => inquiry.status === "new" && !inquiry.unsubscribed_at)
    .map((inquiry) => {
      const nextReminder = (reminders.get(inquiry.id) ?? []).sort((a, b) => (a.due_at ?? "").localeCompare(b.due_at ?? ""))[0] ?? null;
      const lastContact = contacts.get(inquiry.id) ?? null;
      const dueDay = nextReminder?.due_at ? dayKey(nextReminder.due_at) : null;
      const priority: LeadWorkItem["priority"] = dueDay && dueDay < today
        ? "overdue"
        : dueDay === today
          ? "due_today"
          : !lastContact
            ? "unreplied"
            : nextReminder
              ? "scheduled"
              : "keep_warm";
      return { inquiry, nextReminder, lastContact, priority };
    })
    .sort((a, b) => {
      const byPriority = rank[a.priority] - rank[b.priority];
      if (byPriority) return byPriority;
      if (a.nextReminder?.due_at && b.nextReminder?.due_at) return a.nextReminder.due_at.localeCompare(b.nextReminder.due_at);
      return a.inquiry.created_at.localeCompare(b.inquiry.created_at);
    });
}

export function countDue(work: LeadWorkItem[]): number {
  return work.filter((item) => item.priority === "overdue" || item.priority === "due_today").length;
}
