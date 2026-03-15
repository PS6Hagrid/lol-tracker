"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ChampionDetail } from "@/lib/champion-detail";
import { TIER_CONFIG, LANE_CONFIG } from "@/lib/champion-data";
import type { Lane } from "@/lib/champion-data";
import { DDRAGON_BASE_URL } from "@/lib/constants";

interface ChampionDetailViewProps {
  champion: ChampionDetail;
}

const ABILITY_KEYS = ["P", "Q", "W", "E", "R"] as const;

export default function ChampionDetailView({
  champion,
}: ChampionDetailViewProps) {
  const [selectedAbility, setSelectedAbility] = useState<number>(0);
  const tierCfg = TIER_CONFIG[champion.tier];

  const splashUrl = `${DDRAGON_BASE_URL}/cdn/img/champion/splash/${champion.id}_0.jpg`;

  // Build ability data: passive + 4 spells
  const abilities = [
    {
      key: "P" as const,
      name: champion.passive.name,
      description: champion.passive.description,
      iconUrl: `${DDRAGON_BASE_URL}/cdn/${champion.version}/img/passive/${champion.passive.image.full}`,
      cooldown: null as string | null,
      cost: null as string | null,
      range: null as string | null,
    },
    ...champion.spells.map((spell, i) => ({
      key: ABILITY_KEYS[i + 1],
      name: spell.name,
      description: spell.description,
      iconUrl: `${DDRAGON_BASE_URL}/cdn/${champion.version}/img/spell/${spell.image.full}`,
      cooldown: spell.cooldownBurn,
      cost: spell.costBurn,
      range: spell.rangeBurn,
    })),
  ];

  const active = abilities[selectedAbility];

  const statBars: { label: string; value: number }[] = [
    { label: "Attack", value: champion.info.attack },
    { label: "Defense", value: champion.info.defense },
    { label: "Magic", value: champion.info.magic },
    { label: "Difficulty", value: champion.info.difficulty },
  ];

  const hasTips =
    champion.allytips.length > 0 || champion.enemytips.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      {/* Hero Section */}
      <div className="relative h-[420px] w-full overflow-hidden">
        <Image
          src={splashUrl}
          alt={`${champion.name} splash art`}
          fill
          className="object-cover object-top"
          unoptimized
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/60 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="mx-auto flex max-w-7xl items-end gap-5">
            {/* Back link */}
            <Link
              href="/champions"
              className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg bg-[#0a0e17]/70 px-3 py-1.5 text-sm text-gray-300 backdrop-blur transition hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Champions
            </Link>

            {/* Champion icon */}
            <Image
              src={`${DDRAGON_BASE_URL}/cdn/${champion.version}/img/champion/${champion.id}.png`}
              alt={champion.name}
              width={64}
              height={64}
              className="rounded-lg border-2 border-gray-700/50"
              unoptimized
            />

            <div className="flex flex-col gap-1.5">
              <h1 className="text-3xl font-bold text-gray-100">
                {champion.name}
              </h1>
              <p className="text-lg text-gray-400">{champion.title}</p>
              <div className="flex flex-wrap items-center gap-2">
                {/* Tier badge */}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tierCfg.bgColor} ${tierCfg.color} border ${tierCfg.borderColor}`}
                >
                  {tierCfg.label} Tier
                </span>

                {/* Role pills */}
                {champion.roles.map((role) => {
                  const cfg = LANE_CONFIG[role as Lane];
                  return (
                    <span
                      key={role}
                      className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs text-blue-400"
                    >
                      {cfg?.emoji} {cfg?.label}
                    </span>
                  );
                })}

                {/* Tag pills */}
                {champion.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-700/50 bg-gray-700/20 px-2.5 py-0.5 text-xs text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
        {/* Stats Bars */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statBars.map((stat) => (
            <div key={stat.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  {stat.label}
                </span>
                <span className="text-sm text-gray-500">{stat.value}/10</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700/50">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(stat.value / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Abilities Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-100">Abilities</h2>

          {/* Ability tabs */}
          <div className="flex gap-2">
            {abilities.map((ability, i) => (
              <button
                key={i}
                onClick={() => setSelectedAbility(i)}
                className={`relative flex h-14 w-14 items-center justify-center rounded-lg border transition ${
                  selectedAbility === i
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-gray-700/50 bg-[#111827] hover:border-gray-600"
                }`}
                title={`${ABILITY_KEYS[i]} - ${ability.name}`}
              >
                <Image
                  src={ability.iconUrl}
                  alt={ability.name}
                  width={48}
                  height={48}
                  className="rounded"
                  unoptimized
                />
                <span
                  className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                    selectedAbility === i
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {ABILITY_KEYS[i]}
                </span>
              </button>
            ))}
          </div>

          {/* Active ability details */}
          {active && (
            <div className="rounded-xl border border-gray-700/50 bg-[#111827] p-5">
              <div className="mb-3 flex items-center gap-3">
                <Image
                  src={active.iconUrl}
                  alt={active.name}
                  width={48}
                  height={48}
                  className="rounded"
                  unoptimized
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">
                    {active.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {ABILITY_KEYS[selectedAbility]}
                    {selectedAbility === 0 ? " - Passive" : " - Active"}
                  </span>
                </div>
              </div>

              {/* DDragon ability descriptions contain HTML tags from Riot's official CDN (not user content) */}
              <div
                className="text-sm leading-relaxed text-gray-300 [&_br]:mb-1 [&_span]:inline"
                dangerouslySetInnerHTML={{ __html: active.description }}
              />

              {active.cooldown && (
                <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-700/50 pt-3 text-sm">
                  {active.cooldown && active.cooldown !== "0" && (
                    <div>
                      <span className="text-gray-500">Cooldown: </span>
                      <span className="text-gray-300">{active.cooldown}s</span>
                    </div>
                  )}
                  {active.cost && active.cost !== "0" && (
                    <div>
                      <span className="text-gray-500">Cost: </span>
                      <span className="text-gray-300">{active.cost}</span>
                    </div>
                  )}
                  {active.range && active.range !== "0" && (
                    <div>
                      <span className="text-gray-500">Range: </span>
                      <span className="text-gray-300">{active.range}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Lore Section */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-100">Lore</h2>
          <p className="leading-relaxed text-gray-300">{champion.lore}</p>
        </section>

        {/* Tips Section */}
        {hasTips && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100">Tips</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {champion.allytips.length > 0 && (
                <div className="rounded-xl border border-gray-700/50 bg-[#111827] p-5">
                  <h3 className="mb-3 text-sm font-semibold text-green-400">
                    Playing As {champion.name}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {champion.allytips.map((tip, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500/60" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {champion.enemytips.length > 0 && (
                <div className="rounded-xl border border-gray-700/50 bg-[#111827] p-5">
                  <h3 className="mb-3 text-sm font-semibold text-red-400">
                    Playing Against {champion.name}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {champion.enemytips.map((tip, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/60" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Skins Gallery */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-100">
            Skins{" "}
            <span className="text-base font-normal text-gray-500">
              ({champion.skins.length})
            </span>
          </h2>
          <div className="flex snap-x gap-4 overflow-x-auto pb-4">
            {champion.skins.map((skin) => (
              <div key={skin.id} className="shrink-0 snap-start">
                <div className="relative h-40 w-72 overflow-hidden rounded-lg">
                  <Image
                    src={`${DDRAGON_BASE_URL}/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`}
                    alt={skin.name === "default" ? champion.name : skin.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  {skin.name === "default" ? "Classic" : skin.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
