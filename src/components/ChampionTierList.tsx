"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ChampionMeta, ChampionTier, Lane } from "@/lib/champion-data";
import { TIER_CONFIG, LANE_CONFIG, TIER_ORDER } from "@/lib/champion-data";

interface ChampionTierListProps {
  champions: ChampionMeta[];
  patch: string;
}

const TIER_DESCRIPTIONS: Record<ChampionTier, string> = {
  S: "Meta Dominators",
  A: "Strong Picks",
  B: "Solid Choices",
  C: "Situational",
  D: "Weak / Niche",
};

const TIER_SECTION_BORDER: Record<ChampionTier, string> = {
  S: "border-yellow-500",
  A: "border-blue-500",
  B: "border-green-500",
  C: "border-gray-500",
  D: "border-red-500",
};

const TIER_HOVER_BORDER: Record<ChampionTier, string> = {
  S: "hover:border-yellow-500/60",
  A: "hover:border-blue-500/60",
  B: "hover:border-green-500/60",
  C: "hover:border-gray-500/60",
  D: "hover:border-red-500/60",
};

const ALL_LANES: Lane[] = ["top", "jungle", "mid", "bot", "support"];

export default function ChampionTierList({
  champions,
  patch,
}: ChampionTierListProps) {
  const [lane, setLane] = useState<Lane | "all">("all");
  const [tierFilter, setTierFilter] = useState<ChampionTier | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"tier" | "name">("tier");

  const filtered = useMemo(() => {
    let result = champions;

    if (lane !== "all") {
      result = result.filter((c) => c.roles.includes(lane));
    }

    if (tierFilter !== "all") {
      result = result.filter((c) => c.tier === tierFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    if (sort === "tier") {
      result = [...result].sort((a, b) => {
        const tierDiff = TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
        if (tierDiff !== 0) return tierDiff;
        return a.name.localeCompare(b.name);
      });
    } else {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [champions, lane, tierFilter, search, sort]);

  const grouped = useMemo(() => {
    if (sort !== "tier") return null;
    const groups: Partial<Record<ChampionTier, ChampionMeta[]>> = {};
    for (const champ of filtered) {
      if (!groups[champ.tier]) groups[champ.tier] = [];
      groups[champ.tier]!.push(champ);
    }
    return groups;
  }, [filtered, sort]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <h1 className="text-xl font-bold text-gray-100 sm:text-2xl">Champion Tier List</h1>
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
          Patch {patch}
        </span>
      </div>

      {/* Lane Tabs */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Lane filter">
        <button
          role="tab"
          aria-selected={lane === "all"}
          onClick={() => setLane("all")}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
            lane === "all"
              ? "bg-blue-500 text-white"
              : "border border-gray-700/50 bg-[#111827] text-gray-400 hover:text-gray-200"
          }`}
        >
          All
        </button>
        {ALL_LANES.map((l) => (
          <button
            key={l}
            role="tab"
            aria-selected={lane === l}
            onClick={() => setLane(l)}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
              lane === l
                ? "bg-blue-500 text-white"
                : "border border-gray-700/50 bg-[#111827] text-gray-400 hover:text-gray-200"
            }`}
          >
            {LANE_CONFIG[l].emoji} {LANE_CONFIG[l].label}
          </button>
        ))}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Tier Dropdown */}
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as ChampionTier | "all")}
          className="rounded-lg border border-gray-700/50 bg-[#111827] px-3 py-2 text-sm text-gray-300 outline-none focus:border-blue-500"
        >
          <option value="all">All Tiers</option>
          {TIER_ORDER.map((t) => (
            <option key={t} value={t}>
              {t} Tier
            </option>
          ))}
        </select>

        {/* Search Input */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search champions..."
          aria-label="Search champions"
          className="w-full rounded-lg border border-gray-700/50 bg-[#111827] px-3 py-2 text-sm text-gray-300 outline-none placeholder:text-gray-600 focus:border-blue-500 sm:w-auto"
        />

        {/* Sort Toggle */}
        <div className="flex overflow-hidden rounded-lg border border-gray-700/50" role="group" aria-label="Sort order">
          <button
            onClick={() => setSort("tier")}
            aria-pressed={sort === "tier"}
            className={`px-3 py-2 text-sm font-medium transition ${
              sort === "tier"
                ? "bg-blue-500 text-white"
                : "bg-[#111827] text-gray-400 hover:text-gray-200"
            }`}
          >
            By Tier
          </button>
          <button
            onClick={() => setSort("name")}
            aria-pressed={sort === "name"}
            className={`px-3 py-2 text-sm font-medium transition ${
              sort === "name"
                ? "bg-blue-500 text-white"
                : "bg-[#111827] text-gray-400 hover:text-gray-200"
            }`}
          >
            By Name
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-400">
        Showing {filtered.length} of {champions.length} champions
      </p>

      {/* Champion List */}
      {sort === "tier" && grouped ? (
        <div className="space-y-6">
          {TIER_ORDER.map((tier) => {
            const champs = grouped[tier];
            if (!champs || champs.length === 0) return null;
            return (
              <section key={tier} role="region" aria-label={`${tier} Tier - ${TIER_DESCRIPTIONS[tier]}`}>
                <div
                  className={`mb-3 flex flex-wrap items-center gap-1.5 border-l-4 sm:gap-3 ${TIER_SECTION_BORDER[tier]} pl-3`}
                >
                  <span
                    className={`text-base font-bold sm:text-lg ${TIER_CONFIG[tier].color}`}
                  >
                    {tier} Tier
                  </span>
                  <span className="hidden text-sm text-gray-500 sm:inline">
                    &mdash; {TIER_DESCRIPTIONS[tier]}
                  </span>
                  <span className="text-xs text-gray-600">
                    ({champs.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {champs.map((champ) => (
                    <ChampionCard key={champ.id} champion={champ} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((champ) => (
            <ChampionCard key={champ.id} champion={champ} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChampionCard({ champion }: { champion: ChampionMeta }) {
  const tierCfg = TIER_CONFIG[champion.tier];

  return (
    <Link
      href={`/champions/${champion.id}`}
      className={`flex items-center gap-3 rounded-xl border border-gray-700/50 bg-[#111827] p-3 transition hover:scale-[1.02] ${TIER_HOVER_BORDER[champion.tier]}`}
    >
      <Image
        src={champion.iconUrl}
        alt={champion.name}
        width={48}
        height={48}
        className="rounded-lg"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-100">{champion.name}</p>
        <p className="truncate text-xs text-gray-500">{champion.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {/* Tier Badge */}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${tierCfg.bgColor} ${tierCfg.color}`}
          >
            {tierCfg.label}
          </span>

          {/* Role Emojis */}
          {champion.roles.map((role) => (
            <span key={role} className="text-xs" title={LANE_CONFIG[role].label}>
              {LANE_CONFIG[role].emoji}
            </span>
          ))}

          {/* Tags */}
          {champion.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-gray-700 px-1.5 py-0.5 text-[10px] text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
