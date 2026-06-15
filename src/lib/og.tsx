import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/**
 * Shared OG card renderer (OG/SOCIAL CARDS LAW: FB previews must look expensive).
 * Uses only the flexbox subset ImageResponse supports. System font is used for
 * reliability (no external font fetch at build); the composition does the work —
 * deep wine field, cream type, a thin inset frame, and dramatic scale contrast.
 *
 * Each route exports a tiny opengraph-image.tsx that calls this with its title.
 */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function renderOg(opts: {
  eyebrow?: string;
  title: string;
  footer?: string;
}) {
  const { eyebrow = site.serviceArea, title, footer } = opts;
  const foot = footer ?? `${site.domain} · Collections from $1,800`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(120% 120% at 50% 0%, #2a2622 0%, #1c1a17 55%, #121110 100%)",
          padding: 64,
        }}
      >
        {/* inset frame */}
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            border: "1px solid rgba(250,247,242,0.28)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#faf7f2",
          }}
        >
          <div
            style={{
              fontSize: 30,
              letterSpacing: "0.02em",
              fontWeight: 600,
            }}
          >
            {site.brand}
          </div>
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#cda971",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.05,
              color: "#faf7f2",
              maxWidth: 940,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "rgba(250,247,242,0.8)",
            fontSize: 24,
          }}
        >
          <div style={{ width: 48, height: 1, background: "rgba(250,247,242,0.5)" }} />
          {foot}
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
