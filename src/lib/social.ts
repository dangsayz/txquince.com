/**
 * social.ts — social-platform numbers next to what each platform sent the site.
 *
 * Platform side: a Google Sheet ("TX Quince · Social numbers (Grokbot fills
 * daily)", tab "daily") that Grokbot fills in each day. One row per platform
 * per day: date, platform, followers, reach, views, profile_visits,
 * link_clicks, posts, notes. The sheet is shared view-only by link; its id
 * lives in the SOCIAL_SHEET_ID secret (not in the repo).
 *
 * Site side: visits and leads per platform, from first-party analytics
 * (referrer host or ?src= / utm_source) — see platformOf().
 */

export const PLATFORMS = ["instagram", "facebook", "tiktok", "youtube", "pinterest", "quora"] as const;
export type Platform = (typeof PLATFORMS)[number];
export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  quora: "Quora",
};

/** Map a referrer host, ?src= / utm_source value or lead source to a platform. */
export function platformOf(v: string | null | undefined): Platform | null {
  if (!v) return null;
  const s = v.toLowerCase();
  if (/instagram|(^|[^a-z])ig([^a-z]|$)/.test(s)) return "instagram";
  if (/facebook|fb\.|(^|[^a-z])fb([^a-z]|$)|fb-|messenger/.test(s)) return "facebook";
  if (/tiktok/.test(s)) return "tiktok";
  if (/youtube|youtu\.be|(^|[^a-z])yt([^a-z]|$)/.test(s)) return "youtube";
  if (/pinterest|pin\.it/.test(s)) return "pinterest";
  if (/quora/.test(s)) return "quora";
  return null;
}

export type SocialRow = {
  date: string;
  platform: Platform;
  followers: number | null;
  reach: number | null;
  views: number | null;
  profile_visits: number | null;
  link_clicks: number | null;
  posts: number | null;
  notes: string;
};

/** Minimal CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim()));
}

const num = (v: string | undefined) => {
  if (v == null) return null;
  const t = v.replace(/[, ]/g, "").trim();
  if (!t) return null;
  const k = /^([\d.]+)k$/i.exec(t);
  const n = k ? Number(k[1]) * 1000 : Number(t);
  return Number.isFinite(n) ? Math.round(n) : null;
};

/** Sheet CSV → rows (bad dates / unknown platforms skipped). */
export function rowsFromCsv(text: string): SocialRow[] {
  const [head, ...body] = parseCsv(text);
  if (!head) return [];
  const idx = (k: string) => head.findIndex((h) => h.trim().toLowerCase().replace(/\s+/g, "_") === k);
  const col = (r: string[], k: string) => (idx(k) >= 0 ? r[idx(k)] : undefined);
  const out: SocialRow[] = [];
  for (const r of body) {
    const d = (col(r, "date") ?? "").trim();
    const date = /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0, 10) : !Number.isNaN(Date.parse(d)) ? new Date(d).toISOString().slice(0, 10) : null;
    const platform = platformOf(col(r, "platform"));
    if (!date || !platform) continue;
    out.push({
      date,
      platform,
      followers: num(col(r, "followers")),
      reach: num(col(r, "reach")),
      views: num(col(r, "views")),
      profile_visits: num(col(r, "profile_visits")),
      link_clicks: num(col(r, "link_clicks")),
      posts: num(col(r, "posts")),
      notes: (col(r, "notes") ?? "").trim().slice(0, 200),
    });
  }
  return out;
}

export type SocialSummary = {
  platform: Platform;
  followers: number | null;
  followersChange: number | null;
  reach: number;
  views: number;
  profileVisits: number;
  linkClicks: number;
  posts: number;
  lastDate: string | null;
};

/** Per platform over the last `range` days: latest followers (+ change) and summed activity. */
export function summarize(rows: SocialRow[], range: number, today = new Date()): SocialSummary[] {
  const since = new Date(today.getTime() - range * 86400_000).toISOString().slice(0, 10);
  return PLATFORMS.map((platform) => {
    const all = rows.filter((r) => r.platform === platform).sort((a, b) => a.date.localeCompare(b.date));
    const inRange = all.filter((r) => r.date >= since);
    const withF = all.filter((r) => r.followers != null);
    const latest = withF[withF.length - 1];
    const before = withF.filter((r) => r.date < since).pop() ?? withF.find((r) => r.date >= since);
    const sum = (k: "reach" | "views" | "profile_visits" | "link_clicks" | "posts") => inRange.reduce((t, r) => t + (r[k] ?? 0), 0);
    return {
      platform,
      followers: latest?.followers ?? null,
      followersChange: latest && before && before !== latest ? latest.followers! - before.followers! : null,
      reach: sum("reach"),
      views: sum("views"),
      profileVisits: sum("profile_visits"),
      linkClicks: sum("link_clicks"),
      posts: sum("posts"),
      lastDate: all[all.length - 1]?.date ?? null,
    };
  });
}

export type SocialSheet = { configured: boolean; ok: boolean; rows: SocialRow[] };

/** Read the Grokbot sheet (cached 30 min). Never throws. */
export async function getSocialSheet(): Promise<SocialSheet> {
  // SOCIAL_SHEET_CSV_URL: any CSV URL with the same columns (e.g. "publish to web"); else the sheet id.
  const id = process.env.SOCIAL_SHEET_ID;
  const url =
    process.env.SOCIAL_SHEET_CSV_URL ||
    (id && /^[\w-]{20,80}$/.test(id) ? `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=daily` : null);
  if (!url) return { configured: false, ok: false, rows: [] };
  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 },
    } as RequestInit);
    if (!res.ok) return { configured: true, ok: false, rows: [] };
    const text = await res.text();
    if (text.trimStart().startsWith("<")) return { configured: true, ok: false, rows: [] }; // sign-in page: not shared
    return { configured: true, ok: true, rows: rowsFromCsv(text) };
  } catch {
    return { configured: true, ok: false, rows: [] };
  }
}
