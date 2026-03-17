"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, getProfileIconUrl } from "@/lib/constants";
import { useSearchHistory } from "@/hooks/useSearchHistory";

interface SuggestionItem {
  gameName: string;
  tagLine: string;
  region: string;
  profileIconId: number;
  summonerLevel: number;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("na1");
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { history, addEntry, removeEntry, clearHistory } = useSearchHistory();

  const regionShortLabel = (value: string) => {
    const map: Record<string, string> = {
      na1: "NA", euw1: "EUW", eun1: "EUNE", kr: "KR", jp1: "JP",
      br1: "BR", la1: "LAN", la2: "LAS", oc1: "OCE", tr1: "TR",
      ru: "RU", ph2: "PH", sg2: "SG", th2: "TH", tw2: "TW", vn2: "VN",
    };
    return map[value] ?? value.toUpperCase();
  };

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      // Show history when input is focused but no query
      return;
    }
    // Hide history when typing
    setShowHistory(false);

    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: trimmed, region });
        const res = await fetch(`/api/summoners/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions);
          setShowDropdown(data.suggestions.length > 0);
          setHighlightedIndex(-1);
        }
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, region]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateToSuggestion(s: SuggestionItem) {
    setShowDropdown(false);
    setShowHistory(false);
    setQuery("");
    addEntry({ gameName: s.gameName, tagLine: s.tagLine, region: s.region });
    router.push(
      `/summoner/${encodeURIComponent(s.region)}/${encodeURIComponent(s.gameName)}-${encodeURIComponent(s.tagLine)}`,
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          e.preventDefault();
          navigateToSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    setShowDropdown(false);

    let gameName: string;
    let tagLine: string;

    if (trimmed.includes("#")) {
      const hashIndex = trimmed.indexOf("#");
      gameName = trimmed.slice(0, hashIndex).trim();
      tagLine = trimmed.slice(hashIndex + 1).trim();
    } else {
      gameName = trimmed;
      tagLine = region.toUpperCase().replace(/[0-9]/g, "");
    }

    if (!gameName) return;
    if (!tagLine) tagLine = region.toUpperCase().replace(/[0-9]/g, "");

    addEntry({ gameName, tagLine, region });
    setShowHistory(false);
    router.push(
      `/summoner/${encodeURIComponent(region)}/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
      {/* Region selector */}
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="h-12 rounded-lg border border-border-theme bg-bg-card/80 px-3 text-sm text-text-primary outline-none transition-all duration-200 focus:border-cyan focus:ring-1 focus:ring-cyan/30 sm:w-44"
      >
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Search input + button + dropdown */}
      <div ref={wrapperRef} className="relative flex-1">
        <div className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
              else if (query.trim().length < 2 && history.length > 0) setShowHistory(true);
            }}
            onBlur={() => {
              blurTimeoutRef.current = setTimeout(() => setShowHistory(false), 200);
            }}
            placeholder="Search summoner... (e.g. Faker#KR1)"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
            className="h-12 w-full rounded-l-lg border border-r-0 border-border-theme bg-bg-card/80 px-4 text-text-primary placeholder-gray-500 outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/30"
          />
          <button
            type="submit"
            className="flex h-12 items-center gap-2 rounded-r-lg border border-gold/80 bg-gold/10 px-5 font-medium text-gold transition-all duration-200 hover:bg-gold/20 hover:shadow-[0_0_12px_rgba(200,155,60,0.3)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {showDropdown && (
          <div
            id="search-suggestions"
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border-theme bg-bg-card/95 shadow-xl backdrop-blur-md animate-fade-in-scale"
          >
            {suggestions.map((s, index) => (
              <button
                key={`${s.gameName}-${s.tagLine}-${s.region}`}
                id={`suggestion-${index}`}
                role="option"
                type="button"
                aria-selected={index === highlightedIndex}
                onClick={() => navigateToSuggestion(s)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 ${
                  index === highlightedIndex
                    ? "bg-gold/10 text-text-primary"
                    : "text-text-secondary hover:bg-white/5"
                }`}
              >
                <img
                  src={getProfileIconUrl(s.profileIconId)}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-lg border border-border-theme"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    <span className="truncate">{s.gameName}</span>
                    <span className="flex-shrink-0 text-text-muted">#{s.tagLine}</span>
                  </p>
                  <p className="text-xs text-text-muted">Level {s.summonerLevel}</p>
                </div>
                <span className="rounded-md bg-cyan/10 px-2 py-0.5 text-[10px] font-medium text-cyan">
                  {REGIONS.find((r) => r.value === s.region)?.label ?? s.region}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Search history dropdown */}
        {showHistory && !showDropdown && history.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border-theme bg-bg-card shadow-xl backdrop-blur-md animate-fade-in-scale">
            <div className="flex items-center justify-between border-b border-border-theme px-4 py-2">
              <span className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Searches
              </span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  clearHistory();
                  setShowHistory(false);
                }}
                className="text-[10px] text-text-muted transition-colors hover:text-text-secondary"
              >
                Clear all
              </button>
            </div>
            {history.map((entry, index) => (
              <div
                key={`${entry.gameName}-${entry.tagLine}-${entry.region}-${entry.timestamp}`}
                className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-bg-card-hover/50"
              >
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    addEntry({ gameName: entry.gameName, tagLine: entry.tagLine, region: entry.region });
                    setShowHistory(false);
                    setQuery("");
                    router.push(
                      `/summoner/${encodeURIComponent(entry.region)}/${encodeURIComponent(entry.gameName)}-${encodeURIComponent(entry.tagLine)}`,
                    );
                  }}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <svg className="h-4 w-4 flex-shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="truncate text-sm text-text-primary">
                    {entry.gameName}
                    <span className="text-text-muted">#{entry.tagLine}</span>
                  </span>
                  <span className="ml-auto rounded-full bg-border-theme/60 px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                    {regionShortLabel(entry.region)}
                  </span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => removeEntry(index)}
                  className="flex-shrink-0 rounded p-0.5 text-text-muted opacity-0 transition-all hover:bg-bg-card-hover/50 hover:text-text-secondary group-hover:opacity-100"
                  aria-label={`Remove ${entry.gameName}#${entry.tagLine}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
