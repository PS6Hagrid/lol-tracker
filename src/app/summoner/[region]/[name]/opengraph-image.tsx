import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Summoner Stats — Trackerino";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ region: string; name: string }>;
}) {
  const { region, name } = await params;
  const decodedName = decodeURIComponent(name);
  const lastHyphen = decodedName.lastIndexOf("-");
  const gameName =
    lastHyphen > 0 ? decodedName.slice(0, lastHyphen) : decodedName;
  const tagLine =
    lastHyphen > 0 ? decodedName.slice(lastHyphen + 1) : region.toUpperCase();

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
          background:
            "linear-gradient(135deg, #0a0e17 0%, #111827 50%, #0a0e17 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(200,155,60,0.12) 0%, transparent 70%)",
            top: "15%",
            left: "35%",
          }}
        />

        {/* Branding */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          <span style={{ color: "#C89B3C" }}>Tracker</span>
          <span style={{ color: "#ffffff" }}>ino</span>
        </div>

        {/* Summoner name */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -1,
          }}
        >
          {gameName}
          <span
            style={{ color: "#6b7280", fontWeight: 400, marginLeft: 8 }}
          >
            #{tagLine}
          </span>
        </div>

        {/* Region badge */}
        <div
          style={{
            display: "flex",
            marginTop: 24,
            padding: "8px 24px",
            borderRadius: 999,
            background: "rgba(0,212,255,0.1)",
            border: "1px solid rgba(0,212,255,0.3)",
            fontSize: 24,
            color: "#00d4ff",
            fontWeight: 600,
          }}
        >
          {region.toUpperCase()}
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 48,
            fontSize: 18,
            color: "#6b7280",
          }}
        >
          <span>Ranked Stats</span>
          <span>{"•"}</span>
          <span>Match History</span>
          <span>{"•"}</span>
          <span>Champions</span>
          <span>{"•"}</span>
          <span>Live Game</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
