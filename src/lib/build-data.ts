import { DDRAGON_BASE_URL, GAME_VERSION } from "./constants";
import buildsJson from "@/data/builds/recommended-builds.json";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChampionBuild {
  championId: string;
  championName: string;
  role: string;
  startingItems: number[];
  coreItems: number[];
  boots: number;
  situationalItems: number[];
  skillOrder: string[];
  skillMaxOrder: string[];
  runeKeystone: string;
  runeSecondary: string;
  summonerSpells: [string, string];
  winRate: number;
  pickRate: number;
}

// ─── Item name lookup (subset of commonly used items) ────────────────────────

const ITEM_NAMES: Record<number, string> = {
  // Starting items
  1036: "Long Sword",
  1054: "Doran's Shield",
  1055: "Doran's Blade",
  1056: "Doran's Ring",
  1103: "Scorchclaw Pup",
  2003: "Health Potion",
  3850: "Spellthief's Edge",
  3862: "Relic Shield",

  // Boots
  3006: "Berserker's Greaves",
  3009: "Boots of Swiftness",
  3020: "Sorcerer's Shoes",
  3047: "Plated Steelcaps",
  3111: "Mercury's Treads",
  3117: "Mobility Boots",
  3158: "Ionian Boots of Lucidity",

  // Core / Legendary items
  3004: "Manamune",
  3026: "Guardian Angel",
  3031: "Infinity Edge",
  3036: "Lord Dominik's Regards",
  3053: "Sterak's Gage",
  3071: "Black Cleaver",
  3078: "Trinity Force",
  3085: "Runaan's Hurricane",
  3089: "Rabadon's Deathcap",
  3091: "Wit's End",
  3094: "Rapid Firecannon",
  3102: "Banshee's Veil",
  3107: "Redemption",
  3109: "Knight's Vow",
  3115: "Nashor's Tooth",
  3116: "Rylai's Crystal Scepter",
  3118: "Malignance",
  3124: "Guinsoo's Rageblade",
  3135: "Void Staff",
  3139: "Mercurial Scimitar",
  3142: "Youmuu's Ghostblade",
  3143: "Randuin's Omen",
  3153: "Blade of the Ruined King",
  3156: "Maw of Malmortius",
  3157: "Zhonya's Hourglass",
  3190: "Locket of the Iron Solari",
  3222: "Mikael's Blessing",
  3508: "Essence Reaver",
  3742: "Dead Man's Plate",
  3814: "Edge of Night",
  4401: "Force of Nature",
  4629: "Cosmic Drive",
  6333: "Death's Dance",
  6630: "Goredrinker",
  6631: "Stridebreaker",
  6632: "Divine Sunderer",
  6655: "Luden's Tempest",
  6672: "Kraken Slayer",
  6673: "Immortal Shieldbow",
  6675: "Navori Flickerblade",
  6676: "The Collector",
  6693: "Prowler's Claw",
  6694: "Serylda's Grudge",
  6701: "Opportunity",
  2065: "Shurelya's Battlesong",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get item image URL from DDragon */
export function getItemImageUrl(itemId: number): string {
  return `${DDRAGON_BASE_URL}/cdn/${GAME_VERSION}/img/item/${itemId}.png`;
}

/** Get champion icon URL from DDragon */
export function getChampionImageUrl(championId: string): string {
  return `${DDRAGON_BASE_URL}/cdn/${GAME_VERSION}/img/champion/${championId}.png`;
}

/** Get a human-readable item name by ID */
export function getItemName(itemId: number): string {
  return ITEM_NAMES[itemId] ?? `Item ${itemId}`;
}

// ─── Data access ─────────────────────────────────────────────────────────────

/** Get all recommended builds */
export function getAllBuilds(): ChampionBuild[] {
  return buildsJson as ChampionBuild[];
}

/** Get builds filtered by role */
export function getBuildsByRole(role: string): ChampionBuild[] {
  return getAllBuilds().filter((b) => b.role === role);
}

/** Get build for a specific champion */
export function getBuildByChampion(championId: string): ChampionBuild | undefined {
  return getAllBuilds().find((b) => b.championId === championId);
}

/** Search builds by champion name (case-insensitive partial match) */
export function searchBuilds(query: string): ChampionBuild[] {
  if (!query.trim()) return getAllBuilds();
  const lower = query.toLowerCase();
  return getAllBuilds().filter(
    (b) =>
      b.championName.toLowerCase().includes(lower) ||
      b.role.toLowerCase().includes(lower)
  );
}

/** Get all unique roles from the build data */
export function getAvailableRoles(): string[] {
  const roles = new Set(getAllBuilds().map((b) => b.role));
  return Array.from(roles).sort();
}
