import { ImageResponse } from "next/og";

// Google shows a site icon in search results only at a multiple of 48px.
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

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
          background: "#1d1d1f",
          color: "#ffffff",
          fontSize: 45,
          fontWeight: 600,
          letterSpacing: "-0.04em",
        }}
      >
        TX
      </div>
    ),
    { ...size },
  );
}
