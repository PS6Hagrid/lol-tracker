"use client";

import { useState } from "react";
import type { MatchDTO } from "@/types/riot";
import MatchCard from "@/components/MatchCard";

interface MatchHistoryListProps {
  matches: MatchDTO[];
  summonerPuuid: string;
}

type FilterMode = "all" | "wins" | "losses";

export default function MatchHistoryList({
  matches,
  summonerPuuid,
}: MatchHistoryListProps) {
  const [filter, setFilter] = useState<FilterMode>("all");

  const filteredMatches = matches.filter((match) => {
    if (filter === "all") return true;

    const player =
      match.info.participants.find((p) => p.puuid === summonerPuuid) ??
      match.info.participants[0];

    if (filter === "wins") return player.win;
    return !player.win;
  });

  const totalWins = matches.filter((match) => {
    const player =
      match.info.participants.find((p) => p.puuid === summonerPuuid) ??
      match.info.participants[0];
    return player.win;
  }).length;

  const totalLosses = matches.length - totalWins;

  return (
    <div>
      {/* Filter controls + win/loss summary */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-gray-800/60 p-1">
          {(["all", "wins", "losses"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 ${
                filter === mode
                  ? "bg-gray-700 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-400">
          <span className="font-semibold text-green-400">{totalWins}W</span>
          {" / "}
          <span className="font-semibold text-red-400">{totalLosses}L</span>
          <span className="ml-1 text-gray-500">
            ({matches.length > 0 ? ((totalWins / matches.length) * 100).toFixed(0) : 0}%
            WR)
          </span>
        </div>
      </div>

      {/* Match list */}
      <div className="space-y-2">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <MatchCard
              key={match.metadata.matchId}
              match={match}
              summonerPuuid={summonerPuuid}
            />
          ))
        ) : (
          <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-8 text-center backdrop-blur-sm">
            <p className="text-gray-400">
              No matches found for the selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
