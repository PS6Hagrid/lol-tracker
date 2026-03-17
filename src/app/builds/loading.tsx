import { Skeleton } from "@/components/Skeleton";

export default function BuildsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Title */}
      <div className="mb-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
        <Skeleton className="ml-auto h-9 w-56 rounded-md" />
      </div>

      {/* Build cards grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border-theme bg-bg-card p-5"
          >
            {/* Champion header */}
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-28" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>

            {/* Item sections */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-14" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-10 w-10 rounded" />
                    <Skeleton className="h-10 w-10 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Skill order */}
            <div className="mb-3">
              <Skeleton className="mb-1.5 h-3 w-24" />
              <div className="flex gap-1">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-7 w-7 rounded" />
                ))}
              </div>
            </div>

            {/* Bottom section */}
            <div className="border-t border-border-theme pt-3">
              <div className="flex gap-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
