import { Skeleton } from "@/components/Skeleton";

export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Title */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Summoner Inputs */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="w-full sm:flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

        <div className="w-full sm:flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Placeholder Card */}
      <div className="rounded-xl border border-border-theme bg-bg-card p-12">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
    </div>
  );
}
