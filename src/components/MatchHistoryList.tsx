"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { MatchDTO } from "@/types/riot";
import MatchCard from "@/components/MatchCard";
import { getChampionIconUrl } from "@/lib/constants";

interface MatchHistoryListProps {
  matches: MatchDTO[];
  summonerPuuid: string;
  region?: string;
  puuid?: string;
}

type FilterMode = "all" | "wins" | "losses";
type QueueFilter = "all" | "ranked" | "normal" | "aram";
type RoleFilter = "" | "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";

const ROLE_OPTIONS: { label: string; value: RoleFilter }[] = [
  { label: "All", value: "" },
  { label: "Top", value: "TOP" },
  { label: "JG", value: "JUNGLE" },
  { label: "Mid", value: "MIDDLE" },
  { label: "Bot", value: "BOTTOM" },
  { label: "Sup", value: "UTILITY" },
];

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

/** Map participant lane/role fields to a normalized role value */
function getParticipantRole(participant: {
  lane: string;
  role: string;
}): string {
  const lane = participant.lane?.toUpperCase() ?? "";
  const role = participant.role?.toUpperCase() ?? "";

  if (lane === "TOP") return "TOP";
  if (lane === "JUNGLE") return "JUNGLE";
  if (lane === "MIDDLE" || lane === "MID") return "MIDDLE";
  if (lane === "BOTTOM" || lane === "BOT") {
    if (role === "SUPPORT" || role === "UTILITY") return "UTILITY";
    return "BOTTOM";
  }
  if (role === "SUPPORT" || role === "UTILITY") return "UTILITY";
  return lane || role || "";
}

export default function MatchHistoryList({
  matches: initialMatches,
  summonerPuuid,
  region,
  puuid,
}: MatchHistoryListProps) {
  const [extraMatches, setExtraMatches] = useState<MatchDTO[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resultFilter, setResultFilter] = useState<FilterMode>("all");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("");
  const [championFilter, setChampionFilter] = useState<string>("");
  const [championSearch, setChampionSearch] = useState("");
  const [championDropdownOpen, setChampionDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine server-loaded + client-loaded matches
  const matches = useMemo(
    () => [...initialMatches, ...extraMatches],
    [initialMatches, extraMatches],
  );

  // Load more matches from the API
  const loadMore = useCallback(async () => {
    if (!region || !puuid || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setLoadError(null);
    try {
      const start = initialMatches.length + extraMatches.length;
      const res = await fetch(
        `/api/matches/${region}/${puuid}?start=${start}&count=10`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load more matches");
      }
      const data = await res.json();
      const newMatches: MatchDTO[] = data.matches ?? [];
      if (newMatches.length === 0) {
        setHasMore(false);
      } else {
        setExtraMatches((prev) => [...prev, ...newMatches]);
        if (newMatches.length < 10) setHasMore(false);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setIsLoadingMore(false);
    }
  }, [region, puuid, isLoadingMore, hasMore, initialMatches.length, extraMatches.length]);

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

  // Champions filtered by search input
  const filteredChampions = useMemo(() => {
    if (!championSearch) return playedChampions;
    const lower = championSearch.toLowerCase();
    return playedChampions.filter((name) =>
      name.toLowerCase().includes(lower),
    );
  }, [playedChampions, championSearch]);

  // Check if any filter is active
  const hasActiveFilters =
    resultFilter !== "all" ||
    queueFilter !== "all" ||
    roleFilter !== "" ||
    championFilter !== "";

  // Clear all filters
  const clearAllFilters = () => {
    setResultFilter("all");
    setQueueFilter("all");
    setRoleFilter("");
    setChampionFilter("");
    setChampionSearch("");
    setChampionDropdownOpen(false);
  };

  // Matches after queue + champion + role filters (for W/L stats)
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

      if (championFilter !== "" && player.championName !== championFilter) {
        return false;
      }

      if (roleFilter !== "") {
        const participantRole = getParticipantRole(player);
        if (participantRole !== roleFilter) return false;
      }

      return true;
    });
  }, [matches, summonerPuuid, queueFilter, championFilter, roleFilter]);

  // Final filtered matches (+ win/loss filter)
  const filteredMatches = useMemo(() => {
    if (resultFilter === "all") return baseFilteredMatches;
    return baseFilteredMatches.filter((match) => {
      const player = findPlayer(match, summonerPuuid);
      return resultFilter === "wins" ? player.win : !player.win;
    });
  }, [baseFilteredMatches, resultFilter, summonerPuuid]);

  // Stats from base filtered (queue + champion + role, not win/loss)
  const totalWins = useMemo(() => {
    return baseFilteredMatches.filter(
      (match) => findPlayer(match, summonerPuuid).win,
    ).length;
  }, [baseFilteredMatches, summonerPuuid]);

  const totalLosses = baseFilteredMatches.length - totalWins;

  // Pill button styling helper
  const pillClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
      active
        ? "bg-blue-500 text-white"
        : "bg-bg-card border border-border-theme text-text-secondary hover:text-text-primary"
    }`;

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap gap-2 items-start">
        {/* Champion filter — searchable text input with autocomplete */}
        <div ref={dropdownRef} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={championFilter || championSearch}
            onChange={(e) => {
              const val = e.target.value;
              setChampionSearch(val);
              setChampionFilter("");
              setChampionDropdownOpen(val.length > 0);
            }}
            onFocus={() => {
              if (championFilter) {
                setChampionSearch(championFilter);
                setChampionFilter("");
              }
              setChampionDropdownOpen(true);
            }}
            placeholder="Champion..."
            className="w-40 rounded-md border border-border-theme bg-bg-card px-3 py-1.5 text-xs text-text-primary placeholder-text-secondary outline-none focus:ring-1 focus:ring-blue-500/50"
          />

          {championDropdownOpen && filteredChampions.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-border-theme bg-bg-card/95 shadow-xl backdrop-blur-md">
              <div className="max-h-48 overflow-y-auto">
                {!championSearch && (
                  <button
                    onClick={() => {
                      setChampionFilter("");
                      setChampionSearch("");
                      setChampionDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                      championFilter === ""
                        ? "bg-blue-500 text-white"
                        : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                    }`}
                  >
                    All Champions
                  </button>
                )}
                {filteredChampions.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setChampionFilter(name);
                      setChampionSearch("");
                      setChampionDropdownOpen(false);
                      inputRef.current?.blur();
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                      championFilter === name
                        ? "bg-blue-500 text-white"
                        : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
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

        {/* Role filter — pill buttons */}
        <div className="flex items-center gap-1" role="tablist" aria-label="Filter by role">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="tab"
              aria-selected={roleFilter === opt.value}
              onClick={() => setRoleFilter(opt.value)}
              className={pillClass(roleFilter === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Queue type filter — pill buttons */}
        <div className="flex items-center gap-1" role="tablist" aria-label="Filter by queue type">
          {(["all", "ranked", "normal", "aram"] as const).map((mode) => (
            <button
              key={mode}
              role="tab"
              aria-selected={queueFilter === mode}
              onClick={() => setQueueFilter(mode)}
              className={`${pillClass(queueFilter === mode)} ${mode === "aram" ? "uppercase" : "capitalize"}`}
            >
              {mode === "aram" ? "ARAM" : mode === "all" ? "All" : mode}
            </button>
          ))}
        </div>

        {/* Result filter — pill buttons */}
        <div className="flex items-center gap-1" role="tablist" aria-label="Filter by result">
          {(["all", "wins", "losses"] as const).map((mode) => (
            <button
              key={mode}
              role="tab"
              aria-selected={resultFilter === mode}
              onClick={() => setResultFilter(mode)}
              className={`${pillClass(resultFilter === mode)} capitalize`}
            >
              {mode === "all" ? "All" : mode === "wins" ? "Wins" : "Losses"}
            </button>
          ))}
        </div>

        {/* Clear all filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="rounded-md px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Showing X of Y + Win/Loss summary */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
        <span>
          Showing {filteredMatches.length} of {matches.length} matches
        </span>
        <span className="text-text-muted">|</span>
        <span>
          <span className="font-semibold text-green-400">{totalWins}W</span>
          {" / "}
          <span className="font-semibold text-red-400">{totalLosses}L</span>
          <span className="ml-1 text-text-muted">
            (
            {baseFilteredMatches.length > 0
              ? ((totalWins / baseFilteredMatches.length) * 100).toFixed(0)
              : 0}
            % WR)
          </span>
        </span>
      </div>

      {/* Match list */}
      <div
        key={`${resultFilter}-${queueFilter}-${championFilter}-${roleFilter}`}
        className="animate-stagger space-y-2"
      >
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <MatchCard
              key={match.metadata.matchId}
              match={match}
              summonerPuuid={summonerPuuid}
              region={region}
            />
          ))
        ) : (
          <div className="rounded-xl border border-border-theme bg-bg-card/80 p-8 text-center backdrop-blur-sm">
            <p className="text-text-secondary">
              No matches found for the selected filters.
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {region && puuid && hasMore && (
        <div className="mt-4 flex flex-col items-center gap-2">
          {loadError && (
            <p className="text-xs text-red-400">{loadError}</p>
          )}
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="group flex items-center gap-2 rounded-xl border border-border-theme bg-bg-card/80 px-6 py-3 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/30 hover:text-white hover:shadow-lg disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5"
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
                Load More Matches
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
