import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0e17 0%, #151d2e 100%)",
          borderRadius: 6,
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 900, color: "#C89B3C", lineHeight: 1 }}>
          T
        </span>
      </div>
    ),
    { ...size },
  );
}
