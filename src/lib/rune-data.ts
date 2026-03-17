import runeData from "@/data/runes/runes.json";

const DDRAGON_CDN = "https://ddragon.leagueoflegends.com/cdn/img";

export interface RuneInfo {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface RuneSlot {
  row: number;
  runes: RuneInfo[];
}

export interface RuneTree {
  id: number;
  key: string;
  name: string;
  icon: string;
  color: string;
  slots: RuneSlot[];
}

export interface StatShard {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface RuneDataSet {
  trees: RuneTree[];
  statShards: {
    offense: StatShard[];
    flex: StatShard[];
    defense: StatShard[];
  };
}

/** Get the full rune data set */
export function getRuneData(): RuneDataSet {
  return runeData as RuneDataSet;
}

/** Get all rune trees */
export function getRuneTrees(): RuneTree[] {
  return runeData.trees as RuneTree[];
}

/** Get a specific rune tree by ID */
export function getRuneTreeById(id: number): RuneTree | undefined {
  return (runeData.trees as RuneTree[]).find((t) => t.id === id);
}

/** Get the DDragon CDN URL for a rune icon */
export function getRuneIconUrl(iconPath: string): string {
  return `${DDRAGON_CDN}/${iconPath}`;
}

/** Get the DDragon CDN URL for a rune tree icon */
export function getTreeIconUrl(tree: RuneTree): string {
  return `${DDRAGON_CDN}/${tree.icon}`;
}

/** Get stat shards */
export function getStatShards() {
  return runeData.statShards;
}
