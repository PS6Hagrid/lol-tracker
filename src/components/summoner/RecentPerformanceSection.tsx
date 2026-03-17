import { getDataService } from "@/lib/data-service";
import RecentPerformance from "@/components/RecentPerformance";
import PerformanceRadar from "@/components/PerformanceRadar";
import RoleDistribution from "@/components/RoleDistribution";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

interface RecentPerformanceSectionProps {
  region: string;
  puuid: string;
}

export default async function RecentPerformanceSection({ region, puuid }: RecentPerformanceSectionProps) {
  const dataService = await getDataService();

  const matchIds = await dataService.getMatchHistory(region, puuid, 10);
  
  if (matchIds.length === 0) {
    return (
        <div className="rounded-xl border border-border-theme bg-bg-card/80 p-8 text-center backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-text-primary">No Recent Matches</h3>
            <p className="mt-1 text-sm text-text-secondary">This summoner hasn't played any matches recently.</p>
        </div>
    );
  }

  const matches = dataService.getMatchDetailsBatch
    ? await dataService.getMatchDetailsBatch(region, matchIds)
    : await Promise.all(matchIds.map((id) => dataService.getMatchDetails(region, id)));

  if (matches.length === 0) {
    return null; // Should not happen if matchIds has items, but good practice
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-text-primary">
        Recent Performance
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentPerformance matches={matches} puuid={puuid} />
        <PerformanceRadar matches={matches} puuid={puuid} />
      </div>
      <div className="mt-4">
        <RoleDistribution matches={matches} puuid={puuid} />
      </div>
    </section>
  );
}

export function RecentPerformanceSectionSkeleton() {
  return (
    <section>
      <SkeletonText className="mb-3 h-6 w-48" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard className="h-[200px]" />
        <SkeletonCard className="h-[200px]" />
      </div>
      <div className="mt-4">
        <SkeletonCard className="h-[80px]" />
      </div>
    </section>
  );
}
