import type { LeagueEntryDTO } from "@/types/riot";
import { getProfileIconUrl, getRankEmblemUrl, QUEUE_TYPES } from "@/lib/constants";

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

function RankBadge({ entry, queueType }: { entry: LeagueEntryDTO | null; queueType: string }) {
  const label = queueType === "RANKED_SOLO_5x5" ? "Solo" : "Flex";

  if (!entry) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-gray-800/60 px-2.5 py-1.5 text-xs">
        <span className="text-gray-500">{label}:</span>
        <span className="text-gray-500">Unranked</span>
      </div>
    );
  }

  const isApex = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(entry.tier);
  const tierColor = getTierColor(entry.tier);

  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-gray-800/60 px-2.5 py-1.5 text-xs">
      <span className="text-gray-500">{label}:</span>
      <img
        src={getRankEmblemUrl(entry.tier)}
        alt={entry.tier}
        width={20}
        height={20}
        className="flex-shrink-0"
      />
      <span className="font-semibold" style={{ color: tierColor }}>
        {formatTier(entry.tier)} {!isApex ? entry.rank : ""}
      </span>
      <span className="font-medium text-gold">{entry.leaguePoints} LP</span>
    </div>
  );
}

interface SummonerHeaderProps {
  summoner: {
    gameName: string;
    tagLine: string;
    profileIconId: number;
    summonerLevel: number;
  };
  regionLabel: string;
  rankedStats?: LeagueEntryDTO[];
}

export default function SummonerHeader({ summoner, regionLabel, rankedStats }: SummonerHeaderProps) {
  const soloQueue = rankedStats?.find((e) => e.queueType === "RANKED_SOLO_5x5") ?? null;
  const flexQueue = rankedStats?.find((e) => e.queueType === "RANKED_FLEX_SR") ?? null;

  return (
    <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      {/* Profile Icon */}
      <div className="relative">
        <img
          src={getProfileIconUrl(summoner.profileIconId)}
          alt="Profile Icon"
          width={80}
          height={80}
          className="rounded-xl border-2 border-gray-700"
        />
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-gray-800 px-2 py-0.5 text-xs font-bold text-gold">
          {summoner.summonerLevel}
        </span>
      </div>

      {/* Name + Region + Rank badges */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {summoner.gameName}
          <span className="text-gray-500">#{summoner.tagLine}</span>
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className="rounded-md bg-cyan/10 px-2 py-0.5 text-xs font-medium text-cyan">
            {regionLabel}
          </span>
          {rankedStats && (
            <>
              <RankBadge entry={soloQueue} queueType="RANKED_SOLO_5x5" />
              <RankBadge entry={flexQueue} queueType="RANKED_FLEX_SR" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
