import { PLATFORM_LABEL, type Platform, type SocialSummary } from "@/lib/social";

/**
 * SocialPanel — each social platform's own numbers (from Grokbot's daily
 * sheet) next to what it actually sent the site (visits, leads). The point
 * is the right-hand columns: where posting time turns into families.
 */
const fmt = (v: number | null) => (v == null ? "—" : v.toLocaleString("en-US"));

export function SocialPanel({
  summary,
  site,
  range,
  status,
}: {
  summary: SocialSummary[];
  site: Record<Platform, { visits: number; leads: number }>;
  range: number;
  status: { configured: boolean; ok: boolean; lastDate: string | null };
}) {
  const rows = summary.filter((r) => r.lastDate || site[r.platform].visits || site[r.platform].leads);
  const ranked = [...rows].sort((a, b) => site[b.platform].leads - site[a.platform].leads || site[b.platform].visits - site[a.platform].visits);
  const best = ranked[0] && (site[ranked[0].platform].leads || site[ranked[0].platform].visits) ? ranked[0] : null;
  const loud = [...rows].filter((r) => r.reach > 0).sort((a, b) => b.reach - a.reach)[0];
  const quiet = loud && site[loud.platform].visits < Math.max(5, loud.reach * 0.002) ? loud : null;

  return (
    <section aria-labelledby="social-title" className="hud-card min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e2ddd5] px-4 py-3.5 sm:px-5">
        <h2 id="social-title" className="hud-label m-0" style={{ color: "#111110" }}>
          Social
        </h2>
        <p className="hud-mono m-0 text-[13px] text-[#4d4b48]">
          Last {range} days ·{" "}
          {!status.configured
            ? "platform numbers not connected yet"
            : !status.ok
              ? "can't read Grokbot's sheet (check its sharing)"
              : status.lastDate
                ? `Grokbot updated ${new Date(`${status.lastDate}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`
                : "waiting for Grokbot's first update"}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="m-0 px-4 py-4 text-[15px] leading-6 text-[#4d4b48] sm:px-5">
          No social visits yet in this period. Tag the links you post with <span className="hud-mono text-[#111110]">?src=instagram</span>,{" "}
          <span className="hud-mono text-[#111110]">?src=youtube</span> and so on, and they show up here.
        </p>
      ) : (
        <>
          {best || quiet ? (
            <div className="space-y-1 px-4 pt-3.5 sm:px-5">
              {best ? (
                <p className="m-0 text-[15px] leading-6 text-[#111110]">
                  <span className="font-semibold">{PLATFORM_LABEL[best.platform]}</span> brought the most: {site[best.platform].visits} visits
                  {site[best.platform].leads ? ` and ${site[best.platform].leads} ${site[best.platform].leads === 1 ? "lead" : "leads"}` : ""}. Post there first this week.
                </p>
              ) : null}
              {quiet && quiet.platform !== best?.platform ? (
                <p className="m-0 text-[13px] leading-5 text-[#4d4b48]">
                  {PLATFORM_LABEL[quiet.platform]} reached {quiet.reach.toLocaleString("en-US")} people but sent only {site[quiet.platform].visits} visits. Put the link in the
                  caption or first comment, and say what they get (&quot;see her full gallery&quot;).
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="overflow-x-auto px-2 pb-3 pt-2 sm:px-3">
            <table className="w-full min-w-[520px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="text-[13px] text-[#4d4b48]">
                  <th className="px-2 py-2 font-medium">Platform</th>
                  <th className="px-2 py-2 text-right font-medium">Followers</th>
                  <th className="px-2 py-2 text-right font-medium">Reach / views</th>
                  <th className="px-2 py-2 text-right font-medium">Link clicks</th>
                  <th className="px-2 py-2 text-right font-medium" style={{ color: "#111110" }}>Site visits</th>
                  <th className="px-2 py-2 text-right font-medium" style={{ color: "#111110" }}>Leads</th>
                </tr>
              </thead>
              <tbody className="hud-mono">
                {ranked.map((r) => (
                  <tr key={r.platform} className="border-t border-[#f2efe9]">
                    <td className="px-2 py-2.5 font-sans font-semibold text-[#111110]">{PLATFORM_LABEL[r.platform]}</td>
                    <td className="px-2 py-2.5 text-right text-[#111110]">
                      {fmt(r.followers)}
                      {r.followersChange ? (
                        <span className="ml-1.5 text-[13px]" style={{ color: r.followersChange > 0 ? "#2e6f40" : "#a14f12" }}>
                          {r.followersChange > 0 ? "+" : ""}
                          {r.followersChange.toLocaleString("en-US")}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-2.5 text-right text-[#111110]">{r.lastDate ? fmt(r.reach || r.views) : "—"}</td>
                    <td className="px-2 py-2.5 text-right text-[#111110]">{r.lastDate ? fmt(r.linkClicks) : "—"}</td>
                    <td className="px-2 py-2.5 text-right font-semibold text-[#111110]">{site[r.platform].visits.toLocaleString("en-US")}</td>
                    <td className="px-2 py-2.5 text-right font-semibold text-[#111110]">{site[r.platform].leads.toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="m-0 border-t border-[#e2ddd5] px-4 py-3 text-[13px] leading-5 text-[#4d4b48] sm:px-5">
        Followers, reach (views on YouTube) and link clicks come from Grokbot&apos;s daily sheet. Site visits and leads are counted by the site itself. Quora has no stats to read, so
        tag its links with ?src=quora.
      </p>
    </section>
  );
}
