import { describe, expect, it } from "vitest";
import en from "./blog/posts/quinceanera-planning-timeline-checklist";
import es from "./blog/posts/es/como-planear-una-quinceanera-cronograma";
import { dateStages, daysBetween, dueDate, parseIso, parseStageHeading, planIcs, planStages, planText, splitTask } from "./plan-stages";

describe("reading stages out of the planning post", () => {
  it("finds the same eight stages in English and Spanish", () => {
    const a = planStages(en.content);
    const b = planStages(es.content);
    expect(a.map((s) => s.key)).toEqual(["m12", "m9", "m7", "m5", "m3", "m2", "m1", "d7"]);
    expect(b.map((s) => s.key)).toEqual(a.map((s) => s.key));
    expect(b.map((s) => s.tasks.length)).toEqual(a.map((s) => s.tasks.length));
  });

  it("uses the post's own words for every task", () => {
    const lists = en.content.flatMap((b) => (b.type === "ul" || b.type === "ol" ? b.items : []));
    for (const stage of planStages(en.content)) {
      expect(stage.tasks.length).toBeGreaterThan(0);
      for (const t of stage.tasks) expect(lists.some((item) => item.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").startsWith(t.title))).toBe(true);
    }
  });

  it("reads windows, labels and offsets from headings", () => {
    expect(parseStageHeading("9–10 months out: dress and court")).toEqual({ window: "9–10 months out", label: "dress and court", offset: { months: 9 } });
    expect(parseStageHeading("2 months out: pre-quince session and final timeline")?.offset).toEqual({ months: 2 });
    expect(parseStageHeading("One week out")).toEqual({ window: "One week out", label: "", offset: { days: 7 } });
    expect(parseStageHeading("Una semana antes")?.offset).toEqual({ days: 7 });
    expect(parseStageHeading("12–18 meses antes: la base")).toEqual({ window: "12–18 meses antes", label: "la base", offset: { months: 12 } });
    expect(parseStageHeading("1 month, 1 week, and the day itself")).toBeNull();
    expect(parseStageHeading("Day of")).toBeNull();
  });

  it("splits a list item into a task and its detail", () => {
    expect(splitTask("Set the date and a backup date. A backup matters.")).toEqual({ title: "Set the date and a backup date", detail: "A backup matters." });
    expect(splitTask("Rest. A calm quinceañera looks calm in the photos.").title).toBe("Rest");
    expect(splitTask("No sentence end").title).toBe("No sentence end");
  });
});

describe("dates", () => {
  it("counts back whole months and clamps short months", () => {
    expect(dueDate("2027-05-31", { months: 3 })).toBe("2027-02-28");
    expect(dueDate("2028-05-31", { months: 3 })).toBe("2028-02-29");
    expect(dueDate("2027-03-15", { months: 12 })).toBe("2026-03-15");
    expect(dueDate("2027-01-10", { months: 2 })).toBe("2026-11-10");
    expect(dueDate("2027-03-03", { days: 7 })).toBe("2027-02-24");
    expect(dueDate("not-a-date", { months: 1 })).toBeNull();
  });

  it("rejects dates that do not exist", () => {
    expect(parseIso("2027-02-30")).toBeNull();
    expect(parseIso("2027-13-01")).toBeNull();
    expect(daysBetween("2026-11-09", "2026-11-19")).toBe(10);
    expect(daysBetween("2026-11-09", "2026-11-01")).toBe(-8);
  });

  it("marks late, now, later and done", () => {
    const stages = planStages(en.content);
    // Party in 6 months: the 12, 9 and 7 month stages are already past.
    const dated = dateStages(stages, "2027-05-15", "2026-11-15", new Set());
    expect(dated.map((s) => s.status)).toEqual(["late", "late", "late", "now", "later", "later", "later", "later"]);
    const first = new Set(stages[0].tasks.map((t) => t.id));
    expect(dateStages(stages, "2027-05-15", "2026-11-15", first)[0].status).toBe("done");
    // No date yet: nothing is late and the first stage is the one to start.
    expect(dateStages(stages, null, "2026-11-15", new Set()).map((s) => s.status)[0]).toBe("now");
    expect(dateStages(stages, null, "2026-11-15", new Set()).some((s) => s.status === "late")).toBe(false);
  });
});

describe("sharing", () => {
  const stages = planStages(en.content);
  const done = new Set(stages[0].tasks.map((t) => t.id));
  const dated = dateStages(stages, "2027-05-15", "2026-11-15", done);

  it("writes a message with only the tasks that are left", () => {
    const text = planText(dated, "2027-05-15", "en", done, "https://txquince.com/blog/x");
    expect(text).toContain("Party day: May 15, 2027");
    expect(text).not.toContain(stages[0].tasks[0].title);
    expect(text).toContain(`☐ ${stages[1].tasks[0].title}`);
    expect(text).toContain("https://txquince.com/blog/x");
  });

  it("writes a valid calendar file", () => {
    const ics = planIcs(dated, "2027-05-15", "en", done, "20261115T000000Z");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    // 7 unfinished stages + the party day.
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(8);
    expect(ics).toContain("DTSTART;VALUE=DATE:20270515");
    expect(ics).toContain("DTEND;VALUE=DATE:20270516");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260815"); // 9 months before
    expect(ics).not.toMatch(/[^\r]\n/);
  });
});
