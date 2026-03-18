import { getDataService } from "@/lib/data-service";
import { REGIONS } from "@/lib/constants";
import TabNavigation from "@/components/TabNavigation";
import SummonerHeader from "@/components/SummonerHeader";
import UpdateButton from "@/components/UpdateButton";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import LiveGamePanel from "@/components/LiveGamePanel";
import { enrichLiveGame } from "@/lib/live-game-enrichment";

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
        <div className="rounded-xl border border-border-theme bg-bg-card/80 p-8 text-center backdrop-blur-sm">
          <h2 className="text-xl font-bold text-loss">Invalid Summoner Name</h2>
          <p className="mt-2 text-text-secondary">
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
  let rankedStats;

  try {
    summoner = await dataService.getSummoner(region, gameName, tagLine);
    rankedStats = await dataService.getRankedStats(region, summoner.puuid);
  } catch (error) {
    console.error("Error fetching summoner data:", error);
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="rounded-xl border border-border-theme bg-bg-card/80 p-8 text-center backdrop-blur-sm">
          <h2 className="text-xl font-bold text-loss">Summoner Not Found</h2>
          <p className="mt-2 text-text-secondary">
            Could not find &quot;{gameName}#{tagLine}&quot; in{" "}
            {REGIONS.find((r) => r.value === region)?.label ?? region}
          </p>
        </div>
      </div>
    );
  }

  // Fetch live game data and enrich with ranked info + player tags
  const rawLiveGame = await dataService.getLiveGame(region, summoner.puuid);
  const liveGame = rawLiveGame
    ? await enrichLiveGame(dataService, region, rawLiveGame)
    : null;

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
            <ShareButton summonerName={summoner.gameName} region={region} />
          </div>
        }
      />

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
