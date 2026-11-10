/**
 * own-traffic-db.ts — the owner's networks (home wifi), so nobody in the
 * house is counted as a visitor. See own-traffic.ts for the rules.
 *
 * Only a salted HASH of each network is stored (site_settings key
 * "owner_networks"), never an IP address. A network is added when the owner
 * opens Studio from a computer, and forgotten 45 days after the last time.
 * Phones do not add a network: on mobile data one address can be shared by
 * many real families (the owner's own phone is already out by its sign-in).
 */
import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { clientIp } from "@/lib/client-ip";
import { deviceOf } from "@/lib/device";
import { networkKey, parseNetworks, pruneNetworks, touchNetwork, type OwnerNetworks } from "@/lib/own-traffic";

const KEY = "owner_networks";
const CACHE_MS = 60_000;
let cache: { at: number; nets: OwnerNetworks } | null = null;

async function hashNetwork(net: string): Promise<string> {
  const data = new TextEncoder().encode(`owner-net:${process.env.ADMIN_SESSION_SECRET ?? "txq"}:${net}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function load(fresh = false): Promise<OwnerNetworks> {
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.nets;
  const { data, error } = await getDb().from("site_settings").select("value").eq("key", KEY).maybeSingle();
  if (error) throw new Error(error.message);
  const nets = pruneNetworks(parseNetworks((data as { value?: unknown } | null)?.value));
  cache = { at: Date.now(), nets };
  return nets;
}

type HasHeaders = { headers: Pick<Headers, "get"> };

/** True when this request comes from a network the owner uses. Never throws. */
export async function isOwnerNetwork(req: HasHeaders): Promise<boolean> {
  try {
    const net = networkKey(clientIp(req));
    if (!net || !isDbConfigured()) return false;
    const nets = await load();
    if (!Object.keys(nets).length) return false;
    return (await hashNetwork(net)) in nets;
  } catch {
    return false;
  }
}

/**
 * Call on a Studio page AFTER the admin check passed: remembers this network
 * as the owner's (computers only). Returns whether this network is now one
 * that is not counted. Never throws.
 */
export async function rememberOwnerNetwork(req: HasHeaders): Promise<boolean> {
  try {
    const net = networkKey(clientIp(req));
    if (!net || !isDbConfigured()) return false;
    const hash = await hashNetwork(net);
    if (deviceOf(req.headers.get("user-agent")) !== "desktop") return hash in (await load());
    const next = touchNetwork(await load(true), hash);
    if (!next) return true;
    const { error } = await getDb()
      .from("site_settings")
      .upsert({ key: KEY, value: next, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) return false;
    cache = { at: Date.now(), nets: next };
    return true;
  } catch {
    return false;
  }
}
