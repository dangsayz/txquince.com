/**
 * polls.ts — the one-question polls a blog post can show.
 *
 * A poll stores only a counter per answer (migrations/0006_polls.sql): no
 * name, no account, no free text. The English and Spanish posts share one
 * poll id, so both languages count into the same result.
 * No server imports: used by the client poll, the API and tests.
 */
export type PollOption = { id: string; en: string; es: string };
export type Poll = { id: string; question: { en: string; es: string }; options: readonly PollOption[] };

export const POLLS: readonly Poll[] = [
  {
    id: "guest-count",
    question: { en: "How many guests are you planning for?", es: "¿Para cuántos invitados está planeando?" },
    options: [
      { id: "under-100", en: "Under 100", es: "Menos de 100" },
      { id: "100-150", en: "100 to 150", es: "100 a 150" },
      { id: "151-250", en: "151 to 250", es: "151 a 250" },
      { id: "over-250", en: "More than 250", es: "Más de 250" },
    ],
  },
];

export function getPoll(id: string): Poll | undefined {
  return POLLS.find((p) => p.id === id);
}

/** Percentages stay hidden until this many answers, so one vote never reads as "100%". */
export const POLL_MIN_TO_SHOW = 10;

export type PollResults = {
  total: number;
  /** Null until POLL_MIN_TO_SHOW answers are in. Whole percents that sum to 100. */
  results: { id: string; pct: number }[] | null;
};

/** Turn raw counters into what the page may show. Unknown option ids are ignored. */
export function pollResults(poll: Poll, counts: Record<string, number>): PollResults {
  const votes = poll.options.map((o) => Math.max(0, Math.floor(counts[o.id] ?? 0)));
  const total = votes.reduce((a, b) => a + b, 0);
  if (total < POLL_MIN_TO_SHOW) return { total, results: null };
  // Largest-remainder rounding so the shown percents always add up to 100.
  const exact = votes.map((v) => (v / total) * 100);
  const pct = exact.map(Math.floor);
  let left = 100 - pct.reduce((a, b) => a + b, 0);
  const order = exact.map((x, i) => [x - Math.floor(x), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    pct[i] += 1;
    left -= 1;
  }
  return { total, results: poll.options.map((o, i) => ({ id: o.id, pct: pct[i] })) };
}

export const pollCookieName = (pollId: string) => `tq_poll_${pollId.replace(/[^a-z0-9]/g, "_")}`;
