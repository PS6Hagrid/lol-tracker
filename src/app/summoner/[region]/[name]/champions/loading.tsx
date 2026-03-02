import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
} from "@/components/ui/Skeleton";

export default function ChampionsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="absolute -bottom-2 left-1/2 h-5 w-10 -translate-x-1/2 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:w-64" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
      </div>

      {/* Tab skeleton */}
      <div className="flex gap-1 border-b border-gray-700/50 pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-md sm:w-24" />
        ))}
      </div>

      {/* Content */}
      <div className="mt-6 space-y-6">
        {/* Highlight card skeletons */}
        <div>
          <SkeletonText className="mb-3 h-6 w-24" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-12 w-12 flex-shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </div>

        <SkeletonText className="h-6 w-44" />
        <SkeletonText className="h-4 w-64" />

        {/* Champion table header */}
        <SkeletonCard className="p-0 overflow-hidden">
          <div className="flex items-center gap-4 border-b border-gray-700/30 px-4 py-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="hidden h-4 w-16 sm:block" />
          </div>

          {/* Champion rows */}
          <div className="animate-stagger">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-gray-800/30 px-4 py-2.5 last:border-b-0"
              >
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="ml-auto h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="hidden h-4 w-14 sm:block" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}
