import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1d1d1f",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 78, fontWeight: 600, letterSpacing: "-0.04em" }}>
          TX
        </div>
        <div
          style={{
            fontSize: 16,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            marginTop: 6,
          }}
        >
          Quince
        </div>
      </div>
    ),
    { ...size },
  );
}
