import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0e17 0%, #151d2e 100%)",
          borderRadius: 36,
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ fontSize: 100, fontWeight: 900, color: "#C89B3C", lineHeight: 1 }}>
          T
        </span>
      </div>
    ),
    { ...size },
  );
}
