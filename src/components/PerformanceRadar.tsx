"use client";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import type { MatchDTO } from "@/types/riot";

interface PerformanceRadarProps {
  matches: MatchDTO[];
  puuid: string;
}

// ── Benchmarks: "excellent" thresholds that map to 100 on the radar ──────────
const BENCHMARKS = {
  kda: 5.0,
  csPerMin: 8.0,
  damage: 25000,
  killPart: 70,
  visionMin: 1.5,
  goldMin: 450,
} as const;

function normalize(value: number, max: number): number {
  return Math.min(100, Math.round((value / max) * 100));
}

function findPlayer(match: MatchDTO, puuid: string) {
  return (
    match.info.participants.find((p) => p.puuid === puuid) ??
    match.info.participants[0]
  );
}

// ── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomRadarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { stat: string; value: number; raw: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const { stat, value, raw } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-theme bg-bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-medium text-text-secondary">{stat}</p>
      <p className="mt-0.5 font-semibold text-cyan">{raw}</p>
      <p className="text-text-muted">Score: {value}/100</p>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function PerformanceRadar({
  matches,
  puuid,
}: PerformanceRadarProps) {
  // Aggregate stats across non-remake matches
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalCS = 0;
  let totalMinutes = 0;
  let totalDamage = 0;
  let totalKP = 0;
  let totalVision = 0;
  let totalGold = 0;
  let gamesPlayed = 0;

  for (const match of matches) {
    const player = findPlayer(match, puuid);
    if (match.info.gameDuration < 300) continue; // skip remakes

    gamesPlayed++;
    const minutes = match.info.gameDuration / 60;

    totalKills += player.kills;
    totalDeaths += player.deaths;
    totalAssists += player.assists;
    totalCS += player.totalMinionsKilled + player.neutralMinionsKilled;
    totalMinutes += minutes;
    totalDamage += player.totalDamageDealtToChampions;
    totalVision += player.visionScore;
    totalGold += player.goldEarned;

    // Kill participation
    const teamKills = match.info.participants
      .filter((p) => p.teamId === player.teamId)
      .reduce((sum, p) => sum + p.kills, 0);
    totalKP += teamKills > 0 ? (player.kills + player.assists) / teamKills : 0;
  }

  if (gamesPlayed === 0) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-border-theme bg-bg-card/80 p-4 backdrop-blur-sm">
        <p className="text-sm text-text-muted">Not enough data for radar</p>
      </div>
    );
  }

  // Compute averages
  const avgKDA =
    totalDeaths === 0
      ? (totalKills + totalAssists) // perfect KDA cap at kills+assists
      : (totalKills + totalAssists) / totalDeaths;
  const avgCSPerMin = totalMinutes > 0 ? totalCS / totalMinutes : 0;
  const avgDamage = totalDamage / gamesPlayed;
  const avgKP = (totalKP / gamesPlayed) * 100;
  const avgVisionMin = totalMinutes > 0 ? totalVision / totalMinutes : 0;
  const avgGoldMin = totalMinutes > 0 ? totalGold / totalMinutes : 0;

  // Build radar data
  const radarData = [
    {
      stat: "KDA",
      value: normalize(avgKDA, BENCHMARKS.kda),
      raw: avgKDA >= 10 ? avgKDA.toFixed(1) : avgKDA.toFixed(2),
    },
    {
      stat: "CS/min",
      value: normalize(avgCSPerMin, BENCHMARKS.csPerMin),
      raw: avgCSPerMin.toFixed(1),
    },
    {
      stat: "Damage",
      value: normalize(avgDamage, BENCHMARKS.damage),
      raw: avgDamage >= 1000 ? `${(avgDamage / 1000).toFixed(1)}k` : avgDamage.toFixed(0),
    },
    {
      stat: "Kill Part.",
      value: normalize(avgKP, BENCHMARKS.killPart),
      raw: `${avgKP.toFixed(0)}%`,
    },
    {
      stat: "Vision",
      value: normalize(avgVisionMin, BENCHMARKS.visionMin),
      raw: `${avgVisionMin.toFixed(2)}/min`,
    },
    {
      stat: "Gold/min",
      value: normalize(avgGoldMin, BENCHMARKS.goldMin),
      raw: avgGoldMin.toFixed(0),
    },
  ];

  return (
    <div className="rounded-xl border border-border-theme bg-bg-card/80 p-5 backdrop-blur-sm">
      <h3 className="mb-2 text-sm font-semibold text-text-secondary">
        Performance Overview
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#374151" strokeOpacity={0.6} />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="#00d4ff"
            fill="#00d4ff"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ r: 3, fill: "#00d4ff", strokeWidth: 0 }}
          />
          <Tooltip content={<CustomRadarTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
