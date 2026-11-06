import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

const go = (path: string) => GET(new NextRequest(`https://txquince.com${path}`));

describe("/reserve", () => {
  it("keeps the query in front of #intake, so ?collection= and ?src= both reach the page", () => {
    const res = go("/reserve?collection=duo&src=instagram");
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://txquince.com/?collection=duo&src=instagram#intake");
  });

  it("goes straight to the booking panel without a query", () => {
    expect(go("/reserve").headers.get("location")).toBe("https://txquince.com/#intake");
  });
});
