"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { REGIONS, getProfileIconUrl } from "@/lib/constants";
import { useSearchHistory } from "@/hooks/useSearchHistory";

interface Suggestion {
  gameName: string;
  tagLine: string;
  region: string;
  profileIconId: number;
  summonerLevel: number;
}

export default function NavSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("euw1");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [highlighted, setHighlighted] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  // Don't render on homepage (it has its own search)
  const isHome = pathname === "/";

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    setShowHistory(false);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/summoners/search?q=${encodeURIComponent(trimmed)}&region=${region}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions ?? []);
          setHighlighted(-1);
        }
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, region]);

  function navigate(gameName: string, tagLine: string, reg: string) {
    setOpen(false);
    setShowHistory(false);
    setQuery("");
    setSuggestions([]);
    addEntry({ gameName, tagLine, region: reg });
    router.push(
      `/summoner/${encodeURIComponent(reg)}/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`,
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    let gameName: string;
    let tagLine: string;
    if (trimmed.includes("#")) {
      const idx = trimmed.indexOf("#");
      gameName = trimmed.slice(0, idx).trim();
      tagLine = trimmed.slice(idx + 1).trim();
    } else {
      gameName = trimmed;
      tagLine = region.toUpperCase().replace(/[0-9]/g, "");
    }
    if (!gameName) return;
    if (!tagLine) tagLine = region.toUpperCase().replace(/[0-9]/g, "");
    setShowHistory(false);
    navigate(gameName, tagLine, region);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((p) => (p < suggestions.length - 1 ? p + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((p) => (p > 0 ? p - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      const s = suggestions[highlighted];
      navigate(s.gameName, s.tagLine, s.region);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  }

  if (isHome) return null;

  return (
    <div ref={wrapperRef} className="relative">
      {/* Collapsed: just a search icon button */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary sm:hidden"
          aria-label="Search"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}

      {/* Expanded / always visible on sm+ */}
      <form
        onSubmit={handleSubmit}
        className={`${
          open ? "flex" : "hidden sm:flex"
        } items-center gap-1`}
      >
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="hidden h-8 rounded-md border border-border-theme bg-bg-card-hover/60 px-1.5 text-[11px] text-text-secondary outline-none focus:border-cyan/50 lg:block"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
              else if (query.trim().length < 2 && history.length > 0) setShowHistory(true);
            }}
            onBlur={() => {
              blurTimeoutRef.current = setTimeout(() => setShowHistory(false), 200);
            }}
            placeholder="Search..."
            className="h-8 w-36 rounded-md border border-border-theme bg-bg-card-hover/60 px-3 pr-8 text-xs text-text-primary placeholder-gray-500 outline-none transition-all duration-300 ease-out focus:w-48 focus:border-gold/50 focus:ring-2 focus:ring-gold/15 focus:shadow-[0_0_0_3px_rgba(200,155,60,0.08)] lg:w-44 lg:focus:w-56"
          />
          <svg
            className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && open && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border-theme bg-bg-card/95 shadow-xl backdrop-blur-md">
              {suggestions.map((s, i) => (
                <button
                  key={`${s.gameName}-${s.tagLine}-${s.region}`}
                  type="button"
                  onClick={() => navigate(s.gameName, s.tagLine, s.region)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                    i === highlighted ? "bg-gold/10 text-text-primary" : "text-text-secondary hover:bg-white/5"
                  }`}
                >
                  <img
                    src={getProfileIconUrl(s.profileIconId)}
                    alt=""
                    width={24}
                    height={24}
                    className="rounded"
                  />
                  <span className="font-medium">
                    <span className="truncate">{s.gameName}</span>
                    <span className="flex-shrink-0 text-text-muted">#{s.tagLine}</span>
                  </span>
                  <span className="ml-auto rounded bg-cyan/10 px-1.5 py-0.5 text-[9px] text-cyan">
                    {REGIONS.find((r) => r.value === s.region)?.label ?? s.region}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Search history dropdown */}
          {showHistory && suggestions.length === 0 && history.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 min-w-[280px] overflow-hidden rounded-xl border border-border-theme bg-bg-card shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-border-theme px-3 py-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-text-secondary">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                  className="text-[9px] text-text-muted transition-colors hover:text-text-secondary"
                >
                  Clear all
                </button>
              </div>
              {history.map((entry, index) => (
                <div
                  key={`${entry.gameName}-${entry.tagLine}-${entry.region}-${entry.timestamp}`}
                  className="group flex w-full items-center gap-2 px-3 py-2 text-left transition-colors duration-150 hover:bg-bg-card-hover/50"
                >
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setShowHistory(false);
                      navigate(entry.gameName, entry.tagLine, entry.region);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2"
                  >
                    <svg className="h-3.5 w-3.5 flex-shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="truncate text-xs text-text-primary">
                      {entry.gameName}
                      <span className="text-text-muted">#{entry.tagLine}</span>
                    </span>
                    <span className="ml-auto rounded-full bg-border-theme/60 px-1.5 py-0.5 text-[9px] font-medium text-text-secondary">
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
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
