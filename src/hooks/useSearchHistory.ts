"use client";
import { useState, useEffect, useCallback } from "react";

export interface SearchHistoryEntry {
  gameName: string;
  tagLine: string;
  region: string;
  timestamp: number;
}

const STORAGE_KEY = "trackerino-search-history";
const MAX_ENTRIES = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const addEntry = useCallback((entry: Omit<SearchHistoryEntry, "timestamp">) => {
    setHistory((prev) => {
      // Remove duplicate if exists (same name+tag+region)
      const filtered = prev.filter(
        (e) => !(e.gameName === entry.gameName && e.tagLine === entry.tagLine && e.region === entry.region)
      );
      const updated = [{ ...entry, timestamp: Date.now() }, ...filtered].slice(0, MAX_ENTRIES);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const removeEntry = useCallback((index: number) => {
    setHistory((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { history, addEntry, removeEntry, clearHistory };
}
