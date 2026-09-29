import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/** Shared visual renderer for social previews. No server or data contract changes. */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function renderOg(opts: {
  eyebrow?: string;
  title: string;
  footer?: string;
}) {
  const { eyebrow = site.serviceArea, title, footer } = opts;
  const foot = footer ?? `${site.domain} · Collections from $2,500`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: 64,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            border: "1px solid #e6e6e6",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#191919",
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
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#585858",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 60,
              lineHeight: 1.1,
              color: "#191919",
              maxWidth: 940,
              letterSpacing: "-0.025em",
              fontWeight: 600,
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
            color: "#585858",
            fontSize: 24,
          }}
        >
          <div style={{ width: 48, height: 4, background: "#1d1d1f" }} />
          {foot}
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
