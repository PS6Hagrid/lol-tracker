import type {
  SummonerDTO,
  LeagueEntryDTO,
  MatchDTO,
  MatchTimelineDTO,
  CurrentGameInfo,
  ChampionMasteryDTO,
  LeagueListDTO,
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
import { cacheService } from "./redis-cache-service"; // Import the new cache service

// ── Error Classes ──────────────────────────────────────────────────────────

export class RiotApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "RiotApiError";
  }
}

export class RiotApiNotFoundError extends RiotApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = "RiotApiNotFoundError";
  }
}

export class RiotApiForbiddenError extends RiotApiError {
  constructor(message: string) {
    super(message, 403);
    this.name = "RiotApiForbiddenError";
  }
}

export class RiotApiRateLimitError extends RiotApiError {
  constructor(message: string = "Too many requests. Please try again shortly.") {
    super(message, 429);
    this.name = "RiotApiRateLimitError";
  }
}

export class RiotApiServiceUnavailableError extends RiotApiError {
  constructor(message: string = "Riot API service is currently unavailable.") {
    super(message, 503);
    this.name = "RiotApiServiceUnavailableError";
  }
}

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

  /**
   * Centralized fetch wrapper for Riot API.
   * Handles rate limiting, retries, error parsing, and logging.
   * Uses Redis for caching.
   */
  private async riotFetch<T>(
    url: string,
    options: {
      cacheTtl?: number; // Time to live for Redis cache in seconds. Undefined or 0 means no caching.
    } = {},
  ): Promise<T> {
    const cacheKey = `riot-api:${url}`;

    // 1. Try to get from Redis cache
    if (options.cacheTtl && options.cacheTtl > 0) {
      const cachedData = await cacheService.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    let retries = 3;
    
    while (retries > 0) {
      try {
        // Wait for a rate-limit token before every outgoing request
        await rateLimiter.acquire();

        const fetchOptions: RequestInit = {
          headers: { "X-Riot-Token": this.apiKey },
        };

        // Next.js specific caching options are removed, Redis handles caching now.
        // fetchOptions.next = { revalidate: options.revalidate };
        // fetchOptions.cache = "no-store";
        
        const res = await fetch(url, fetchOptions);

        if (res.status === 429) {
          const retryAfter = parseInt(res.headers.get("Retry-After") ?? "2", 10);
          console.warn(JSON.stringify({
            level: "warn",
            message: "Rate limited by Riot API",
            retryAfter,
            url
          }));
          
          await new Promise((r) => setTimeout(r, retryAfter * 1000));
          retries--;
          continue;
        }

        if (res.status === 404) {
          throw new RiotApiNotFoundError(`Not found: ${url}`);
        }

        if (res.status === 403) {
          // Log critical error for 403 as it might mean expired key
          console.error(JSON.stringify({
            level: "error",
            message: "Riot API Forbidden (403)",
            url,
            hint: "Check if RIOT_API_KEY is valid and has access to this endpoint."
          }));
          throw new RiotApiForbiddenError(
            `Forbidden (403): API key may lack access to this endpoint.`,
          );
        }
        
        if (res.status >= 500) {
           console.warn(JSON.stringify({
            level: "warn",
            message: `Riot API Server Error ${res.status}`,
            url
          }));
           // Retry on server errors
           await new Promise((r) => setTimeout(r, 1000));
           retries--;
           continue;
        }

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new RiotApiError(
            `Riot API error ${res.status}: ${res.statusText}. ${body}`,
            res.status
          );
        }

        const data = await res.json() as T;

        // 2. Store in Redis cache if successful
        if (options.cacheTtl && options.cacheTtl > 0) {
          await cacheService.set(cacheKey, data, options.cacheTtl);
        }
        return data;

      } catch (error) {
        // If it's a known error that shouldn't be retried, rethrow immediately
        if (error instanceof RiotApiNotFoundError || error instanceof RiotApiForbiddenError) {
          throw error;
        }
        
        // If we ran out of retries, throw the last error
        if (retries <= 1) {
            if (error instanceof RiotApiError) throw error;
            // Wrap unknown errors
            throw new RiotApiError(error instanceof Error ? error.message : "Unknown error");
        }
        
        // Otherwise loop and retry
        retries--;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    throw new RiotApiRateLimitError("Max retries exceeded");
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
        { cacheTtl: 300 }
      );
      return data;
    } catch (e) {
      if (e instanceof RiotApiForbiddenError) {
        console.warn(JSON.stringify({
            level: "warn",
            message: "Summoner-v4 returned 403. Using fallback values.",
            region,
            puuid
        }));
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
      { cacheTtl: 300 }
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
        { cacheTtl: 120 }
      );
    } catch (e) {
      if (e instanceof RiotApiForbiddenError) {
        console.warn(JSON.stringify({
            level: "warn",
            message: "League-v4 returned 403. Returning empty ranked stats.",
            region,
            puuid
        }));
        return [];
      }
      throw e;
    }
  }

  async getMatchHistory(
    region: string,
    puuid: string,
    count: number = 20,
    start: number = 0,
  ): Promise<string[]> {
    // Cache 1 min — new matches appear frequently
    const params = new URLSearchParams({
      count: String(count),
      start: String(start),
    });
    return this.riotFetch<string[]>(
      `${this.routingUrl(region)}/lol/match/v5/matches/by-puuid/${puuid}/ids?${params}`,
      { cacheTtl: 60 }
    );
  }

  async getMatchDetails(region: string, matchId: string): Promise<MatchDTO> {
    // Check DB cache first — matches are immutable
    const cached = await getCachedMatch(matchId);
    if (cached) return cached;

    // Fetch from Riot API (cache forever in Redis)
    const match = await this.riotFetch<MatchDTO>(
      `${this.routingUrl(region)}/lol/match/v5/matches/${matchId}`,
      { cacheTtl: 31536000 } // 1 year
    );

    // Save to DB cache (fire-and-forget)
    saveMatchToCache(match, region).catch((err) => {
        console.error(JSON.stringify({
            level: "error",
            message: "Failed to save match to DB cache",
            matchId,
            error: err instanceof Error ? err.message : String(err)
        }));
    });

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
    
    // Process in chunks to avoid overwhelming the rate limiter queue
    for (let i = 0; i < uncachedIds.length; i += 5) {
      const batch = uncachedIds.slice(i, i + 5);
      const batchResults = await Promise.allSettled(
        batch.map((id) =>
          this.riotFetch<MatchDTO>(
            `${this.routingUrl(region)}/lol/match/v5/matches/${id}`,
            { cacheTtl: 31536000 } // 1 year
          )
        )
      );
      
      for (const result of batchResults) {
          if (result.status === 'fulfilled') {
              newlyFetched.push(result.value);
          } else {
              console.error(JSON.stringify({
                  level: "error",
                  message: "Failed to fetch match in batch",
                  error: result.reason instanceof Error ? result.reason.message : String(result.reason)
              }));
          }
      }
    }

    // 3. Save newly fetched matches to DB cache (fire-and-forget)
    if (newlyFetched.length > 0) {
      saveMatchesToCache(newlyFetched, region).catch((err) => {
          console.error(JSON.stringify({
            level: "error",
            message: "Failed to save batch matches to DB cache",
            count: newlyFetched.length,
            error: err instanceof Error ? err.message : String(err)
        }));
      });
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
      // Live game data should NOT be cached
      return await this.riotFetch<CurrentGameInfo>(
        `${this.platformUrl(region)}/lol/spectator/v5/active-games/by-summoner/${puuid}`,
        { cacheTtl: 0 } // Explicitly set 0 for no caching
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
        { cacheTtl: 300 }
      );
    } catch (e) {
      if (e instanceof RiotApiForbiddenError) {
        console.warn(JSON.stringify({
            level: "warn",
            message: "Champion-Mastery-v4 returned 403. Returning empty.",
            region,
            puuid
        }));
        return [];
      }
      throw e;
    }
  }

  async getMatchTimeline(
    region: string,
    matchId: string,
  ): Promise<MatchTimelineDTO> {
    return this.riotFetch<MatchTimelineDTO>(
      `${this.routingUrl(region)}/lol/match/v5/matches/${matchId}/timeline`,
      { cacheTtl: 31536000 },
    );
  }

  async getLeagueByTier(
    region: string,
    queue: string,
    tier: "challenger" | "grandmaster" | "master",
  ): Promise<LeagueListDTO> {
    const endpoint =
      tier === "challenger"
        ? "challengerleagues"
        : tier === "grandmaster"
          ? "grandmasterleagues"
          : "masterleagues";

    return this.riotFetch<LeagueListDTO>(
      `${this.platformUrl(region)}/lol/league/v4/${endpoint}/by-queue/${queue}`,
      { cacheTtl: 300 },
    );
  }
}
