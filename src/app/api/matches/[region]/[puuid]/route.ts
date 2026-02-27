import { NextResponse } from "next/server";
import { getDataService } from "@/lib/data-service";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ region: string; puuid: string }> },
) {
  try {
    const { region, puuid } = await params;

    if (!region || !puuid) {
      return NextResponse.json(
        { error: "Missing region or puuid parameter" },
        { status: 400 },
      );
    }

    const dataService = await getDataService();

    // Fetch 20 match IDs
    const matchIds = await dataService.getMatchHistory(region, puuid, 20);

    // Fetch details for each match
    const matches = await Promise.all(
      matchIds.map((matchId) => dataService.getMatchDetails(region, matchId)),
    );

    // Persist matches to DB (skip if already saved)
    for (const match of matches) {
      const existingMatch = await prisma.match.findUnique({
        where: { matchId: match.metadata.matchId },
      });

      if (existingMatch) continue;

      await prisma.match.create({
        data: {
          matchId: match.metadata.matchId,
          region,
          gameMode: match.info.gameMode,
          gameType: match.info.gameType,
          gameDuration: match.info.gameDuration,
          gameCreation: new Date(match.info.gameCreation),
          gameVersion: match.info.gameVersion,
          mapId: match.info.mapId,
          participants: {
            create: match.info.participants.map((p) => ({
              championId: p.championId,
              championName: p.championName,
              teamId: p.teamId,
              role: p.role,
              lane: p.lane,
              win: p.win,
              stats: {
                create: {
                  kills: p.kills,
                  deaths: p.deaths,
                  assists: p.assists,
                  cs: p.totalMinionsKilled + p.neutralMinionsKilled,
                  goldEarned: p.goldEarned,
                  visionScore: p.visionScore,
                  wardsPlaced: p.wardsPlaced,
                  wardsKilled: p.wardsKilled,
                  totalDamageDealt: p.totalDamageDealt,
                  totalDamageToChampions: p.totalDamageDealtToChampions,
                  physicalDamage: p.physicalDamageDealtToChampions,
                  magicDamage: p.magicDamageDealtToChampions,
                  trueDamage: p.trueDamageDealtToChampions,
                  damageTaken: p.totalDamageTaken,
                  totalHeal: p.totalHeal,
                  turretDamage: p.damageDealtToTurrets,
                  objectiveDamage: p.damageDealtToObjectives,
                  doubleKills: p.doubleKills,
                  tripleKills: p.tripleKills,
                  quadraKills: p.quadraKills,
                  pentaKills: p.pentaKills,
                  firstBlood: p.firstBloodKill,
                  longestTimeSpentLiving: p.longestTimeSpentLiving,
                },
              },
              items: {
                create: {
                  item0: p.item0,
                  item1: p.item1,
                  item2: p.item2,
                  item3: p.item3,
                  item4: p.item4,
                  item5: p.item5,
                  item6: p.item6, // item6 is the trinket slot in Riot API
                },
              },
              runes: {
                create: {
                  primaryStyle: p.perks.styles[0]?.style ?? 0,
                  subStyle: p.perks.styles[1]?.style ?? 0,
                  runeSlots: JSON.stringify(
                    p.perks.styles.flatMap((s) =>
                      s.selections.map((sel) => sel.perk),
                    ),
                  ),
                },
              },
            })),
          },
          teams: {
            create: match.info.teams.map((t) => ({
              teamId: t.teamId,
              win: t.win,
              baronKills: t.objectives.baron.kills,
              dragonKills: t.objectives.dragon.kills,
              riftHeraldKills: t.objectives.riftHerald.kills,
              towerKills: t.objectives.tower.kills,
              inhibitorKills: t.objectives.inhibitor.kills,
              bans: JSON.stringify(t.bans),
            })),
          },
        },
      });
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch match history" },
      { status: 500 },
    );
  }
}
