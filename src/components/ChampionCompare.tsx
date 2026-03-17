"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import type { ChampionFullData } from "@/lib/champion-compare";
import { DDRAGON_BASE_URL, GAME_VERSION } from "@/lib/constants";

interface ChampionCompareProps {
  champions: { id: string; name: string }[];
}

interface StatRow {
  label: string;
  key: keyof ChampionFullData["stats"];
  perLevelKey?: keyof ChampionFullData["stats"];
  format?: (v: number) => string;
}

const BASE_STATS: StatRow[] = [
  { label: "HP", key: "hp", perLevelKey: "hpperlevel" },
  { label: "Mana", key: "mp", perLevelKey: "mpperlevel" },
  { label: "Armor", key: "armor", perLevelKey: "armorperlevel" },
  { label: "Magic Resist", key: "spellblock", perLevelKey: "spellblockperlevel" },
  { label: "Attack Damage", key: "attackdamage", perLevelKey: "attackdamageperlevel" },
  {
    label: "Attack Speed",
    key: "attackspeed",
    perLevelKey: "attackspeedperlevel",
    format: (v: number) => v.toFixed(3),
  },
  { label: "Move Speed", key: "movespeed" },
  { label: "Attack Range", key: "attackrange" },
  { label: "HP Regen", key: "hpregen", perLevelKey: "hpregenperlevel", format: (v: number) => v.toFixed(1) },
  { label: "Mana Regen", key: "mpregen", perLevelKey: "mpregenperlevel", format: (v: number) => v.toFixed(1) },
];

const INFO_STATS: { label: string; key: keyof ChampionFullData["info"] }[] = [
  { label: "Attack", key: "attack" },
  { label: "Defense", key: "defense" },
  { label: "Magic", key: "magic" },
  { label: "Difficulty", key: "difficulty" },
];

function getChampionIconUrl(championId: string): string {
  return `${DDRAGON_BASE_URL}/cdn/${GAME_VERSION}/img/champion/${championId}.png`;
}

function formatStat(value: number, format?: (v: number) => string): string {
  return format ? format(value) : String(Math.round(value * 100) / 100);
}

/* ─── Searchable Combobox ─────────────────────────────────────────────── */

function ChampionSelector({
  champions,
  selected,
  onSelect,
  label,
}: {
  champions: { id: string; name: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return champions;
    const q = query.toLowerCase();
    return champions.filter((c) => c.name.toLowerCase().includes(q));
  }, [champions, query]);

  const selectedChampion = champions.find((c) => c.id === selected);

  return (
    <div ref={ref} className="relative w-full">
      <label className="mb-1 block text-xs font-medium text-text-secondary">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border border-border-theme bg-bg-card px-3 py-2 text-left text-sm text-text-primary transition hover:border-blue-500"
      >
        {selectedChampion ? (
          <>
            <Image
              src={getChampionIconUrl(selectedChampion.id)}
              alt={selectedChampion.name}
              width={24}
              height={24}
              className="rounded"
            />
            <span>{selectedChampion.name}</span>
          </>
        ) : (
          <span className="text-text-muted">Select champion...</span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border-theme bg-bg-card shadow-lg">
          <div className="p-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              autoFocus
              className="w-full rounded border border-border-theme bg-bg-card px-2 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-blue-500"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto pb-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-text-muted">No champions found</li>
            )}
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(c.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition hover:bg-blue-500/10 ${
                    selected === c.id ? "bg-blue-500/20 text-blue-400" : "text-text-primary"
                  }`}
                >
                  <Image
                    src={getChampionIconUrl(c.id)}
                    alt={c.name}
                    width={20}
                    height={20}
                    className="rounded"
                  />
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Comparison Bar ──────────────────────────────────────────────────── */

function ComparisonBar({
  label,
  value1,
  value2,
  perLevel1,
  perLevel2,
  format,
  maxValue,
}: {
  label: string;
  value1: number;
  value2: number;
  perLevel1?: number;
  perLevel2?: number;
  format?: (v: number) => string;
  maxValue: number;
}) {
  const pct1 = maxValue > 0 ? (value1 / maxValue) * 100 : 0;
  const pct2 = maxValue > 0 ? (value2 / maxValue) * 100 : 0;
  const higher1 = value1 > value2;
  const higher2 = value2 > value1;

  return (
    <div className="space-y-1">
      <div className="text-center text-xs font-medium text-text-secondary">{label}</div>
      <div className="flex items-center gap-2">
        {/* Left value */}
        <div className="w-20 text-right">
          <span className={`text-sm font-semibold ${higher1 ? "text-green-400" : "text-text-secondary"}`}>
            {formatStat(value1, format)}
          </span>
          {perLevel1 !== undefined && (
            <span className="ml-1 text-[10px] text-text-muted">+{formatStat(perLevel1, format)}/lvl</span>
          )}
        </div>

        {/* Bars */}
        <div className="flex flex-1 items-center gap-0.5">
          {/* Left bar (grows right-to-left) */}
          <div className="flex h-5 flex-1 justify-end overflow-hidden rounded-l bg-gray-800/50">
            <div
              className={`h-full rounded-l transition-all duration-500 ${higher1 ? "bg-blue-500" : "bg-blue-500/40"}`}
              style={{ width: `${pct1}%` }}
            />
          </div>
          {/* Right bar (grows left-to-right) */}
          <div className="flex h-5 flex-1 justify-start overflow-hidden rounded-r bg-gray-800/50">
            <div
              className={`h-full rounded-r transition-all duration-500 ${higher2 ? "bg-red-500" : "bg-red-500/40"}`}
              style={{ width: `${pct2}%` }}
            />
          </div>
        </div>

        {/* Right value */}
        <div className="w-20">
          <span className={`text-sm font-semibold ${higher2 ? "text-green-400" : "text-text-secondary"}`}>
            {formatStat(value2, format)}
          </span>
          {perLevel2 !== undefined && (
            <span className="ml-1 text-[10px] text-text-muted">+{formatStat(perLevel2, format)}/lvl</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Info Rating Bar ─────────────────────────────────────────────────── */

function InfoBar({
  label,
  value1,
  value2,
}: {
  label: string;
  value1: number;
  value2: number;
}) {
  const higher1 = value1 > value2;
  const higher2 = value2 > value1;

  return (
    <div className="space-y-1">
      <div className="text-center text-xs font-medium text-text-secondary">{label}</div>
      <div className="flex items-center gap-2">
        <div className="w-8 text-right">
          <span className={`text-sm font-semibold ${higher1 ? "text-green-400" : "text-text-secondary"}`}>
            {value1}
          </span>
        </div>
        <div className="flex flex-1 items-center gap-0.5">
          <div className="flex h-4 flex-1 justify-end overflow-hidden rounded-l bg-gray-800/50">
            <div
              className={`h-full rounded-l transition-all duration-500 ${higher1 ? "bg-blue-500" : "bg-blue-500/40"}`}
              style={{ width: `${(value1 / 10) * 100}%` }}
            />
          </div>
          <div className="flex h-4 flex-1 justify-start overflow-hidden rounded-r bg-gray-800/50">
            <div
              className={`h-full rounded-r transition-all duration-500 ${higher2 ? "bg-red-500" : "bg-red-500/40"}`}
              style={{ width: `${(value2 / 10) * 100}%` }}
            />
          </div>
        </div>
        <div className="w-8">
          <span className={`text-sm font-semibold ${higher2 ? "text-green-400" : "text-text-secondary"}`}>
            {value2}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */

export default function ChampionCompare({ champions }: ChampionCompareProps) {
  const [champion1, setChampion1] = useState<string | null>(null);
  const [champion2, setChampion2] = useState<string | null>(null);
  const [data1, setData1] = useState<ChampionFullData | null>(null);
  const [data2, setData2] = useState<ChampionFullData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchChampion = useCallback(async (id: string): Promise<ChampionFullData | null> => {
    try {
      const res = await fetch(`/api/champion/${id}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.champion as ChampionFullData;
    } catch {
      return null;
    }
  }, []);

  const handleSelect1 = useCallback(
    async (id: string) => {
      setChampion1(id);
      setLoading(true);
      const data = await fetchChampion(id);
      setData1(data);
      setLoading(false);
    },
    [fetchChampion],
  );

  const handleSelect2 = useCallback(
    async (id: string) => {
      setChampion2(id);
      setLoading(true);
      const data = await fetchChampion(id);
      setData2(data);
      setLoading(false);
    },
    [fetchChampion],
  );

  // Compute max values for bar scaling
  const statMaxValues = useMemo(() => {
    if (!data1 || !data2) return {} as Record<string, number>;
    const maxes: Record<string, number> = {};
    for (const stat of BASE_STATS) {
      maxes[stat.key] = Math.max(data1.stats[stat.key], data2.stats[stat.key]) * 1.1;
    }
    return maxes;
  }, [data1, data2]);

  const bothLoaded = data1 && data2;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">Champion Comparison</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Select two champions to compare their stats side by side.
        </p>
      </div>

      {/* Champion Selectors */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="w-full sm:flex-1">
          <ChampionSelector
            champions={champions}
            selected={champion1}
            onSelect={handleSelect1}
            label="Champion 1"
          />
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-theme bg-bg-card text-lg font-bold text-text-secondary">
          vs
        </div>

        <div className="w-full sm:flex-1">
          <ChampionSelector
            champions={champions}
            selected={champion2}
            onSelect={handleSelect2}
            label="Champion 2"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}

      {/* Champion Headers */}
      {bothLoaded && !loading && (
        <>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            {/* Champion 1 Header */}
            <div className="flex items-center gap-3">
              <Image
                src={getChampionIconUrl(data1.id)}
                alt={data1.name}
                width={64}
                height={64}
                className="rounded-lg border-2 border-blue-500"
              />
              <div>
                <h2 className="text-lg font-bold text-blue-400">{data1.name}</h2>
                <p className="text-xs text-text-muted">{data1.title}</p>
              </div>
            </div>

            {/* Champion 2 Header */}
            <div className="flex items-center gap-3 sm:flex-row-reverse sm:text-right">
              <Image
                src={getChampionIconUrl(data2.id)}
                alt={data2.name}
                width={64}
                height={64}
                className="rounded-lg border-2 border-red-500"
              />
              <div>
                <h2 className="text-lg font-bold text-red-400">{data2.name}</h2>
                <p className="text-xs text-text-muted">{data2.title}</p>
              </div>
            </div>
          </div>

          {/* Base Stats Section */}
          <section className="rounded-xl border border-border-theme bg-bg-card p-4 sm:p-6">
            <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Base Stats
            </h3>
            <div className="space-y-3">
              {BASE_STATS.map((stat) => (
                <ComparisonBar
                  key={stat.key}
                  label={stat.label}
                  value1={data1.stats[stat.key]}
                  value2={data2.stats[stat.key]}
                  perLevel1={stat.perLevelKey ? data1.stats[stat.perLevelKey] : undefined}
                  perLevel2={stat.perLevelKey ? data2.stats[stat.perLevelKey] : undefined}
                  format={stat.format}
                  maxValue={statMaxValues[stat.key] ?? 1}
                />
              ))}
            </div>
          </section>

          {/* Info Ratings Section */}
          <section className="rounded-xl border border-border-theme bg-bg-card p-4 sm:p-6">
            <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Info Ratings
            </h3>
            <div className="space-y-3">
              {INFO_STATS.map((stat) => (
                <InfoBar
                  key={stat.key}
                  label={stat.label}
                  value1={data1.info[stat.key]}
                  value2={data2.info[stat.key]}
                />
              ))}
            </div>
          </section>

          {/* Tags & Roles Section */}
          <section className="rounded-xl border border-border-theme bg-bg-card p-4 sm:p-6">
            <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Tags & Roles
            </h3>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 text-center">
                <p className="mb-2 text-sm font-medium text-blue-400">{data1.name}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {data1.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hidden w-px bg-border-theme sm:block" />
              <div className="border-t border-border-theme sm:hidden" />
              <div className="flex-1 text-center">
                <p className="mb-2 text-sm font-medium text-red-400">{data2.name}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {data2.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Empty State */}
      {!bothLoaded && !loading && (
        <div className="rounded-xl border border-border-theme bg-bg-card p-12 text-center">
          <p className="text-text-muted">
            Select two champions above to compare their stats.
          </p>
        </div>
      )}
    </div>
  );
}
