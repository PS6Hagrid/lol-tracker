"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  type ChampionBuild,
  getItemImageUrl,
  getChampionImageUrl,
  getItemName,
} from "@/lib/build-data";

// ─── Constants ───────────────────────────────────────────────────────────────

const SKILL_COLORS: Record<string, string> = {
  Q: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  W: "bg-green-500/20 text-green-400 border-green-500/30",
  E: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  R: "bg-red-500/20 text-red-400 border-red-500/30",
};

const ROLE_COLORS: Record<string, string> = {
  top: "bg-red-500/20 text-red-400",
  jungle: "bg-green-500/20 text-green-400",
  mid: "bg-blue-500/20 text-blue-400",
  bot: "bg-yellow-500/20 text-yellow-400",
  support: "bg-purple-500/20 text-purple-400",
};

const ALL_ROLES = ["all", "top", "jungle", "mid", "bot", "support"] as const;

// ─── Sub-components ──────────────────────────────────────────────────────────

function ItemIcon({ itemId }: { itemId: number }) {
  const name = getItemName(itemId);
  return (
    <div className="group relative">
      <div className="h-10 w-10 overflow-hidden rounded border border-border-theme transition-all duration-200 hover:scale-110 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10">
        <Image
          src={getItemImageUrl(itemId)}
          alt={name}
          width={40}
          height={40}
          sizes="40px"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {name}
      </div>
    </div>
  );
}

function ItemSection({
  label,
  itemIds,
}: {
  label: string;
  itemIds: number[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {itemIds.map((id, idx) => (
          <ItemIcon key={`${id}-${idx}`} itemId={id} />
        ))}
      </div>
    </div>
  );
}

function WinRateIndicator({ winRate }: { winRate: number }) {
  const color =
    winRate >= 52
      ? "text-green-400"
      : winRate >= 50
        ? "text-cyan-400"
        : "text-yellow-400";
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-text-muted">
        WR
      </span>
      <span className={`text-sm font-bold ${color}`}>{winRate.toFixed(1)}%</span>
    </div>
  );
}

function PickRateIndicator({ pickRate }: { pickRate: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-text-muted">
        PR
      </span>
      <span className="text-sm font-bold text-text-primary">
        {pickRate.toFixed(1)}%
      </span>
    </div>
  );
}

// ─── Build Card ──────────────────────────────────────────────────────────────

function BuildCard({ build }: { build: ChampionBuild }) {
  return (
    <div className="rounded-lg border border-border-theme bg-bg-card p-5 transition-all duration-200 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5">
      {/* Champion header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border-theme">
          <Image
            src={getChampionImageUrl(build.championId)}
            alt={build.championName}
            width={56}
            height={56}
            sizes="56px"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-text-primary">
            {build.championName}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${ROLE_COLORS[build.role] ?? "bg-gray-500/20 text-gray-400"}`}
            >
              {build.role}
            </span>
            <WinRateIndicator winRate={build.winRate} />
            <PickRateIndicator pickRate={build.pickRate} />
          </div>
        </div>
      </div>

      {/* Build path */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ItemSection label="Starting" itemIds={build.startingItems} />
        <ItemSection label="Core Build" itemIds={build.coreItems} />
        <ItemSection label="Boots" itemIds={[build.boots]} />
        <ItemSection label="Situational" itemIds={build.situationalItems} />
      </div>

      {/* Skill order */}
      <div className="mb-3">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Skill Order (Lv 1-6)
        </span>
        <div className="flex gap-1">
          {build.skillOrder.map((skill, idx) => (
            <div
              key={idx}
              className={`flex h-7 w-7 items-center justify-center rounded border text-xs font-bold ${SKILL_COLORS[skill] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}
            >
              {skill}
            </div>
          ))}
        </div>
      </div>

      {/* Runes & Summoner Spells */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border-theme pt-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-text-muted">
            Keystone
          </span>
          <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold text-yellow-400">
            {build.runeKeystone}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-text-muted">
            Spells
          </span>
          <div className="flex gap-1">
            {build.summonerSpells.map((spell) => (
              <span
                key={spell}
                className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400"
              >
                {spell}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BuildRecommender({
  builds,
}: {
  builds: ChampionBuild[];
}) {
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState<string>("all");

  const filtered = useMemo(() => {
    let result = builds;
    if (activeRole !== "all") {
      result = result.filter((b) => b.role === activeRole);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.championName.toLowerCase().includes(q) ||
          b.role.toLowerCase().includes(q) ||
          b.runeKeystone.toLowerCase().includes(q)
      );
    }
    return result;
  }, [builds, search, activeRole]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">
          Build Recommender
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Recommended builds, runes, and skill orders for popular champions.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Role tabs */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                activeRole === role
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-bg-card text-text-muted hover:bg-bg-card/80 hover:text-text-primary"
              }`}
            >
              {role === "all" ? "All Roles" : role}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search champion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-border-theme bg-bg-card pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 sm:w-56"
          />
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-border-theme bg-bg-card">
          <p className="text-sm text-text-muted">
            No builds found. Try a different search or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((build) => (
            <BuildCard key={build.championId} build={build} />
          ))}
        </div>
      )}
    </div>
  );
}
