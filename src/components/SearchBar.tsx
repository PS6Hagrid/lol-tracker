"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, getProfileIconUrl } from "@/lib/constants";

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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

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
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateToSuggestion(s: SuggestionItem) {
    setShowDropdown(false);
    setQuery("");
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
        className="h-12 rounded-lg border border-gray-700/50 bg-gray-900/80 px-3 text-sm text-white outline-none transition-all duration-200 focus:border-cyan focus:ring-1 focus:ring-cyan/30 sm:w-44"
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
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search summoner... (e.g. Faker#KR1)"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
            className="h-12 w-full rounded-l-lg border border-r-0 border-gray-700/50 bg-gray-900/80 px-4 text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/30"
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
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/95 shadow-xl backdrop-blur-md animate-fade-in-scale"
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
                    ? "bg-gold/10 text-white"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <img
                  src={getProfileIconUrl(s.profileIconId)}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-lg border border-gray-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {s.gameName}
                    <span className="text-gray-500">#{s.tagLine}</span>
                  </p>
                  <p className="text-xs text-gray-500">Level {s.summonerLevel}</p>
                </div>
                <span className="rounded-md bg-cyan/10 px-2 py-0.5 text-[10px] font-medium text-cyan">
                  {REGIONS.find((r) => r.value === s.region)?.label ?? s.region}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
