import type {
  SummonerDTO,
  LeagueEntryDTO,
  MatchDTO,
  CurrentGameInfo,
  ChampionMasteryDTO,
} from "@/types/riot";
import type { DataService } from "@/lib/data-service";
import { REGION_TO_ROUTING } from "@/lib/constants";

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
  // Cache summonerId lookups to avoid repeated Summoner-v4 calls
  private summonerIdCache = new Map<string, string>();

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

  private async riotFetch<T>(url: string): Promise<T> {
    let retries = 3;
    while (retries > 0) {
      const res = await fetch(url, {
        headers: { "X-Riot-Token": this.apiKey },
        cache: "no-store",
      });

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("Retry-After") ?? "2", 10);
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
    throw new Error("Riot API rate limit exceeded after retries.");
  }

  /** Try Summoner-v4 to get summonerId + profile info. Returns null on 403. */
  private async tryGetSummonerByPuuid(
    region: string,
    puuid: string,
  ): Promise<{
    id: string;
    profileIconId: number;
    summonerLevel: number;
  } | null> {
    try {
      const data = await this.riotFetch<{
        id: string;
        puuid: string;
        profileIconId: number;
        summonerLevel: number;
      }>(
        `${this.platformUrl(region)}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      );
      // Cache the summonerId for getRankedStats
      this.summonerIdCache.set(puuid, data.id);
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
    // Step 1: Account-v1 (always works with dev keys)
    const account = await this.riotFetch<{
      puuid: string;
      gameName: string;
      tagLine: string;
    }>(
      `${this.routingUrl(region)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
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
    // Need encryptedSummonerId for League-v4
    let summonerId = this.summonerIdCache.get(puuid);

    if (!summonerId) {
      const summoner = await this.tryGetSummonerByPuuid(region, puuid);
      if (!summoner) {
        // Summoner-v4 is 403, can't get ranked stats
        console.warn("Cannot fetch ranked stats: Summoner-v4 unavailable.");
        return [];
      }
      summonerId = summoner.id;
    }

    try {
      return await this.riotFetch<LeagueEntryDTO[]>(
        `${this.platformUrl(region)}/lol/league/v4/entries/by-summoner/${summonerId}`,
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
    return this.riotFetch<string[]>(
      `${this.routingUrl(region)}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`,
    );
  }

  async getMatchDetails(region: string, matchId: string): Promise<MatchDTO> {
    return this.riotFetch<MatchDTO>(
      `${this.routingUrl(region)}/lol/match/v5/matches/${matchId}`,
    );
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
      return await this.riotFetch<ChampionMasteryDTO[]>(
        `${this.platformUrl(region)}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
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

class RiotApiNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RiotApiNotFoundError";
  }
}

class RiotApiForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RiotApiForbiddenError";
  }
}
