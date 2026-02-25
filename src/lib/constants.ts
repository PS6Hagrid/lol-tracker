// ─── League of Legends Constants ─────────────────────────────────────────────

/** Data Dragon CDN base URL */
export const DDRAGON_BASE_URL = "https://ddragon.leagueoflegends.com";

/** Current game version for Data Dragon assets */
export const GAME_VERSION = "14.24.1";

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
