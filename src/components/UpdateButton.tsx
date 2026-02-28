"use client";

import { useState, useEffect, useCallback } from "react";

interface UpdateButtonProps {
  region: string;
  name: string;
}

const COOLDOWN_SECONDS = 120; // 2 minutes between updates
const STORAGE_KEY = "trackerino:lastUpdate";

export default function UpdateButton({ region, name }: UpdateButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check cooldown from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}:${region}:${name}`);
    if (stored) {
      const elapsed = Math.floor((Date.now() - parseInt(stored, 10)) / 1000);
      const remaining = COOLDOWN_SECONDS - elapsed;
      if (remaining > 0) setCooldown(remaining);
    }
  }, [region, name]);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleUpdate = useCallback(async () => {
    if (isUpdating || cooldown > 0) return;
    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      // Call the summoner API to refresh data from Riot
      const res = await fetch(`/api/summoner/${region}/${name}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update");
      }

      // Set cooldown
      localStorage.setItem(
        `${STORAGE_KEY}:${region}:${name}`,
        String(Date.now()),
      );
      setCooldown(COOLDOWN_SECONDS);
      setSuccess(true);

      // Reload the page after a brief success indicator
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, cooldown, region, name]);

  const isDisabled = isUpdating || cooldown > 0;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleUpdate}
        disabled={isDisabled}
        title={
          cooldown > 0
            ? `Available in ${cooldown}s`
            : "Update summoner data"
        }
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
          success
            ? "border border-green-500/50 bg-green-500/10 text-green-400"
            : isDisabled
              ? "border border-gray-700/50 bg-gray-800/40 text-gray-500 cursor-not-allowed"
              : "border border-cyan/30 bg-cyan/10 text-cyan hover:bg-cyan/20 hover:shadow-md"
        }`}
      >
        {isUpdating ? (
          <svg
            className="h-3.5 w-3.5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : success ? (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        )}
        {isUpdating
          ? "Updating…"
          : success
            ? "Updated!"
            : cooldown > 0
              ? `${cooldown}s`
              : "Update"}
      </button>
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}
