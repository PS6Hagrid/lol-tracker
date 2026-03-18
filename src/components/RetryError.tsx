"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface RetryErrorProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

/** Determine a user-friendly message and whether auto-retry is appropriate. */
function categorizeError(error: Error | string): {
  message: string;
  autoRetry: boolean;
} {
  const raw =
    typeof error === "string" ? error : error.message ?? String(error);

  if (/network|fetch|failed to fetch|econnrefused|enotfound/i.test(raw)) {
    return {
      message: "Connection failed. Please check your internet.",
      autoRetry: true,
    };
  }

  if (/429|rate.?limit|too many requests/i.test(raw)) {
    return {
      message: "Too many requests. Retrying in {seconds}s...",
      autoRetry: true,
    };
  }

  if (/404|not found|summoner not found/i.test(raw)) {
    return {
      message: "Summoner not found. Check the name and region.",
      autoRetry: false,
    };
  }

  if (/500|server error|internal server/i.test(raw)) {
    return {
      message: "Server error. Please try again later.",
      autoRetry: true,
    };
  }

  return { message: raw || "An unexpected error occurred.", autoRetry: true };
}

const AUTO_RETRY_SECONDS = 5;

export default function RetryError({
  error,
  onRetry,
  className = "",
}: RetryErrorProps) {
  const { message, autoRetry } = categorizeError(error);
  const [countdown, setCountdown] = useState(
    autoRetry && onRetry ? AUTO_RETRY_SECONDS : 0,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start countdown when auto-retry is enabled
  useEffect(() => {
    if (!autoRetry || !onRetry) return;

    setCountdown(AUTO_RETRY_SECONDS);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          onRetry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [autoRetry, onRetry, clearTimer]);

  const handleManualRetry = () => {
    clearTimer();
    setCountdown(0);
    onRetry?.();
  };

  // Build display message — replace {seconds} placeholder with countdown
  const displayMessage = message.replace("{seconds}", String(countdown));

  return (
    <div
      className={`w-full max-w-md rounded-xl border border-red-700/40 bg-bg-card p-8 text-center ${className}`}
    >
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

      {/* Categorized message */}
      <p className="mt-2 text-sm text-text-muted">{displayMessage}</p>

      {/* Raw error detail */}
      {typeof error !== "string" && error.message && (
        <pre className="mt-4 overflow-x-auto rounded-lg bg-bg-page px-4 py-3 text-left text-xs text-text-muted">
          <code>{error.message}</code>
        </pre>
      )}

      {/* Retry controls */}
      {onRetry && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={handleManualRetry}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-6 py-2.5 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/20 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
            Retry now
          </button>

          {autoRetry && countdown > 0 && (
            <p className="text-xs text-text-muted">
              Auto-retrying in {countdown}s...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
