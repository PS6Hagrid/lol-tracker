import { Skeleton } from "@/components/Skeleton";

export default function PatchNotesLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />

      {/* Featured patch skeleton */}
      <div className="mt-6 rounded-xl border border-gray-700/50 bg-[#111827] p-6">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="mt-3 h-6 w-56" />
        <Skeleton className="mt-2 h-4 w-40" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full max-w-md" />
          ))}
        </div>
        <Skeleton className="mt-4 h-4 w-32" />
      </div>

      {/* Previous patches heading */}
      <Skeleton className="mt-8 h-6 w-40" />

      {/* Previous patches grid skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-700/50 bg-[#111827] p-6"
          >
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="mt-3 h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-36" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full max-w-xs" />
              ))}
            </div>
            <Skeleton className="mt-4 h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
