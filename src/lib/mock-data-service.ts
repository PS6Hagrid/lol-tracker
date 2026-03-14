import type {
  SummonerDTO,
  LeagueEntryDTO,
  MatchDTO,
  MatchTimelineDTO,
  MatchParticipantDTO,
  MatchTeamDTO,
  CurrentGameInfo,
  ChampionMasteryDTO,
  PerksDTO,
  TimelineFrame,
  TimelineParticipantFrame,
  TimelineEvent,
  LeagueListDTO,
  LeagueItemDTO,
} from "@/types/riot";
import type { DataService } from "@/lib/data-service";

// ─── Deterministic seeded PRNG ──────────────────────────────────────────────
// Simple hash-based seed so the same input always produces the same output.

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/** Mulberry32 PRNG — returns a function that yields [0, 1) floats. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function seededPick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function seededShuffle<T>(rng: () => number, arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Champion pool ──────────────────────────────────────────────────────────

const CHAMPIONS: readonly { id: number; name: string }[] = [
  { id: 103, name: "Ahri" },
  { id: 84, name: "Akali" },
  { id: 12, name: "Alistar" },
  { id: 32, name: "Amumu" },
  { id: 22, name: "Ashe" },
  { id: 53, name: "Blitzcrank" },
  { id: 63, name: "Brand" },
  { id: 51, name: "Caitlyn" },
  { id: 122, name: "Darius" },
  { id: 119, name: "Draven" },
  { id: 81, name: "Ezreal" },
  { id: 114, name: "Fiora" },
  { id: 86, name: "Garen" },
  { id: 104, name: "Graves" },
  { id: 39, name: "Irelia" },
  { id: 202, name: "Jhin" },
  { id: 222, name: "Jinx" },
  { id: 145, name: "Kaisa" },
  { id: 55, name: "Katarina" },
  { id: 64, name: "LeeSin" },
  { id: 99, name: "Lux" },
  { id: 21, name: "MissFortune" },
  { id: 25, name: "Morgana" },
  { id: 111, name: "Nautilus" },
  { id: 61, name: "Orianna" },
  { id: 555, name: "Pyke" },
  { id: 92, name: "Riven" },
  { id: 235, name: "Senna" },
  { id: 412, name: "Thresh" },
  { id: 4, name: "TwistedFate" },
  { id: 110, name: "Varus" },
  { id: 67, name: "Vayne" },
  { id: 254, name: "Vi" },
  { id: 157, name: "Yasuo" },
  { id: 238, name: "Zed" },
];

// ─── Item pool (real LoL item IDs) ──────────────────────────────────────────

const ITEMS = [
  3006, 3031, 3033, 3036, 3046, 3072, 3074, 3078, 3083, 3089, 3091, 3094,
  3095, 3100, 3102, 3110, 3115, 3116, 3135, 3139, 3142, 3152, 3153, 3156,
  3157, 3161, 3165, 3190, 3193, 3222, 3504, 3742, 3814,
] as const;

const TRINKETS = [3340, 3363, 3364] as const;

// ─── Roles / Lanes ──────────────────────────────────────────────────────────

const ROLES_LANES: readonly { role: string; lane: string }[] = [
  { role: "SOLO", lane: "TOP" },
  { role: "NONE", lane: "JUNGLE" },
  { role: "SOLO", lane: "MIDDLE" },
  { role: "CARRY", lane: "BOTTOM" },
  { role: "SUPPORT", lane: "BOTTOM" },
];

// ─── Rune styles ────────────────────────────────────────────────────────────

const RUNE_STYLES = [8000, 8100, 8200, 8300, 8400] as const;

const RUNE_KEYSTONES: Record<number, number[]> = {
  8000: [8005, 8008, 8021, 8010],
  8100: [8112, 8124, 8128, 9923],
  8200: [8214, 8229, 8230],
  8300: [8351, 8360, 8369],
  8400: [8437, 8439, 8465],
};

// ─── Summoner spells ────────────────────────────────────────────────────────

const SUMMONER_SPELLS = [1, 3, 4, 6, 7, 11, 12, 14, 21] as const;

// ─── Pre-defined summoners ──────────────────────────────────────────────────

interface PreDefinedSummoner {
  gameName: string;
  tagLine: string;
  region: string;
  profileIconId: number;
  summonerLevel: number;
  puuid: string;
  tier: string;
  rank: string;
  lp: number;
}

const PRE_DEFINED_SUMMONERS: readonly PreDefinedSummoner[] = [
  {
    gameName: "Faker",
    tagLine: "KR1",
    region: "kr",
    profileIconId: 6,
    summonerLevel: 782,
    puuid: "mock-puuid-faker-kr1-000000000000000000000000",
    tier: "CHALLENGER",
    rank: "I",
    lp: 1247,
  },
  {
    gameName: "Doublelift",
    tagLine: "NA1",
    region: "na1",
    profileIconId: 4813,
    summonerLevel: 543,
    puuid: "mock-puuid-doublelift-na1-0000000000000000000",
    tier: "GRANDMASTER",
    rank: "I",
    lp: 587,
  },
  {
    gameName: "xPeke",
    tagLine: "EUW",
    region: "euw1",
    profileIconId: 3150,
    summonerLevel: 421,
    puuid: "mock-puuid-xpeke-euw1-00000000000000000000000",
    tier: "DIAMOND",
    rank: "II",
    lp: 64,
  },
];

// ─── Fake summoner names for other participants ─────────────────────────────

const FAKE_NAMES = [
  "ShadowReaper99",
  "BladeOfSilence",
  "ArcaneStorm",
  "DragonSlayer42",
  "FrostByte",
  "NeonPhantom",
  "VoidWalkerX",
  "IronWill77",
  "CrystalMage",
  "ThunderPaw",
  "EmberFox",
  "LunarKnight",
  "QuantumShift",
  "StealthHawk",
  "ToxicRain",
  "StarForge",
  "NightCrawl3r",
  "WarpDriv3",
  "CosmicDuelist",
  "PrismBlade",
] as const;

// ─── MockDataService ────────────────────────────────────────────────────────

export class MockDataService implements DataService {
  // ────────────────────────────────────────────────────────────────────────
  // getSummoner
  // ────────────────────────────────────────────────────────────────────────

  async getSummoner(
    region: string,
    gameName: string,
    tagLine: string,
  ): Promise<SummonerDTO> {
    // Check pre-defined summoners first (case-insensitive match)
    const preDefined = PRE_DEFINED_SUMMONERS.find(
      (s) =>
        s.gameName.toLowerCase() === gameName.toLowerCase() &&
        s.tagLine.toLowerCase() === tagLine.toLowerCase(),
    );

    if (preDefined) {
      return {
        puuid: preDefined.puuid,
        gameName: preDefined.gameName,
        tagLine: preDefined.tagLine,
        profileIconId: preDefined.profileIconId,
        summonerLevel: preDefined.summonerLevel,
      };
    }

    // Generate dynamic summoner deterministically
    const rng = seededRandom(hashString(`summoner:${gameName}:${tagLine}:${region}`));
    return {
      puuid: `mock-puuid-${gameName.toLowerCase()}-${tagLine.toLowerCase()}-${region}`.padEnd(
        48,
        "0",
      ),
      gameName,
      tagLine,
      profileIconId: seededInt(rng, 1, 5000),
      summonerLevel: seededInt(rng, 30, 600),
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // getRankedStats
  // ────────────────────────────────────────────────────────────────────────

  async getRankedStats(
    _region: string,
    puuid: string,
  ): Promise<LeagueEntryDTO[]> {
    const rng = seededRandom(hashString(`ranked:${puuid}`));

    const preDefined = PRE_DEFINED_SUMMONERS.find((s) => s.puuid === puuid);

    const tiers = [
      "IRON",
      "BRONZE",
      "SILVER",
      "GOLD",
      "PLATINUM",
      "EMERALD",
      "DIAMOND",
      "MASTER",
      "GRANDMASTER",
      "CHALLENGER",
    ];
    const divisions = ["I", "II", "III", "IV"];

    function makeEntry(queueType: string, tierOverride?: string, rankOverride?: string, lpOverride?: number): LeagueEntryDTO {
      const tier = tierOverride ?? seededPick(rng, tiers);
      const isApex = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);
      const rank = isApex ? "I" : (rankOverride ?? seededPick(rng, divisions));
      const lp = lpOverride ?? (isApex ? seededInt(rng, 0, 1500) : seededInt(rng, 0, 99));
      const wins = seededInt(rng, 40, 300);
      const losses = seededInt(rng, 35, 280);

      return {
        queueType,
        tier,
        rank,
        leaguePoints: lp,
        wins,
        losses,
        summonerId: `mock-summoner-id-${puuid.slice(0, 16)}`,
        leagueId: `mock-league-${hashString(`${puuid}:${queueType}`).toString(16)}`,
        hotStreak: rng() > 0.8,
        veteran: rng() > 0.6,
        freshBlood: rng() > 0.85,
        inactive: false,
      };
    }

    if (preDefined) {
      return [
        makeEntry("RANKED_SOLO_5x5", preDefined.tier, preDefined.rank, preDefined.lp),
        makeEntry("RANKED_FLEX_SR"),
      ];
    }

    return [makeEntry("RANKED_SOLO_5x5"), makeEntry("RANKED_FLEX_SR")];
  }

  // ────────────────────────────────────────────────────────────────────────
  // getMatchHistory
  // ────────────────────────────────────────────────────────────────────────

  async getMatchHistory(
    region: string,
    puuid: string,
    count: number = 20,
    start: number = 0,
  ): Promise<string[]> {
    const routingPrefix = region.toUpperCase().replace(/[0-9]/g, "");
    const ids: string[] = [];
    for (let i = start; i < start + count; i++) {
      const hash = hashString(`match:${puuid}:${i}`);
      ids.push(`${routingPrefix}_${5000000000 + hash % 1000000}`);
    }
    return ids;
  }

  // ────────────────────────────────────────────────────────────────────────
  // getMatchDetails
  // ────────────────────────────────────────────────────────────────────────

  async getMatchDetails(
    _region: string,
    matchId: string,
  ): Promise<MatchDTO> {
    const rng = seededRandom(hashString(`details:${matchId}`));

    // Game duration 1200-2400 seconds (20-40 minutes)
    const gameDuration = seededInt(rng, 1200, 2400);
    const gameCreation = Date.now() - seededInt(rng, 3600000, 604800000); // 1h - 7d ago
    const blueWin = rng() > 0.5;

    // Pick 10 unique champions
    const shuffledChamps = seededShuffle(rng, [...CHAMPIONS]);
    const matchChamps = shuffledChamps.slice(0, 10);

    // Generate 10 puuids for participants
    const participantPuuids: string[] = [];
    for (let i = 0; i < 10; i++) {
      participantPuuids.push(
        `mock-puuid-participant-${matchId}-${i}`.padEnd(48, "0"),
      );
    }

    // Assign names
    const shuffledNames = seededShuffle(rng, [...FAKE_NAMES]);
    const participantNames = shuffledNames.slice(0, 10);

    // Build participants
    const participants: MatchParticipantDTO[] = [];
    for (let i = 0; i < 10; i++) {
      const teamId = i < 5 ? 100 : 200;
      const win = teamId === 100 ? blueWin : !blueWin;
      const roleIndex = i < 5 ? i : i - 5;
      const { role, lane } = ROLES_LANES[roleIndex];
      const champ = matchChamps[i];

      // KDA — realistic ranges
      const kills = seededInt(rng, 0, 18);
      const deaths = seededInt(rng, 0, 13);
      const assists = seededInt(rng, 0, 22);

      // CS scales with game duration (rough estimate: 6-9 cs/min)
      const gameMinutes = gameDuration / 60;
      const csPerMin = 5 + rng() * 4;
      const totalMinionsKilled = Math.round(csPerMin * gameMinutes * (0.7 + rng() * 0.3));
      const neutralMinionsKilled = seededInt(rng, 0, Math.round(totalMinionsKilled * 0.3));

      // Gold (8000-18000)
      const goldEarned = seededInt(rng, 8000, 18000);

      // Vision
      const visionScore = seededInt(rng, 10, 60);
      const wardsPlaced = seededInt(rng, 5, 30);
      const wardsKilled = seededInt(rng, 1, 15);

      // Damage
      const totalDamageDealtToChampions = seededInt(rng, 8000, 30000);
      const physicalPortion = rng();
      const magicPortion = rng() * (1 - physicalPortion);
      const physicalDamageDealtToChampions = Math.round(
        totalDamageDealtToChampions * physicalPortion,
      );
      const magicDamageDealtToChampions = Math.round(
        totalDamageDealtToChampions * magicPortion,
      );
      const trueDamageDealtToChampions =
        totalDamageDealtToChampions -
        physicalDamageDealtToChampions -
        magicDamageDealtToChampions;
      const totalDamageDealt = totalDamageDealtToChampions + seededInt(rng, 10000, 50000);

      const totalDamageTaken = seededInt(rng, 10000, 35000);
      const totalHeal = seededInt(rng, 2000, 15000);
      const damageDealtToTurrets = seededInt(rng, 0, 8000);
      const damageDealtToObjectives = damageDealtToTurrets + seededInt(rng, 0, 6000);

      // Items (6 regular items + 1 trinket)
      const shuffledItems = seededShuffle(rng, [...ITEMS]);
      const trinket = seededPick(rng, TRINKETS);

      // Perks
      const primaryStyleId = seededPick(rng, RUNE_STYLES);
      let subStyleId = seededPick(rng, RUNE_STYLES);
      while (subStyleId === primaryStyleId) {
        subStyleId = seededPick(rng, RUNE_STYLES);
      }

      const keystones = RUNE_KEYSTONES[primaryStyleId] ?? [8005];
      const keystone = seededPick(rng, keystones);

      const perks: PerksDTO = {
        statPerks: {
          defense: seededPick(rng, [5001, 5002, 5003]),
          flex: seededPick(rng, [5001, 5002, 5008]),
          offense: seededPick(rng, [5005, 5007, 5008]),
        },
        styles: [
          {
            description: "primaryStyle",
            style: primaryStyleId,
            selections: [
              { perk: keystone, var1: seededInt(rng, 0, 3000), var2: seededInt(rng, 0, 1000), var3: 0 },
              { perk: seededInt(rng, 8000, 8500), var1: seededInt(rng, 0, 500), var2: 0, var3: 0 },
              { perk: seededInt(rng, 8000, 8500), var1: seededInt(rng, 0, 500), var2: 0, var3: 0 },
              { perk: seededInt(rng, 8000, 8500), var1: seededInt(rng, 0, 500), var2: 0, var3: 0 },
            ],
          },
          {
            description: "subStyle",
            style: subStyleId,
            selections: [
              { perk: seededInt(rng, 8000, 8500), var1: seededInt(rng, 0, 500), var2: 0, var3: 0 },
              { perk: seededInt(rng, 8000, 8500), var1: seededInt(rng, 0, 500), var2: 0, var3: 0 },
            ],
          },
        ],
      };

      // Multi-kills
      const doubleKills = kills >= 4 ? seededInt(rng, 0, 3) : (kills >= 2 ? seededInt(rng, 0, 2) : 0);
      const tripleKills = kills >= 6 ? seededInt(rng, 0, 2) : 0;
      const quadraKills = kills >= 10 ? seededInt(rng, 0, 1) : 0;
      const pentaKills = kills >= 14 ? seededInt(rng, 0, 1) : 0;

      participants.push({
        puuid: participantPuuids[i],
        summonerName: participantNames[i],
        championId: champ.id,
        championName: champ.name,
        teamId,
        role,
        lane,
        win,
        kills,
        deaths,
        assists,
        totalMinionsKilled,
        neutralMinionsKilled,
        goldEarned,
        visionScore,
        wardsPlaced,
        wardsKilled,
        totalDamageDealt,
        totalDamageDealtToChampions,
        physicalDamageDealtToChampions,
        magicDamageDealtToChampions,
        trueDamageDealtToChampions,
        totalDamageTaken,
        totalHeal,
        damageDealtToTurrets,
        damageDealtToObjectives,
        item0: shuffledItems[0],
        item1: shuffledItems[1],
        item2: shuffledItems[2],
        item3: shuffledItems[3],
        item4: shuffledItems[4],
        item5: shuffledItems[5],
        item6: trinket,
        summoner1Id: seededPick(rng, [4, 14, 12, 7, 3, 6, 11, 21, 1]),
        summoner2Id: seededPick(rng, [4, 14, 12, 7, 3, 6, 11, 21, 1]),
        perks,
        doubleKills,
        tripleKills,
        quadraKills,
        pentaKills,
        firstBloodKill: i === 0 ? rng() > 0.5 : false,
        longestTimeSpentLiving: seededInt(rng, 60, gameDuration),
      });
    }

    // Build teams
    const teams: MatchTeamDTO[] = [
      buildTeam(rng, 100, blueWin, matchChamps),
      buildTeam(rng, 200, !blueWin, matchChamps),
    ];

    return {
      metadata: {
        matchId,
        participants: participantPuuids,
        dataVersion: "2",
      },
      info: {
        gameMode: "CLASSIC",
        gameType: "MATCHED_GAME",
        gameDuration,
        gameCreation,
        gameVersion: "14.24.6789012",
        mapId: 11,
        participants,
        teams,
      },
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // getLiveGame
  // ────────────────────────────────────────────────────────────────────────

  async getLiveGame(
    _region: string,
    puuid: string,
  ): Promise<CurrentGameInfo | null> {
    // Only the first pre-defined summoner (Faker) is "in game"
    if (puuid !== PRE_DEFINED_SUMMONERS[0].puuid) {
      return null;
    }

    const rng = seededRandom(hashString(`livegame:${puuid}`));

    const shuffledChamps = seededShuffle(rng, [...CHAMPIONS]);
    const liveChamps = shuffledChamps.slice(0, 10);
    const shuffledNames = seededShuffle(rng, [...FAKE_NAMES]);

    const participants = liveChamps.map((champ, i) => {
      const teamId = i < 5 ? 100 : 200;
      const spell1 = seededPick(rng, SUMMONER_SPELLS);
      let spell2 = seededPick(rng, SUMMONER_SPELLS);
      while (spell2 === spell1) {
        spell2 = seededPick(rng, SUMMONER_SPELLS);
      }

      const primaryStyle = seededPick(rng, RUNE_STYLES);
      let subStyle = seededPick(rng, RUNE_STYLES);
      while (subStyle === primaryStyle) {
        subStyle = seededPick(rng, RUNE_STYLES);
      }
      const keystones = RUNE_KEYSTONES[primaryStyle] ?? [8005];

      return {
        puuid: i === 0 ? puuid : `mock-puuid-live-${i}`.padEnd(48, "0"),
        summonerId: `mock-sid-live-${i}`,
        summonerName: i === 0 ? "Faker" : shuffledNames[i],
        championId: champ.id,
        teamId,
        perks: {
          perkIds: [seededPick(rng, keystones), seededInt(rng, 8000, 8500), seededInt(rng, 8000, 8500)],
          perkStyle: primaryStyle,
          perkSubStyle: subStyle,
        },
        spell1Id: spell1,
        spell2Id: spell2,
      };
    });

    // Banned champions (5 per team)
    const banChamps = seededShuffle(rng, [...CHAMPIONS]).slice(0, 10);
    const bannedChampions = banChamps.map((champ, i) => ({
      championId: champ.id,
      teamId: i < 5 ? 100 : 200,
      pickTurn: i + 1,
    }));

    return {
      gameId: 7000000000 + seededInt(rng, 0, 999999),
      gameMode: "CLASSIC",
      gameType: "MATCHED_GAME",
      gameStartTime: Date.now() - seededInt(rng, 60000, 1800000), // 1-30 min ago
      mapId: 11,
      platformId: "KR",
      participants,
      bannedChampions,
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // getChampionMasteries
  // ────────────────────────────────────────────────────────────────────────

  async getChampionMasteries(
    _region: string,
    puuid: string,
  ): Promise<ChampionMasteryDTO[]> {
    const rng = seededRandom(hashString(`mastery:${puuid}`));
    const count = seededInt(rng, 10, 20);
    const shuffled = seededShuffle(rng, [...CHAMPIONS]);
    const selected = shuffled.slice(0, count);

    return selected.map((champ) => {
      const level = seededInt(rng, 1, 7);
      // Higher levels tend to have more points
      const basePoints = [0, 1000, 6000, 12000, 21000, 35000, 50000, 80000];
      const minPoints = basePoints[level] ?? 1000;
      const maxPoints = level === 7 ? 500000 : (basePoints[level + 1] ?? 100000);
      const points = seededInt(rng, minPoints, maxPoints);

      return {
        championId: champ.id,
        championLevel: level,
        championPoints: points,
        lastPlayTime: Date.now() - seededInt(rng, 86400000, 2592000000), // 1-30 days ago
        puuid,
      };
    });
  }

  async getMatchTimeline(
    _region: string,
    matchId: string,
  ): Promise<MatchTimelineDTO> {
    const rng = seededRandom(hashString(`timeline:${matchId}`));

    // Derive game duration consistently with getMatchDetails
    const matchRng = seededRandom(hashString(`details:${matchId}`));
    const gameDuration = seededInt(matchRng, 1200, 2400);
    const frameInterval = 60000;
    const frameCount = Math.ceil(gameDuration / 60);

    const participantPuuids: string[] = [];
    for (let i = 0; i < 10; i++) {
      participantPuuids.push(`mock-puuid-${matchId}-${i}`.padEnd(48, "0"));
    }

    const frames: TimelineFrame[] = [];
    const goldAccum = Array.from({ length: 10 }, () => 500);
    const xpAccum = Array.from({ length: 10 }, () => 0);

    for (let f = 0; f <= frameCount; f++) {
      const timestamp = f * frameInterval;
      const participantFrames: Record<string, TimelineParticipantFrame> = {};

      for (let p = 0; p < 10; p++) {
        if (f > 0) {
          goldAccum[p] += seededInt(rng, 250, 550);
          xpAccum[p] += seededInt(rng, 350, 750);
        }

        const level = Math.min(18, Math.max(1, Math.floor(xpAccum[p] / 600) + 1));

        participantFrames[String(p + 1)] = {
          participantId: p + 1,
          totalGold: goldAccum[p],
          currentGold: seededInt(rng, 0, Math.min(goldAccum[p], 3000)),
          minionsKilled: Math.round((5 + rng() * 4) * f * (0.7 + rng() * 0.3)),
          jungleMinionsKilled: p % 5 === 1 ? seededInt(rng, 0, f * 4) : seededInt(rng, 0, f),
          xp: xpAccum[p],
          level,
          position: { x: seededInt(rng, 0, 14000), y: seededInt(rng, 0, 14000) },
        };
      }

      const events: TimelineEvent[] = [];

      if (f > 2) {
        // Champion kill ~30% per frame
        if (rng() < 0.3) {
          const killerId = seededInt(rng, 1, 10);
          let victimId = seededInt(rng, 1, 10);
          while (Math.ceil(victimId / 5) === Math.ceil(killerId / 5)) {
            victimId = seededInt(rng, 1, 10);
          }
          const sameTeam = Array.from({ length: 5 }, (_, i) =>
            killerId <= 5 ? i + 1 : i + 6,
          ).filter((id) => id !== killerId);
          const assists = seededShuffle(rng, sameTeam).slice(0, seededInt(rng, 0, 3));

          events.push({
            type: "CHAMPION_KILL",
            timestamp: timestamp + seededInt(rng, 0, frameInterval),
            killerId,
            victimId,
            assistingParticipantIds: assists,
          });
        }

        // Dragon every ~5 min after min 5
        if (f >= 5 && f % 5 === 0 && rng() < 0.6) {
          const dragonTypes = ["FIRE_DRAGON", "WATER_DRAGON", "EARTH_DRAGON", "AIR_DRAGON", "HEXTECH_DRAGON", "CHEMTECH_DRAGON"];
          events.push({
            type: "ELITE_MONSTER_KILL",
            timestamp: timestamp + seededInt(rng, 0, frameInterval),
            killerId: seededInt(rng, 1, 10),
            monsterType: "DRAGON",
            monsterSubType: seededPick(rng, dragonTypes),
          });
        }

        // Baron after 20 min
        if (f >= 20 && f % 7 === 0 && rng() < 0.4) {
          events.push({
            type: "ELITE_MONSTER_KILL",
            timestamp: timestamp + seededInt(rng, 0, frameInterval),
            killerId: seededInt(rng, 1, 10),
            monsterType: "BARON_NASHOR",
          });
        }

        // Rift Herald min 8-20
        if (f >= 8 && f <= 20 && f % 6 === 0 && rng() < 0.5) {
          events.push({
            type: "ELITE_MONSTER_KILL",
            timestamp: timestamp + seededInt(rng, 0, frameInterval),
            killerId: seededInt(rng, 1, 10),
            monsterType: "RIFTHERALD",
          });
        }

        // Tower kills after min 10
        if (f >= 10 && rng() < 0.15) {
          const lanes = ["TOP_LANE", "MID_LANE", "BOT_LANE"] as const;
          const towerTypes = ["OUTER_TURRET", "INNER_TURRET", "BASE_TURRET"] as const;
          events.push({
            type: "BUILDING_KILL",
            timestamp: timestamp + seededInt(rng, 0, frameInterval),
            killerId: seededInt(rng, 1, 10),
            teamId: rng() > 0.5 ? 100 : 200,
            buildingType: "TOWER_BUILDING",
            laneType: seededPick(rng, lanes),
            towerType: seededPick(rng, towerTypes),
          });
        }
      }

      frames.push({ timestamp, participantFrames, events });
    }

    return {
      metadata: { matchId, participants: participantPuuids, dataVersion: "2" },
      info: { frameInterval, frames },
    };
  }

  async getLeagueByTier(
    region: string,
    queue: string,
    tier: "challenger" | "grandmaster" | "master",
  ): Promise<LeagueListDTO> {
    const seed = hashString(`leaderboard:${region}:${queue}:${tier}`);
    const rng = seededRandom(seed);

    const count =
      tier === "challenger" ? 300 : tier === "grandmaster" ? 700 : 3000;
    const baseLp =
      tier === "challenger" ? 800 : tier === "grandmaster" ? 400 : 0;

    const FAKE_NAMES = [
      "HideonBush", "Ruler", "Deft", "Chovy", "Zeus", "Keria", "Canyon",
      "Gumayusi", "ShowMaker", "Viper", "BeryL", "Lehends", "Peyz", "Oner",
      "Faker", "Peanut", "Doran", "Prince", "Aiming", "Delight", "Life",
      "Lucid", "Zeka", "Kanavi", "TheShy", "Meiko", "Scout", "Jiejie", "Elk",
      "ON", "Caps", "Jankos", "Rekkles", "Mikyx", "Wunder", "HansSama",
      "Elyoya", "Humanoid", "Comp", "Trymbi", "Upset", "Razork", "Oscarinin",
      "Noah", "Inspired", "Bwipo", "CoreJJ", "Blaber", "Berserker", "Impact",
    ];

    const entries: LeagueItemDTO[] = Array.from({ length: count }, (_, i) => {
      const nameBase = FAKE_NAMES[i % FAKE_NAMES.length];
      const suffix =
        i >= FAKE_NAMES.length
          ? `${Math.floor(i / FAKE_NAMES.length)}`
          : "";
      return {
        summonerId: `mock-${region}-${tier}-${i}`,
        summonerName: `${nameBase}${suffix}`,
        leaguePoints: baseLp + Math.floor(rng() * 600) + (count - i),
        rank: "I",
        wins: seededInt(rng, 100, 500),
        losses: seededInt(rng, 80, 400),
        veteran: rng() > 0.7,
        freshBlood: rng() > 0.85,
        hotStreak: rng() > 0.8,
        inactive: false,
      };
    });

    entries.sort((a, b) => b.leaguePoints - a.leaguePoints);

    return {
      tier: tier.toUpperCase(),
      leagueId: `mock-league-${region}-${tier}`,
      queue,
      name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${region.toUpperCase()}`,
      entries,
    };
  }
}

// ─── Helper: build team objectives ──────────────────────────────────────────

function buildTeam(
  rng: () => number,
  teamId: number,
  win: boolean,
  allChamps: { id: number; name: string }[],
): MatchTeamDTO {
  const towerKills = win ? seededInt(rng, 5, 11) : seededInt(rng, 3, 8);
  const inhibKills = win ? seededInt(rng, 1, 3) : seededInt(rng, 0, 1);
  const baronKills = seededInt(rng, 0, 2);
  const dragonKills = seededInt(rng, 1, 4);
  const riftKills = seededInt(rng, 0, 2);
  const champKills = seededInt(rng, 10, 45);

  // 5 bans from remaining champions
  const banPool = seededShuffle(rng, [...allChamps]);
  const bans = banPool.slice(0, 5).map((c, i) => ({
    championId: c.id,
    pickTurn: teamId === 100 ? i + 1 : i + 6,
  }));

  return {
    teamId,
    win,
    objectives: {
      baron: { first: rng() > 0.5, kills: baronKills },
      dragon: { first: rng() > 0.5, kills: dragonKills },
      riftHerald: { first: rng() > 0.5, kills: riftKills },
      tower: { first: rng() > 0.5, kills: towerKills },
      inhibitor: { first: rng() > 0.5, kills: inhibKills },
      champion: { first: rng() > 0.5, kills: champKills },
    },
    bans,
  };
}
