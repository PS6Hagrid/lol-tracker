"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { REGIONS, getProfileIconUrl } from "@/lib/constants";

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Don't render on homepage (it has its own search)
  const isHome = pathname === "/";

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
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
    setQuery("");
    setSuggestions([]);
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
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white sm:hidden"
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
          className="hidden h-8 rounded-md border border-gray-700/50 bg-gray-800/60 px-1.5 text-[11px] text-gray-300 outline-none focus:border-cyan/50 lg:block"
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
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search..."
            className="h-8 w-36 rounded-md border border-gray-700/50 bg-gray-800/60 px-3 pr-8 text-xs text-white placeholder-gray-500 outline-none transition-all focus:w-48 focus:border-gold/50 focus:ring-1 focus:ring-gold/20 lg:w-44 lg:focus:w-56"
          />
          <svg
            className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && open && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/95 shadow-xl backdrop-blur-md">
              {suggestions.map((s, i) => (
                <button
                  key={`${s.gameName}-${s.tagLine}-${s.region}`}
                  type="button"
                  onClick={() => navigate(s.gameName, s.tagLine, s.region)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                    i === highlighted ? "bg-gold/10 text-white" : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <img
                    src={getProfileIconUrl(s.profileIconId)}
                    alt=""
                    width={24}
                    height={24}
                    className="rounded"
                  />
                  <span className="truncate font-medium">
                    {s.gameName}
                    <span className="text-gray-500">#{s.tagLine}</span>
                  </span>
                  <span className="ml-auto rounded bg-cyan/10 px-1.5 py-0.5 text-[9px] text-cyan">
                    {REGIONS.find((r) => r.value === s.region)?.label ?? s.region}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
