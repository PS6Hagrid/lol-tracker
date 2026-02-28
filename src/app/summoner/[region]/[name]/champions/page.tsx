import { getDataService } from "@/lib/data-service";
import { REGIONS } from "@/lib/constants";
import TabNavigation from "@/components/TabNavigation";
import SummonerHeader from "@/components/SummonerHeader";
import UpdateButton from "@/components/UpdateButton";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import ChampionGrid from "@/components/ChampionGrid";
import type { ChampionStatRow } from "@/components/ChampionGrid";
import type { MatchDTO, ChampionMasteryDTO, LeagueEntryDTO } from "@/types/riot";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

/**
 * Map champion IDs to names. In a full app this would come from Data Dragon.
 * For mock data, we reverse-map from the commonly used IDs.
 */
const CHAMPION_ID_TO_NAME: Record<number, string> = {
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

function getChampionNameById(championId: number): string {
  return CHAMPION_ID_TO_NAME[championId] ?? `Champion${championId}`;
}

/**
 * Aggregate champion stats from match data and merge mastery info.
 */
function aggregateChampionStats(
  matches: MatchDTO[],
  summonerPuuid: string,
  masteries: ChampionMasteryDTO[],
): ChampionStatRow[] {
  const masteryMap = new Map<number, number>();
  for (const m of masteries) {
    masteryMap.set(m.championId, m.championLevel);
  }

  // Aggregate from match data
  const champMap = new Map<
    string,
    {
      championId: number;
      games: number;
      wins: number;
      totalKills: number;
      totalDeaths: number;
      totalAssists: number;
      totalCS: number;
      totalGold: number;
      totalDuration: number; // seconds
    }
  >();

  for (const match of matches) {
    const player =
      match.info.participants.find((p) => p.puuid === summonerPuuid) ??
      match.info.participants[0];

    const key = player.championName;
    const existing = champMap.get(key) ?? {
      championId: player.championId,
      games: 0,
      wins: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      totalCS: 0,
      totalGold: 0,
      totalDuration: 0,
    };

    existing.games++;
    if (player.win) existing.wins++;
    existing.totalKills += player.kills;
    existing.totalDeaths += player.deaths;
    existing.totalAssists += player.assists;
    existing.totalCS +=
      player.totalMinionsKilled + player.neutralMinionsKilled;
    existing.totalGold += player.goldEarned;
    existing.totalDuration += match.info.gameDuration;

    champMap.set(key, existing);
  }

  const rows: ChampionStatRow[] = [];

  for (const [championName, data] of champMap.entries()) {
    const totalMinutes = data.totalDuration / 60;
    const avgKDA =
      data.totalDeaths === 0
        ? Infinity
        : (data.totalKills + data.totalAssists) / data.totalDeaths;

    rows.push({
      championName,
      championId: data.championId,
      gamesPlayed: data.games,
      wins: data.wins,
      losses: data.games - data.wins,
      winrate: data.games > 0 ? (data.wins / data.games) * 100 : 0,
      avgKills: data.games > 0 ? data.totalKills / data.games : 0,
      avgDeaths: data.games > 0 ? data.totalDeaths / data.games : 0,
      avgAssists: data.games > 0 ? data.totalAssists / data.games : 0,
      avgKDA,
      avgCSPerMin: totalMinutes > 0 ? data.totalCS / totalMinutes : 0,
      avgGoldPerMin: totalMinutes > 0 ? data.totalGold / totalMinutes : 0,
      masteryLevel: masteryMap.get(data.championId) ?? 0,
    });
  }

  // If no match-based data, use mastery data as fallback
  if (rows.length === 0) {
    for (const m of masteries) {
      const name = getChampionNameById(m.championId);
      rows.push({
        championName: name,
        championId: m.championId,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winrate: 0,
        avgKills: 0,
        avgDeaths: 0,
        avgAssists: 0,
        avgKDA: 0,
        avgCSPerMin: 0,
        avgGoldPerMin: 0,
        masteryLevel: m.championLevel,
      });
    }
  } else {
    // Merge mastery data for champions that appear in masteries but not in recent matches
    for (const m of masteries) {
      const name = getChampionNameById(m.championId);
      const existing = rows.find((r) => r.championId === m.championId);
      if (existing) {
        existing.masteryLevel = m.championLevel;
      }
    }
  }

  return rows;
}

export default async function ChampionsPage({ params }: PageProps) {
  const { region, name } = await params;

  // Parse name
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

  const dataService = await getDataService();

  let summoner;
  let championRows: ChampionStatRow[] = [];
  let rankedStats: LeagueEntryDTO[] = [];

  try {
    summoner = await dataService.getSummoner(region, gameName, tagLine);

    // Fetch match history, champion masteries, and ranked stats in parallel
    const [matchIds, masteries, ranked] = await Promise.all([
      dataService.getMatchHistory(region, summoner.puuid, 20),
      dataService.getChampionMasteries(region, summoner.puuid),
      dataService.getRankedStats(region, summoner.puuid),
    ]);

    rankedStats = ranked;

    // Fetch match details — uses DB cache for known matches, API for new ones
    const matches: MatchDTO[] = dataService.getMatchDetailsBatch
      ? await dataService.getMatchDetailsBatch(region, matchIds)
      : await Promise.all(matchIds.map((id) => dataService.getMatchDetails(region, id)));

    championRows = aggregateChampionStats(matches, summoner.puuid, masteries);
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

  const regionLabel = REGIONS.find((r) => r.value === region)?.label ?? region;
  const basePath = `/summoner/${region}/${name}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Summoner Header */}
      <SummonerHeader
        summoner={summoner}
        regionLabel={regionLabel}
        rankedStats={rankedStats}
        actions={
          <div className="flex items-center gap-1.5">
            <UpdateButton region={region} name={name} />
            <FavoriteButton gameName={summoner.gameName} tagLine={summoner.tagLine} region={region} profileIconId={summoner.profileIconId} />
            <ShareButton />
          </div>
        }
      />

      {/* Tab Navigation */}
      <TabNavigation basePath={basePath} />

      {/* Champions Content */}
      <div className="animate-stagger mt-6 space-y-6">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Champion Performance
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            Stats aggregated from recent {championRows.length > 0 ? "matches" : "data"}.
            Click column headers to sort.
          </p>
          <ChampionGrid champions={championRows} />
        </section>
      </div>
    </div>
  );
}
