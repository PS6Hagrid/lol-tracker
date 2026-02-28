"use client";

import { useEffect, useMemo } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Determine a user-friendly title + message from the error. */
function classifyError(error: Error) {
  const msg = error.message?.toLowerCase() ?? "";

  if (msg.includes("rate limit") || msg.includes("429") || msg.includes("too many")) {
    return {
      icon: "\u23F3",
      title: "Too Many Requests",
      message:
        "The server is handling a lot of traffic right now. Please wait a moment and try again.",
    };
  }
  if (msg.includes("not found") || msg.includes("404")) {
    return {
      icon: "\uD83D\uDD0D",
      title: "Not Found",
      message:
        "The summoner or page you are looking for could not be found. Check the name and region.",
    };
  }
  if (msg.includes("api key") || msg.includes("forbidden") || msg.includes("403")) {
    return {
      icon: "\uD83D\uDD27",
      title: "Service Temporarily Unavailable",
      message:
        "The connection to Riot Games is experiencing issues. Please try again later.",
    };
  }
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("econnrefused")) {
    return {
      icon: "\uD83C\uDF10",
      title: "Connection Error",
      message:
        "Could not connect to the server. Check your internet connection and try again.",
    };
  }

  return {
    icon: "\u26A0\uFE0F",
    title: "Something Went Wrong",
    message:
      "An unexpected error occurred. Please try again or return to the home page.",
  };
}

/** Root-level error boundary for the entire application. */
export default function RootError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const { icon, title, message } = useMemo(() => classifyError(error), [error]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-700/40 bg-gray-900/90 p-8 text-center backdrop-blur-sm">
        {/* Icon */}
        <div className="mx-auto mb-4 text-5xl">{icon}</div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm text-gray-400">{message}</p>

        {/* Error detail (only in dev, subtle) */}
        {process.env.NODE_ENV === "development" && error.message && (
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
