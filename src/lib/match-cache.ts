import { prisma } from "@/lib/db";
import type { MatchDTO } from "@/types/riot";

/**
 * Try to get a match from the DB cache.
 * Returns null if not found.
 */
export async function getCachedMatch(
  matchId: string,
): Promise<MatchDTO | null> {
  try {
    const cached = await prisma.matchCache.findUnique({
      where: { matchId },
    });
    if (!cached) return null;
    return JSON.parse(cached.data) as MatchDTO;
  } catch {
    return null;
  }
}

/**
 * Get multiple matches from cache at once.
 * Returns a Map of matchId → MatchDTO for found entries.
 */
export async function getCachedMatches(
  matchIds: string[],
): Promise<Map<string, MatchDTO>> {
  const result = new Map<string, MatchDTO>();
  if (matchIds.length === 0) return result;

  try {
    const cached = await prisma.matchCache.findMany({
      where: { matchId: { in: matchIds } },
    });
    for (const entry of cached) {
      try {
        result.set(entry.matchId, JSON.parse(entry.data) as MatchDTO);
      } catch {
        // Skip corrupt entries
      }
    }
  } catch {
    // Return whatever we have
  }

  return result;
}

/**
 * Save a match from Riot API to the DB cache.
 * Silently skips if match already exists or on error.
 */
export async function saveMatchToCache(
  match: MatchDTO,
  region: string,
): Promise<void> {
  try {
    await prisma.matchCache.upsert({
      where: { matchId: match.metadata.matchId },
      update: {}, // Already exists, do nothing
      create: {
        matchId: match.metadata.matchId,
        region,
        data: JSON.stringify(match),
      },
    });
  } catch {
    // Silently skip — race condition or other error
  }
}

/**
 * Save multiple matches to cache (fire-and-forget).
 */
export async function saveMatchesToCache(
  matches: MatchDTO[],
  region: string,
): Promise<void> {
  await Promise.allSettled(
    matches.map((match) => saveMatchToCache(match, region)),
  );
}
