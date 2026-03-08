import { getDataService } from "@/lib/data-service";
import { getChampionIconUrl, getChampionNameById } from "@/lib/constants";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

interface TopChampionsSectionProps {
  region: string;
  puuid: string;
}

export default async function TopChampionsSection({ region, puuid }: TopChampionsSectionProps) {
  const dataService = await getDataService();
  const masteries = await dataService.getChampionMasteries(region, puuid);

  if (masteries.length === 0) {
    return null;
  }

  const topChampionCards = masteries.slice(0, 3).map((m) => ({
    championName: getChampionNameById(m.championId),
    games: Math.floor(m.championPoints / 1000), // Rough estimate or just show points
    points: m.championPoints,
    level: m.championLevel,
  }));

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-white">
        Top Champions (Mastery)
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {topChampionCards.map((champ) => (
          <div
            key={champ.championName}
            className="flex items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-600/50 hover:shadow-lg"
          >
            <img
              src={getChampionIconUrl(champ.championName)}
              alt={champ.championName}
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {champ.championName}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Lvl {champ.level}</span>
                <span className="font-medium text-cyan">
                  {(champ.points / 1000).toFixed(0)}k pts
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TopChampionsSectionSkeleton() {
  return (
    <section>
      <SkeletonText className="mb-3 h-6 w-36" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <SkeletonText className="h-4 w-24" />
                <SkeletonText className="h-3 w-32" />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </section>
  );
}
