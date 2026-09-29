import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
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
          fontSize: 30,
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
