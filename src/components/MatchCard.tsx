"use client";

import { useState } from "react";
import type { MatchDTO, MatchParticipantDTO } from "@/types/riot";
import { getChampionIconUrl, getItemIconUrl } from "@/lib/constants";

interface MatchCardProps {
  match: MatchDTO;
  summonerPuuid: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function findSummonerParticipant(
  match: MatchDTO,
  puuid: string,
): MatchParticipantDTO {
  return (
    match.info.participants.find((p) => p.puuid === puuid) ??
    match.info.participants[0]
  );
}

/** Get the highest multi-kill for a participant */
function getMultiKillBadge(p: MatchParticipantDTO): {
  label: string;
  className: string;
} | null {
  if (p.pentaKills > 0) return { label: "PENTA", className: "bg-amber-500/20 text-amber-400" };
  if (p.quadraKills > 0) return { label: "QUADRA", className: "bg-purple-500/20 text-purple-400" };
  if (p.tripleKills > 0) return { label: "TRIPLE", className: "bg-cyan-500/20 text-cyan-400" };
  if (p.doubleKills > 0) return { label: "DOUBLE", className: "bg-blue-500/20 text-blue-400" };
  return null;
}

// ── Main Component ─────────────────────────────────────────────────────────────

type DetailTab = "overview" | "damage" | "vision";

export default function MatchCard({ match, summonerPuuid }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
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
    player.item0, player.item1, player.item2,
    player.item3, player.item4, player.item5, player.item6,
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
          {/* Team objectives summary */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
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
                  <span>Baron: <span className="text-amber-400">{blueTeamData.objectives.baron.kills}</span></span>
                  <span>Dragon: <span className="text-purple-400">{blueTeamData.objectives.dragon.kills}</span></span>
                  <span>Tower: <span className="text-cyan-400">{blueTeamData.objectives.tower.kills}</span></span>
                </div>
              )}
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2">
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
                  <span>Baron: <span className="text-amber-400">{redTeamData.objectives.baron.kills}</span></span>
                  <span>Dragon: <span className="text-purple-400">{redTeamData.objectives.dragon.kills}</span></span>
                  <span>Tower: <span className="text-cyan-400">{redTeamData.objectives.tower.kills}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Tab navigation */}
          <div className="mb-4 flex gap-1 border-b border-gray-700/50">
            {(
              [
                { key: "overview", label: "Overview" },
                { key: "damage", label: "Damage" },
                { key: "vision", label: "Vision" },
              ] as { key: DetailTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "border-b-2 border-cyan text-cyan"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && (
            <OverviewTab
              blueTeam={blueTeam}
              redTeam={redTeam}
              summonerPuuid={summonerPuuid}
              maxDamage={maxDamage}
            />
          )}
          {activeTab === "damage" && (
            <DamageTab
              participants={match.info.participants}
              summonerPuuid={summonerPuuid}
            />
          )}
          {activeTab === "vision" && (
            <VisionTab
              participants={match.info.participants}
              summonerPuuid={summonerPuuid}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────────

function OverviewTab({
  blueTeam,
  redTeam,
  summonerPuuid,
  maxDamage,
}: {
  blueTeam: MatchParticipantDTO[];
  redTeam: MatchParticipantDTO[];
  summonerPuuid: string;
  maxDamage: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <OverviewTeamTable
        participants={blueTeam}
        summonerPuuid={summonerPuuid}
        maxDamage={maxDamage}
        teamLabel="Blue Side"
        teamColor="blue"
      />
      <OverviewTeamTable
        participants={redTeam}
        summonerPuuid={summonerPuuid}
        maxDamage={maxDamage}
        teamLabel="Red Side"
        teamColor="red"
      />
    </div>
  );
}

function OverviewTeamTable({
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
        {participants.map((p, idx) => {
          const isSummoner = p.puuid === summonerPuuid;
          const cs = p.totalMinionsKilled + p.neutralMinionsKilled;
          const damagePercent =
            maxDamage > 0 ? (p.totalDamageDealtToChampions / maxDamage) * 100 : 0;
          const multiKill = getMultiKillBadge(p);
          const playerItems = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6];

          return (
            <div
              key={p.puuid || `${p.championName}-${idx}`}
              className={`rounded-lg px-2 py-1.5 text-xs ${
                isSummoner
                  ? "bg-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "bg-gray-800/40"
              }`}
            >
              {/* Row 1: Champion, Name, KDA, Multi-kill */}
              <div className="flex items-center gap-2">
                <img
                  src={getChampionIconUrl(p.championName)}
                  alt={p.championName}
                  width={28}
                  height={28}
                  className="flex-shrink-0 rounded"
                />
                <span
                  className={`w-20 min-w-0 truncate ${
                    isSummoner ? "font-semibold text-cyan-400" : "text-gray-300"
                  }`}
                >
                  {p.summonerName || p.championName}
                </span>
                <span className="w-16 flex-shrink-0 text-center text-gray-400">
                  {p.kills}/{p.deaths}/{p.assists}
                </span>
                {multiKill && (
                  <span className={`rounded px-1 py-0.5 text-[10px] font-bold ${multiKill.className}`}>
                    {multiKill.label}
                  </span>
                )}
                <span className="ml-auto flex-shrink-0 text-gray-500">{cs} CS</span>
                <span className="flex-shrink-0 text-amber-400">{formatNumber(p.goldEarned)}</span>
              </div>

              {/* Row 2: Items + Damage bar */}
              <div className="mt-1 flex items-center gap-2">
                {/* Items */}
                <div className="flex items-center gap-0.5">
                  {playerItems.map((itemId, i) => (
                    <div key={i} className="h-6 w-6 overflow-hidden rounded">
                      {itemId > 0 ? (
                        <img
                          src={getItemIconUrl(itemId)}
                          alt={`Item ${itemId}`}
                          width={24}
                          height={24}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-800/60" />
                      )}
                    </div>
                  ))}
                </div>

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
                    {formatNumber(p.totalDamageDealtToChampions)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Damage Tab ─────────────────────────────────────────────────────────────────

function DamageTab({
  participants,
  summonerPuuid,
}: {
  participants: MatchParticipantDTO[];
  summonerPuuid: string;
}) {
  const sorted = [...participants].sort(
    (a, b) => b.totalDamageDealtToChampions - a.totalDamageDealtToChampions,
  );
  const maxDealt = Math.max(...sorted.map((p) => p.totalDamageDealtToChampions));
  const maxTaken = Math.max(...sorted.map((p) => p.totalDamageTaken));

  return (
    <div>
      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <span className="font-semibold text-gray-300">Damage Dealt</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500/70" /> Physical
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500/70" /> Magic
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-white/40" /> True
        </span>
        <span className="ml-4 font-semibold text-gray-300">Damage Taken</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-500/50" /> Total
        </span>
      </div>

      <div className="space-y-1.5">
        {sorted.map((p, idx) => {
          const isSummoner = p.puuid === summonerPuuid;
          const totalDealt = p.totalDamageDealtToChampions;
          const physPct = maxDealt > 0 ? (p.physicalDamageDealtToChampions / maxDealt) * 100 : 0;
          const magicPct = maxDealt > 0 ? (p.magicDamageDealtToChampions / maxDealt) * 100 : 0;
          const truePct = maxDealt > 0 ? (p.trueDamageDealtToChampions / maxDealt) * 100 : 0;
          const takenPct = maxTaken > 0 ? (p.totalDamageTaken / maxTaken) * 100 : 0;

          return (
            <div
              key={p.puuid || `${p.championName}-${idx}`}
              className={`rounded-lg px-2 py-2 text-xs ${
                isSummoner
                  ? "bg-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "bg-gray-800/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <img
                  src={getChampionIconUrl(p.championName)}
                  alt={p.championName}
                  width={24}
                  height={24}
                  className="flex-shrink-0 rounded"
                />
                <span
                  className={`w-20 min-w-0 truncate ${
                    isSummoner ? "font-semibold text-cyan-400" : "text-gray-300"
                  }`}
                >
                  {p.summonerName || p.championName}
                </span>

                {/* Stacked damage bar */}
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-700/50">
                    <div className="flex h-full">
                      <div
                        className="h-full bg-red-500/70"
                        style={{ width: `${physPct}%` }}
                      />
                      <div
                        className="h-full bg-blue-500/70"
                        style={{ width: `${magicPct}%` }}
                      />
                      <div
                        className="h-full bg-white/40"
                        style={{ width: `${truePct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 flex-shrink-0 text-right font-medium text-gray-300">
                    {formatNumber(totalDealt)}
                  </span>
                </div>
              </div>

              {/* Damage breakdown numbers */}
              <div className="mt-1 flex items-center gap-2 pl-8">
                <span className="text-red-400">{formatNumber(p.physicalDamageDealtToChampions)}</span>
                <span className="text-gray-600">/</span>
                <span className="text-blue-400">{formatNumber(p.magicDamageDealtToChampions)}</span>
                <span className="text-gray-600">/</span>
                <span className="text-gray-300">{formatNumber(p.trueDamageDealtToChampions)}</span>

                {/* Damage taken bar */}
                <div className="ml-auto flex min-w-0 flex-1 items-center gap-1" style={{ maxWidth: "40%" }}>
                  <span className="flex-shrink-0 text-gray-500">Taken:</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-700/50">
                    <div
                      className="h-full rounded-full bg-orange-500/50"
                      style={{ width: `${takenPct}%` }}
                    />
                  </div>
                  <span className="w-10 flex-shrink-0 text-right text-orange-400">
                    {formatNumber(p.totalDamageTaken)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Vision Tab ─────────────────────────────────────────────────────────────────

function VisionTab({
  participants,
  summonerPuuid,
}: {
  participants: MatchParticipantDTO[];
  summonerPuuid: string;
}) {
  const sortedByVision = [...participants].sort(
    (a, b) => b.visionScore - a.visionScore,
  );
  const maxVision = Math.max(...sortedByVision.map((p) => p.visionScore));
  const maxObjDmg = Math.max(
    ...participants.map((p) => p.damageDealtToObjectives + p.damageDealtToTurrets),
  );

  return (
    <div className="space-y-6">
      {/* Vision Score Ranking */}
      <div>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
          Vision Score
        </h5>
        <div className="space-y-1">
          {sortedByVision.map((p, idx) => {
            const isSummoner = p.puuid === summonerPuuid;
            const visionPct = maxVision > 0 ? (p.visionScore / maxVision) * 100 : 0;

            return (
              <div
                key={p.puuid || `${p.championName}-vision-${idx}`}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                  isSummoner
                    ? "bg-cyan-500/10 ring-1 ring-cyan-500/30"
                    : "bg-gray-800/40"
                }`}
              >
                <img
                  src={getChampionIconUrl(p.championName)}
                  alt={p.championName}
                  width={24}
                  height={24}
                  className="flex-shrink-0 rounded"
                />
                <span
                  className={`w-20 min-w-0 truncate ${
                    isSummoner ? "font-semibold text-cyan-400" : "text-gray-300"
                  }`}
                >
                  {p.summonerName || p.championName}
                </span>

                {/* Vision bar */}
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-700/50">
                    <div
                      className="h-full rounded-full bg-purple-500/60"
                      style={{ width: `${visionPct}%` }}
                    />
                  </div>
                  <span className="w-8 flex-shrink-0 text-right font-medium text-purple-400">
                    {p.visionScore}
                  </span>
                </div>

                {/* Wards */}
                <div className="flex flex-shrink-0 items-center gap-2 text-gray-500">
                  <span title="Wards Placed">
                    <span className="text-green-400">{p.wardsPlaced}</span>
                    <span className="ml-0.5">placed</span>
                  </span>
                  <span title="Wards Killed">
                    <span className="text-red-400">{p.wardsKilled}</span>
                    <span className="ml-0.5">killed</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Objective Damage */}
      <div>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          Objective & Turret Damage
        </h5>
        <div className="space-y-1">
          {[...participants]
            .sort(
              (a, b) =>
                b.damageDealtToObjectives + b.damageDealtToTurrets -
                (a.damageDealtToObjectives + a.damageDealtToTurrets),
            )
            .map((p, idx) => {
              const isSummoner = p.puuid === summonerPuuid;
              const objTotal = p.damageDealtToObjectives + p.damageDealtToTurrets;
              const objPct = maxObjDmg > 0 ? (objTotal / maxObjDmg) * 100 : 0;
              const turretPct = maxObjDmg > 0 ? (p.damageDealtToTurrets / maxObjDmg) * 100 : 0;

              return (
                <div
                  key={p.puuid || `${p.championName}-obj-${idx}`}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                    isSummoner
                      ? "bg-cyan-500/10 ring-1 ring-cyan-500/30"
                      : "bg-gray-800/40"
                  }`}
                >
                  <img
                    src={getChampionIconUrl(p.championName)}
                    alt={p.championName}
                    width={24}
                    height={24}
                    className="flex-shrink-0 rounded"
                  />
                  <span
                    className={`w-20 min-w-0 truncate ${
                      isSummoner ? "font-semibold text-cyan-400" : "text-gray-300"
                    }`}
                  >
                    {p.summonerName || p.championName}
                  </span>

                  {/* Stacked bar: Turret (cyan) + Other Obj (amber) */}
                  <div className="flex min-w-0 flex-1 items-center gap-1">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-700/50">
                      <div className="flex h-full">
                        <div
                          className="h-full bg-cyan-500/60"
                          style={{ width: `${turretPct}%` }}
                        />
                        <div
                          className="h-full bg-amber-500/50"
                          style={{ width: `${Math.max(0, objPct - turretPct)}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-12 flex-shrink-0 text-right text-gray-400">
                      {formatNumber(objTotal)}
                    </span>
                  </div>

                  {/* Breakdown */}
                  <div className="flex flex-shrink-0 items-center gap-2 text-gray-500">
                    <span>
                      <span className="text-cyan-400">{formatNumber(p.damageDealtToTurrets)}</span>
                      <span className="ml-0.5">turret</span>
                    </span>
                    <span>
                      <span className="text-amber-400">{formatNumber(p.damageDealtToObjectives)}</span>
                      <span className="ml-0.5">obj</span>
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
