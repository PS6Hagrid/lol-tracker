import type {
  SummonerDTO,
  LeagueEntryDTO,
  MatchDTO,
  CurrentGameInfo,
  ChampionMasteryDTO,
} from "@/types/riot";

/**
 * DataService interface — abstraction over League of Legends data retrieval.
 *
 * Two implementations exist:
 *   - MockDataService  — deterministic fake data for development
 *   - RiotApiService   — real Riot Games API (requires RIOT_API_KEY)
 */
export interface DataService {
  /** Look up a summoner by riot ID (gameName + tagLine) */
  getSummoner(
    region: string,
    gameName: string,
    tagLine: string,
  ): Promise<SummonerDTO>;

  /** Fetch ranked stats (solo/duo + flex) for a given puuid */
  getRankedStats(
    region: string,
    puuid: string,
  ): Promise<LeagueEntryDTO[]>;

  /** Fetch recent match IDs for a summoner */
  getMatchHistory(
    region: string,
    puuid: string,
    count?: number,
  ): Promise<string[]>;

  /** Fetch full match details by match ID */
  getMatchDetails(
    region: string,
    matchId: string,
  ): Promise<MatchDTO>;

  /** Fetch live/in-progress game for a summoner (null if not in game) */
  getLiveGame(
    region: string,
    puuid: string,
  ): Promise<CurrentGameInfo | null>;

  /** Fetch champion mastery data for a summoner */
  getChampionMasteries(
    region: string,
    puuid: string,
  ): Promise<ChampionMasteryDTO[]>;
}

/**
 * Factory function — returns the appropriate DataService implementation
 * based on the `DATA_SOURCE` environment variable.
 *
 *   "mock"  -> MockDataService  (default)
 *   anything else -> RiotApiService
 */
export function getDataService(): DataService {
  const source = process.env.DATA_SOURCE ?? "mock";

  if (source === "mock") {
    // Dynamic import avoided; use lazy singleton instead
    const { MockDataService } = require("@/lib/mock-data-service");
    return new MockDataService();
  }

  const { RiotApiService } = require("@/lib/riot-api-service");
  return new RiotApiService();
}
