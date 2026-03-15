import { Skeleton } from "@/components/Skeleton";

export default function SummonerLoading() {
  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Profile Header */}
        <div className="flex items-center gap-5 mb-8">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>

        {/* Stats Row - 3 Ranked Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg bg-gray-800/40 p-5 flex flex-col gap-3"
            >
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </div>

        {/* Match History - 5 Match Cards */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40 mb-2" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg bg-gray-800/40 p-4 flex items-center gap-4"
            >
              <Skeleton className="h-12 w-12 rounded shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-5 w-full max-w-md" />
                <Skeleton className="h-4 w-full max-w-sm" />
              </div>
              <Skeleton className="h-8 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
