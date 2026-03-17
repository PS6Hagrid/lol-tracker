"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  REGIONS,
  RANKED_TIERS,
  getProfileIconUrl,
  getChampionIconUrl,
  getChampionNameById,
  getRankEmblemUrl,
} from "@/lib/constants";
import type { SummonerDTO, LeagueEntryDTO, ChampionMasteryDTO } from "@/types/riot";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface RecentStats {
  avgKDA: {
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
  } | null;
  csPerMin: number;
  matchCount: number;
}

interface SummonerCompareData {
  summoner: SummonerDTO;
  rankedStats: LeagueEntryDTO[];
  topChampions: ChampionMasteryDTO[];
  recentStats: RecentStats;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function getSoloQueueEntry(entries: LeagueEntryDTO[]): LeagueEntryDTO | null {
  return entries.find((e) => e.queueType === "RANKED_SOLO_5x5") ?? null;
}

function getFlexEntry(entries: LeagueEntryDTO[]): LeagueEntryDTO | null {
  return entries.find((e) => e.queueType === "RANKED_FLEX_SR") ?? null;
}

function winRate(wins: number, losses: number): number {
  const total = wins + losses;
  return total > 0 ? Math.round((wins / total) * 1000) / 10 : 0;
}

function tierValue(tier: string): number {
  const idx = RANKED_TIERS.indexOf(tier.toUpperCase() as (typeof RANKED_TIERS)[number]);
  return idx >= 0 ? idx : -1;
}

function divisionValue(rank: string): number {
  const map: Record<string, number> = { IV: 0, III: 1, II: 2, I: 3 };
  return map[rank] ?? 0;
}

function rankScore(entry: LeagueEntryDTO | null): number {
  if (!entry) return -1;
  return tierValue(entry.tier) * 400 + divisionValue(entry.rank) * 100 + entry.leaguePoints;
}

/* ─── Comparison Bar ─────────────────────────────────────────────────── */

function ComparisonBar({
  label,
  value1,
  value2,
  format,
  higherIsBetter = true,
}: {
  label: string;
  value1: number;
  value2: number;
  format?: (v: number) => string;
  higherIsBetter?: boolean;
}) {
  const maxVal = Math.max(value1, value2, 0.01);
  const pct1 = (value1 / maxVal) * 100;
  const pct2 = (value2 / maxVal) * 100;

  const better1 = higherIsBetter ? value1 > value2 : value1 < value2;
  const better2 = higherIsBetter ? value2 > value1 : value2 < value1;
  const tied = value1 === value2;

  const fmt = format ?? ((v: number) => String(Math.round(v * 100) / 100));

  return (
    <div className="space-y-1">
      <div className="text-center text-xs font-medium text-text-secondary">{label}</div>
      <div className="flex items-center gap-2">
        {/* Left value */}
        <div className="w-16 text-right sm:w-20">
          <span
            className={`text-sm font-semibold ${
              tied ? "text-text-secondary" : better1 ? "text-green-400" : "text-red-400"
            }`}
          >
            {fmt(value1)}
          </span>
        </div>

        {/* Bars */}
        <div className="flex flex-1 items-center gap-0.5">
          <div className="flex h-5 flex-1 justify-end overflow-hidden rounded-l bg-gray-800/50">
            <div
              className={`h-full rounded-l transition-all duration-500 ${
                better1 ? "bg-green-500" : tied ? "bg-blue-500/40" : "bg-red-500/60"
              }`}
              style={{ width: `${pct1}%` }}
            />
          </div>
          <div className="flex h-5 flex-1 justify-start overflow-hidden rounded-r bg-gray-800/50">
            <div
              className={`h-full rounded-r transition-all duration-500 ${
                better2 ? "bg-green-500" : tied ? "bg-blue-500/40" : "bg-red-500/60"
              }`}
              style={{ width: `${pct2}%` }}
            />
          </div>
        </div>

        {/* Right value */}
        <div className="w-16 sm:w-20">
          <span
            className={`text-sm font-semibold ${
              tied ? "text-text-secondary" : better2 ? "text-green-400" : "text-red-400"
            }`}
          >
            {fmt(value2)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Rank Display ───────────────────────────────────────────────────── */

function RankDisplay({
  entry,
  label,
}: {
  entry: LeagueEntryDTO | null;
  label: string;
}) {
  if (!entry) {
    return (
      <div className="text-center">
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <p className="mt-1 text-sm text-text-secondary">Unranked</p>
      </div>
    );
  }

  const wr = winRate(entry.wins, entry.losses);
  const isApex = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(entry.tier);

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <Image
        src={getRankEmblemUrl(entry.tier)}
        alt={entry.tier}
        width={48}
        height={48}
        className="drop-shadow-md"
        unoptimized
      />
      <p className="text-sm font-bold text-text-primary">
        {entry.tier.charAt(0) + entry.tier.slice(1).toLowerCase()}
        {!isApex && ` ${entry.rank}`}
      </p>
      <p className="text-xs text-text-secondary">{entry.leaguePoints} LP</p>
      <p className="text-xs text-text-muted">
        {entry.wins}W {entry.losses}L ({wr}%)
      </p>
    </div>
  );
}

/* ─── Summoner Input ─────────────────────────────────────────────────── */

function SummonerInput({
  label,
  name,
  region,
  onNameChange,
  onRegionChange,
}: {
  label: string;
  name: string;
  region: string;
  onNameChange: (v: string) => void;
  onRegionChange: (v: string) => void;
}) {
  return (
    <div className="w-full space-y-2">
      <label className="block text-xs font-medium text-text-secondary">{label}</label>
      <select
        value={region}
        onChange={(e) => onRegionChange(e.target.value)}
        className="w-full rounded-lg border border-border-theme bg-bg-card px-3 py-2 text-sm text-text-primary outline-none transition hover:border-blue-500 focus:border-blue-500"
      >
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="GameName-TagLine (e.g. Faker-KR1)"
        className="w-full rounded-lg border border-border-theme bg-bg-card px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted transition hover:border-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function SummonerCompare() {
  const [name1, setName1] = useState("");
  const [region1, setRegion1] = useState("na1");
  const [name2, setName2] = useState("");
  const [region2, setRegion2] = useState("na1");

  const [data1, setData1] = useState<SummonerCompareData | null>(null);
  const [data2, setData2] = useState<SummonerCompareData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummoner = useCallback(
    async (region: string, name: string): Promise<SummonerCompareData | null> => {
      const trimmed = name.trim();
      if (!trimmed) return null;

      const res = await fetch(`/api/compare/${region}/${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to fetch summoner (${res.status})`);
      }
      return res.json();
    },
    [],
  );

  const handleCompare = useCallback(async () => {
    if (!name1.trim() || !name2.trim()) {
      setError("Please enter both summoner names in the format GameName-TagLine.");
      return;
    }

    setLoading(true);
    setError(null);
    setData1(null);
    setData2(null);

    try {
      const [result1, result2] = await Promise.all([
        fetchSummoner(region1, name1),
        fetchSummoner(region2, name2),
      ]);
      setData1(result1);
      setData2(result2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch summoner data.");
    } finally {
      setLoading(false);
    }
  }, [name1, name2, region1, region2, fetchSummoner]);

  const solo1 = data1 ? getSoloQueueEntry(data1.rankedStats) : null;
  const solo2 = data2 ? getSoloQueueEntry(data2.rankedStats) : null;
  const flex1 = data1 ? getFlexEntry(data1.rankedStats) : null;
  const flex2 = data2 ? getFlexEntry(data2.rankedStats) : null;

  const wr1 = solo1 ? winRate(solo1.wins, solo1.losses) : 0;
  const wr2 = solo2 ? winRate(solo2.wins, solo2.losses) : 0;

  const bothLoaded = data1 && data2;

  // Determine which summoner has higher rank
  const rank1Score = rankScore(solo1);
  const rank2Score = rankScore(solo2);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">Summoner Comparison</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enter two summoner names to compare their stats side by side.
        </p>
      </div>

      {/* Summoner Inputs */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="w-full sm:flex-1">
          <SummonerInput
            label="Summoner 1"
            name={name1}
            region={region1}
            onNameChange={setName1}
            onRegionChange={setRegion1}
          />
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-theme bg-bg-card text-lg font-bold text-text-secondary">
          vs
        </div>

        <div className="w-full sm:flex-1">
          <SummonerInput
            label="Summoner 2"
            name={name2}
            region={region2}
            onNameChange={setName2}
            onRegionChange={setRegion2}
          />
        </div>
      </div>

      {/* Compare Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleCompare}
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-500 hover:to-cyan-400 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}

      {/* Comparison Results */}
      {bothLoaded && !loading && (
        <>
          {/* Profile Headers */}
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            {/* Summoner 1 Header */}
            <div className="flex items-center gap-3">
              <Image
                src={getProfileIconUrl(data1.summoner.profileIconId)}
                alt={data1.summoner.gameName}
                width={64}
                height={64}
                className="rounded-lg border-2 border-blue-500"
                unoptimized
              />
              <div>
                <h2 className="text-lg font-bold text-blue-400">
                  {data1.summoner.gameName}
                  <span className="text-sm font-normal text-text-muted">
                    #{data1.summoner.tagLine}
                  </span>
                </h2>
                <p className="text-xs text-text-muted">
                  Level {data1.summoner.summonerLevel}
                </p>
              </div>
            </div>

            {/* Summoner 2 Header */}
            <div className="flex items-center gap-3 sm:flex-row-reverse sm:text-right">
              <Image
                src={getProfileIconUrl(data2.summoner.profileIconId)}
                alt={data2.summoner.gameName}
                width={64}
                height={64}
                className="rounded-lg border-2 border-red-500"
                unoptimized
              />
              <div>
                <h2 className="text-lg font-bold text-red-400">
                  {data2.summoner.gameName}
                  <span className="text-sm font-normal text-text-muted">
                    #{data2.summoner.tagLine}
                  </span>
                </h2>
                <p className="text-xs text-text-muted">
                  Level {data2.summoner.summonerLevel}
                </p>
              </div>
            </div>
          </div>

          {/* Level Comparison */}
          <ComparisonBar
            label="Summoner Level"
            value1={data1.summoner.summonerLevel}
            value2={data2.summoner.summonerLevel}
          />

          {/* Ranked Stats Section */}
          <section className="rounded-xl border border-border-theme bg-bg-card p-4 sm:p-6">
            <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Ranked Solo/Duo
            </h3>

            {/* Rank Emblems */}
            <div className="mb-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
              <RankDisplay entry={solo1} label={data1.summoner.gameName} />
              <div className="hidden w-px self-stretch bg-border-theme sm:block" />
              <div className="w-full border-t border-border-theme sm:hidden" />
              <RankDisplay entry={solo2} label={data2.summoner.gameName} />
            </div>

            {/* Ranked Stat Bars */}
            {solo1 && solo2 && (
              <div className="space-y-3">
                <ComparisonBar
                  label="Rank"
                  value1={rank1Score}
                  value2={rank2Score}
                  format={(v) => {
                    const entry = v === rank1Score ? solo1 : solo2;
                    if (!entry) return "Unranked";
                    const isApex = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(entry.tier);
                    const tierLabel = entry.tier.charAt(0) + entry.tier.slice(1).toLowerCase();
                    return isApex ? `${tierLabel} ${entry.leaguePoints}LP` : `${tierLabel} ${entry.rank}`;
                  }}
                />
                <ComparisonBar
                  label="LP"
                  value1={solo1.leaguePoints}
                  value2={solo2.leaguePoints}
                />
                <ComparisonBar
                  label="Win Rate"
                  value1={wr1}
                  value2={wr2}
                  format={(v) => `${v}%`}
                />
                <ComparisonBar label="Wins" value1={solo1.wins} value2={solo2.wins} />
                <ComparisonBar
                  label="Losses"
                  value1={solo1.losses}
                  value2={solo2.losses}
                  higherIsBetter={false}
                />
                <ComparisonBar
                  label="Total Games"
                  value1={solo1.wins + solo1.losses}
                  value2={solo2.wins + solo2.losses}
                />
              </div>
            )}

            {(!solo1 || !solo2) && (
              <p className="text-center text-sm text-text-muted">
                One or both summoners are unranked in Solo/Duo.
              </p>
            )}
          </section>

          {/* Flex Queue */}
          {(flex1 || flex2) && (
            <section className="rounded-xl border border-border-theme bg-bg-card p-4 sm:p-6">
              <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-text-secondary">
                Ranked Flex
              </h3>
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
                <RankDisplay entry={flex1} label={data1.summoner.gameName} />
                <div className="hidden w-px self-stretch bg-border-theme sm:block" />
                <div className="w-full border-t border-border-theme sm:hidden" />
                <RankDisplay entry={flex2} label={data2.summoner.gameName} />
              </div>
            </section>
          )}

          {/* Recent Performance Stats */}
          <section className="rounded-xl border border-border-theme bg-bg-card p-4 sm:p-6">
            <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Recent Performance (Last {Math.max(data1.recentStats.matchCount, data2.recentStats.matchCount)} Games)
            </h3>
            <div className="space-y-3">
              {data1.recentStats.avgKDA && data2.recentStats.avgKDA && (
                <>
                  <ComparisonBar
                    label="KDA Ratio"
                    value1={data1.recentStats.avgKDA.kda}
                    value2={data2.recentStats.avgKDA.kda}
                    format={(v) => v.toFixed(2)}
                  />
                  <ComparisonBar
                    label="Avg Kills"
                    value1={data1.recentStats.avgKDA.kills}
                    value2={data2.recentStats.avgKDA.kills}
                    format={(v) => v.toFixed(1)}
                  />
                  <ComparisonBar
                    label="Avg Deaths"
                    value1={data1.recentStats.avgKDA.deaths}
                    value2={data2.recentStats.avgKDA.deaths}
                    format={(v) => v.toFixed(1)}
                    higherIsBetter={false}
                  />
                  <ComparisonBar
                    label="Avg Assists"
                    value1={data1.recentStats.avgKDA.assists}
                    value2={data2.recentStats.avgKDA.assists}
                    format={(v) => v.toFixed(1)}
                  />
                </>
              )}
              <ComparisonBar
                label="CS / min"
                value1={data1.recentStats.csPerMin}
                value2={data2.recentStats.csPerMin}
                format={(v) => v.toFixed(1)}
              />
            </div>
          </section>

          {/* Top Champions Section */}
          <section className="rounded-xl border border-border-theme bg-bg-card p-4 sm:p-6">
            <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Top Champions
            </h3>
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Summoner 1 Champions */}
              <div className="flex-1 text-center">
                <p className="mb-3 text-sm font-medium text-blue-400">{data1.summoner.gameName}</p>
                <div className="flex flex-col items-center gap-2">
                  {data1.topChampions.map((champ) => {
                    const champName = getChampionNameById(champ.championId);
                    return (
                      <div
                        key={champ.championId}
                        className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2"
                      >
                        <Image
                          src={getChampionIconUrl(champName)}
                          alt={champName}
                          width={32}
                          height={32}
                          className="rounded"
                          unoptimized
                        />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-text-primary">{champName}</p>
                          <p className="text-xs text-text-muted">
                            Mastery {champ.championLevel} &middot;{" "}
                            {champ.championPoints.toLocaleString()} pts
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {data1.topChampions.length === 0 && (
                    <p className="text-sm text-text-muted">No mastery data</p>
                  )}
                </div>
              </div>

              <div className="hidden w-px bg-border-theme sm:block" />
              <div className="border-t border-border-theme sm:hidden" />

              {/* Summoner 2 Champions */}
              <div className="flex-1 text-center">
                <p className="mb-3 text-sm font-medium text-red-400">{data2.summoner.gameName}</p>
                <div className="flex flex-col items-center gap-2">
                  {data2.topChampions.map((champ) => {
                    const champName = getChampionNameById(champ.championId);
                    return (
                      <div
                        key={champ.championId}
                        className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2"
                      >
                        <Image
                          src={getChampionIconUrl(champName)}
                          alt={champName}
                          width={32}
                          height={32}
                          className="rounded"
                          unoptimized
                        />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-text-primary">{champName}</p>
                          <p className="text-xs text-text-muted">
                            Mastery {champ.championLevel} &middot;{" "}
                            {champ.championPoints.toLocaleString()} pts
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {data2.topChampions.length === 0 && (
                    <p className="text-sm text-text-muted">No mastery data</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Empty State */}
      {!bothLoaded && !loading && !error && (
        <div className="rounded-xl border border-border-theme bg-bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
            <svg
              className="h-8 w-8 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-primary">Ready to Compare</p>
          <p className="mt-1 text-sm text-text-muted">
            Enter two summoner names above in the format <strong>GameName-TagLine</strong> (e.g.
            Faker-KR1) and click Compare to see their stats side by side.
          </p>
        </div>
      )}
    </div>
  );
}
