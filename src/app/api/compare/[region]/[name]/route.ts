import { NextResponse } from "next/server";
import { getDataService } from "@/lib/data-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ region: string; name: string }> },
) {
  try {
    const { region, name } = await params;

    if (!region || !name) {
      return NextResponse.json(
        { error: "Missing region or name parameter" },
        { status: 400 },
      );
    }

    // Name format: "GameName-TagLine" — split on the last hyphen
    const lastHyphen = name.lastIndexOf("-");
    if (lastHyphen === -1 || lastHyphen === 0 || lastHyphen === name.length - 1) {
      return NextResponse.json(
        { error: "Invalid name format. Expected GameName-TagLine" },
        { status: 400 },
      );
    }

    const gameName = decodeURIComponent(name.slice(0, lastHyphen));
    const tagLine = decodeURIComponent(name.slice(lastHyphen + 1));

    const dataService = await getDataService();

    // Fetch summoner profile
    const summoner = await dataService.getSummoner(region, gameName, tagLine);

    // Fetch ranked stats, champion masteries, and recent matches in parallel
    const [rankedStats, masteries, matchIds] = await Promise.all([
      dataService.getRankedStats(region, summoner.puuid),
      dataService.getChampionMasteries(region, summoner.puuid),
      dataService.getMatchHistory(region, summoner.puuid, 10),
    ]);

    // Fetch match details for recent matches
    const matches = await Promise.all(
      matchIds.map((matchId) => dataService.getMatchDetails(region, matchId)),
    );

    // Compute aggregated stats from recent matches
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalCs = 0;
    let totalDuration = 0;
    let matchCount = 0;

    for (const match of matches) {
      const participant = match.info.participants.find(
        (p) => p.puuid === summoner.puuid,
      );
      if (!participant) continue;
      matchCount++;
      totalKills += participant.kills;
      totalDeaths += participant.deaths;
      totalAssists += participant.assists;
      totalCs += participant.totalMinionsKilled + participant.neutralMinionsKilled;
      totalDuration += match.info.gameDuration;
    }

    const avgKDA = matchCount > 0
      ? {
          kills: totalKills / matchCount,
          deaths: totalDeaths / matchCount,
          assists: totalAssists / matchCount,
          kda: totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : totalKills + totalAssists,
        }
      : null;

    const csPerMin = matchCount > 0 && totalDuration > 0
      ? (totalCs / (totalDuration / 60))
      : 0;

    // Get top 3 champion masteries
    const topChampions = masteries
      .sort((a, b) => b.championPoints - a.championPoints)
      .slice(0, 3);

    return NextResponse.json({
      summoner,
      rankedStats,
      topChampions,
      recentStats: {
        avgKDA,
        csPerMin: Math.round(csPerMin * 10) / 10,
        matchCount,
      },
    });
  } catch (error) {
    console.error("Error fetching summoner for comparison:", error);

    const { RiotApiNotFoundError, RiotApiForbiddenError, RiotApiRateLimitError } =
      await import("@/lib/riot-api-service");

    if (error instanceof RiotApiNotFoundError) {
      return NextResponse.json(
        { error: "Summoner not found. Check the name and region.", code: "NOT_FOUND" },
        { status: 404 },
      );
    }
    if (error instanceof RiotApiRateLimitError) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a moment.", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }
    if (error instanceof RiotApiForbiddenError) {
      return NextResponse.json(
        { error: "API access restricted.", code: "FORBIDDEN" },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again later.", code: "INTERNAL" },
      { status: 500 },
    );
  }
}
