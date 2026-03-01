"use client";

import { useState, useEffect, useCallback } from "react";
import type { EnrichedCurrentGameInfo, EnrichedParticipant, BannedChampion, PlayerTag } from "@/types/riot";
import { getChampionIconUrl, getSummonerSpellIconUrl, getRankEmblemUrl } from "@/lib/constants";

// ─── Champion ID to Name mapping ────────────────────────────────────────────
const CHAMPION_ID_TO_NAME: Record<number, string> = {
  103: "Ahri", 84: "Akali", 12: "Alistar", 32: "Amumu", 22: "Ashe",
  53: "Blitzcrank", 63: "Brand", 51: "Caitlyn", 122: "Darius", 119: "Draven",
  81: "Ezreal", 114: "Fiora", 86: "Garen", 104: "Graves", 39: "Irelia",
  202: "Jhin", 222: "Jinx", 145: "Kaisa", 55: "Katarina", 64: "LeeSin",
  99: "Lux", 21: "MissFortune", 25: "Morgana", 111: "Nautilus", 61: "Orianna",
  555: "Pyke", 92: "Riven", 235: "Senna", 412: "Thresh", 4: "TwistedFate",
  110: "Varus", 67: "Vayne", 254: "Vi", 157: "Yasuo", 238: "Zed",
};

function getChampionNameById(championId: number): string {
  return CHAMPION_ID_TO_NAME[championId] ?? `Champion${championId}`;
}

// ─── Keystone mapping ───────────────────────────────────────────────────────
const KEYSTONE_NAMES: Record<number, string> = {
  8005: "Press the Attack", 8008: "Lethal Tempo", 8010: "Conqueror", 8021: "Fleet Footwork",
  8112: "Electrocute", 8124: "Predator", 8128: "Dark Harvest", 9923: "Hail of Blades",
  8214: "Summon Aery", 8229: "Arcane Comet", 8230: "Phase Rush",
  8351: "Glacial Augment", 8360: "Unsealed Spellbook", 8369: "First Strike",
  8437: "Grasp of the Undying", 8439: "Aftershock", 8465: "Guardian",
};

// ─── Tier colors ────────────────────────────────────────────────────────────
const TIER_COLOR_MAP: Record<string, string> = {
  IRON: "var(--color-rank-iron)", BRONZE: "var(--color-rank-bronze)",
  SILVER: "var(--color-rank-silver)", GOLD: "var(--color-rank-gold)",
  PLATINUM: "var(--color-rank-platinum)", EMERALD: "var(--color-rank-emerald)",
  DIAMOND: "var(--color-rank-diamond)", MASTER: "var(--color-rank-master)",
  GRANDMASTER: "var(--color-rank-grandmaster)", CHALLENGER: "var(--color-rank-challenger)",
};

// ─── Game Mode mapping ──────────────────────────────────────────────────────
const GAME_MODE_NAMES: Record<string, string> = {
  CLASSIC: "Summoner's Rift", ARAM: "ARAM", URF: "Ultra Rapid Fire",
  ONEFORALL: "One for All", CHERRY: "Arena",
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatTier(tier: string): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface LiveGamePanelProps {
  initialGame: EnrichedCurrentGameInfo | null;
  summonerPuuid: string;
  summonerName: string;
  region: string;
}

// ─── Not In Game State ──────────────────────────────────────────────────────

function NotInGameState({ summonerName }: { summonerName: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-700/50 bg-gray-900/80 px-6 py-16 text-center backdrop-blur-sm">
      <span className="mb-4 text-5xl">🎮</span>
      <h3 className="text-xl font-bold text-white">Not Currently In Game</h3>
      <p className="mt-2 max-w-md text-gray-400">{summonerName} is not currently in a game.</p>
      <p className="mt-1 text-sm text-gray-500">Live game data will appear here when a match is in progress.</p>
    </div>
  );
}

// ─── Game Ended State ───────────────────────────────────────────────────────

function GameEndedState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-700/50 bg-gray-900/80 px-6 py-16 text-center backdrop-blur-sm">
      <span className="mb-4 text-5xl">🏁</span>
      <h3 className="text-xl font-bold text-white">Game Has Ended</h3>
      <p className="mt-2 text-gray-400">The live game has concluded. Check the match history for results.</p>
    </div>
  );
}

// ─── Player Tag Badge ───────────────────────────────────────────────────────

function PlayerTagBadge({ tag }: { tag: PlayerTag }) {
  const classes: Record<string, string> = {
    positive: "bg-green-500/15 text-green-400 border-green-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    neutral: "bg-gray-500/15 text-gray-300 border-gray-500/30",
  };

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none ${classes[tag.variant] ?? classes.neutral}`}>
      <span>{tag.emoji}</span>
      <span>{tag.label}</span>
    </span>
  );
}

// ─── Participant Row ────────────────────────────────────────────────────────

function ParticipantRow({
  participant,
  isCurrentSummoner,
}: {
  participant: EnrichedParticipant;
  isCurrentSummoner: boolean;
}) {
  const championName = getChampionNameById(participant.championId);
  const keystoneId = participant.perks.perkIds[0];
  const keystoneName = KEYSTONE_NAMES[keystoneId] ?? `Rune ${keystoneId}`;

  const soloEntry = participant.ranked?.soloQueue;
  const isApex = soloEntry && ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(soloEntry.tier);
  const tierColor = soloEntry ? (TIER_COLOR_MAP[soloEntry.tier] ?? "var(--color-rank-iron)") : undefined;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg p-2 transition-all duration-200 ${
        isCurrentSummoner
          ? "border border-cyan/50 bg-cyan/10 shadow-[0_0_12px_rgba(0,212,255,0.15)]"
          : "border border-transparent hover:bg-white/5"
      }`}
    >
      {/* Champion Icon */}
      <img src={getChampionIconUrl(championName)} alt={championName} width={40} height={40} className="flex-shrink-0 rounded-lg" />

      {/* Summoner Spells (stacked icons) */}
      <div className="flex flex-shrink-0 flex-col gap-0.5">
        <img src={getSummonerSpellIconUrl(participant.spell1Id)} alt="" width={18} height={18} className="rounded" />
        <img src={getSummonerSpellIconUrl(participant.spell2Id)} alt="" width={18} height={18} className="rounded" />
      </div>

      {/* Name + Rank */}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${isCurrentSummoner ? "text-cyan" : "text-white"}`}>
          {participant.summonerName}
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          {soloEntry ? (
            <>
              <img src={getRankEmblemUrl(soloEntry.tier)} alt={soloEntry.tier} width={16} height={16} className="flex-shrink-0" />
              <span className="text-[10px] font-semibold" style={{ color: tierColor }}>
                {formatTier(soloEntry.tier)}{!isApex ? ` ${soloEntry.rank}` : ""}
              </span>
              <span className="text-[10px] text-gold">{soloEntry.leaguePoints} LP</span>
            </>
          ) : (
            <span className="text-[10px] text-gray-500">Unranked</span>
          )}
        </div>
      </div>

      {/* Player Tags */}
      {participant.tags.length > 0 && (
        <div className="hidden flex-shrink-0 flex-wrap gap-1 sm:flex">
          {participant.tags.map((tag) => (
            <PlayerTagBadge key={tag.type} tag={tag} />
          ))}
        </div>
      )}

      {/* Winrate */}
      <div className="hidden flex-shrink-0 flex-col items-end md:flex" style={{ minWidth: "52px" }}>
        {participant.winrate !== null && participant.totalGames !== null ? (
          <>
            <span className={`text-xs font-semibold ${participant.winrate >= 50 ? "text-win" : "text-loss"}`}>
              {participant.winrate.toFixed(0)}%
            </span>
            <span className="text-[10px] text-gray-500">{participant.totalGames}G</span>
          </>
        ) : (
          <span className="text-[10px] text-gray-500">—</span>
        )}
      </div>

      {/* Keystone */}
      <div className="hidden flex-shrink-0 lg:block" style={{ minWidth: "80px" }}>
        <span className="text-[10px] font-medium text-gray-400">{keystoneName}</span>
      </div>
    </div>
  );
}

// ─── Team Section ───────────────────────────────────────────────────────────

function TeamSection({
  teamName,
  teamColor,
  participants,
  summonerPuuid,
  borderClass,
  bgClass,
}: {
  teamName: string;
  teamColor: string;
  participants: EnrichedParticipant[];
  summonerPuuid: string;
  borderClass: string;
  bgClass: string;
}) {
  const playersWithWR = participants.filter((p) => p.winrate !== null);
  const avgWinrate = playersWithWR.length > 0
    ? playersWithWR.reduce((sum, p) => sum + (p.winrate ?? 0), 0) / playersWithWR.length
    : null;

  return (
    <div className={`rounded-xl border ${borderClass} ${bgClass} p-4 backdrop-blur-sm`}>
      {/* Team Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${teamColor}`} />
          <h3 className="text-sm font-semibold text-white">{teamName}</h3>
        </div>
        {avgWinrate !== null && (
          <span className={`text-xs font-medium ${avgWinrate >= 50 ? "text-win" : "text-loss"}`}>
            Avg {avgWinrate.toFixed(0)}% WR
          </span>
        )}
      </div>

      {/* Participant List */}
      <div className="space-y-1">
        {participants.map((participant) => (
          <ParticipantRow
            key={participant.puuid}
            participant={participant}
            isCurrentSummoner={participant.puuid === summonerPuuid}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Banned Champions Section ───────────────────────────────────────────────

function BannedChampionsSection({ bans }: { bans: BannedChampion[] }) {
  const blueBans = bans.filter((b) => b.teamId === 100);
  const redBans = bans.filter((b) => b.teamId === 200);

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-semibold text-white">Banned Champions</h3>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <div className="flex-1">
          <p className="mb-2 text-xs text-blue-400">Blue Side Bans</p>
          <div className="flex gap-2">
            {blueBans.map((ban) => {
              const name = getChampionNameById(ban.championId);
              return (
                <div key={`ban-${ban.teamId}-${ban.pickTurn}`} className="relative">
                  <img src={getChampionIconUrl(name)} alt={name} width={32} height={32} className="rounded-md opacity-50 grayscale" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-[2px] w-7 rotate-45 rounded bg-red-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-1">
          <p className="mb-2 text-xs text-red-400">Red Side Bans</p>
          <div className="flex gap-2">
            {redBans.map((ban) => {
              const name = getChampionNameById(ban.championId);
              return (
                <div key={`ban-${ban.teamId}-${ban.pickTurn}`} className="relative">
                  <img src={getChampionIconUrl(name)} alt={name} width={32} height={32} className="rounded-md opacity-50 grayscale" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-[2px] w-7 rotate-45 rounded bg-red-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main LiveGamePanel Component ───────────────────────────────────────────

export default function LiveGamePanel({
  initialGame,
  summonerPuuid,
  summonerName,
  region,
}: LiveGamePanelProps) {
  const [liveGame, setLiveGame] = useState<EnrichedCurrentGameInfo | null>(initialGame);
  const [gameEnded, setGameEnded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [gameDuration, setGameDuration] = useState("");

  const updateGameDuration = useCallback(() => {
    if (!liveGame) return;
    const elapsed = Date.now() - liveGame.gameStartTime;
    if (elapsed > 0) {
      setGameDuration(formatDuration(elapsed));
    } else {
      setGameDuration("Loading...");
    }
  }, [liveGame]);

  useEffect(() => {
    updateGameDuration();
    const interval = setInterval(updateGameDuration, 1000);
    return () => clearInterval(interval);
  }, [updateGameDuration]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  useEffect(() => {
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/livegame/${encodeURIComponent(region)}/${encodeURIComponent(summonerPuuid)}`
        );
        if (!response.ok) return;
        const data = await response.json();
        setLastUpdated(new Date());
        setSecondsAgo(0);
        if (data.liveGame) {
          setLiveGame(data.liveGame);
          setGameEnded(false);
        } else {
          if (liveGame) setGameEnded(true);
          setLiveGame(null);
        }
      } catch (error) {
        console.error("Error polling live game:", error);
      }
    };

    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [region, summonerPuuid, liveGame]);

  if (gameEnded && !liveGame) return <GameEndedState />;

  if (!liveGame) {
    return (
      <div>
        <NotInGameState summonerName={summonerName} />
        <p className="mt-3 text-center text-xs text-gray-500">
          Auto-checking every 30 seconds &middot; Last checked {secondsAgo}s ago
        </p>
      </div>
    );
  }

  const blueTeam = liveGame.participants.filter((p) => p.teamId === 100);
  const redTeam = liveGame.participants.filter((p) => p.teamId === 200);
  const gameModeName = GAME_MODE_NAMES[liveGame.gameMode] ?? liveGame.gameMode;

  return (
    <div className="space-y-4">
      {/* Game Info Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-700/50 bg-gray-900/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-sm font-medium text-white">LIVE</span>
          <span className="text-sm text-gray-400">{gameModeName}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-sm font-semibold text-gold">{gameDuration}</span>
          </div>
          <span className="text-xs text-gray-500">Updated {secondsAgo}s ago</span>
        </div>
      </div>

      {/* Teams Side by Side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TeamSection
          teamName="Blue Side"
          teamColor="bg-blue-500"
          participants={blueTeam}
          summonerPuuid={summonerPuuid}
          borderClass="border-blue-700/30"
          bgClass="bg-blue-900/20"
        />
        <TeamSection
          teamName="Red Side"
          teamColor="bg-red-500"
          participants={redTeam}
          summonerPuuid={summonerPuuid}
          borderClass="border-red-700/30"
          bgClass="bg-red-900/20"
        />
      </div>

      {/* Banned Champions */}
      {liveGame.bannedChampions.length > 0 && (
        <BannedChampionsSection bans={liveGame.bannedChampions} />
      )}
    </div>
  );
}
