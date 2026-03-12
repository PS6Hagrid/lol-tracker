import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import {
  getProfileIconUrl,
  getRankEmblemUrl,
  REGIONS,
} from "@/lib/constants";
import type { SummonerDTO, LeagueEntryDTO } from "@/types/riot";

export const runtime = "edge";
export const alt = "Summoner Stats — Trackerino";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ── Helpers ──────────────────────────────────────────────────────────────────

function tierColor(tier: string): string {
  const colors: Record<string, string> = {
    IRON: "#6b6b6b",
    BRONZE: "#a0715e",
    SILVER: "#8c9fae",
    GOLD: "#C89B3C",
    PLATINUM: "#35917f",
    EMERALD: "#2fa06b",
    DIAMOND: "#5765e0",
    MASTER: "#9e45d4",
    GRANDMASTER: "#e04545",
    CHALLENGER: "#f0c040",
  };
  return colors[tier.toUpperCase()] ?? "#C89B3C";
}

function tierLabel(tier: string, rank: string): string {
  const apex = ["MASTER", "GRANDMASTER", "CHALLENGER"];
  const name = tier.charAt(0) + tier.slice(1).toLowerCase();
  return apex.includes(tier.toUpperCase()) ? name : `${name} ${rank}`;
}

// ── Static Fallback ──────────────────────────────────────────────────────────

function staticCard(gameName: string, tagLine: string, region: string) {
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
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, marginBottom: 32 }}>
          <span style={{ color: "#C89B3C" }}>Tracker</span>
          <span style={{ color: "#ffffff" }}>ino</span>
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800, color: "#ffffff", letterSpacing: -1 }}>
          {gameName}
          <span style={{ color: "#6b7280", fontWeight: 400, marginLeft: 8 }}>#{tagLine}</span>
        </div>
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
      </div>
    ),
    { ...size },
  );
}

// ── Dynamic OG Image ─────────────────────────────────────────────────────────

export default async function OGImage({
  params,
}: {
  params: Promise<{ region: string; name: string }>;
}) {
  const { region, name } = await params;
  const decodedName = decodeURIComponent(name);
  const lastHyphen = decodedName.lastIndexOf("-");
  const gameName = lastHyphen > 0 ? decodedName.slice(0, lastHyphen) : decodedName;
  const tagLine = lastHyphen > 0 ? decodedName.slice(lastHyphen + 1) : region.toUpperCase();

  // Fetch data via internal API (Edge runtime can't import Prisma/Node modules)
  let summoner: SummonerDTO | null = null;
  let soloQ: LeagueEntryDTO | null = null;
  let winrate = 0;

  try {
    const hdrs = await headers();
    const host = hdrs.get("host") ?? "localhost:3000";
    const protocol = hdrs.get("x-forwarded-proto") ?? "http";
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(
      `${baseUrl}/api/summoner/${region}/${encodeURIComponent(name)}`,
      { cache: "no-store" },
    );

    if (res.ok) {
      const data: { summoner: SummonerDTO; rankedStats: LeagueEntryDTO[] } =
        await res.json();
      summoner = data.summoner;
      soloQ =
        data.rankedStats.find((q) => q.queueType === "RANKED_SOLO_5x5") ??
        data.rankedStats.find((q) => q.queueType === "RANKED_FLEX_SR") ??
        null;
      if (soloQ) {
        winrate = Math.round(
          (soloQ.wins / (soloQ.wins + soloQ.losses)) * 100,
        );
      }
    }
  } catch {
    // Fallback to static card
  }

  // If we couldn't fetch data, show static card
  if (!summoner) {
    return staticCard(gameName, tagLine, region);
  }

  const regionLabel =
    REGIONS.find((r) => r.value === region)?.label ?? region.toUpperCase();
  const profileIconUrl = getProfileIconUrl(summoner.profileIconId);
  const rankEmblemUrl = soloQ ? getRankEmblemUrl(soloQ.tier) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0a0e17 0%, #111827 50%, #0a0e17 100%)",
          fontFamily: "sans-serif",
          padding: "48px 64px",
        }}
      >
        {/* Decorative glows */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(200,155,60,0.08) 0%, transparent 70%)",
            top: -100,
            right: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
            bottom: -100,
            left: -50,
          }}
        />

        {/* Header: Branding + Region */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>
            <span style={{ color: "#C89B3C" }}>Tracker</span>
            <span style={{ color: "#ffffff" }}>ino</span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "6px 20px",
              borderRadius: 999,
              background: "rgba(0,212,255,0.1)",
              border: "1px solid rgba(0,212,255,0.3)",
              fontSize: 20,
              color: "#00d4ff",
              fontWeight: 600,
            }}
          >
            {regionLabel}
          </div>
        </div>

        {/* Main content */}
        <div
          style={{ display: "flex", flex: 1, alignItems: "center", gap: 48 }}
        >
          {/* Left: Profile Icon */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                position: "relative",
                width: 120,
                height: 120,
                borderRadius: 16,
                overflow: "hidden",
                border: "3px solid rgba(200,155,60,0.5)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profileIconUrl}
                width={120}
                height={120}
                alt=""
                style={{ objectFit: "cover" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                padding: "4px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontSize: 16,
                color: "#9ca3af",
                fontWeight: 600,
              }}
            >
              Lvl {summoner.summonerLevel}
            </div>
          </div>

          {/* Right: Name + Rank info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 24,
            }}
          >
            {/* Summoner name */}
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: -1,
                  lineHeight: 1,
                }}
              >
                {gameName}
              </span>
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 400,
                  color: "#6b7280",
                  marginLeft: 8,
                  lineHeight: 1,
                }}
              >
                #{tagLine}
              </span>
            </div>

            {/* Rank info */}
            {soloQ ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: 24 }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 100,
                    height: 100,
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rankEmblemUrl} width={100} height={100} alt="" />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 36,
                        fontWeight: 800,
                        color: tierColor(soloQ.tier),
                      }}
                    >
                      {tierLabel(soloQ.tier, soloQ.rank)}
                    </span>
                    <span
                      style={{
                        fontSize: 28,
                        fontWeight: 600,
                        color: "#C89B3C",
                      }}
                    >
                      {soloQ.leaguePoints} LP
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      fontSize: 22,
                    }}
                  >
                    <span style={{ color: "#22c55e", fontWeight: 600 }}>
                      {soloQ.wins}W
                    </span>
                    <span style={{ color: "#6b7280" }}>/</span>
                    <span style={{ color: "#ef4444", fontWeight: 600 }}>
                      {soloQ.losses}L
                    </span>
                    <span
                      style={{
                        color: winrate >= 50 ? "#22c55e" : "#ef4444",
                        fontWeight: 700,
                        marginLeft: 8,
                        padding: "2px 12px",
                        borderRadius: 999,
                        background:
                          winrate >= 50
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(239,68,68,0.1)",
                      }}
                    >
                      {winrate}% WR
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{ display: "flex", fontSize: 28, color: "#6b7280" }}
              >
                Unranked
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 24,
            fontSize: 18,
            color: "#4b5563",
          }}
        >
          trackerino.gg • League of Legends Stats
        </div>
      </div>
    ),
    { ...size },
  );
}
