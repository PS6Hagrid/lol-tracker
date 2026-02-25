import type { LeagueEntryDTO } from "@/types/riot";
import { QUEUE_TYPES } from "@/lib/constants";

/** Map tier names to the CSS variable color tokens */
const TIER_COLOR_MAP: Record<string, string> = {
  IRON: "var(--color-rank-iron)",
  BRONZE: "var(--color-rank-bronze)",
  SILVER: "var(--color-rank-silver)",
  GOLD: "var(--color-rank-gold)",
  PLATINUM: "var(--color-rank-platinum)",
  EMERALD: "var(--color-rank-emerald)",
  DIAMOND: "var(--color-rank-diamond)",
  MASTER: "var(--color-rank-master)",
  GRANDMASTER: "var(--color-rank-grandmaster)",
  CHALLENGER: "var(--color-rank-challenger)",
};

function getTierColor(tier: string): string {
  return TIER_COLOR_MAP[tier.toUpperCase()] ?? "var(--color-rank-iron)";
}

function formatTier(tier: string): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

interface RankCardProps {
  entry: LeagueEntryDTO | null;
  queueType: string;
}

export default function RankCard({ entry, queueType }: RankCardProps) {
  const queueLabel = QUEUE_TYPES[queueType] ?? queueType;

  if (!entry) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-900/80 p-6 backdrop-blur-sm transition-all duration-200 hover:border-gray-600/50">
        <p className="text-sm font-medium text-gray-400">{queueLabel}</p>
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-700 bg-gray-800">
          <span className="text-2xl text-gray-600">?</span>
        </div>
        <p className="text-lg font-semibold text-gray-500">Unranked</p>
      </div>
    );
  }

  const tierColor = getTierColor(entry.tier);
  const totalGames = entry.wins + entry.losses;
  const winrate = totalGames > 0 ? (entry.wins / totalGames) * 100 : 0;
  const isApex = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(entry.tier);

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-900/80 p-6 backdrop-blur-sm transition-all duration-200 hover:border-gray-600/50">
      {/* Queue label */}
      <p className="text-sm font-medium text-gray-400">{queueLabel}</p>

      {/* Rank emblem placeholder */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full border-2 bg-gray-800"
        style={{ borderColor: tierColor }}
      >
        <span className="text-2xl font-bold" style={{ color: tierColor }}>
          {entry.tier.charAt(0)}
          {!isApex && entry.rank}
        </span>
      </div>

      {/* Tier + Division */}
      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: tierColor }}>
          {formatTier(entry.tier)} {!isApex ? entry.rank : ""}
        </p>
        <p className="text-sm text-gold font-semibold">{entry.leaguePoints} LP</p>
      </div>

      {/* Win / Loss */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-win">{entry.wins}W</span>
        <span className="text-gray-600">/</span>
        <span className="text-loss">{entry.losses}L</span>
      </div>

      {/* Winrate bar */}
      <div className="w-full">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-gray-500">Winrate</span>
          <span
            className="font-medium"
            style={{
              color: winrate >= 50 ? "var(--color-win)" : "var(--color-loss)",
            }}
          >
            {winrate.toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${winrate}%`,
              backgroundColor:
                winrate >= 50 ? "var(--color-win)" : "var(--color-loss)",
            }}
          />
        </div>
      </div>

      {/* Hot streak indicator */}
      {entry.hotStreak && (
        <span className="rounded-full bg-loss/10 px-2 py-0.5 text-xs font-medium text-loss">
          Hot Streak
        </span>
      )}
    </div>
  );
}
