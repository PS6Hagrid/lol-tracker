import type { DataService } from "@/lib/data-service";
import type {
  CurrentGameInfo,
  CurrentGameParticipant,
  EnrichedParticipant,
  EnrichedCurrentGameInfo,
  PlayerTag,
  LeagueEntryDTO,
  ChampionMasteryDTO,
} from "@/types/riot";

// ─── Tag Computation ──────────────────────────────────────────────────────────

function computePlayerTags(
  rankedEntry: LeagueEntryDTO | null,
  masteries: ChampionMasteryDTO[],
  currentChampionId: number,
): PlayerTag[] {
  const tags: PlayerTag[] = [];

  // Hot Streak — direct Riot API flag
  if (rankedEntry?.hotStreak) {
    tags.push({ type: "HOT_STREAK", label: "Hot Streak", emoji: "\uD83D\uDD25", variant: "positive" });
  }

  // Veteran — direct Riot API flag
  if (rankedEntry?.veteran) {
    tags.push({ type: "VETERAN", label: "Veteran", emoji: "\uD83C\uDF96\uFE0F", variant: "neutral" });
  }

  // Fresh Blood — direct Riot API flag
  if (rankedEntry?.freshBlood) {
    tags.push({ type: "FRESH_BLOOD", label: "Fresh Blood", emoji: "\uD83C\uDF31", variant: "neutral" });
  }

  // OTP — current champion mastery is >60% of total top-5 mastery points
  if (masteries.length > 0) {
    const sorted = [...masteries].sort((a, b) => b.championPoints - a.championPoints).slice(0, 5);
    const top5Total = sorted.reduce((sum, m) => sum + m.championPoints, 0);
    const currentMastery = masteries.find((m) => m.championId === currentChampionId);
    if (currentMastery && top5Total > 0 && currentMastery.championPoints / top5Total > 0.6) {
      tags.push({ type: "OTP", label: "OTP", emoji: "\uD83C\uDFAF", variant: "neutral" });
    }
  }

  // First Timer — mastery < 5000 points or not found
  const currentMastery = masteries.find((m) => m.championId === currentChampionId);
  if (!currentMastery || currentMastery.championPoints < 5000) {
    tags.push({ type: "FIRST_TIMER", label: "First Timer", emoji: "\u26A0\uFE0F", variant: "warning" });
  }

  return tags;
}

// ─── Participant Enrichment ───────────────────────────────────────────────────

async function enrichParticipant(
  dataService: DataService,
  region: string,
  participant: CurrentGameParticipant,
): Promise<EnrichedParticipant> {
  const [rankedEntries, masteries] = await Promise.all([
    dataService.getRankedStats(region, participant.puuid).catch(() => [] as LeagueEntryDTO[]),
    dataService.getChampionMasteries(region, participant.puuid).catch(() => [] as ChampionMasteryDTO[]),
  ]);

  const soloQueue = rankedEntries.find((e) => e.queueType === "RANKED_SOLO_5x5") ?? null;
  const flexQueue = rankedEntries.find((e) => e.queueType === "RANKED_FLEX_SR") ?? null;

  const primaryEntry = soloQueue ?? flexQueue;
  const totalGames = primaryEntry ? primaryEntry.wins + primaryEntry.losses : null;
  const winrate = totalGames && totalGames > 0 ? (primaryEntry!.wins / totalGames) * 100 : null;

  const currentChampMastery = masteries.find((m) => m.championId === participant.championId);

  return {
    ...participant,
    ranked: { soloQueue, flexQueue },
    winrate,
    totalGames,
    tags: computePlayerTags(primaryEntry, masteries, participant.championId),
    championMasteryLevel: currentChampMastery?.championLevel ?? null,
    championMasteryPoints: currentChampMastery?.championPoints ?? null,
  };
}

// ─── Live Game Enrichment ─────────────────────────────────────────────────────

export async function enrichLiveGame(
  dataService: DataService,
  region: string,
  liveGame: CurrentGameInfo,
): Promise<EnrichedCurrentGameInfo> {
  const enrichedParticipants = await Promise.all(
    liveGame.participants.map((p) => enrichParticipant(dataService, region, p)),
  );
  return { ...liveGame, participants: enrichedParticipants } as EnrichedCurrentGameInfo;
}
