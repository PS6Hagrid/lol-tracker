import { Skeleton } from "@/components/Skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-bg-page">
      {/* Hero Section */}
      <div className="mx-auto max-w-5xl px-4 pt-24 pb-16 flex flex-col items-center">
        <Skeleton className="h-12 w-80 mb-4" />
        <Skeleton className="h-5 w-64 mb-10" />
        <Skeleton className="h-12 w-full max-w-lg rounded-lg" />
      </div>

      {/* Feature Cards */}
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg bg-bg-card-hover/40 p-6 flex flex-col gap-4"
            >
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
