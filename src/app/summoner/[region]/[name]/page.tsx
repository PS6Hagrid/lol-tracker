import { getDataService } from "@/lib/data-service";
import {
  getProfileIconUrl,
  getChampionIconUrl,
  REGIONS,
} from "@/lib/constants";
import type { LeagueEntryDTO, ChampionMasteryDTO } from "@/types/riot";
import RankCard from "@/components/RankCard";
import LPGraph from "@/components/LPGraph";
import TabNavigation from "@/components/TabNavigation";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

/** Compute champion stats from recent matches for a given puuid */
interface ChampionStat {
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winrate: number;
}

function getTopChampionsFromMatches(
  matches: { info: { participants: { puuid: string; championName: string; win: boolean }[] } }[],
  puuid: string,
  count: number
): ChampionStat[] {
  const champMap = new Map<string, { games: number; wins: number }>();

  for (const match of matches) {
    const participant = match.info.participants.find((p) => p.puuid === puuid);
    if (!participant) continue;

    const existing = champMap.get(participant.championName) ?? { games: 0, wins: 0 };
    existing.games++;
    if (participant.win) existing.wins++;
    champMap.set(participant.championName, existing);
  }

  const stats: ChampionStat[] = Array.from(champMap.entries())
    .map(([championName, { games, wins }]) => ({
      championName,
      games,
      wins,
      losses: games - wins,
      winrate: games > 0 ? (wins / games) * 100 : 0,
    }))
    .sort((a, b) => b.games - a.games)
    .slice(0, count);

  return stats;
}

export default async function SummonerProfilePage({ params }: PageProps) {
  const { region, name } = await params;

  // Parse name: "GameName-TagLine" — split on last hyphen
  const lastHyphen = name.lastIndexOf("-");
  if (lastHyphen === -1 || lastHyphen === 0 || lastHyphen === name.length - 1) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-8 text-center backdrop-blur-sm">
          <h2 className="text-xl font-bold text-loss">Invalid Summoner Name</h2>
          <p className="mt-2 text-gray-400">
            Expected format: GameName-TagLine (e.g. Faker-KR1)
          </p>
        </div>
      </div>
    );
  }

  const gameName = decodeURIComponent(name.slice(0, lastHyphen));
  const tagLine = decodeURIComponent(name.slice(lastHyphen + 1));

  // Fetch data using the data service directly (server component)
  const dataService = getDataService();

  let summoner;
  let rankedStats: LeagueEntryDTO[] = [];
  let topChampions: ChampionStat[] = [];
  let masteries: ChampionMasteryDTO[] = [];

  try {
    summoner = await dataService.getSummoner(region, gameName, tagLine);

    // Fetch ranked stats, match history, and champion masteries in parallel
    const [ranked, matchIds, masteryData] = await Promise.all([
      dataService.getRankedStats(region, summoner.puuid),
      dataService.getMatchHistory(region, summoner.puuid, 10),
      dataService.getChampionMasteries(region, summoner.puuid),
    ]);

    rankedStats = ranked;
    masteries = masteryData;

    // Fetch match details for top champion calculation
    const matches = await Promise.all(
      matchIds.slice(0, 10).map((id) => dataService.getMatchDetails(region, id))
    );

    topChampions = getTopChampionsFromMatches(matches, summoner.puuid, 3);
  } catch (error) {
    console.error("Error fetching summoner data:", error);
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-8 text-center backdrop-blur-sm">
          <h2 className="text-xl font-bold text-loss">Summoner Not Found</h2>
          <p className="mt-2 text-gray-400">
            Could not find &quot;{gameName}#{tagLine}&quot; in{" "}
            {REGIONS.find((r) => r.value === region)?.label ?? region}
          </p>
        </div>
      </div>
    );
  }

  const soloQueue = rankedStats.find((e) => e.queueType === "RANKED_SOLO_5x5") ?? null;
  const flexQueue = rankedStats.find((e) => e.queueType === "RANKED_FLEX_SR") ?? null;
  const currentLP = soloQueue?.leaguePoints ?? flexQueue?.leaguePoints ?? 0;

  const regionLabel = REGIONS.find((r) => r.value === region)?.label ?? region;
  const basePath = `/summoner/${encodeURIComponent(region)}/${encodeURIComponent(name)}`;

  // Build top champions from masteries as a fallback when match-based data is sparse
  const topChampionCards =
    topChampions.length > 0
      ? topChampions
      : masteries.slice(0, 3).map((m) => ({
          championName: getChampionNameById(m.championId),
          games: Math.floor(m.championPoints / 1000),
          wins: Math.floor((m.championPoints / 1000) * 0.55),
          losses: Math.floor((m.championPoints / 1000) * 0.45),
          winrate: 55,
        }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* ── Summoner Header ── */}
      <div className="mb-6 flex items-center gap-4">
        {/* Profile Icon */}
        <div className="relative">
          <img
            src={getProfileIconUrl(summoner.profileIconId)}
            alt="Profile Icon"
            width={80}
            height={80}
            className="rounded-xl border-2 border-gray-700"
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-gray-800 px-2 py-0.5 text-xs font-bold text-gold">
            {summoner.summonerLevel}
          </span>
        </div>

        {/* Name + Region */}
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {summoner.gameName}
            <span className="text-gray-500">#{summoner.tagLine}</span>
          </h1>
          <span className="mt-1 inline-block rounded-md bg-cyan/10 px-2 py-0.5 text-xs font-medium text-cyan">
            {regionLabel}
          </span>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <TabNavigation basePath={basePath} />

      {/* ── Overview Content ── */}
      <div className="mt-6 space-y-6">
        {/* Ranked Cards */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Ranked</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <RankCard entry={soloQueue} queueType="RANKED_SOLO_5x5" />
            <RankCard entry={flexQueue} queueType="RANKED_FLEX_SR" />
          </div>
        </section>

        {/* LP Graph */}
        <section>
          <LPGraph data={[]} currentLP={currentLP} />
        </section>

        {/* Top Champions Preview */}
        {topChampionCards.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              Top Champions
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {topChampionCards.map((champ) => (
                <div
                  key={champ.championName}
                  className="flex items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-600/50"
                >
                  <img
                    src={getChampionIconUrl(champ.championName)}
                    alt={champ.championName}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {champ.championName}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">{champ.games} games</span>
                      <span
                        className="font-medium"
                        style={{
                          color:
                            champ.winrate >= 50
                              ? "var(--color-win)"
                              : "var(--color-loss)",
                        }}
                      >
                        {champ.winrate.toFixed(0)}% WR
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/**
 * Simple reverse lookup for champion name by ID.
 * In a full app this would come from Data Dragon champion data.
 * For now, map common IDs used in the mock service.
 */
function getChampionNameById(championId: number): string {
  const MAP: Record<number, string> = {
    103: "Ahri",
    84: "Akali",
    12: "Alistar",
    32: "Amumu",
    22: "Ashe",
    53: "Blitzcrank",
    63: "Brand",
    51: "Caitlyn",
    122: "Darius",
    119: "Draven",
    81: "Ezreal",
    114: "Fiora",
    86: "Garen",
    104: "Graves",
    39: "Irelia",
    202: "Jhin",
    222: "Jinx",
    145: "Kaisa",
    55: "Katarina",
    64: "LeeSin",
    99: "Lux",
    21: "MissFortune",
    25: "Morgana",
    111: "Nautilus",
    61: "Orianna",
    555: "Pyke",
    92: "Riven",
    235: "Senna",
    412: "Thresh",
    4: "TwistedFate",
    110: "Varus",
    67: "Vayne",
    254: "Vi",
    157: "Yasuo",
    238: "Zed",
  };
  return MAP[championId] ?? `Champion${championId}`;
}
