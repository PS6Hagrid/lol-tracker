// ─── Riot API v5 Type Definitions ────────────────────────────────────────────

/** Account / Summoner DTO from Riot Account-v1 and Summoner-v4 */
export interface SummonerDTO {
  puuid: string;
  gameName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number;
}

/** League entry from League-v4 */
export interface LeagueEntryDTO {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  summonerId: string;
  leagueId: string;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
}

/** Top-level Match DTO from Match-v5 */
export interface MatchDTO {
  metadata: MatchMetadata;
  info: MatchInfo;
}

export interface MatchMetadata {
  matchId: string;
  participants: string[]; // list of puuids
  dataVersion: string;
}

export interface MatchInfo {
  gameMode: string;
  gameType: string;
  gameDuration: number;
  gameCreation: number;
  gameVersion: string;
  mapId: number;
  participants: MatchParticipantDTO[];
  teams: MatchTeamDTO[];
}

/** Individual participant within a match */
export interface MatchParticipantDTO {
  puuid: string;
  summonerName: string;
  championId: number;
  championName: string;
  teamId: number;
  role: string;
  lane: string;
  win: boolean;

  // KDA
  kills: number;
  deaths: number;
  assists: number;

  // Farming and economy
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;

  // Vision
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;

  // Damage dealt
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  physicalDamageDealtToChampions: number;
  magicDamageDealtToChampions: number;
  trueDamageDealtToChampions: number;

  // Damage taken and healing
  totalDamageTaken: number;
  totalHeal: number;

  // Objective damage
  damageDealtToTurrets: number;
  damageDealtToObjectives: number;

  // Items (slots 0-6 + trinket)
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;

  // Runes
  perks: PerksDTO;

  // Multi-kills
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
  firstBloodKill: boolean;
  longestTimeSpentLiving: number;
}

/** Rune / perk information */
export interface PerksDTO {
  statPerks: {
    defense: number;
    flex: number;
    offense: number;
  };
  styles: PerkStyleDTO[];
}

export interface PerkStyleDTO {
  description: string; // "primaryStyle" | "subStyle"
  style: number;
  selections: PerkSelectionDTO[];
}

export interface PerkSelectionDTO {
  perk: number;
  var1: number;
  var2: number;
  var3: number;
}

/** Team data within a match */
export interface MatchTeamDTO {
  teamId: number;
  win: boolean;
  objectives: {
    baron: ObjectiveDTO;
    dragon: ObjectiveDTO;
    riftHerald: ObjectiveDTO;
    tower: ObjectiveDTO;
    inhibitor: ObjectiveDTO;
    champion: ObjectiveDTO;
  };
  bans: BanDTO[];
}

export interface ObjectiveDTO {
  first: boolean;
  kills: number;
}

export interface BanDTO {
  championId: number;
  pickTurn: number;
}

// ─── Live Game / Spectator ──────────────────────────────────────────────────

/** Current game info from Spectator-v5 */
export interface CurrentGameInfo {
  gameId: number;
  gameMode: string;
  gameType: string;
  gameStartTime: number;
  mapId: number;
  platformId: string;
  participants: CurrentGameParticipant[];
  bannedChampions: BannedChampion[];
}

export interface CurrentGameParticipant {
  puuid: string;
  summonerId: string;
  summonerName: string;
  championId: number;
  teamId: number;
  perks: CurrentGamePerks;
  spell1Id: number;
  spell2Id: number;
}

export interface CurrentGamePerks {
  perkIds: number[];
  perkStyle: number;
  perkSubStyle: number;
}

export interface BannedChampion {
  championId: number;
  teamId: number;
  pickTurn: number;
}

// ─── Champion Mastery ───────────────────────────────────────────────────────

/** Champion mastery from Champion-Mastery-v4 */
export interface ChampionMasteryDTO {
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  puuid: string;
}

// ─── Regions & Queue Types ──────────────────────────────────────────────────

export type Region =
  | "na1"
  | "euw1"
  | "eun1"
  | "kr"
  | "jp1"
  | "br1"
  | "la1"
  | "la2"
  | "oc1"
  | "tr1"
  | "ru"
  | "ph2"
  | "sg2"
  | "th2"
  | "tw2"
  | "vn2";

export type RoutingRegion = "americas" | "europe" | "asia" | "sea";

export type RankedTier =
  | "IRON"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "EMERALD"
  | "DIAMOND"
  | "MASTER"
  | "GRANDMASTER"
  | "CHALLENGER";

export type RankedDivision = "I" | "II" | "III" | "IV";

export type QueueType =
  | "RANKED_SOLO_5x5"
  | "RANKED_FLEX_SR"
  | "RANKED_TFT_DOUBLE_UP";
