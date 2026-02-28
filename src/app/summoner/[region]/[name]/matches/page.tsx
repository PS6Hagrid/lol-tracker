import { getDataService } from "@/lib/data-service";
import { REGIONS } from "@/lib/constants";
import TabNavigation from "@/components/TabNavigation";
import SummonerHeader from "@/components/SummonerHeader";
import UpdateButton from "@/components/UpdateButton";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import MatchHistoryList from "@/components/MatchHistoryList";
import KDAChart from "@/components/KDAChart";
import WinRateChart from "@/components/WinRateChart";
import RecentPerformance from "@/components/RecentPerformance";
import type { MatchDTO, LeagueEntryDTO } from "@/types/riot";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

export default async function MatchHistoryPage({ params }: PageProps) {
  const { region, name } = await params;

  // Parse name: "GameName-TagLine" -- split on last hyphen
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
  let matches: MatchDTO[] = [];
  let rankedStats: LeagueEntryDTO[] = [];

  try {
    summoner = await dataService.getSummoner(region, gameName, tagLine);

    // Fetch match history and ranked stats in parallel
    const [matchIds, ranked] = await Promise.all([
      dataService.getMatchHistory(region, summoner.puuid, 20),
      dataService.getRankedStats(region, summoner.puuid),
    ]);

    rankedStats = ranked;

    // Fetch match details — uses DB cache for known matches, API for new ones
    matches = dataService.getMatchDetailsBatch
      ? await dataService.getMatchDetailsBatch(region, matchIds)
      : await Promise.all(matchIds.map((id) => dataService.getMatchDetails(region, id)));
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

  // Build KDA chart data from matches
  const kdaChartData = matches.map((match, index) => {
    const player =
      match.info.participants.find((p) => p.puuid === summoner.puuid) ??
      match.info.participants[0];

    return {
      match: index + 1,
      kills: player.kills,
      deaths: player.deaths,
      assists: player.assists,
    };
  });

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

      {/* Match History Content */}
      <div className="animate-stagger mt-6 space-y-6">
        {/* Stats Summary + KDA Chart */}
        <section>
          <RecentPerformance matches={matches} puuid={summoner.puuid} />
        </section>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <KDAChart data={kdaChartData} />
          <WinRateChart matches={matches} puuid={summoner.puuid} />
        </div>

        {/* Match List */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Match History
          </h2>
          <MatchHistoryList
            matches={matches}
            summonerPuuid={summoner.puuid}
            region={region}
            puuid={summoner.puuid}
          />
        </section>
      </div>
    </div>
  );
}
