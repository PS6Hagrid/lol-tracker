/** Reusable skeleton loading primitives with shimmer animation. */

interface SkeletonProps {
  className?: string;
}

/** Generic rectangular skeleton block. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-800/50 ${className}`}
      aria-hidden="true"
    />
  );
}

/** Circle skeleton for avatars / icons. */
export function SkeletonCircle({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-full bg-gray-800/50 ${className}`}
      aria-hidden="true"
    />
  );
}

/** Full-width text line skeleton. */
export function SkeletonText({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`h-4 animate-pulse rounded bg-gray-800/50 ${className}`}
      aria-hidden="true"
    />
  );
}

/** Card-shaped skeleton container. */
export function SkeletonCard({ className = "", children }: SkeletonProps & { children?: React.ReactNode }) {
  return (
    <div
      className={`rounded-xl border border-gray-700/50 bg-gray-900/80 p-6 backdrop-blur-sm ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
