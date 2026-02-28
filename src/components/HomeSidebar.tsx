"use client";

import { useState, useEffect } from "react";
import {
  getSearchHistory,
  getFavorites,
  clearSearchHistory,
  type StoredSummoner,
} from "@/lib/local-storage";
import { getProfileIconUrl, REGIONS } from "@/lib/constants";

function SummonerLink({ s }: { s: StoredSummoner }) {
  const href = `/summoner/${encodeURIComponent(s.region)}/${encodeURIComponent(s.gameName)}-${encodeURIComponent(s.tagLine)}`;
  const regionLabel =
    REGIONS.find((r) => r.value === s.region)?.label ?? s.region;

  return (
    <a
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 hover:bg-white/5"
    >
      {s.profileIconId ? (
        <img
          src={getProfileIconUrl(s.profileIconId)}
          alt=""
          width={28}
          height={28}
          className="rounded-md border border-gray-700/50"
        />
      ) : (
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-700/50 bg-gray-800 text-xs text-gray-500">
          ?
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-200">
          {s.gameName}
          <span className="text-gray-500">#{s.tagLine}</span>
        </p>
      </div>
      <span className="rounded bg-cyan/10 px-1.5 py-0.5 text-[9px] font-medium text-cyan">
        {regionLabel}
      </span>
    </a>
  );
}

export default function HomeSidebar() {
  const [history, setHistory] = useState<StoredSummoner[]>([]);
  const [favorites, setFavorites] = useState<StoredSummoner[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory());
    setFavorites(getFavorites());
  }, []);

  const hasContent = history.length > 0 || favorites.length > 0;
  if (!hasContent) return null;

  return (
    <div className="mt-8 flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="flex-1 rounded-xl border border-gray-700/50 bg-gray-900/60 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <svg
              className="h-4 w-4 text-amber-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-300">Favorites</h3>
          </div>
          <div className="space-y-0.5">
            {favorites.map((s) => (
              <SummonerLink
                key={`${s.gameName}-${s.tagLine}-${s.region}`}
                s={s}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {history.length > 0 && (
        <div className="flex-1 rounded-xl border border-gray-700/50 bg-gray-900/60 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-sm font-semibold text-gray-300">Recent</h3>
            </div>
            <button
              onClick={() => {
                clearSearchHistory();
                setHistory([]);
              }}
              className="text-[10px] text-gray-600 transition-colors hover:text-gray-400"
            >
              Clear
            </button>
          </div>
          <div className="space-y-0.5">
            {history.slice(0, 5).map((s) => (
              <SummonerLink
                key={`${s.gameName}-${s.tagLine}-${s.region}`}
                s={s}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
