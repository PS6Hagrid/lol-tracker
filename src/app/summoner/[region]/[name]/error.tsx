"use client";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Error boundary for summoner profile pages. */
export default function SummonerError({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-red-700/40 bg-gray-900/90 p-8 text-center backdrop-blur-sm">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-700/50 bg-red-900/20">
          <svg
            className="h-8 w-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white">Something Went Wrong</h2>
        <p className="mt-2 text-gray-400">
          We encountered an error while loading this summoner profile. This
          might be a temporary issue.
        </p>

        {/* Error detail (subtle) */}
        {error.message && (
          <p className="mt-3 rounded-lg bg-gray-800/60 px-3 py-2 text-xs text-gray-500">
            {error.message}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg border border-cyan/50 bg-cyan/10 px-6 py-2.5 text-sm font-medium text-cyan transition-all duration-200 hover:bg-cyan/20 hover:shadow-[0_0_12px_rgba(0,212,255,0.2)]"
          >
            Try Again
          </button>
          <a
            href="/"
            className="rounded-lg border border-gray-700 bg-gray-800/60 px-6 py-2.5 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-gray-700/60"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
