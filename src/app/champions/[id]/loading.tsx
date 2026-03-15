import { Skeleton } from "@/components/Skeleton";

export default function ChampionDetailLoading() {
  return (
    <div className="min-h-screen bg-[#0a0e17]">
      {/* Hero Section Skeleton */}
      <div className="relative h-[400px] w-full overflow-hidden bg-[#0d1117]">
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="mx-auto flex max-w-7xl items-end gap-6">
            <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-12 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
        {/* Stats Bars Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Abilities Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-28" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-12 rounded-lg" />
            ))}
          </div>
          <div className="space-y-2 rounded-xl bg-[#111827] p-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Lore Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Skins Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-28" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shrink-0 space-y-2">
                <Skeleton className="h-40 w-72 rounded-lg" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
