import { getDataService } from "@/lib/data-service";
import { getProfileIconUrl, REGIONS } from "@/lib/constants";
import TabNavigation from "@/components/TabNavigation";
import LiveGamePanel from "@/components/LiveGamePanel";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

export default async function LiveGamePage({ params }: PageProps) {
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

  try {
    summoner = await dataService.getSummoner(region, gameName, tagLine);
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

  // Fetch live game data
  const liveGame = await dataService.getLiveGame(region, summoner.puuid);

  const regionLabel = REGIONS.find((r) => r.value === region)?.label ?? region;
  const basePath = `/summoner/${region}/${name}`;

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

      {/* Live Game Content */}
      <div className="mt-6">
        <LiveGamePanel
          initialGame={liveGame}
          summonerPuuid={summoner.puuid}
          summonerName={summoner.gameName}
          region={region}
        />
      </div>
    </div>
  );
}
