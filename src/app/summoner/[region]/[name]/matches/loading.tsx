import { MatchCardSkeleton } from "@/components/MatchCard";

export default function MatchHistoryLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header skeleton */}
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="h-20 w-20 animate-pulse rounded-xl bg-gray-700" />
        <div className="space-y-2 text-center sm:text-left">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-700" />
          <div className="h-5 w-20 animate-pulse rounded bg-gray-700" />
        </div>
      </div>

      {/* Tab skeleton */}
      <div className="mb-6 flex gap-1 border-b border-gray-700/50">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded bg-gray-800" />
        ))}
      </div>

      {/* Filter skeleton */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="h-9 w-40 animate-pulse rounded-lg bg-gray-800/60" />
        <div className="h-9 w-56 animate-pulse rounded-lg bg-gray-800/60" />
        <div className="h-9 w-36 animate-pulse rounded-lg bg-gray-800/60" />
      </div>

      {/* Match card skeletons */}
      <div className="animate-stagger space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
