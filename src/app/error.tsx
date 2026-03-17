"use client";

import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Root-level error boundary for the entire application. */
export default function RootError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-md rounded-xl border border-border-theme bg-bg-card p-8 text-center">
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
        <h2 className="text-xl font-bold text-text-primary">
          Something Went Wrong
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          An unexpected error occurred. Please try again or return to the home
          page.
        </p>

        {/* Error detail in code block */}
        {error.message && (
          <pre className="mt-4 overflow-x-auto rounded-lg bg-bg-page px-4 py-3 text-left text-xs text-text-secondary">
            <code>{error.message}</code>
          </pre>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg border border-blue-500/50 bg-blue-500/10 px-6 py-2.5 text-sm font-medium text-blue-400 transition-all duration-200 hover:bg-blue-500/20 hover:shadow-[0_0_12px_rgba(59,130,246,0.2)]"
          >
            Try Again
          </button>
          <a
            href="/"
            className="rounded-lg border border-border-theme bg-bg-card-hover/60 px-6 py-2.5 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-bg-card-hover/60"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
