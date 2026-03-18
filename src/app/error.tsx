"use client";

import { useEffect } from "react";
import RetryError from "@/components/RetryError";

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
      <div className="flex flex-col items-center gap-4">
        <RetryError error={error} onRetry={reset} />

        <a
          href="/"
          className="rounded-lg border border-border-theme bg-bg-card-hover/60 px-6 py-2.5 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-bg-card-hover/80"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
