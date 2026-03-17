import { Skeleton } from "@/components/Skeleton";

export default function RunesLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Skeleton className="mb-2 h-9 w-48" />
      <Skeleton className="mb-8 h-5 w-96" />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Primary tree skeleton */}
        <div className="rounded-xl border border-border-theme bg-bg-card p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="mb-6 flex justify-center gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-center gap-3">
                {Array.from({ length: i === 0 ? 4 : 3 }).map((_, j) => (
                  <Skeleton
                    key={j}
                    className={`rounded-full ${i === 0 ? "h-14 w-14" : "h-10 w-10"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Secondary tree skeleton */}
        <div className="rounded-xl border border-border-theme bg-bg-card p-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="mb-6 flex justify-center gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-center gap-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-10 rounded-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat shards skeleton */}
      <div className="mt-8 rounded-xl border border-border-theme bg-bg-card p-6">
        <Skeleton className="mb-4 h-6 w-28" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-4 w-16" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 flex-1 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
