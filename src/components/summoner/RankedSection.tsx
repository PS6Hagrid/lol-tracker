import { getDataService } from "@/lib/data-service";
import { prisma } from "@/lib/db";
import { toTotalLP } from "@/lib/constants";
import RankCard from "@/components/RankCard";
import LPGraph from "@/components/LPGraph";
import { Skeleton, SkeletonCard, SkeletonText, SkeletonCircle } from "@/components/ui/Skeleton";

interface RankedSectionProps {
  region: string;
  puuid: string;
  summonerId: string; // DB ID needed for LP history
}

export default async function RankedSection({ region, puuid, summonerId }: RankedSectionProps) {
  const dataService = await getDataService();
  
  // Fetch ranked stats from Riot API
  const rankedStats = await dataService.getRankedStats(region, puuid);

  // Save rank snapshots (deduplicated: max 1 per 2 hours per queue)
  // We do this as a side effect of rendering this component
  if (summonerId) {
    for (const entry of rankedStats) {
      const TWO_HOURS_AGO = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const recent = await prisma.rankSnapshot.findFirst({
        where: { summonerId: summonerId, queueType: entry.queueType, timestamp: { gte: TWO_HOURS_AGO } },
        orderBy: { timestamp: "desc" },
      });
      if (!recent) {
        prisma.rankSnapshot.create({
          data: {
            summonerId: summonerId,
            queueType: entry.queueType,
            tier: entry.tier,
            rank: entry.rank,
            lp: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
          },
        }).catch(() => {}); // Fire-and-forget
      }
    }
  }

  const soloQueue = rankedStats.find((e) => e.queueType === "RANKED_SOLO_5x5") ?? null;
  const flexQueue = rankedStats.find((e) => e.queueType === "RANKED_FLEX_SR") ?? null;

  // Query LP history from DB for the graph
  let lpHistory: { tier: string; rank: string; lp: number; totalLP: number; timestamp: string }[] = [];
  if (summonerId) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const snapshots = await prisma.rankSnapshot.findMany({
      where: {
        summonerId: summonerId,
        queueType: "RANKED_SOLO_5x5",
        timestamp: { gte: ninetyDaysAgo },
      },
      orderBy: { timestamp: "asc" },
    }).catch(() => []);

    lpHistory = snapshots.map((s) => ({
      tier: s.tier,
      rank: s.rank,
      lp: s.lp,
      totalLP: toTotalLP(s.tier, s.rank, s.lp),
      timestamp: `${s.timestamp.getMonth() + 1}/${s.timestamp.getDate()}`,
    }));
  }

  return (
    <div className="space-y-6">
      {/* Ranked Cards */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Ranked</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RankCard entry={soloQueue} queueType="RANKED_SOLO_5x5" />
          <RankCard entry={flexQueue} queueType="RANKED_FLEX_SR" />
        </div>
      </section>

      {/* LP Graph */}
      <section>
        <LPGraph data={lpHistory} currentEntry={soloQueue ?? flexQueue} />
      </section>
    </div>
  );
}

export function RankedSectionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Ranked Cards */}
      <section>
        <SkeletonText className="mb-3 h-6 w-24" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Solo Queue Card */}
          <SkeletonCard>
            <div className="flex flex-col items-center gap-3">
              <SkeletonText className="h-4 w-28" />
              <SkeletonCircle className="h-20 w-20" />
              <SkeletonText className="h-6 w-32" />
              <SkeletonText className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </SkeletonCard>

          {/* Flex Queue Card */}
          <SkeletonCard>
            <div className="flex flex-col items-center gap-3">
              <SkeletonText className="h-4 w-28" />
              <SkeletonCircle className="h-20 w-20" />
              <SkeletonText className="h-6 w-32" />
              <SkeletonText className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </SkeletonCard>
        </div>
      </section>

      {/* LP Graph Skeleton */}
      <section>
        <SkeletonCard>
          <SkeletonText className="mb-3 h-4 w-24" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </SkeletonCard>
      </section>
    </div>
  );
}
