"use client";

import { useState, useMemo } from "react";
import { getChampionIconUrl } from "@/lib/constants";

export interface ChampionStatRow {
  championName: string;
  championId: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winrate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKDA: number;
  avgCSPerMin: number;
  avgGoldPerMin: number;
  masteryLevel: number;
}

interface ChampionGridProps {
  champions: ChampionStatRow[];
}

type SortKey =
  | "championName"
  | "gamesPlayed"
  | "winrate"
  | "avgKDA"
  | "avgCSPerMin"
  | "avgGoldPerMin";

type SortDir = "asc" | "desc";

const COLUMN_HEADERS: { key: SortKey; label: string; shortLabel?: string }[] = [
  { key: "championName", label: "Champion" },
  { key: "gamesPlayed", label: "Games", shortLabel: "G" },
  { key: "winrate", label: "Winrate", shortLabel: "WR" },
  { key: "avgKDA", label: "KDA" },
  { key: "avgCSPerMin", label: "CS/min" },
  { key: "avgGoldPerMin", label: "Gold/min" },
];

export default function ChampionGrid({ champions }: ChampionGridProps) {
  const [sortKey, setSortKey] = useState<SortKey>("gamesPlayed");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const copy = [...champions];
    copy.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortKey === "championName") {
        aVal = a.championName.toLowerCase();
        bVal = b.championName.toLowerCase();
      } else {
        aVal = a[sortKey];
        bVal = b[sortKey];
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [champions, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "championName" ? "asc" : "desc");
    }
  }

  function SortIcon({ columnKey }: { columnKey: SortKey }) {
    if (sortKey !== columnKey)
      return <span className="ml-1 text-gray-600">&#8597;</span>;
    return (
      <span className="ml-1 text-cyan-400">
        {sortDir === "asc" ? "\u25B2" : "\u25BC"}
      </span>
    );
  }

  if (champions.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-8 text-center backdrop-blur-sm">
        <p className="text-gray-400">No champion data available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700/50">
            {COLUMN_HEADERS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="cursor-pointer select-none px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:text-gray-200"
              >
                <span className="hidden sm:inline">{col.label}</span>
                <span className="sm:hidden">{col.shortLabel ?? col.label}</span>
                <SortIcon columnKey={col.key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((champ) => (
            <tr
              key={champ.championName}
              className="border-b border-gray-800/50 transition-all duration-200 hover:bg-white/5"
            >
              {/* Champion */}
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-shrink-0">
                    <img
                      src={getChampionIconUrl(champ.championName)}
                      alt={champ.championName}
                      width={36}
                      height={36}
                      className="rounded-lg"
                    />
                    {champ.masteryLevel > 0 && (
                      <span
                        className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                          champ.masteryLevel >= 7
                            ? "bg-amber-500 text-black"
                            : champ.masteryLevel >= 5
                              ? "bg-purple-500 text-white"
                              : "bg-gray-600 text-white"
                        }`}
                      >
                        {champ.masteryLevel}
                      </span>
                    )}
                  </div>
                  <span className="truncate font-medium text-white">
                    {champ.championName}
                  </span>
                </div>
              </td>

              {/* Games */}
              <td className="px-3 py-2.5 text-gray-300">{champ.gamesPlayed}</td>

              {/* Winrate */}
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-red-900/40">
                    <div
                      className="h-full rounded-full bg-green-500/80"
                      style={{ width: `${champ.winrate}%` }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{
                      color:
                        champ.winrate >= 60
                          ? "var(--color-win)"
                          : champ.winrate >= 50
                            ? "#86efac"
                            : "var(--color-loss)",
                    }}
                  >
                    {champ.winrate.toFixed(0)}%
                  </span>
                  <span className="hidden text-xs text-gray-500 sm:inline">
                    ({champ.wins}W {champ.losses}L)
                  </span>
                </div>
              </td>

              {/* KDA */}
              <td className="px-3 py-2.5">
                <div className="text-xs text-gray-400">
                  {champ.avgKills.toFixed(1)} / {champ.avgDeaths.toFixed(1)} /{" "}
                  {champ.avgAssists.toFixed(1)}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    champ.avgKDA >= 5
                      ? "text-amber-400"
                      : champ.avgKDA >= 3
                        ? "text-cyan-400"
                        : champ.avgKDA >= 2
                          ? "text-green-400"
                          : "text-gray-400"
                  }`}
                >
                  {champ.avgKDA === Infinity
                    ? "Perfect"
                    : `${champ.avgKDA.toFixed(2)} KDA`}
                </span>
              </td>

              {/* CS/min */}
              <td className="px-3 py-2.5 text-gray-300">
                {champ.avgCSPerMin.toFixed(1)}
              </td>

              {/* Gold/min */}
              <td className="px-3 py-2.5 text-amber-400">
                {champ.avgGoldPerMin.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
