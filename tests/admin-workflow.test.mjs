import assert from "node:assert/strict";
import test from "node:test";
import { buildLeadWork, countDue } from "../src/lib/admin-workflow.ts";

const inquiry = (id, status = "new") => ({
  id,
  status,
  unsubscribed_at: null,
  created_at: "2026-09-22T12:00:00.000Z",
});
const activity = (id, inquiryId, kind, fields = {}) => ({
  id,
  inquiry_id: inquiryId,
  kind,
  created_at: "2026-09-22T18:00:00.000Z",
  due_at: null,
  completed_at: null,
  ...fields,
});

test("prioritizes overdue reminders and first personal replies", () => {
  const now = new Date("2026-09-23T18:00:00.000Z");
  const rows = [inquiry("unreplied"), inquiry("overdue"), inquiry("closed", "won")];
  const events = [
    activity("r1", "overdue", "reminder", { due_at: "2026-09-22T23:00:00.000Z" }),
    activity("c1", "overdue", "contact"),
    activity("r2", "closed", "reminder", { due_at: "2026-09-22T23:00:00.000Z" }),
  ];
  const work = buildLeadWork(rows, events, now);
  assert.deepEqual(work.map((item) => [item.inquiry.id, item.priority]), [
    ["overdue", "overdue"],
    ["unreplied", "unreplied"],
  ]);
  assert.equal(countDue(work), 1);
});

test("uses Dallas calendar dates and ignores completed reminders", () => {
  const now = new Date("2026-09-24T02:00:00.000Z");
  const events = [
    activity("completed", "client", "reminder", { due_at: "2026-09-22T18:00:00.000Z", completed_at: "2026-09-23T01:00:00.000Z" }),
    activity("today", "client", "reminder", { due_at: "2026-09-24T03:00:00.000Z" }),
    activity("contact", "client", "contact"),
  ];
  const [item] = buildLeadWork([inquiry("client")], events, now);
  assert.equal(item.priority, "due_today");
  assert.equal(item.nextReminder?.id, "today");
});

test("keeps a contacted open lead visible without inventing a reminder", () => {
  const [item] = buildLeadWork([inquiry("client")], [activity("contact", "client", "contact")]);
  assert.equal(item.priority, "keep_warm");
  assert.equal(item.nextReminder, null);
});
