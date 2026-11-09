import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";

export type OpenTicket = { id: string; created_at: string; name: string; topic: string; message: string; language: string };

/** Open support tickets for the admin home, the longest wait first. */
export async function listOpenTickets(limit = 50): Promise<OpenTicket[]> {
  if (!isDbConfigured()) return [];
  try {
    const { data, error } = await getDb()
      .from("support_tickets")
      .select("id, created_at, name, topic, message, language")
      .eq("status", "open")
      .order("created_at", { ascending: true })
      .limit(limit);
    return error || !data ? [] : (data as OpenTicket[]);
  } catch {
    return [];
  }
}
