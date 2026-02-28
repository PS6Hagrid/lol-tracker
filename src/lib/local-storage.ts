/**
 * Client-side localStorage utilities for search history and favorites.
 * All data is stored locally — no server calls needed.
 */

export interface StoredSummoner {
  gameName: string;
  tagLine: string;
  region: string;
  profileIconId?: number;
  timestamp: number;
}

const HISTORY_KEY = "trackerino:searchHistory";
const FAVORITES_KEY = "trackerino:favorites";
const MAX_HISTORY = 10;

// ── Search History ─────────────────────────────────────────────────────

export function getSearchHistory(): StoredSummoner[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToSearchHistory(summoner: Omit<StoredSummoner, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const history = getSearchHistory();
    // Remove duplicate if exists
    const filtered = history.filter(
      (s) =>
        !(
          s.gameName.toLowerCase() === summoner.gameName.toLowerCase() &&
          s.tagLine.toLowerCase() === summoner.tagLine.toLowerCase() &&
          s.region === summoner.region
        ),
    );
    // Add to front
    filtered.unshift({ ...summoner, timestamp: Date.now() });
    // Trim to max
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_HISTORY)));
  } catch {}
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

// ── Favorites ──────────────────────────────────────────────────────────

export function getFavorites(): StoredSummoner[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isFavorite(gameName: string, tagLine: string, region: string): boolean {
  return getFavorites().some(
    (s) =>
      s.gameName.toLowerCase() === gameName.toLowerCase() &&
      s.tagLine.toLowerCase() === tagLine.toLowerCase() &&
      s.region === region,
  );
}

export function toggleFavorite(summoner: Omit<StoredSummoner, "timestamp">): boolean {
  if (typeof window === "undefined") return false;
  try {
    const favorites = getFavorites();
    const existingIdx = favorites.findIndex(
      (s) =>
        s.gameName.toLowerCase() === summoner.gameName.toLowerCase() &&
        s.tagLine.toLowerCase() === summoner.tagLine.toLowerCase() &&
        s.region === summoner.region,
    );

    if (existingIdx >= 0) {
      // Remove from favorites
      favorites.splice(existingIdx, 1);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return false; // no longer favorited
    } else {
      // Add to favorites
      favorites.unshift({ ...summoner, timestamp: Date.now() });
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true; // now favorited
    }
  } catch {
    return false;
  }
}
