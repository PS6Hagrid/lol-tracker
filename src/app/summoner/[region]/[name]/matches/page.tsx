import { getDataService } from "@/lib/data-service";
import { getProfileIconUrl, REGIONS } from "@/lib/constants";
import TabNavigation from "@/components/TabNavigation";
import MatchHistoryList from "@/components/MatchHistoryList";
import KDAChart from "@/components/KDAChart";
import type { MatchDTO } from "@/types/riot";

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

  const dataService = getDataService();

  let summoner;
  let matches: MatchDTO[] = [];

  try {
    summoner = await dataService.getSummoner(region, gameName, tagLine);

    // Fetch match history (20 matches)
    const matchIds = await dataService.getMatchHistory(region, summoner.puuid, 20);

    // Fetch match details in parallel
    matches = await Promise.all(
      matchIds.map((id) => dataService.getMatchDetails(region, id)),
    );
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
  const basePath = `/summoner/${encodeURIComponent(region)}/${encodeURIComponent(name)}`;

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
      <div className="mb-6 flex items-center gap-4">
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

      {/* Tab Navigation */}
      <TabNavigation basePath={basePath} />

      {/* Match History Content */}
      <div className="mt-6 space-y-6">
        {/* KDA Chart */}
        <section>
          <KDAChart data={kdaChartData} />
        </section>

        {/* Match List */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Match History
          </h2>
          <MatchHistoryList
            matches={matches}
            summonerPuuid={summoner.puuid}
          />
        </section>
      </div>
    </div>
  );
}
