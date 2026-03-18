import type {
  SummonerDTO,
  LeagueEntryDTO,
  MatchDTO,
  MatchTimelineDTO,
  CurrentGameInfo,
  ChampionMasteryDTO,
  LeagueListDTO,
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
    start?: number,
  ): Promise<string[]>;

  /** Fetch full match details by match ID */
  getMatchDetails(
    region: string,
    matchId: string,
  ): Promise<MatchDTO>;

  /** Fetch multiple match details efficiently (with caching) */
  getMatchDetailsBatch?(
    region: string,
    matchIds: string[],
  ): Promise<MatchDTO[]>;

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

  /** Fetch match timeline data (gold/xp frames + events) */
  getMatchTimeline(
    region: string,
    matchId: string,
  ): Promise<MatchTimelineDTO>;

  /** Fetch apex-tier league (challenger/grandmaster/master) for a queue */
  getLeagueByTier(
    region: string,
    queue: string,
    tier: "challenger" | "grandmaster" | "master",
  ): Promise<LeagueListDTO>;
}

/**
 * Factory function — returns the appropriate DataService implementation
 * based on the `DATA_SOURCE` environment variable.
 *
 *   "mock"  -> MockDataService  (default)
 *   anything else -> RiotApiService (falls back to mock if API key is missing)
 */
export async function getDataService(): Promise<DataService> {
  const source = process.env.DATA_SOURCE ?? "mock";

  if (source === "mock") {
    const { MockDataService } = await import("@/lib/mock-data-service");
    return new MockDataService();
  }

  // If DATA_SOURCE is "riot" but no API key is set, fall back to mock
  if (!process.env.RIOT_API_KEY) {
    console.warn(
      "DATA_SOURCE is set to 'riot' but RIOT_API_KEY is not configured. Falling back to MockDataService.",
    );
    const { MockDataService } = await import("@/lib/mock-data-service");
    return new MockDataService();
  }

  try {
    const { RiotApiService } = await import("@/lib/riot-api-service");
    return new RiotApiService();
  } catch {
    console.warn(
      "Failed to initialize RiotApiService. Falling back to MockDataService.",
    );
    const { MockDataService } = await import("@/lib/mock-data-service");
    return new MockDataService();
  }
}

/**
 * Returns a MockDataService instance. Useful as a fallback when the
 * primary data service fails at runtime (e.g. expired API key).
 */
export async function getMockDataService(): Promise<DataService> {
  const { MockDataService } = await import("@/lib/mock-data-service");
  return new MockDataService();
}
