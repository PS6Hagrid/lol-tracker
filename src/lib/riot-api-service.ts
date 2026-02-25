import type {
  SummonerDTO,
  LeagueEntryDTO,
  MatchDTO,
  CurrentGameInfo,
  ChampionMasteryDTO,
} from "@/types/riot";
import type { DataService } from "@/lib/data-service";

const NOT_CONFIGURED_MSG =
  "Riot API not configured. Set RIOT_API_KEY environment variable.";

/**
 * RiotApiService — stub implementation of DataService.
 *
 * All methods throw an error directing the developer to set RIOT_API_KEY.
 * Replace with real Riot Games API calls when ready for production.
 */
export class RiotApiService implements DataService {
  async getSummoner(
    _region: string,
    _gameName: string,
    _tagLine: string,
  ): Promise<SummonerDTO> {
    throw new Error(NOT_CONFIGURED_MSG);
  }

  async getRankedStats(
    _region: string,
    _puuid: string,
  ): Promise<LeagueEntryDTO[]> {
    throw new Error(NOT_CONFIGURED_MSG);
  }

  async getMatchHistory(
    _region: string,
    _puuid: string,
    _count?: number,
  ): Promise<string[]> {
    throw new Error(NOT_CONFIGURED_MSG);
  }

  async getMatchDetails(
    _region: string,
    _matchId: string,
  ): Promise<MatchDTO> {
    throw new Error(NOT_CONFIGURED_MSG);
  }

  async getLiveGame(
    _region: string,
    _puuid: string,
  ): Promise<CurrentGameInfo | null> {
    throw new Error(NOT_CONFIGURED_MSG);
  }

  async getChampionMasteries(
    _region: string,
    _puuid: string,
  ): Promise<ChampionMasteryDTO[]> {
    throw new Error(NOT_CONFIGURED_MSG);
  }
}
