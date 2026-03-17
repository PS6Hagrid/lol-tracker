import { Skeleton } from "@/components/Skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-bg-page">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Title */}
        <Skeleton className="h-9 w-64 mb-6" />

        {/* Tier Tabs */}
        <div className="flex gap-3 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-md" />
          ))}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-4 px-4 py-3 mb-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-14" />
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-4 items-center rounded-lg bg-bg-card-hover/40 px-4 py-3"
            >
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
