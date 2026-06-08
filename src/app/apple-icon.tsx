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
          background: "#6b2230",
          color: "#faf7f2",
        }}
      >
        <div style={{ fontSize: 78, fontWeight: 600, letterSpacing: "0.02em" }}>
          TX
        </div>
        <div
          style={{
            fontSize: 16,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(250,247,242,0.8)",
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
