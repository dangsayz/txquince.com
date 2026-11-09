/**
 * GET /venues/<slug>/experience/card — the 1200×630 link-preview picture for
 * "Our experience at this venue" (Facebook, WhatsApp, Messages, X).
 *
 * It lives under /venues, not /api, because robots.txt keeps crawlers out of
 * /api and Facebook's crawler must be able to fetch it. It never fails: an
 * unknown venue, a venue with nothing written, or a rendering problem all get
 * the site's standard card, so a shared link never shows a broken picture.
 */
import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { getVenue } from "@/content/venues";
import { ogSize, renderOg } from "@/lib/og";
import { getVenueExperience } from "@/lib/venue-experience-db";
import { excerpt, experienceTitle, VERDICT_LABEL } from "@/lib/venue-experience-share";

export const dynamic = "force-dynamic";

const INK = "#0d0d0c";
const PAPER = "#faf8f5";
const MUTE = "#b9b5ae";
const DOT = { great: "#6fbf85", mixed: "#e89a5c", poor: "#e89a5c" } as const;

// The ?v= in the address changes on every save, so a long cache is safe.
const CACHE = "public, max-age=86400, s-maxage=31536000, immutable";
const withCache = (res: Response, value: string) => {
  res.headers.set("cache-control", value);
  return res;
};

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = getVenue(slug);
  const x = venue ? await getVenueExperience(venue.slug) : null;
  const fallback = () => withCache(renderOg({ title: venue ? `Quinceañeras at ${venue.venue}` : "Quinceañera photos & video for her day." }), "public, max-age=300");
  if (!venue || !x) return fallback();

  const title = experienceTitle(venue.venue);
  try {
    return withCache(
      new ImageResponse(
        (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: INK, color: PAPER, padding: 64 }}>
            <div style={{ position: "absolute", top: 28, left: 28, right: 28, bottom: 28, border: "1px solid #2a2925" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 30, letterSpacing: "0.2em", fontWeight: 600 }}>TX QUINCE</div>
              <div style={{ fontSize: 18, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTE }}>From behind the camera</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: title.length > 52 ? 54 : 62, lineHeight: 1.08, letterSpacing: "-0.025em", fontWeight: 600, maxWidth: 1000 }}>{title}</div>
              {x.verdict ? (
                <div style={{ display: "flex", marginTop: 26 }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #6b6862", borderRadius: 999, padding: "10px 22px", fontSize: 26 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 999, background: DOT[x.verdict], marginRight: 14 }} />
                    {VERDICT_LABEL[x.verdict]}
                  </div>
                </div>
              ) : null}
              <div style={{ marginTop: 26, fontSize: 28, lineHeight: 1.4, color: "#e4e0d9", maxWidth: 1000 }}>{`“${excerpt(x.body_en, 150)}”`}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", color: MUTE, fontSize: 22 }}>
              <div style={{ width: 48, height: 4, background: PAPER, marginRight: 16 }} />
              {`${site.domain} · Quinceañera photo & video · ${site.serviceArea}`}
            </div>
          </div>
        ),
        { ...ogSize },
      ),
      CACHE,
    );
  } catch {
    return fallback();
  }
}
