import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Branded monogram favicon — champagne-gold "TX" on warm near-black.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1a17",
          color: "#cda971",
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        TX
      </div>
    ),
    { ...size },
  );
}
