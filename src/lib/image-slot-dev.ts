/**
 * image-slot-dev.ts — DEVELOPMENT-ONLY stand-ins so the slot editor can be
 * exercised end to end on a laptop with no Supabase or R2:
 *   · a site_settings table kept in a JSON file
 *   · an R2 bucket kept on disk
 *   · an admin bypass (opt-in with TXQ_DEV_ADMIN_BYPASS=1)
 *
 * Every entry point checks `process.env.NODE_ENV === "development"`. Next
 * inlines NODE_ENV at build time, so in a production build each check is the
 * constant `false` and these paths are dead code: `next build && next start`
 * can never take them, whatever the environment variables say.
 * Files live in the OS temp folder, never in the repo or public/.
 */
import "server-only";

export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Dev-only: treat the browser as the admin (for local screenshots/tests). */
export function devAdminBypass(): string | null {
  if (process.env.NODE_ENV !== "development") return null;
  return process.env.TXQ_DEV_ADMIN_BYPASS === "1" ? "dev-admin@localhost" : null;
}

async function root(): Promise<string> {
  const os = await import("node:os");
  return `${os.tmpdir()}/txq-slot-dev`;
}

type Row = { value: unknown; updated_at: string };

async function readTable(): Promise<Record<string, Row>> {
  const fs = await import("node:fs/promises");
  try {
    return JSON.parse(await fs.readFile(`${await root()}/site_settings.json`, "utf8"));
  } catch {
    return {};
  }
}

async function writeTable(t: Record<string, Row>): Promise<void> {
  const fs = await import("node:fs/promises");
  const dir = await root();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(`${dir}/site_settings.json`, JSON.stringify(t, null, 2));
}

/** Dev-only site_settings stand-in (same optimistic-concurrency contract). */
export const devSettings = {
  async readAll(prefix: string): Promise<{ key: string; value: unknown }[]> {
    if (!isDev()) return [];
    const t = await readTable();
    return Object.entries(t)
      .filter(([k]) => k.startsWith(prefix))
      .map(([key, r]) => ({ key, value: r.value }));
  },
  async read(key: string): Promise<Row | null> {
    if (!isDev()) return null;
    return (await readTable())[key] ?? null;
  },
  async write(key: string, value: unknown, expected: string | null, next: string): Promise<boolean> {
    if (!isDev()) return false;
    const t = await readTable();
    const cur = t[key]?.updated_at ?? null;
    if (cur !== expected) return false;
    t[key] = { value, updated_at: next };
    await writeTable(t);
    return true;
  },
};

export interface DevBucketObject {
  body: ReadableStream;
  size: number;
  httpMetadata?: { contentType?: string };
}

/** Dev-only R2 stand-in for `slots/` keys. */
export function devSlotBucket() {
  if (!isDev()) return null;
  const safe = async (key: string) => {
    if (!/^slots\/[a-z0-9.-]+\/[a-z0-9-]+\.(webp|jpg)$/.test(key)) throw new Error("bad key");
    return `${await root()}/${key}`;
  };
  return {
    async get(key: string): Promise<DevBucketObject | null> {
      const fs = await import("node:fs/promises");
      try {
        const buf = await fs.readFile(await safe(key));
        return {
          body: new Response(buf).body as ReadableStream,
          size: buf.byteLength,
          httpMetadata: { contentType: key.endsWith(".jpg") ? "image/jpeg" : "image/webp" },
        };
      } catch {
        return null;
      }
    },
    async put(key: string, value: ArrayBuffer): Promise<unknown> {
      const fs = await import("node:fs/promises");
      const path = await safe(key);
      await fs.mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
      await fs.writeFile(path, Buffer.from(value));
      return {};
    },
  };
}
