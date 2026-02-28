"use client";

import type { MatchDTO } from "@/types/riot";

interface RecentPerformanceProps {
  matches: MatchDTO[];
  puuid: string;
}

function findPlayer(match: MatchDTO, puuid: string) {
  return (
    match.info.participants.find((p) => p.puuid === puuid) ??
    match.info.participants[0]
  );
}

/** Donut SVG for win rate display */
function WinRateDonut({
  wins,
  total,
}: {
  wins: number;
  total: number;
}) {
  const pct = total > 0 ? (wins / total) * 100 : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const color =
    pct >= 60
      ? "#22c55e"
      : pct >= 50
        ? "#00d4ff"
        : pct >= 40
          ? "#f59e0b"
          : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(107,114,128,0.2)"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold text-white">
          {pct.toFixed(0)}%
        </span>
        <span className="text-[10px] text-gray-400">
          {wins}W {total - wins}L
        </span>
      </div>
    </div>
  );
}

export default function RecentPerformance({
  matches,
  puuid,
}: RecentPerformanceProps) {
  if (matches.length === 0) return null;

  // Compute aggregated stats
  let wins = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalCS = 0;
  let totalMinutes = 0;
  let totalDamage = 0;
  let totalKP = 0;
  let remakes = 0;

  for (const match of matches) {
    const player = findPlayer(match, puuid);
    const isRemake = match.info.gameDuration < 300;
    if (isRemake) {
      remakes++;
      continue;
    }

    if (player.win) wins++;
    totalKills += player.kills;
    totalDeaths += player.deaths;
    totalAssists += player.assists;
    totalCS += player.totalMinionsKilled + player.neutralMinionsKilled;
    totalMinutes += match.info.gameDuration / 60;
    totalDamage += player.totalDamageDealtToChampions;

    // Kill participation = (kills + assists) / team kills
    const teamKills = match.info.participants
      .filter((p) => p.teamId === player.teamId)
      .reduce((sum, p) => sum + p.kills, 0);
    totalKP += teamKills > 0 ? (player.kills + player.assists) / teamKills : 0;
  }

  const gamesPlayed = matches.length - remakes;
  if (gamesPlayed === 0) return null;

  const avgKills = totalKills / gamesPlayed;
  const avgDeaths = totalDeaths / gamesPlayed;
  const avgAssists = totalAssists / gamesPlayed;
  const avgKDA =
    totalDeaths === 0
      ? Infinity
      : (totalKills + totalAssists) / totalDeaths;
  const avgCSPerMin = totalMinutes > 0 ? totalCS / totalMinutes : 0;
  const avgDamage = totalDamage / gamesPlayed;
  const avgKP = (totalKP / gamesPlayed) * 100;

  const kdaColor =
    avgKDA >= 5
      ? "text-amber-400"
      : avgKDA >= 3
        ? "text-cyan-400"
        : avgKDA >= 2
          ? "text-green-400"
          : "text-gray-400";

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-5 backdrop-blur-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-400">
        Recent {gamesPlayed} Games
      </h3>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {/* Win Rate Donut */}
        <div className="flex-shrink-0">
          <WinRateDonut wins={wins} total={gamesPlayed} />
        </div>

        {/* Stats Grid */}
        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {/* KDA */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500">
              Avg KDA
            </p>
            <p className="text-sm text-gray-300">
              {avgKills.toFixed(1)}
              <span className="text-gray-500"> / </span>
              <span className="text-red-400">{avgDeaths.toFixed(1)}</span>
              <span className="text-gray-500"> / </span>
              {avgAssists.toFixed(1)}
            </p>
            <p className={`text-sm font-bold ${kdaColor}`}>
              {avgKDA === Infinity
                ? "Perfect"
                : `${avgKDA.toFixed(2)} KDA`}
            </p>
          </div>

          {/* Kill Participation */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500">
              Kill Participation
            </p>
            <p className="text-lg font-bold text-purple-400">
              {avgKP.toFixed(0)}%
            </p>
          </div>

          {/* CS/min */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500">
              CS / min
            </p>
            <p className="text-lg font-bold text-white">
              {avgCSPerMin.toFixed(1)}
            </p>
          </div>

          {/* Avg Damage */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500">
              Avg Damage
            </p>
            <p className="text-lg font-bold text-orange-400">
              {avgDamage >= 1000
                ? `${(avgDamage / 1000).toFixed(1)}k`
                : avgDamage.toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
