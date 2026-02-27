"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { MatchDTO } from "@/types/riot";
import MatchCard from "@/components/MatchCard";
import { getChampionIconUrl } from "@/lib/constants";

interface MatchHistoryListProps {
  matches: MatchDTO[];
  summonerPuuid: string;
}

type FilterMode = "all" | "wins" | "losses";
type QueueFilter = "all" | "ranked" | "normal" | "aram";

function getQueueCategory(gameMode: string, gameType: string): string {
  if (gameType === "MATCHED_GAME" && gameMode === "CLASSIC") return "ranked";
  if (gameMode === "ARAM") return "aram";
  return "normal";
}

function findPlayer(match: MatchDTO, puuid: string) {
  return (
    match.info.participants.find((p) => p.puuid === puuid) ??
    match.info.participants[0]
  );
}

export default function MatchHistoryList({
  matches,
  summonerPuuid,
}: MatchHistoryListProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [championFilter, setChampionFilter] = useState<string>("all");
  const [championSearch, setChampionSearch] = useState("");
  const [championDropdownOpen, setChampionDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setChampionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Unique champions the summoner played
  const playedChampions = useMemo(() => {
    const champions = new Set<string>();
    for (const match of matches) {
      champions.add(findPlayer(match, summonerPuuid).championName);
    }
    return Array.from(champions).sort();
  }, [matches, summonerPuuid]);

  // Champions filtered by search
  const filteredChampions = useMemo(() => {
    if (!championSearch) return playedChampions;
    const lower = championSearch.toLowerCase();
    return playedChampions.filter((name) =>
      name.toLowerCase().includes(lower),
    );
  }, [playedChampions, championSearch]);

  // Matches after queue + champion filters (for W/L stats)
  const baseFilteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const player = findPlayer(match, summonerPuuid);

      if (queueFilter !== "all") {
        const category = getQueueCategory(
          match.info.gameMode,
          match.info.gameType,
        );
        if (category !== queueFilter) return false;
      }

      if (championFilter !== "all" && player.championName !== championFilter) {
        return false;
      }

      return true;
    });
  }, [matches, summonerPuuid, queueFilter, championFilter]);

  // Final filtered matches (+ win/loss filter)
  const filteredMatches = useMemo(() => {
    if (filter === "all") return baseFilteredMatches;
    return baseFilteredMatches.filter((match) => {
      const player = findPlayer(match, summonerPuuid);
      return filter === "wins" ? player.win : !player.win;
    });
  }, [baseFilteredMatches, filter, summonerPuuid]);

  // Stats from base filtered (queue + champion, not win/loss)
  const totalWins = useMemo(() => {
    return baseFilteredMatches.filter(
      (match) => findPlayer(match, summonerPuuid).win,
    ).length;
  }, [baseFilteredMatches, summonerPuuid]);

  const totalLosses = baseFilteredMatches.length - totalWins;

  return (
    <div>
      {/* Filter controls + win/loss summary */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Win/Loss filter */}
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

        {/* Queue type filter */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-800/60 p-1">
          {(["all", "ranked", "normal", "aram"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setQueueFilter(mode)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                queueFilter === mode
                  ? "bg-gray-700 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              } ${mode === "aram" ? "uppercase" : "capitalize"}`}
            >
              {mode === "aram" ? "ARAM" : mode}
            </button>
          ))}
        </div>

        {/* Champion filter dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              setChampionDropdownOpen(!championDropdownOpen);
              setChampionSearch("");
            }}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              championFilter !== "all"
                ? "bg-gray-700 text-white shadow"
                : "bg-gray-800/60 text-gray-400 hover:text-gray-200"
            }`}
          >
            {championFilter !== "all" && (
              <img
                src={getChampionIconUrl(championFilter)}
                alt={championFilter}
                width={16}
                height={16}
                className="rounded"
              />
            )}
            {championFilter === "all" ? "All Champions" : championFilter}
            <svg
              className={`h-3 w-3 transition-transform duration-200 ${
                championDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {championDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/95 shadow-xl backdrop-blur-md">
              <div className="border-b border-gray-700/50 p-2">
                <input
                  type="text"
                  value={championSearch}
                  onChange={(e) => setChampionSearch(e.target.value)}
                  placeholder="Search champion..."
                  className="w-full rounded-md bg-gray-800/60 px-2 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-cyan/30"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    setChampionFilter("all");
                    setChampionDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                    championFilter === "all"
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  All Champions
                </button>
                {filteredChampions.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setChampionFilter(name);
                      setChampionDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                      championFilter === name
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                  >
                    <img
                      src={getChampionIconUrl(name)}
                      alt={name}
                      width={20}
                      height={20}
                      className="rounded"
                    />
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Win/Loss summary */}
        <div className="text-sm text-gray-400">
          <span className="font-semibold text-green-400">{totalWins}W</span>
          {" / "}
          <span className="font-semibold text-red-400">{totalLosses}L</span>
          <span className="ml-1 text-gray-500">
            (
            {baseFilteredMatches.length > 0
              ? ((totalWins / baseFilteredMatches.length) * 100).toFixed(0)
              : 0}
            % WR)
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
              No matches found for the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
