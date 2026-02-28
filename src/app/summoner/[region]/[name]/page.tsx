import type { Metadata } from "next";
import { getDataService } from "@/lib/data-service";
import { prisma } from "@/lib/db";
import {
  getChampionIconUrl,
  REGIONS,
} from "@/lib/constants";
import {
  RiotApiNotFoundError,
  RiotApiRateLimitError,
} from "@/lib/riot-api-service";
import type { LeagueEntryDTO, ChampionMasteryDTO } from "@/types/riot";
import RankCard from "@/components/RankCard";
import LPGraph from "@/components/LPGraph";
import TabNavigation from "@/components/TabNavigation";
import SummonerHeader from "@/components/SummonerHeader";
import UpdateButton from "@/components/UpdateButton";
import RecentPerformance from "@/components/RecentPerformance";
import RoleDistribution from "@/components/RoleDistribution";
import type { MatchDTO } from "@/types/riot";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region, name } = await params;
  const decodedName = decodeURIComponent(name);
  const lastHyphen = decodedName.lastIndexOf("-");
  const gameName = lastHyphen > 0 ? decodedName.slice(0, lastHyphen) : decodedName;
  const tagLine = lastHyphen > 0 ? decodedName.slice(lastHyphen + 1) : region.toUpperCase();
  const regionLabel = REGIONS.find((r) => r.value === region)?.label ?? region.toUpperCase();
  const title = `${gameName}#${tagLine}`;
  const description = `View stats, match history, and ranked progress for ${gameName}#${tagLine} on ${regionLabel}.`;
  return {
    title,
    description,
    openGraph: {
      title: `${title} — Trackerino`,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Trackerino`,
      description,
    },
  };
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
  const dataService = await getDataService();

  let summoner;
  let rankedStats: LeagueEntryDTO[] = [];
  let topChampions: ChampionStat[] = [];
  let masteries: ChampionMasteryDTO[] = [];
  let recentMatches: MatchDTO[] = [];

  try {
    summoner = await dataService.getSummoner(region, gameName, tagLine);

    // Persist summoner to DB for search autocomplete
    prisma.summoner.upsert({
      where: { gameName_tagLine_region: { gameName: summoner.gameName, tagLine: summoner.tagLine, region } },
      update: { puuid: summoner.puuid, profileIconId: summoner.profileIconId, summonerLevel: summoner.summonerLevel },
      create: { puuid: summoner.puuid, gameName: summoner.gameName, tagLine: summoner.tagLine, region, profileIconId: summoner.profileIconId, summonerLevel: summoner.summonerLevel },
    }).catch(() => {}); // Fire-and-forget, don't block page render

    // Fetch ranked stats, match history, and champion masteries in parallel
    const [ranked, matchIds, masteryData] = await Promise.all([
      dataService.getRankedStats(region, summoner.puuid),
      dataService.getMatchHistory(region, summoner.puuid, 10),
      dataService.getChampionMasteries(region, summoner.puuid),
    ]);

    rankedStats = ranked;
    masteries = masteryData;

    // Fetch match details — uses DB cache for known matches, API for new ones
    const ids = matchIds.slice(0, 10);
    const matches = dataService.getMatchDetailsBatch
      ? await dataService.getMatchDetailsBatch(region, ids)
      : await Promise.all(ids.map((id) => dataService.getMatchDetails(region, id)));

    recentMatches = matches;
    topChampions = getTopChampionsFromMatches(matches, summoner.puuid, 3);
  } catch (error) {
    console.error("Error fetching summoner data:", error);

    let title = "Something Went Wrong";
    let message = "An unexpected error occurred. Please try again later.";
    let icon = "⚠️";

    if (error instanceof RiotApiNotFoundError) {
      title = "Summoner Not Found";
      message = `Could not find "${gameName}#${tagLine}" in ${REGIONS.find((r) => r.value === region)?.label ?? region}. Check the spelling and region.`;
      icon = "🔍";
    } else if (error instanceof RiotApiRateLimitError) {
      title = "Too Many Requests";
      message = "The server is currently handling a lot of requests. Please wait a moment and try again.";
      icon = "⏳";
    } else if (error instanceof Error && error.message.includes("API key")) {
      title = "Service Temporarily Unavailable";
      message = "The Riot API connection is experiencing issues. Please try again later.";
      icon = "🔧";
    }

    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-700/50 bg-gray-900/80 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 text-4xl">{icon}</div>
          <h2 className="text-xl font-bold text-loss">{title}</h2>
          <p className="mt-2 text-sm text-gray-400">{message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={`/summoner/${region}/${name}`}
              className="rounded-lg border border-cyan/50 bg-cyan/10 px-6 py-2.5 text-sm font-medium text-cyan transition-all duration-200 hover:bg-cyan/20"
            >
              Try Again
            </a>
            <a
              href="/"
              className="rounded-lg border border-gray-700 bg-gray-800/60 px-6 py-2.5 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-gray-700/60"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const soloQueue = rankedStats.find((e) => e.queueType === "RANKED_SOLO_5x5") ?? null;
  const flexQueue = rankedStats.find((e) => e.queueType === "RANKED_FLEX_SR") ?? null;
  const currentLP = soloQueue?.leaguePoints ?? flexQueue?.leaguePoints ?? 0;

  const regionLabel = REGIONS.find((r) => r.value === region)?.label ?? region;
  const basePath = `/summoner/${region}/${name}`;

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
      <SummonerHeader
        summoner={summoner}
        regionLabel={regionLabel}
        rankedStats={rankedStats}
        actions={<UpdateButton region={region} name={name} />}
      />

      {/* ── Tab Navigation ── */}
      <TabNavigation basePath={basePath} />

      {/* ── Overview Content ── */}
      <div className="animate-stagger mt-6 space-y-6">
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

        {/* Recent Performance + Role Distribution */}
        {recentMatches.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              Recent Performance
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <RecentPerformance matches={recentMatches} puuid={summoner.puuid} />
              <RoleDistribution matches={recentMatches} puuid={summoner.puuid} />
            </div>
          </section>
        )}

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
                  className="flex items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-600/50 hover:shadow-lg"
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
