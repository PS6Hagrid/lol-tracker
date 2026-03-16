"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { REGIONS } from "@/lib/constants";
import type { LeagueItemDTO } from "@/types/riot";

type Tier = "challenger" | "grandmaster" | "master";

interface LeaderboardTableProps {
  region: string;
}

const TIERS: { label: string; value: Tier }[] = [
  { label: "Challenger", value: "challenger" },
  { label: "Grandmaster", value: "grandmaster" },
  { label: "Master", value: "master" },
];

const PAGE_SIZE = 50;

export default function LeaderboardTable({ region }: LeaderboardTableProps) {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>("challenger");
  const [entries, setEntries] = useState<LeagueItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);

    fetch(`/api/leaderboard/${region}?tier=${tier}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          const sorted = (data.league?.entries ?? []).sort(
            (a: LeagueItemDTO, b: LeagueItemDTO) =>
              b.leaguePoints - a.leaguePoints
          );
          setEntries(sorted);
        }
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tier, region]);

  const isMaster = tier === "master";
  const totalPages = isMaster ? Math.max(1, Math.ceil(entries.length / PAGE_SIZE)) : 1;
  const displayedEntries = useMemo(
    () => isMaster ? entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : entries,
    [entries, page, isMaster],
  );

  const handleRegionChange = (newRegion: string) => {
    router.push(`/leaderboard/${newRegion}`);
  };

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-100">
          👑 Leaderboard
        </h1>

        {/* Region selector */}
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="rounded-lg border border-gray-700/50 bg-[#111827] px-3 py-2 text-sm text-gray-100 outline-none focus:border-blue-500"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tier tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto" role="tablist" aria-label="Tier filter">
        {TIERS.map((t) => {
          const isActive = tier === t.value;
          const count = !loading && tier === t.value ? entries.length : null;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTier(t.value)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "border border-gray-700/50 bg-[#111827] text-gray-400 hover:text-gray-200"
              }`}
            >
              {t.label}
              {count !== null && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] sm:ml-2 sm:px-2 sm:text-xs ${
                    isActive
                      ? "bg-blue-400/20 text-blue-100"
                      : "bg-gray-700/50 text-gray-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-[#0d1117]" role="tabpanel">
        <table className="w-full text-left text-sm" aria-label="Leaderboard rankings">
          <thead>
            <tr className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-400">
              <th scope="col" className="px-2 py-2 font-medium sm:px-4 sm:py-3">#</th>
              <th scope="col" className="px-2 py-2 font-medium sm:px-4 sm:py-3">Summoner Name</th>
              <th scope="col" className="px-2 py-2 font-medium sm:px-4 sm:py-3">LP</th>
              <th scope="col" className="hidden px-2 py-2 font-medium sm:table-cell sm:px-4 sm:py-3">W/L</th>
              <th scope="col" className="hidden px-2 py-2 font-medium sm:table-cell sm:px-4 sm:py-3">Winrate</th>
              <th scope="col" className="px-2 py-2 font-medium sm:px-4 sm:py-3">Badges</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-800/50"
                  >
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-2 py-2 sm:px-4 sm:py-3">
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-700/50 sm:w-20" />
                      </td>
                    ))}
                    <td className="hidden px-2 py-2 sm:table-cell sm:px-4 sm:py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-700/50" />
                    </td>
                    <td className="hidden px-2 py-2 sm:table-cell sm:px-4 sm:py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-700/50" />
                    </td>
                  </tr>
                ))
              : displayedEntries.map((entry, idx) => {
                  const globalRank = isMaster
                    ? (page - 1) * PAGE_SIZE + idx + 1
                    : idx + 1;
                  const totalGames = entry.wins + entry.losses;
                  const winrate = totalGames > 0
                    ? (entry.wins / totalGames) * 100
                    : 0;
                  const summonerTag = `${entry.summonerName}-EUW`;

                  let rankCellClass = "text-gray-100";
                  let rankPrefix = "";
                  let rankBgClass = "";
                  if (globalRank === 1) {
                    rankCellClass = "text-yellow-400 font-bold";
                    rankPrefix = "🥇 ";
                    rankBgClass = "bg-yellow-500/10";
                  } else if (globalRank === 2) {
                    rankCellClass = "text-gray-300 font-bold";
                    rankPrefix = "🥈 ";
                    rankBgClass = "bg-gray-400/10";
                  } else if (globalRank === 3) {
                    rankCellClass = "text-amber-600 font-bold";
                    rankPrefix = "🥉 ";
                    rankBgClass = "bg-amber-700/10";
                  }

                  let winrateColor = "text-gray-100";
                  if (winrate > 55) winrateColor = "text-green-400";
                  else if (winrate < 45) winrateColor = "text-red-400";

                  return (
                    <tr
                      key={entry.summonerId}
                      className={`border-b border-gray-800/50 transition-colors hover:bg-gray-800/30 ${rankBgClass}`}
                    >
                      <td className={`px-2 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm ${rankCellClass}`}>
                        {rankPrefix}{globalRank}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3">
                        <Link
                          href={`/summoner/${region}/${encodeURIComponent(summonerTag)}`}
                          className="text-xs text-blue-400 hover:text-blue-300 hover:underline sm:text-sm"
                        >
                          {entry.summonerName}
                        </Link>
                      </td>
                      <td className="px-2 py-2 text-xs font-bold text-gray-100 sm:px-4 sm:py-3 sm:text-sm">
                        {entry.leaguePoints.toLocaleString()}
                      </td>
                      <td className="hidden px-2 py-2 text-gray-300 sm:table-cell sm:px-4 sm:py-3">
                        {entry.wins}W {entry.losses}L
                      </td>
                      <td className={`hidden px-2 py-2 sm:table-cell sm:px-4 sm:py-3 ${winrateColor}`}>
                        {winrate.toFixed(1)}%
                      </td>
                      <td className="px-2 py-2 text-base sm:px-4 sm:py-3">
                        {entry.hotStreak && (
                          <span title="Hot Streak">🔥</span>
                        )}
                        {entry.freshBlood && (
                          <span title="Fresh Blood">✨</span>
                        )}
                        {entry.veteran && (
                          <span title="Veteran">⭐</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            {!loading && displayedEntries.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (master tier only) */}
      {isMaster && !loading && totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="rounded-lg border border-gray-700/50 bg-[#111827] px-3 py-1.5 text-sm text-gray-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-1 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p as number)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  page === p
                    ? "bg-blue-500 text-white"
                    : "border border-gray-700/50 bg-[#111827] text-gray-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="rounded-lg border border-gray-700/50 bg-[#111827] px-3 py-1.5 text-sm text-gray-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

          <span className="ml-2 text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
