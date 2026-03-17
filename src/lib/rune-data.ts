import runeData from "@/data/runes/runes.json";

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

/** Tree icon emoji/symbol lookup */
const TREE_SYMBOLS: Record<string, string> = {
  Precision: "\u2694",   // crossed swords
  Domination: "\uD83D\uDD25", // fire
  Sorcery: "\u2728",    // sparkles
  Resolve: "\uD83D\uDEE1", // shield
  Inspiration: "\uD83D\uDCA1", // light bulb
};

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

/** Get the emoji/symbol for a rune tree */
export function getTreeSymbol(tree: RuneTree): string {
  return TREE_SYMBOLS[tree.key] ?? "\u26AA";
}

/** Get stat shards */
export function getStatShards() {
  return runeData.statShards;
}
