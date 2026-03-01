import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
} from "@/components/ui/Skeleton";

export default function LiveGameLoading() {
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

      {/* Live game content skeleton */}
      <div className="mt-6">
        <SkeletonCard>
          <div className="mb-4 flex items-center justify-between">
            <SkeletonText className="h-5 w-32" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>

          {/* Two teams */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Blue Team */}
            <div>
              <SkeletonText className="mb-3 h-4 w-20" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-800/40 px-3 py-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="hidden h-6 w-6 rounded sm:block" />
                    <Skeleton className="hidden h-6 w-6 rounded sm:block" />
                  </div>
                ))}
              </div>
            </div>

            {/* Red Team */}
            <div>
              <SkeletonText className="mb-3 h-4 w-20" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-800/40 px-3 py-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="hidden h-6 w-6 rounded sm:block" />
                    <Skeleton className="hidden h-6 w-6 rounded sm:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}
