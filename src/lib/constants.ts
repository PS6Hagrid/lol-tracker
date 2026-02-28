// ─── League of Legends Constants ─────────────────────────────────────────────

/** Data Dragon CDN base URL */
export const DDRAGON_BASE_URL = "https://ddragon.leagueoflegends.com";

/** Fallback game version (used while fetching / in client components) */
export const GAME_VERSION = "14.24.1";

/** Cached latest game version from DDragon API */
let _cachedVersion: string | null = null;
let _cacheExpiry = 0;

/**
 * Get the latest game version from DDragon API.
 * Caches for 1 hour to minimise requests. Falls back to GAME_VERSION.
 */
export async function getLatestGameVersion(): Promise<string> {
  if (_cachedVersion && Date.now() < _cacheExpiry) return _cachedVersion;
  try {
    const res = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const versions: string[] = await res.json();
      _cachedVersion = versions[0] ?? GAME_VERSION;
      _cacheExpiry = Date.now() + 3_600_000;
      return _cachedVersion;
    }
  } catch { /* fall through */ }
  return _cachedVersion ?? GAME_VERSION;
}

/** Summoner Spell ID → name for DDragon icon URL */
export const SUMMONER_SPELLS: Record<number, string> = {
  1: "SummonerBoost",       // Cleanse
  3: "SummonerExhaust",     // Exhaust
  4: "SummonerFlash",       // Flash
  6: "SummonerHaste",       // Ghost
  7: "SummonerHeal",        // Heal
  11: "SummonerSmite",      // Smite
  12: "SummonerTeleport",   // Teleport
  14: "SummonerDot",        // Ignite
  21: "SummonerBarrier",    // Barrier
  32: "SummonerSnowball",   // Mark (ARAM)
};

/** Get summoner spell icon URL */
export function getSummonerSpellIconUrl(spellId: number): string {
  const name = SUMMONER_SPELLS[spellId] ?? "SummonerFlash";
  return `${DDRAGON_BASE_URL}/cdn/${GAME_VERSION}/img/spell/${name}.png`;
}

/** Rune style ID → Community Dragon icon path */
const RUNE_STYLE_ICONS: Record<number, string> = {
  8000: "7201_precision",
  8100: "7200_domination",
  8200: "7202_sorcery",
  8300: "7203_whimsy",
  8400: "7204_resolve",
};

/** Get rune style icon URL from Community Dragon */
export function getRuneStyleIconUrl(styleId: number): string {
  const path = RUNE_STYLE_ICONS[styleId];
  if (!path) return "";
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/${path}.png`;
}

/** All LoL regions with display labels */
export const REGIONS = [
  { label: "North America", value: "na1" },
  { label: "Europe West", value: "euw1" },
  { label: "Europe Nordic & East", value: "eun1" },
  { label: "Korea", value: "kr" },
  { label: "Japan", value: "jp1" },
  { label: "Brazil", value: "br1" },
  { label: "Latin America North", value: "la1" },
  { label: "Latin America South", value: "la2" },
  { label: "Oceania", value: "oc1" },
  { label: "Turkey", value: "tr1" },
  { label: "Russia", value: "ru" },
  { label: "Philippines", value: "ph2" },
  { label: "Singapore", value: "sg2" },
  { label: "Thailand", value: "th2" },
  { label: "Taiwan", value: "tw2" },
  { label: "Vietnam", value: "vn2" },
] as const;

/** Ranked tier ordering from lowest to highest */
export const RANKED_TIERS = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
] as const;

/** Queue type IDs to readable names */
export const QUEUE_TYPES: Record<string, string> = {
  RANKED_SOLO_5x5: "Ranked Solo/Duo",
  RANKED_FLEX_SR: "Ranked Flex",
  RANKED_TFT_DOUBLE_UP: "Teamfight Tactics (Double Up)",
};

/** Mapping from platform region to routing region for Riot API */
export const REGION_TO_ROUTING: Record<string, string> = {
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  euw1: "europe",
  eun1: "europe",
  tr1: "europe",
  ru: "europe",
  kr: "asia",
  jp1: "asia",
  oc1: "sea",
  ph2: "sea",
  sg2: "sea",
  th2: "sea",
  tw2: "sea",
  vn2: "sea",
};

/**
 * Get the champion square icon URL from Data Dragon.
 * @param championName - Internal champion name (e.g., "Ahri", "LeeSin", "MissFortune")
 */
export function getChampionIconUrl(championName: string): string {
  return `${DDRAGON_BASE_URL}/cdn/${GAME_VERSION}/img/champion/${championName}.png`;
}

/**
 * Get the item icon URL from Data Dragon.
 * @param itemId - Riot item ID (e.g., 3031)
 */
export function getItemIconUrl(itemId: number): string {
  return `${DDRAGON_BASE_URL}/cdn/${GAME_VERSION}/img/item/${itemId}.png`;
}

/**
 * Get the profile icon URL from Data Dragon.
 * @param iconId - Profile icon ID
 */
export function getProfileIconUrl(iconId: number): string {
  return `${DDRAGON_BASE_URL}/cdn/${GAME_VERSION}/img/profileicon/${iconId}.png`;
}

/**
 * Get the ranked emblem image URL from Community Dragon CDN.
 * @param tier - Tier name (e.g., "MASTER", "GOLD", "CHALLENGER")
 */
export function getRankEmblemUrl(tier: string): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${tier.toLowerCase()}.png`;
}
