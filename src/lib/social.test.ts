import { describe, expect, it } from "vitest";
import { platformOf, rowsFromCsv, summarize } from "./social";

describe("platformOf", () => {
  it("maps hosts and tags", () => {
    expect(platformOf("l.instagram.com")).toBe("instagram");
    expect(platformOf("ig-bio")).toBe("instagram");
    expect(platformOf("m.facebook.com")).toBe("facebook");
    expect(platformOf("fb-group")).toBe("facebook");
    expect(platformOf("youtu.be")).toBe("youtube");
    expect(platformOf("pin.it")).toBe("pinterest");
    expect(platformOf("www.quora.com")).toBe("quora");
    expect(platformOf("google.com")).toBeNull();
    expect(platformOf("digital")).toBeNull();
  });
});

describe("sheet rows", () => {
  const csv = [
    '"date","platform","followers","reach","views","profile_visits","link_clicks","posts","notes"',
    '"2026-10-20","Instagram","1,200","3000","","40","12","1","reel"',
    '"2026-11-03","Instagram","1250","5000","","60","20","2",""',
    '"2026-11-03","YouTube","310","","900","","15","1","new film"',
    '"oops","Instagram","1","1","1","1","1","1",""',
    '"2026-11-03","Myspace","1","1","1","1","1","1",""',
  ].join("\n");
  it("parses, skipping bad rows", () => {
    const rows = rowsFromCsv(csv);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ platform: "instagram", followers: 1200, reach: 3000, views: null });
  });
  it("summarizes the range with a follower change", () => {
    const s = summarize(rowsFromCsv(csv), 7, new Date("2026-11-05T12:00:00Z"));
    const ig = s.find((r) => r.platform === "instagram")!;
    expect(ig).toMatchObject({ followers: 1250, followersChange: 50, reach: 5000, linkClicks: 20, lastDate: "2026-11-03" });
    expect(s.find((r) => r.platform === "youtube")!.views).toBe(900);
    expect(s.find((r) => r.platform === "pinterest")!.lastDate).toBeNull();
  });
});
