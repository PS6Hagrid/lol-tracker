# Leaderboard Page Design

## Overview

A ranked leaderboard page showing the top players per region using Riot's Apex-tier league endpoints. Covers Challenger, Grandmaster, and Master tiers for Ranked Solo/Duo queue.

## Data Source

Riot League-V4 API endpoints (one call per tier):
- `GET /lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`
- `GET /lol/league/v4/grandmasterleagues/by-queue/RANKED_SOLO_5x5`
- `GET /lol/league/v4/masterleagues/by-queue/RANKED_SOLO_5x5`

Each returns a `LeagueListDTO` containing an array of `LeagueItemDTO`:
- `summonerId`, `summonerName`, `leaguePoints`, `rank`, `wins`, `losses`
- `veteran`, `freshBlood`, `hotStreak`, `inactive`

## Page Layout

### Controls
- **Region dropdown** — All 16 regions, default EUW1
- **Tier tabs** — Challenger | Grandmaster | Master

### Table Columns
| # | Summoner Name | LP | Win/Loss | Winrate | Badges |
|---|---------------|-----|----------|---------|--------|

- **#** — Rank position (sorted by LP desc). Top 3 get gold/silver/bronze highlight
- **Summoner Name** — Clickable link to `/summoner/[region]/[name]`
- **LP** — League points, primary sort
- **W/L** — e.g. "342W 298L"
- **Winrate** — Percentage with color coding (green >55%, red <45%)
- **Badges** — Hot Streak fire emoji, Fresh Blood sparkle, Veteran star

### Pagination
- 50 entries per page for Master tier (3000+ entries)
- Challenger/Grandmaster shown fully (300-700 entries)

## Architecture

### New Files
- `src/app/leaderboard/page.tsx` — Server component, default region
- `src/app/leaderboard/[region]/page.tsx` — Region-specific leaderboard
- `src/components/LeaderboardTable.tsx` — Client component with tier tabs + pagination
- `src/app/api/leaderboard/[region]/route.ts` — API route proxying Riot data

### Data Flow
1. User visits `/leaderboard` or `/leaderboard/euw1`
2. Page server component renders shell with region selector
3. Client component fetches `/api/leaderboard/[region]?tier=challenger`
4. API route calls Riot API (cached in Redis, 5 min TTL)
5. Results sorted by LP descending, returned as JSON

### Data Service
- Add `getLeagueByTier(region, queue, tier)` to DataService interface
- Implement in RiotApiService with Redis caching (5 min TTL)
- Implement in MockDataService with deterministic fake leaderboard data

### Types
```typescript
interface LeagueListDTO {
  tier: string;
  leagueId: string;
  queue: string;
  name: string;
  entries: LeagueItemDTO[];
}

interface LeagueItemDTO {
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  rank: string;
  wins: number;
  losses: number;
  veteran: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
  inactive: boolean;
}
```

## Design Decisions
- **No profile icons** in leaderboard rows — would require N additional API calls per page. Keep it fast.
- **Solo/Duo only** — Flex leaderboards have minimal user interest.
- **Client-side tier switching** — Avoid full page reload when changing tiers.
- **Redis cache 5 min** — Leaderboard data doesn't change frequently.
