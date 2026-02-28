import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Trackerino — League of Legends Stats";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "linear-gradient(135deg, #0a0e17 0%, #111827 50%, #0a0e17 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,155,60,0.15) 0%, transparent 70%)",
            top: "10%",
            left: "30%",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)",
            bottom: "15%",
            right: "25%",
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          <span style={{ color: "#C89B3C" }}>Tracker</span>
          <span style={{ color: "#ffffff" }}>ino</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: "#9ca3af",
            marginTop: 16,
          }}
        >
          League of Legends Stats Tracker
        </div>

        {/* Features row */}
        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 48,
            fontSize: 20,
            color: "#6b7280",
          }}
        >
          <span style={{ color: "#00d4ff" }}>Ranked Stats</span>
          <span>{"•"}</span>
          <span style={{ color: "#00d4ff" }}>Match History</span>
          <span>{"•"}</span>
          <span style={{ color: "#00d4ff" }}>Champion Mastery</span>
          <span>{"•"}</span>
          <span style={{ color: "#00d4ff" }}>Live Game</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
