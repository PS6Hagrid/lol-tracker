"use client";

import { useState, useCallback } from "react";
import { REGIONS, getProfileIconUrl, getRankEmblemUrl } from "@/lib/constants";

interface PlayerResult {
  gameName: string;
  tagLine: string;
  region: string;
  status: "loading" | "found" | "error";
  profileIconId?: number;
  summonerLevel?: number;
  rankedTier?: string;
  rankedRank?: string;
  rankedLP?: number;
  wins?: number;
  losses?: number;
  error?: string;
}

function parseLobbyInput(input: string): { gameName: string; tagLine: string }[] {
  const lines = input
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const results: { gameName: string; tagLine: string }[] = [];

  for (const line of lines) {
    // Try "joined the lobby" format: "SomeName joined the lobby"
    const lobbyMatch = line.match(/^(.+?)\s+joined the lobby$/i);
    if (lobbyMatch) {
      const name = lobbyMatch[1].trim();
      if (name.includes("#")) {
        const [gn, tl] = name.split("#");
        results.push({ gameName: gn.trim(), tagLine: tl.trim() });
      } else {
        results.push({ gameName: name, tagLine: "" });
      }
      continue;
    }

    // Try "GameName#TagLine" format
    if (line.includes("#")) {
      const hashIdx = line.indexOf("#");
      const gameName = line.slice(0, hashIdx).trim();
      const tagLine = line.slice(hashIdx + 1).trim();
      if (gameName) {
        results.push({ gameName, tagLine });
      }
      continue;
    }

    // Try comma-separated
    if (line.includes(",")) {
      for (const part of line.split(",")) {
        const name = part.trim();
        if (name) results.push({ gameName: name, tagLine: "" });
      }
      continue;
    }

    // Single name
    if (line.length > 0) {
      results.push({ gameName: line, tagLine: "" });
    }
  }

  return results.slice(0, 10);
}

export default function MultiSearchPage() {
  const [input, setInput] = useState("");
  const [region, setRegion] = useState("euw1");
  const [players, setPlayers] = useState<PlayerResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    const parsed = parseLobbyInput(input);
    if (parsed.length === 0) return;

    setSearching(true);
    const initial: PlayerResult[] = parsed.map((p) => ({
      gameName: p.gameName,
      tagLine: p.tagLine || region.toUpperCase().replace(/[0-9]/g, ""),
      region,
      status: "loading",
    }));
    setPlayers(initial);

    // Fetch each player in parallel
    const results = await Promise.all(
      initial.map(async (p): Promise<PlayerResult> => {
        try {
          const name = `${encodeURIComponent(p.gameName)}-${encodeURIComponent(p.tagLine)}`;
          const res = await fetch(`/api/summoner/${p.region}/${name}`);
          if (!res.ok) {
            return { ...p, status: "error", error: "Not found" };
          }
          const data = await res.json();
          const solo = data.rankedStats?.find(
            (e: { queueType: string }) => e.queueType === "RANKED_SOLO_5x5",
          );
          return {
            ...p,
            status: "found",
            profileIconId: data.summoner?.profileIconId,
            summonerLevel: data.summoner?.summonerLevel,
            rankedTier: solo?.tier,
            rankedRank: solo?.rank,
            rankedLP: solo?.leaguePoints,
            wins: solo?.wins,
            losses: solo?.losses,
          };
        } catch {
          return { ...p, status: "error", error: "Failed to fetch" };
        }
      }),
    );

    setPlayers(results);
    setSearching(false);
  }, [input, region]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-white">Multi-Search</h1>
      <p className="mb-6 text-sm text-gray-400">
        Paste a lobby chat or enter summoner names to look up multiple players at
        once.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="h-10 rounded-lg border border-gray-700/50 bg-gray-900/80 px-3 text-sm text-white outline-none focus:border-cyan"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Paste lobby chat here, e.g.:\nPlayer1 joined the lobby\nPlayer2 joined the lobby\n\nOr enter names:\nPlayer1#TAG1\nPlayer2#TAG2"}
          rows={4}
          className="flex-1 rounded-lg border border-gray-700/50 bg-gray-900/80 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
        />
      </div>
      <button
        onClick={handleSearch}
        disabled={searching || !input.trim()}
        className="mt-3 flex items-center gap-2 rounded-lg border border-gold/80 bg-gold/10 px-6 py-2.5 text-sm font-medium text-gold transition-all hover:bg-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {searching ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Searching…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search All
          </>
        )}
      </button>

      {/* Results */}
      {players.length > 0 && (
        <div className="mt-6 space-y-2">
          {players.map((p, i) => (
            <div
              key={`${p.gameName}-${p.tagLine}-${i}`}
              className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                p.status === "loading"
                  ? "animate-pulse border-gray-700/30 bg-gray-900/40"
                  : p.status === "error"
                    ? "border-red-800/30 bg-red-900/10"
                    : "border-gray-700/50 bg-gray-900/80 hover:-translate-y-0.5 hover:shadow-lg"
              }`}
            >
              {/* Icon */}
              {p.status === "found" && p.profileIconId ? (
                <img
                  src={getProfileIconUrl(p.profileIconId)}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-lg border border-gray-700/50"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700/50 bg-gray-800 text-gray-500">
                  {p.status === "loading" ? "…" : "?"}
                </div>
              )}

              {/* Name + Level */}
              <div className="min-w-0 flex-1">
                {p.status === "found" ? (
                  <a
                    href={`/summoner/${p.region}/${encodeURIComponent(p.gameName)}-${encodeURIComponent(p.tagLine)}`}
                    className="text-sm font-medium text-white hover:text-cyan transition-colors"
                  >
                    {p.gameName}
                    <span className="text-gray-500">#{p.tagLine}</span>
                  </a>
                ) : (
                  <p className="text-sm font-medium text-gray-300">
                    {p.gameName}
                    <span className="text-gray-500">#{p.tagLine}</span>
                  </p>
                )}
                {p.status === "found" && p.summonerLevel && (
                  <p className="text-xs text-gray-500">
                    Level {p.summonerLevel}
                  </p>
                )}
                {p.status === "error" && (
                  <p className="text-xs text-red-400">{p.error}</p>
                )}
              </div>

              {/* Ranked info */}
              {p.status === "found" && p.rankedTier && (
                <div className="flex items-center gap-2">
                  <img
                    src={getRankEmblemUrl(p.rankedTier)}
                    alt={p.rankedTier}
                    width={28}
                    height={28}
                  />
                  <div className="text-right text-xs">
                    <p className="font-semibold text-gray-200">
                      {p.rankedTier?.charAt(0)}
                      {p.rankedTier?.slice(1).toLowerCase()}{" "}
                      {!["MASTER", "GRANDMASTER", "CHALLENGER"].includes(
                        p.rankedTier ?? "",
                      ) && p.rankedRank}
                    </p>
                    <p className="text-gray-400">
                      {p.rankedLP} LP &middot; {p.wins}W {p.losses}L
                    </p>
                  </div>
                </div>
              )}
              {p.status === "found" && !p.rankedTier && (
                <span className="text-xs text-gray-500">Unranked</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
