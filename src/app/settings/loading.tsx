import { Skeleton } from "@/components/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Title */}
      <Skeleton className="mb-8 h-9 w-48" />

      {/* Appearance section */}
      <div className="mb-6 rounded-xl border border-border-theme bg-bg-card p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="space-y-6">
          <div>
            <Skeleton className="mb-2 h-5 w-20" />
            <Skeleton className="mb-2 h-4 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
          <div>
            <Skeleton className="mb-2 h-5 w-36" />
            <Skeleton className="mb-2 h-4 w-56" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Default Region section */}
      <div className="mb-6 rounded-xl border border-border-theme bg-bg-card p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <Skeleton className="mb-2 h-4 w-72" />
        <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
      </div>

      {/* Privacy section */}
      <div className="mb-6 rounded-xl border border-border-theme bg-bg-card p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>

      {/* Data section */}
      <div className="mb-6 rounded-xl border border-border-theme bg-bg-card p-6">
        <Skeleton className="mb-4 h-6 w-44" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>

      {/* About section */}
      <div className="rounded-xl border border-border-theme bg-bg-card p-6">
        <Skeleton className="mb-4 h-6 w-20" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}
