import type {
  SummonerDTO,
  LeagueEntryDTO,
  MatchDTO,
  CurrentGameInfo,
  ChampionMasteryDTO,
} from "@/types/riot";
import type { DataService } from "@/lib/data-service";
import { REGION_TO_ROUTING } from "@/lib/constants";
import {
  getCachedMatch,
  getCachedMatches,
  saveMatchToCache,
  saveMatchesToCache,
} from "@/lib/match-cache";
import { rateLimiter } from "@/lib/rate-limiter";

/**
 * RiotApiService — real Riot Games API implementation of DataService.
 *
 * Requires RIOT_API_KEY environment variable.
 *
 * Uses Account-v1 as primary (always works with dev keys).
 * Falls back gracefully when Summoner-v4 or League-v4 return 403.
 */
export class RiotApiService implements DataService {
  private apiKey: string;

  constructor() {
    const key = process.env.RIOT_API_KEY;
    if (!key) {
      throw new Error("RIOT_API_KEY environment variable is not set.");
    }
    this.apiKey = key;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private platformUrl(region: string): string {
    return `https://${region}.api.riotgames.com`;
  }

  private routingUrl(region: string): string {
    const routing = REGION_TO_ROUTING[region] ?? "europe";
    return `https://${routing}.api.riotgames.com`;
  }

  private async riotFetch<T>(
    url: string,
    revalidate?: number,
  ): Promise<T> {
    let retries = 3;
    while (retries > 0) {
      // Wait for a rate-limit token before every outgoing request
      await rateLimiter.acquire();

      const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
        headers: { "X-Riot-Token": this.apiKey },
      };
      if (revalidate !== undefined && revalidate > 0) {
        fetchOptions.next = { revalidate };
      } else {
        fetchOptions.cache = "no-store";
      }
      const res = await fetch(url, fetchOptions);

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("Retry-After") ?? "2", 10);
        console.warn(`Rate limited by Riot API. Retrying in ${retryAfter}s…`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        retries--;
        continue;
      }

      if (res.status === 404) {
        throw new RiotApiNotFoundError(`Not found: ${url}`);
      }

      if (res.status === 403) {
        throw new RiotApiForbiddenError(
          `Forbidden (403): API key may lack access to this endpoint.`,
        );
      }

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          `Riot API error ${res.status}: ${res.statusText}. ${body}`,
        );
      }

      return res.json() as Promise<T>;
    }
    throw new RiotApiRateLimitError();
  }

  /** Try Summoner-v4 to get profile info. Returns null on 403. */
  private async tryGetSummonerByPuuid(
    region: string,
    puuid: string,
  ): Promise<{
    profileIconId: number;
    summonerLevel: number;
  } | null> {
    try {
      // Cache 5 min — profile info changes rarely
      const data = await this.riotFetch<{
        puuid: string;
        profileIconId: number;
        summonerLevel: number;
      }>(
        `${this.platformUrl(region)}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
        300,
      );
      return data;
    } catch (e) {
      if (e instanceof RiotApiForbiddenError) {
        console.warn("Summoner-v4 returned 403. Using fallback values.");
        return null;
      }
      throw e;
    }
  }

  // ── DataService implementation ───────────────────────────────────────────

  async getSummoner(
    region: string,
    gameName: string,
    tagLine: string,
  ): Promise<SummonerDTO> {
    // Step 1: Account-v1 (always works with dev keys) — cache 5 min
    const account = await this.riotFetch<{
      puuid: string;
      gameName: string;
      tagLine: string;
    }>(
      `${this.routingUrl(region)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      300,
    );

    // Step 2: Try Summoner-v4 for profile icon + level (may fail with 403)
    const summoner = await this.tryGetSummonerByPuuid(region, account.puuid);

    return {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      profileIconId: summoner?.profileIconId ?? 1,
      summonerLevel: summoner?.summonerLevel ?? 0,
    };
  }

  async getRankedStats(
    region: string,
    puuid: string,
  ): Promise<LeagueEntryDTO[]> {
    try {
      // Use PUUID-based endpoint (Riot removed summonerId from Summoner-v4)
      // Cache 2 min — ranked stats change after games
      return await this.riotFetch<LeagueEntryDTO[]>(
        `${this.platformUrl(region)}/lol/league/v4/entries/by-puuid/${puuid}`,
        120,
      );
    } catch (e) {
      if (e instanceof RiotApiForbiddenError) {
        console.warn("League-v4 returned 403. Returning empty ranked stats.");
        return [];
      }
      throw e;
    }
  }

  async getMatchHistory(
    region: string,
    puuid: string,
    count: number = 20,
  ): Promise<string[]> {
    // Cache 1 min — new matches appear frequently
    return this.riotFetch<string[]>(
      `${this.routingUrl(region)}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`,
      60,
    );
  }

  async getMatchDetails(region: string, matchId: string): Promise<MatchDTO> {
    // Check DB cache first — matches are immutable
    const cached = await getCachedMatch(matchId);
    if (cached) return cached;

    // Fetch from Riot API (no revalidate — we cache in DB forever)
    const match = await this.riotFetch<MatchDTO>(
      `${this.routingUrl(region)}/lol/match/v5/matches/${matchId}`,
    );

    // Save to DB cache (fire-and-forget)
    saveMatchToCache(match, region).catch(() => {});

    return match;
  }

  /**
   * Fetch multiple match details efficiently.
   * Checks DB cache first, only fetches uncached matches from Riot API.
   * Saves newly fetched matches to DB for future use.
   */
  async getMatchDetailsBatch(
    region: string,
    matchIds: string[],
  ): Promise<MatchDTO[]> {
    if (matchIds.length === 0) return [];

    // 1. Check DB cache for all matches at once
    const cachedMap = await getCachedMatches(matchIds);
    const uncachedIds = matchIds.filter((id) => !cachedMap.has(id));

    // 2. Fetch uncached matches from Riot API in batches of 5
    //    The global rate limiter handles pacing automatically.
    const newlyFetched: MatchDTO[] = [];
    for (let i = 0; i < uncachedIds.length; i += 5) {
      const batch = uncachedIds.slice(i, i + 5);
      const batchResults = await Promise.all(
        batch.map((id) =>
          this.riotFetch<MatchDTO>(
            `${this.routingUrl(region)}/lol/match/v5/matches/${id}`,
          ),
        ),
      );
      newlyFetched.push(...batchResults);
    }

    // 3. Save newly fetched matches to DB cache (fire-and-forget)
    if (newlyFetched.length > 0) {
      saveMatchesToCache(newlyFetched, region).catch(() => {});
    }

    // 4. Return all matches in original order
    const allMatchesMap = new Map(cachedMap);
    for (const match of newlyFetched) {
      allMatchesMap.set(match.metadata.matchId, match);
    }

    return matchIds
      .map((id) => allMatchesMap.get(id))
      .filter((m): m is MatchDTO => m !== undefined);
  }

  async getLiveGame(
    region: string,
    puuid: string,
  ): Promise<CurrentGameInfo | null> {
    try {
      return await this.riotFetch<CurrentGameInfo>(
        `${this.platformUrl(region)}/lol/spectator/v5/active-games/by-summoner/${puuid}`,
      );
    } catch (e) {
      if (
        e instanceof RiotApiNotFoundError ||
        e instanceof RiotApiForbiddenError
      ) {
        return null;
      }
      throw e;
    }
  }

  async getChampionMasteries(
    region: string,
    puuid: string,
  ): Promise<ChampionMasteryDTO[]> {
    try {
      // Cache 5 min — mastery changes slowly
      return await this.riotFetch<ChampionMasteryDTO[]>(
        `${this.platformUrl(region)}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
        300,
      );
    } catch (e) {
      if (e instanceof RiotApiForbiddenError) {
        console.warn("Champion-Mastery-v4 returned 403. Returning empty.");
        return [];
      }
      throw e;
    }
  }
}

export class RiotApiNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RiotApiNotFoundError";
  }
}

export class RiotApiForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RiotApiForbiddenError";
  }
}

export class RiotApiRateLimitError extends Error {
  constructor(message: string = "Too many requests. Please try again shortly.") {
    super(message);
    this.name = "RiotApiRateLimitError";
  }
}
