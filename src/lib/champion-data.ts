import { DDRAGON_BASE_URL, getLatestGameVersion } from "@/lib/constants";
import tierConfig from "@/data/tiers/patch-14.24.json";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChampionTier = "S" | "A" | "B" | "C" | "D";
export type Lane = "top" | "jungle" | "mid" | "bot" | "support";

export interface ChampionMeta {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  difficulty: number;
  iconUrl: string;
  tier: ChampionTier;
  roles: Lane[];
}

interface DDragonChampion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  info: { difficulty: number };
}

interface DDragonResponse {
  data: Record<string, DDragonChampion>;
}

// ─── Data Fetching ───────────────────────────────────────────────────────────

/**
 * Fetch all champion data from DDragon and merge with tier config.
 * Intended to be called from a server component (cached via fetch revalidate).
 */
export async function getChampionTierList(): Promise<ChampionMeta[]> {
  const version = await getLatestGameVersion();

  const res = await fetch(
    `${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion.json`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch DDragon champions: ${res.status}`);
  }

  const data: DDragonResponse = await res.json();
  const tiers = tierConfig.tiers as Record<
    string,
    { tier: string; roles: string[] }
  >;

  return Object.values(data.data).map((champ) => {
    const tierEntry = tiers[champ.id];
    return {
      id: champ.id,
      key: champ.key,
      name: champ.name,
      title: champ.title,
      tags: champ.tags,
      difficulty: champ.info.difficulty,
      iconUrl: `${DDRAGON_BASE_URL}/cdn/${version}/img/champion/${champ.id}.png`,
      tier: (tierEntry?.tier as ChampionTier) ?? "C",
      roles: (tierEntry?.roles as Lane[]) ?? [],
    };
  });
}

// ─── Display Config ──────────────────────────────────────────────────────────

export const TIER_CONFIG: Record<
  ChampionTier,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  S: {
    label: "S",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30",
  },
  A: {
    label: "A",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
  },
  B: {
    label: "B",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/30",
  },
  C: {
    label: "C",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/30",
  },
  D: {
    label: "D",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30",
  },
};

export const LANE_CONFIG: Record<Lane, { label: string; emoji: string }> = {
  top: { label: "Top", emoji: "🛡️" },
  jungle: { label: "Jungle", emoji: "🌿" },
  mid: { label: "Mid", emoji: "⚡" },
  bot: { label: "Bot", emoji: "🏹" },
  support: { label: "Support", emoji: "💚" },
};

export const TIER_ORDER: ChampionTier[] = ["S", "A", "B", "C", "D"];
