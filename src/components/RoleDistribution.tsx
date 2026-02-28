"use client";

import type { MatchDTO } from "@/types/riot";

interface RoleDistributionProps {
  matches: MatchDTO[];
  puuid: string;
}

const ROLE_ICONS: Record<string, string> = {
  TOP: "⚔️",
  JUNGLE: "🌿",
  MIDDLE: "🔮",
  BOTTOM: "🏹",
  UTILITY: "🛡️",
};

const ROLE_LABELS: Record<string, string> = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MIDDLE: "Mid",
  BOTTOM: "Bot",
  UTILITY: "Support",
};

const ROLE_COLORS: Record<string, string> = {
  TOP: "#ef4444",
  JUNGLE: "#22c55e",
  MIDDLE: "#00d4ff",
  BOTTOM: "#f59e0b",
  UTILITY: "#a855f7",
};

function findPlayer(match: MatchDTO, puuid: string) {
  return (
    match.info.participants.find((p) => p.puuid === puuid) ??
    match.info.participants[0]
  );
}

/** Map Riot lane/role data to a normalized position */
function getPosition(lane: string, role: string): string {
  // Riot API uses "lane" (TOP/JUNGLE/MIDDLE/BOTTOM) and "role" (SOLO/NONE/CARRY/SUPPORT/DUO)
  const l = lane.toUpperCase();
  const r = role.toUpperCase();

  if (l === "TOP") return "TOP";
  if (l === "JUNGLE") return "JUNGLE";
  if (l === "MIDDLE" || l === "MID") return "MIDDLE";
  if (l === "BOTTOM" || l === "BOT") {
    if (r === "SUPPORT" || r === "UTILITY" || r === "DUO_SUPPORT")
      return "UTILITY";
    return "BOTTOM";
  }
  // Fallback for ARAM or unknown
  return l || "BOTTOM";
}

export default function RoleDistribution({
  matches,
  puuid,
}: RoleDistributionProps) {
  // Only count non-remake, Summoner's Rift games
  const validMatches = matches.filter(
    (m) =>
      m.info.gameDuration >= 300 &&
      m.info.gameMode === "CLASSIC",
  );

  if (validMatches.length < 3) return null;

  // Count positions
  const positionCounts = new Map<string, { total: number; wins: number }>();

  for (const match of validMatches) {
    const player = findPlayer(match, puuid);
    const pos = getPosition(player.lane, player.role);
    const existing = positionCounts.get(pos) ?? { total: 0, wins: 0 };
    existing.total++;
    if (player.win) existing.wins++;
    positionCounts.set(pos, existing);
  }

  // Sort by most played
  const sorted = Array.from(positionCounts.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const maxCount = sorted[0]?.[1]?.total ?? 1;

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-5 backdrop-blur-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-400">
        Position Distribution
      </h3>
      <div className="space-y-2.5">
        {sorted.map(([position, { total, wins }]) => {
          const pct = (total / validMatches.length) * 100;
          const wr = total > 0 ? (wins / total) * 100 : 0;
          const color = ROLE_COLORS[position] ?? "#6b7280";

          return (
            <div key={position} className="flex items-center gap-3">
              {/* Role icon + label */}
              <div className="flex w-20 flex-shrink-0 items-center gap-1.5">
                <span className="text-sm">
                  {ROLE_ICONS[position] ?? "❓"}
                </span>
                <span className="text-xs font-medium text-gray-300">
                  {ROLE_LABELS[position] ?? position}
                </span>
              </div>

              {/* Bar */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="h-5 flex-1 overflow-hidden rounded-md bg-gray-800/60">
                  <div
                    className="flex h-full items-center rounded-md px-2 transition-all duration-500"
                    style={{
                      width: `${(total / maxCount) * 100}%`,
                      backgroundColor: color,
                      opacity: 0.7,
                    }}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Play rate + WR */}
              <div className="flex flex-shrink-0 items-center gap-2 text-xs">
                <span className="text-gray-400">{pct.toFixed(0)}%</span>
                <span
                  className="font-medium"
                  style={{
                    color: wr >= 50 ? "var(--color-win)" : "var(--color-loss)",
                  }}
                >
                  {wr.toFixed(0)}% WR
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
