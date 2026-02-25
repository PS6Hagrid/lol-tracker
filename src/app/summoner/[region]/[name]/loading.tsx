import {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  SkeletonCard,
} from "@/components/ui/Skeleton";

/** Loading UI skeleton for the summoner profile pages. */
export default function SummonerLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* ── Summoner Header Skeleton ── */}
      <div className="mb-6 flex items-center gap-4">
        {/* Profile icon placeholder */}
        <div className="relative">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="absolute -bottom-2 left-1/2 h-5 w-10 -translate-x-1/2 rounded-full" />
        </div>

        {/* Name & region placeholder */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:w-64" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
      </div>

      {/* ── Tab Navigation Skeleton ── */}
      <div className="flex gap-1 border-b border-gray-700/50 pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-md sm:w-24" />
        ))}
      </div>

      {/* ── Content Skeleton ── */}
      <div className="mt-6 space-y-6">
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

        {/* Top Champions Skeleton */}
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
      </div>
    </div>
  );
}
