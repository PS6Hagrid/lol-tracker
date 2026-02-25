"use client";

import { useState } from "react";
import type { MatchDTO, MatchParticipantDTO } from "@/types/riot";
import { getChampionIconUrl, getItemIconUrl } from "@/lib/constants";

interface MatchCardProps {
  match: MatchDTO;
  summonerPuuid: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getGameMode(gameMode: string, gameType: string): string {
  if (gameType === "MATCHED_GAME" && gameMode === "CLASSIC") return "Ranked Solo";
  if (gameMode === "ARAM") return "ARAM";
  if (gameMode === "CLASSIC") return "Normal";
  return gameMode;
}

/** Find the participant row for the searched summoner. Falls back to index 0 if puuid not found (mock data). */
function findSummonerParticipant(
  match: MatchDTO,
  puuid: string,
): MatchParticipantDTO {
  return (
    match.info.participants.find((p) => p.puuid === puuid) ??
    match.info.participants[0]
  );
}

export default function MatchCard({ match, summonerPuuid }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const player = findSummonerParticipant(match, summonerPuuid);
  const win = player.win;
  const totalCS = player.totalMinionsKilled + player.neutralMinionsKilled;
  const gameMinutes = match.info.gameDuration / 60;
  const csPerMin = gameMinutes > 0 ? (totalCS / gameMinutes).toFixed(1) : "0";
  const kdaRatio =
    player.deaths === 0
      ? "Perfect"
      : ((player.kills + player.assists) / player.deaths).toFixed(2);

  const items = [
    player.item0,
    player.item1,
    player.item2,
    player.item3,
    player.item4,
    player.item5,
    player.item6,
  ];

  const blueTeam = match.info.participants.filter((p) => p.teamId === 100);
  const redTeam = match.info.participants.filter((p) => p.teamId === 200);
  const blueTeamData = match.info.teams.find((t) => t.teamId === 100);
  const redTeamData = match.info.teams.find((t) => t.teamId === 200);

  const maxDamage = Math.max(
    ...match.info.participants.map((p) => p.totalDamageDealtToChampions),
  );

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-200 ${
        win
          ? "border-green-700/30 bg-green-900/20"
          : "border-red-700/30 bg-red-900/20"
      }`}
    >
      {/* ── Compact View ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-3 text-left transition-all duration-200 hover:bg-white/5 sm:gap-4 sm:p-4"
      >
        {/* Win/Loss indicator bar */}
        <div
          className={`hidden h-16 w-1 flex-shrink-0 rounded-full sm:block ${
            win ? "bg-green-500" : "bg-red-500"
          }`}
        />

        {/* Champion icon */}
        <div className="relative flex-shrink-0">
          <img
            src={getChampionIconUrl(player.championName)}
            alt={player.championName}
            width={48}
            height={48}
            className="rounded-lg"
          />
        </div>

        {/* KDA */}
        <div className="min-w-0 flex-shrink-0">
          <div className="flex items-center gap-1 text-sm font-bold">
            <span className="text-white">{player.kills}</span>
            <span className="text-gray-500">/</span>
            <span className="text-red-400">{player.deaths}</span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-400">{player.assists}</span>
          </div>
          <span
            className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-xs font-semibold ${
              kdaRatio === "Perfect"
                ? "bg-amber-500/20 text-amber-400"
                : parseFloat(kdaRatio) >= 3
                  ? "bg-cyan-500/20 text-cyan-400"
                  : parseFloat(kdaRatio) >= 2
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {kdaRatio} KDA
          </span>
        </div>

        {/* CS & Gold & Vision */}
        <div className="hidden min-w-0 flex-shrink-0 text-xs text-gray-400 sm:block">
          <div>
            <span className="text-white">{totalCS}</span> CS ({csPerMin}/min)
          </div>
          <div>
            <span className="text-amber-400">
              {(player.goldEarned / 1000).toFixed(1)}k
            </span>{" "}
            gold
          </div>
          <div>
            <span className="text-purple-400">{player.visionScore}</span> vision
          </div>
        </div>

        {/* Items */}
        <div className="ml-auto flex flex-shrink-0 items-center gap-0.5">
          {items.map((itemId, idx) => (
            <div key={idx} className="h-7 w-7 overflow-hidden rounded sm:h-8 sm:w-8">
              {itemId > 0 ? (
                <img
                  src={getItemIconUrl(itemId)}
                  alt={`Item ${itemId}`}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-800/60" />
              )}
            </div>
          ))}
        </div>

        {/* Game info */}
        <div className="flex flex-shrink-0 flex-col items-end text-xs text-gray-400">
          <span className={`font-semibold ${win ? "text-green-400" : "text-red-400"}`}>
            {win ? "Victory" : "Defeat"}
          </span>
          <span>{formatDuration(match.info.gameDuration)}</span>
          <span>{timeAgo(match.info.gameCreation)}</span>
          <span className="text-gray-500">
            {getGameMode(match.info.gameMode, match.info.gameType)}
          </span>
        </div>

        {/* Expand chevron */}
        <svg
          className={`h-4 w-4 flex-shrink-0 text-gray-500 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Expanded View ── */}
      {expanded && (
        <div className="border-t border-gray-700/50 px-3 pb-4 pt-3 sm:px-4">
          {/* Team objectives */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            {/* Blue Team */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    blueTeamData?.win ? "text-green-400" : "text-red-400"
                  }`}
                >
                  Blue Team {blueTeamData?.win ? "(Victory)" : "(Defeat)"}
                </span>
              </div>
              {blueTeamData && (
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>
                    Baron:{" "}
                    <span className="text-amber-400">
                      {blueTeamData.objectives.baron.kills}
                    </span>
                  </span>
                  <span>
                    Dragon:{" "}
                    <span className="text-purple-400">
                      {blueTeamData.objectives.dragon.kills}
                    </span>
                  </span>
                  <span>
                    Tower:{" "}
                    <span className="text-cyan-400">
                      {blueTeamData.objectives.tower.kills}
                    </span>
                  </span>
                </div>
              )}
            </div>
            {/* Red Team */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    redTeamData?.win ? "text-green-400" : "text-red-400"
                  }`}
                >
                  Red Team {redTeamData?.win ? "(Victory)" : "(Defeat)"}
                </span>
              </div>
              {redTeamData && (
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>
                    Baron:{" "}
                    <span className="text-amber-400">
                      {redTeamData.objectives.baron.kills}
                    </span>
                  </span>
                  <span>
                    Dragon:{" "}
                    <span className="text-purple-400">
                      {redTeamData.objectives.dragon.kills}
                    </span>
                  </span>
                  <span>
                    Tower:{" "}
                    <span className="text-cyan-400">
                      {redTeamData.objectives.tower.kills}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Participants table */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Blue Side */}
            <ParticipantTable
              participants={blueTeam}
              summonerPuuid={summonerPuuid}
              maxDamage={maxDamage}
              teamLabel="Blue Side"
              teamColor="blue"
            />
            {/* Red Side */}
            <ParticipantTable
              participants={redTeam}
              summonerPuuid={summonerPuuid}
              maxDamage={maxDamage}
              teamLabel="Red Side"
              teamColor="red"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipantTable({
  participants,
  summonerPuuid,
  maxDamage,
  teamLabel,
  teamColor,
}: {
  participants: MatchParticipantDTO[];
  summonerPuuid: string;
  maxDamage: number;
  teamLabel: string;
  teamColor: "blue" | "red";
}) {
  return (
    <div>
      <h4
        className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
          teamColor === "blue" ? "text-blue-400" : "text-red-400"
        }`}
      >
        {teamLabel}
      </h4>
      <div className="space-y-1">
        {participants.map((p) => {
          const isSummoner = p.puuid === summonerPuuid;
          const cs = p.totalMinionsKilled + p.neutralMinionsKilled;
          const damagePercent =
            maxDamage > 0
              ? (p.totalDamageDealtToChampions / maxDamage) * 100
              : 0;

          return (
            <div
              key={p.puuid}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                isSummoner
                  ? "bg-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "bg-gray-800/40"
              }`}
            >
              {/* Champion icon */}
              <img
                src={getChampionIconUrl(p.championName)}
                alt={p.championName}
                width={28}
                height={28}
                className="flex-shrink-0 rounded"
              />

              {/* Name */}
              <span
                className={`w-24 min-w-0 truncate ${
                  isSummoner ? "font-semibold text-cyan-400" : "text-gray-300"
                }`}
              >
                {p.summonerName}
              </span>

              {/* KDA */}
              <span className="w-16 flex-shrink-0 text-center text-gray-400">
                {p.kills}/{p.deaths}/{p.assists}
              </span>

              {/* CS */}
              <span className="w-10 flex-shrink-0 text-center text-gray-500">
                {cs} CS
              </span>

              {/* Damage bar */}
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-700/50">
                  <div
                    className={`h-full rounded-full ${
                      teamColor === "blue" ? "bg-blue-500/70" : "bg-red-500/70"
                    }`}
                    style={{ width: `${damagePercent}%` }}
                  />
                </div>
                <span className="w-10 flex-shrink-0 text-right text-gray-500">
                  {(p.totalDamageDealtToChampions / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
