import { DDRAGON_BASE_URL, getLatestGameVersion } from "@/lib/constants";
import type { ChampionTier, Lane } from "@/lib/champion-data";
import tierConfig from "@/data/tiers/patch-14.24.json";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AbilityImage {
  full: string;
}

export interface ChampionPassive {
  name: string;
  description: string;
  image: AbilityImage;
}

export interface ChampionSpell {
  id: string;
  name: string;
  description: string;
  image: AbilityImage;
  cooldownBurn: string;
  costBurn: string;
  rangeBurn: string;
}

export interface ChampionSkin {
  id: string;
  num: number;
  name: string;
  chromas: boolean;
}

export interface ChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

export interface ChampionStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeed: number;
  attackspeedperlevel: number;
}

export interface ChampionDetail {
  id: string;
  key: string;
  name: string;
  title: string;
  lore: string;
  tags: string[];
  info: ChampionInfo;
  stats: ChampionStats;
  passive: ChampionPassive;
  spells: ChampionSpell[];
  skins: ChampionSkin[];
  allytips: string[];
  enemytips: string[];
  tier: ChampionTier;
  roles: Lane[];
  version: string;
}

// ─── DDragon Response Shape ──────────────────────────────────────────────────

interface DDragonDetailResponse {
  data: Record<
    string,
    {
      id: string;
      key: string;
      name: string;
      title: string;
      lore: string;
      tags: string[];
      info: ChampionInfo;
      stats: ChampionStats;
      passive: ChampionPassive;
      spells: ChampionSpell[];
      skins: ChampionSkin[];
      allytips: string[];
      enemytips: string[];
    }
  >;
}

// ─── Data Fetching ───────────────────────────────────────────────────────────

/**
 * Fetch detailed champion data from DDragon and merge with tier config.
 * Intended to be called from a server component.
 */
export async function getChampionDetail(
  championId: string,
): Promise<ChampionDetail> {
  const version = await getLatestGameVersion();

  const res = await fetch(
    `${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion/${championId}.json`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch champion detail for "${championId}": ${res.status}`,
    );
  }

  const json: DDragonDetailResponse = await res.json();
  const champ = Object.values(json.data)[0];

  if (!champ) {
    throw new Error(`No champion data found for "${championId}"`);
  }

  const tiers = tierConfig.tiers as Record<
    string,
    { tier: string; roles: string[] }
  >;
  const tierEntry = tiers[champ.id];

  return {
    id: champ.id,
    key: champ.key,
    name: champ.name,
    title: champ.title,
    lore: champ.lore,
    tags: champ.tags,
    info: champ.info,
    stats: champ.stats,
    passive: champ.passive,
    spells: champ.spells.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      image: s.image,
      cooldownBurn: s.cooldownBurn,
      costBurn: s.costBurn,
      rangeBurn: s.rangeBurn,
    })),
    skins: champ.skins.map((s) => ({
      id: s.id,
      num: s.num,
      name: s.name,
      chromas: s.chromas,
    })),
    allytips: champ.allytips,
    enemytips: champ.enemytips,
    tier: (tierEntry?.tier as ChampionTier) ?? "C",
    roles: (tierEntry?.roles as Lane[]) ?? [],
    version,
  };
}
