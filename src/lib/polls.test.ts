/**
 * Poll rules and the real poll SQL against SQLite (node:sqlite, the engine D1
 * is built on) with the real migration.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it, vi } from "vitest";

let sqlite: DatabaseSync;

function fakeD1() {
  return {
    prepare(sql: string) {
      let args: unknown[] = [];
      const stmt = {
        bind(...values: unknown[]) {
          args = values;
          return stmt;
        },
        async first() {
          return (sqlite.prepare(sql).get(...(args as never[])) as Record<string, unknown>) ?? null;
        },
        async all() {
          return { results: sqlite.prepare(sql).all(...(args as never[])), meta: { changes: 0 } };
        },
        async run() {
          const r = sqlite.prepare(sql).run(...(args as never[]));
          return { results: [], meta: { changes: Number(r.changes) } };
        },
      };
      return stmt;
    },
  };
}

vi.mock("server-only", () => ({}));
vi.mock("@/lib/d1", () => ({ getD1: async () => fakeD1(), requireD1: async () => fakeD1() }));

import { POLLS, POLL_MIN_TO_SHOW, getPoll, pollCookieName, pollResults } from "@/content/polls";
import { addPollVote, getPollCounts } from "./polls-db";

const poll = getPoll("guest-count")!;

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(join(process.cwd(), "migrations/0006_polls.sql"), "utf8"));
});

describe("poll counters (SQL)", () => {
  it("starts empty and counts one per vote", async () => {
    expect(await getPollCounts("guest-count")).toEqual({});
    await addPollVote("guest-count", "100-150");
    await addPollVote("guest-count", "100-150");
    await addPollVote("guest-count", "over-250");
    expect(await getPollCounts("guest-count")).toEqual({ "100-150": 2, "over-250": 1 });
  });

  it("keeps polls apart", async () => {
    await addPollVote("guest-count", "100-150");
    expect(await getPollCounts("another")).toEqual({});
  });

  it("stores nothing about the person", () => {
    const cols = sqlite.prepare("PRAGMA table_info(poll_votes)").all() as { name: string }[];
    expect(cols.map((c) => c.name).sort()).toEqual(["option_id", "poll_id", "updated_at", "votes"]);
  });
});

describe("pollResults", () => {
  it("hides percents until enough answers are in", () => {
    expect(pollResults(poll, { "100-150": POLL_MIN_TO_SHOW - 1 })).toEqual({ total: POLL_MIN_TO_SHOW - 1, results: null });
  });

  it("gives whole percents that add up to 100", () => {
    const out = pollResults(poll, { "under-100": 1, "100-150": 1, "151-250": 1, "over-250": 8 });
    expect(out.total).toBe(11);
    expect(out.results!.reduce((a, r) => a + r.pct, 0)).toBe(100);
    expect(out.results!.find((r) => r.id === "over-250")!.pct).toBe(73);
  });

  it("ignores counters for answers the poll does not have", () => {
    expect(pollResults(poll, { hacked: 500 }).total).toBe(0);
  });
});

describe("poll registry", () => {
  it("has unique ids, both languages and a safe cookie name", () => {
    expect(new Set(POLLS.map((p) => p.id)).size).toBe(POLLS.length);
    for (const p of POLLS) {
      expect(p.question.en && p.question.es).toBeTruthy();
      expect(new Set(p.options.map((o) => o.id)).size).toBe(p.options.length);
      expect(pollCookieName(p.id)).toMatch(/^tq_poll_[a-z0-9_]+$/);
    }
  });
});
