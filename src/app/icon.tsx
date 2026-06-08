import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Branded monogram favicon — cream "TX" on deep wine.
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
          background: "#6b2230",
          color: "#faf7f2",
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
