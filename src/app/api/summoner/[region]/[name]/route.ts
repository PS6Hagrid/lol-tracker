import { NextResponse } from "next/server";
import { getDataService } from "@/lib/data-service";
import { prisma } from "@/lib/db";

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

    // Fetch summoner and ranked stats in parallel
    const summoner = await dataService.getSummoner(region, gameName, tagLine);
    const rankedStats = await dataService.getRankedStats(region, summoner.puuid);

    // Persist summoner to DB (upsert)
    const dbSummoner = await prisma.summoner.upsert({
      where: {
        gameName_tagLine_region: {
          gameName: summoner.gameName,
          tagLine: summoner.tagLine,
          region,
        },
      },
      update: {
        puuid: summoner.puuid,
        profileIconId: summoner.profileIconId,
        summonerLevel: summoner.summonerLevel,
      },
      create: {
        puuid: summoner.puuid,
        gameName: summoner.gameName,
        tagLine: summoner.tagLine,
        region,
        profileIconId: summoner.profileIconId,
        summonerLevel: summoner.summonerLevel,
      },
    });

    // Save rank snapshots
    for (const entry of rankedStats) {
      await prisma.rankSnapshot.create({
        data: {
          summonerId: dbSummoner.id,
          queueType: entry.queueType,
          tier: entry.tier,
          rank: entry.rank,
          lp: entry.leaguePoints,
          wins: entry.wins,
          losses: entry.losses,
        },
      });
    }

    return NextResponse.json({ summoner, rankedStats });
  } catch (error) {
    console.error("Error fetching summoner:", error);
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
        { error: "API access restricted. The API key may have expired.", code: "FORBIDDEN" },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again later.", code: "INTERNAL" },
      { status: 500 },
    );
  }
}
