import { Skeleton } from "@/components/Skeleton";

export default function ChampionsLoading() {
  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Title + Patch Badge */}
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Filter Bar: Lane Tabs + Search */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-md" />
          ))}
          <Skeleton className="h-10 w-48 rounded-md ml-auto" />
        </div>

        {/* Champion Card Grid - 3 columns, 12 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg bg-gray-800/40 p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
