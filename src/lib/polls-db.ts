/**
 * polls-db.ts — SERVER-ONLY counters for blog quick polls (D1 table
 * poll_votes, migrations/0006_polls.sql). Callers check the poll and option
 * ids against src/content/polls.ts first.
 */
import "server-only";
import { getD1, requireD1 } from "@/lib/d1";

/** Counters by option id; null when the database is not available. */
export async function getPollCounts(pollId: string): Promise<Record<string, number> | null> {
  const db = await getD1();
  if (!db) return null;
  const { results } = await db
    .prepare("SELECT option_id, votes FROM poll_votes WHERE poll_id = ?")
    .bind(pollId)
    .all<{ option_id: string; votes: number }>();
  return Object.fromEntries(results.map((r) => [r.option_id, Number(r.votes)]));
}

export async function addPollVote(pollId: string, optionId: string): Promise<void> {
  const db = await requireD1();
  await db
    .prepare(
      `INSERT INTO poll_votes (poll_id, option_id, votes) VALUES (?, ?, 1)
       ON CONFLICT (poll_id, option_id)
       DO UPDATE SET votes = votes + 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    )
    .bind(pollId, optionId)
    .run();
}
