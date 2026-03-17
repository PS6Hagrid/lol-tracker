import { Suspense } from "react";
import type { Metadata } from "next";
import { getDataService } from "@/lib/data-service";
import { prisma } from "@/lib/db";
import { REGIONS } from "@/lib/constants";
import {
  RiotApiNotFoundError,
  RiotApiRateLimitError,
  RiotApiForbiddenError,
  RiotApiServiceUnavailableError,
} from "@/lib/riot-api-service";
import TabNavigation from "@/components/TabNavigation";
import SummonerHeader from "@/components/SummonerHeader";
import UpdateButton from "@/components/UpdateButton";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import TrackVisit from "@/components/TrackVisit";

// Sections
import RankedSection, { RankedSectionSkeleton } from "@/components/summoner/RankedSection";
import RecentPerformanceSection, { RecentPerformanceSectionSkeleton } from "@/components/summoner/RecentPerformanceSection";
import TopChampionsSection, { TopChampionsSectionSkeleton } from "@/components/summoner/TopChampionsSection";

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

export default async function SummonerProfilePage({ params }: PageProps) {
  const { region, name } = await params;

  // Parse name: "GameName-TagLine" — split on last hyphen
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

  // Fetch data using the data service directly (server component)
  const dataService = await getDataService();

  let summoner;
  let dbSummoner;

  try {
    summoner = await dataService.getSummoner(region, gameName, tagLine);

    // Persist summoner to DB (need the ID for rank snapshots + LP history)
    dbSummoner = await prisma.summoner.upsert({
      where: { gameName_tagLine_region: { gameName: summoner.gameName, tagLine: summoner.tagLine, region } },
      update: { puuid: summoner.puuid, profileIconId: summoner.profileIconId, summonerLevel: summoner.summonerLevel },
      create: { puuid: summoner.puuid, gameName: summoner.gameName, tagLine: summoner.tagLine, region, profileIconId: summoner.profileIconId, summonerLevel: summoner.summonerLevel },
    });

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
    } else if (error instanceof RiotApiForbiddenError) {
      title = "Access Denied";
      message = "The API key is invalid or expired. Please contact the administrator.";
      icon = "🚫";
    } else if (error instanceof RiotApiServiceUnavailableError) {
      title = "Riot API Unavailable";
      message = "Riot services are currently down. Please try again later.";
      icon = "🔌";
    } else if (error instanceof Error && error.message.includes("API key")) {
        // Fallback for generic errors that might be key related
        title = "Configuration Error";
        message = "There is an issue with the API configuration.";
        icon = "🔧";
    }

    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-border-theme bg-bg-card/80 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 text-4xl">{icon}</div>
          <h2 className="text-xl font-bold text-loss">{title}</h2>
          <p className="mt-2 text-sm text-text-secondary">{message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={`/summoner/${region}/${name}`}
              className="rounded-lg border border-cyan/50 bg-cyan/10 px-6 py-2.5 text-sm font-medium text-cyan transition-all duration-200 hover:bg-cyan/20"
            >
              Try Again
            </a>
            <a
              href="/"
              className="rounded-lg border border-border-theme bg-bg-card-hover/60 px-6 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-card-hover/60"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const regionLabel = REGIONS.find((r) => r.value === region)?.label ?? region;
  const basePath = `/summoner/${region}/${name}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Track visit for search history */}
      <TrackVisit gameName={summoner.gameName} tagLine={summoner.tagLine} region={region} profileIconId={summoner.profileIconId} />

      {/* ── Summoner Header ── */}
      <SummonerHeader
        summoner={summoner}
        regionLabel={regionLabel}
        rankedStats={undefined} // Pass undefined so header doesn't show "Unranked" badges prematurely
        actions={
          <div className="flex items-center gap-1.5">
            <UpdateButton region={region} name={name} />
            <FavoriteButton gameName={summoner.gameName} tagLine={summoner.tagLine} region={region} profileIconId={summoner.profileIconId} />
            <ShareButton />
          </div>
        }
      />

      {/* ── Tab Navigation ── */}
      <TabNavigation basePath={basePath} />

      {/* ── Overview Content ── */}
      <div className="animate-stagger mt-6 space-y-6">
        
        <Suspense fallback={<RankedSectionSkeleton />}>
          <RankedSection region={region} puuid={summoner.puuid} summonerId={dbSummoner.id} />
        </Suspense>

        <Suspense fallback={<RecentPerformanceSectionSkeleton />}>
          <RecentPerformanceSection region={region} puuid={summoner.puuid} />
        </Suspense>

        <Suspense fallback={<TopChampionsSectionSkeleton />}>
          <TopChampionsSection region={region} puuid={summoner.puuid} />
        </Suspense>

      </div>
    </div>
  );
}
