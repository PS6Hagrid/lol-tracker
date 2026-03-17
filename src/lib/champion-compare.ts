import { DDRAGON_BASE_URL, getLatestGameVersion } from "@/lib/constants";

export interface ChampionFullData {
  id: string;
  name: string;
  title: string;
  lore: string;
  tags: string[];
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  stats: {
    hp: number;
    hpperlevel: number;
    mp: number;
    mpperlevel: number;
    armor: number;
    armorperlevel: number;
    spellblock: number;
    spellblockperlevel: number;
    attackdamage: number;
    attackdamageperlevel: number;
    attackspeed: number;
    attackspeedperlevel: number;
    movespeed: number;
    attackrange: number;
    hpregen: number;
    hpregenperlevel: number;
    mpregen: number;
    mpregenperlevel: number;
    crit: number;
    critperlevel: number;
  };
}

export async function getChampionFullData(championId: string): Promise<ChampionFullData> {
  const version = await getLatestGameVersion();
  const res = await fetch(
    `${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion/${championId}.json`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) throw new Error(`Failed to fetch champion ${championId}`);
  const data = await res.json();
  return data.data[championId] as ChampionFullData;
}

export async function getAllChampionNames(): Promise<{ id: string; name: string }[]> {
  const version = await getLatestGameVersion();
  const res = await fetch(
    `${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion.json`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) throw new Error("Failed to fetch champions");
  const data = await res.json();
  return Object.values(data.data as Record<string, { id: string; name: string }>)
    .map((c) => ({ id: c.id, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
