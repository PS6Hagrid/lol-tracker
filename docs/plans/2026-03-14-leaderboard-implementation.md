# Leaderboard Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a ranked leaderboard page showing Challenger/Grandmaster/Master players per region using Riot League-V4 API.

**Architecture:** New `getLeagueByTier()` method on DataService fetches apex-tier league data. API route caches and serves it. Client component handles tier tabs, region selector, pagination, and sorting.

**Tech Stack:** Next.js 14 App Router, Riot League-V4 API, Redis caching (5 min TTL), Tailwind CSS, existing DataService pattern.

---

### Task 1: Add LeagueList types to riot.ts

**Files:**
- Modify: `src/types/riot.ts` (append after line 327)

**Step 1: Add types**

Append to `src/types/riot.ts`:

```typescript
// ─── League Leaderboard ──────────────────────────────────────────────────────

export interface LeagueListDTO {
  tier: string;
  leagueId: string;
  queue: string;
  name: string;
  entries: LeagueItemDTO[];
}

export interface LeagueItemDTO {
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

**Step 2: Commit**

```bash
git add src/types/riot.ts
git commit -m "feat: add LeagueListDTO and LeagueItemDTO types for leaderboard"
```

---

### Task 2: Add getLeagueByTier to DataService interface

**Files:**
- Modify: `src/lib/data-service.ts` (add import + method after line 67)

**Step 1: Update imports at top of file**

Add `LeagueListDTO` to the import from `@/types/riot`:

```typescript
import type {
  SummonerDTO,
  LeagueEntryDTO,
  MatchDTO,
  MatchTimelineDTO,
  CurrentGameInfo,
  ChampionMasteryDTO,
  LeagueListDTO,
} from "@/types/riot";
```

**Step 2: Add method to DataService interface**

After `getMatchTimeline` (line 67), add:

```typescript
  /** Fetch apex-tier league (challenger/grandmaster/master) for a queue */
  getLeagueByTier(
    region: string,
    queue: string,
    tier: "challenger" | "grandmaster" | "master",
  ): Promise<LeagueListDTO>;
```

**Step 3: Commit**

```bash
git add src/lib/data-service.ts
git commit -m "feat: add getLeagueByTier to DataService interface"
```

---

### Task 3: Implement getLeagueByTier in RiotApiService

**Files:**
- Modify: `src/lib/riot-api-service.ts` (add import + method after line 453)

**Step 1: Add LeagueListDTO to imports**

Update the import at line 1-8 to include `LeagueListDTO`:

```typescript
import type {
  SummonerDTO,
  LeagueEntryDTO,
  MatchDTO,
  MatchTimelineDTO,
  CurrentGameInfo,
  ChampionMasteryDTO,
  LeagueListDTO,
} from "@/types/riot";
```

**Step 2: Add implementation**

After `getMatchTimeline` method (line 453), add:

```typescript
  async getLeagueByTier(
    region: string,
    queue: string,
    tier: "challenger" | "grandmaster" | "master",
  ): Promise<LeagueListDTO> {
    const endpoint = tier === "challenger"
      ? "challengerleagues"
      : tier === "grandmaster"
        ? "grandmasterleagues"
        : "masterleagues";

    return this.riotFetch<LeagueListDTO>(
      `${this.platformUrl(region)}/lol/league/v4/${endpoint}/by-queue/${queue}`,
      { cacheTtl: 300 }, // 5 min cache
    );
  }
```

**Step 3: Commit**

```bash
git add src/lib/riot-api-service.ts
git commit -m "feat: implement getLeagueByTier in RiotApiService"
```

---

### Task 4: Implement getLeagueByTier in MockDataService

**Files:**
- Modify: `src/lib/mock-data-service.ts` (add import + method at end of class)

**Step 1: Add LeagueListDTO to imports**

Add `LeagueListDTO` and `LeagueItemDTO` to the import from `@/types/riot` at line 1-14.

**Step 2: Add mock implementation**

Add this method to the `MockDataService` class, after the last method:

```typescript
  async getLeagueByTier(
    region: string,
    queue: string,
    tier: "challenger" | "grandmaster" | "master",
  ): Promise<LeagueListDTO> {
    const seed = hashString(`leaderboard:${region}:${queue}:${tier}`);
    const rng = seededRandom(seed);

    const count = tier === "challenger" ? 300 : tier === "grandmaster" ? 700 : 3000;
    const baseLp = tier === "challenger" ? 800 : tier === "grandmaster" ? 400 : 0;

    const FAKE_NAMES = [
      "HideonBush", "Ruler", "Deft", "Chovy", "Zeus", "Keria", "Canyon", "Gumayusi",
      "ShowMaker", "Viper", "BeryL", "Lehends", "Peyz", "Oner", "Faker",
      "Peanut", "Doran", "Prince", "Aiming", "Delight", "Life", "Lucid",
      "Zeka", "Kanavi", "TheShy", "Meiko", "Scout", "Jiejie", "Elk", "ON",
      "Caps", "Jankos", "Rekkles", "Mikyx", "Wunder", "HansSama", "Elyoya",
      "Humanoid", "Comp", "Trymbi", "Upset", "Razork", "Oscarinin", "Noah",
      "Inspired", "Bwipo", "CoreJJ", "Blaber", "Berserker", "Impact",
    ];

    const entries: LeagueItemDTO[] = Array.from({ length: count }, (_, i) => {
      const nameBase = FAKE_NAMES[i % FAKE_NAMES.length];
      const suffix = i >= FAKE_NAMES.length ? `${Math.floor(i / FAKE_NAMES.length)}` : "";
      return {
        summonerId: `mock-${region}-${tier}-${i}`,
        summonerName: `${nameBase}${suffix}`,
        leaguePoints: baseLp + Math.floor(rng() * 600) + (count - i),
        rank: "I",
        wins: seededInt(rng, 100, 500),
        losses: seededInt(rng, 80, 400),
        veteran: rng() > 0.7,
        freshBlood: rng() > 0.85,
        hotStreak: rng() > 0.8,
        inactive: false,
      };
    });

    // Sort by LP descending
    entries.sort((a, b) => b.leaguePoints - a.leaguePoints);

    return {
      tier: tier.toUpperCase(),
      leagueId: `mock-league-${region}-${tier}`,
      queue,
      name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${region.toUpperCase()}`,
      entries,
    };
  }
```

Note: `hashString`, `seededRandom`, and `seededInt` are already defined at the top of the file.

**Step 3: Commit**

```bash
git add src/lib/mock-data-service.ts
git commit -m "feat: implement getLeagueByTier in MockDataService"
```

---

### Task 5: Create leaderboard API route

**Files:**
- Create: `src/app/api/leaderboard/[region]/route.ts`

**Step 1: Create the API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getDataService } from "@/lib/data-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { region: string } },
) {
  const { region } = params;
  const tier = (request.nextUrl.searchParams.get("tier") ?? "challenger") as
    | "challenger"
    | "grandmaster"
    | "master";

  if (!["challenger", "grandmaster", "master"].includes(tier)) {
    return NextResponse.json(
      { error: "Invalid tier. Must be challenger, grandmaster, or master." },
      { status: 400 },
    );
  }

  try {
    const dataService = await getDataService();
    const league = await dataService.getLeagueByTier(
      region,
      "RANKED_SOLO_5x5",
      tier,
    );

    // Sort by LP descending
    league.entries.sort((a, b) => b.leaguePoints - a.leaguePoints);

    return NextResponse.json({ league });
  } catch (error: unknown) {
    console.error("Leaderboard API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/leaderboard/
git commit -m "feat: add leaderboard API route for apex-tier leagues"
```

---

### Task 6: Create LeaderboardTable client component

**Files:**
- Create: `src/components/LeaderboardTable.tsx`

**Step 1: Create the component**

This is a `"use client"` component handling:
- Tier tabs (Challenger / Grandmaster / Master)
- Fetching data from `/api/leaderboard/[region]?tier=X`
- LP-sorted table with rank #, name, LP, W/L, winrate, badges
- Pagination for Master tier (50 per page)
- Top 3 gold/silver/bronze highlights
- Loading skeleton state
- Link to summoner profile on name click

Key implementation details:
- `useState` for `tier`, `page`, `data`, `loading`
- `useEffect` fetches when `tier` or `region` changes
- Winrate color: green (>55%), white (45-55%), red (<45%)
- Hot streak: 🔥, Fresh blood: ✨, Veteran: ⭐
- Top 3 rows: `bg-gold/5`, `bg-gray-300/5`, `bg-amber-700/5` with medal emoji
- Tier tabs styled like existing TabNavigation pattern
- Pagination: simple prev/next with page numbers

**Step 2: Commit**

```bash
git add src/components/LeaderboardTable.tsx
git commit -m "feat: add LeaderboardTable client component with tier tabs and pagination"
```

---

### Task 7: Create leaderboard page routes

**Files:**
- Create: `src/app/leaderboard/page.tsx`
- Create: `src/app/leaderboard/[region]/page.tsx`

**Step 1: Create redirect page**

`src/app/leaderboard/page.tsx` — redirects to default region:

```typescript
import { redirect } from "next/navigation";

export default function LeaderboardIndex() {
  redirect("/leaderboard/euw1");
}
```

**Step 2: Create region-specific page**

`src/app/leaderboard/[region]/page.tsx` — server component shell:

```typescript
import { REGIONS } from "@/lib/constants";
import LeaderboardTable from "@/components/LeaderboardTable";

export function generateMetadata({ params }: { params: { region: string } }) {
  const regionLabel = REGIONS.find((r) => r.value === params.region)?.label ?? params.region;
  return {
    title: `Leaderboard — ${regionLabel} | Trackerino`,
    description: `Top Challenger, Grandmaster, and Master players in ${regionLabel}.`,
  };
}

export default function LeaderboardPage({ params }: { params: { region: string } }) {
  const { region } = params;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <LeaderboardTable region={region} />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/leaderboard/
git commit -m "feat: add leaderboard page with region routing"
```

---

### Task 8: Add leaderboard link to navigation

**Files:**
- Modify: whatever navbar/header component exists (check `src/components/` for Nav, Header, or layout)

**Step 1: Find and update navigation**

Look for the nav component (likely in `src/app/layout.tsx` or a shared component) and add a "Leaderboard" link pointing to `/leaderboard`.

**Step 2: Commit**

```bash
git add <nav-file>
git commit -m "feat: add leaderboard link to site navigation"
```

---

### Task 9: Build verification and final commit

**Step 1: Run build**

```bash
npx next build
```

Expected: Build succeeds with new `/leaderboard` and `/leaderboard/[region]` routes.

**Step 2: Manual smoke test**

```bash
DATA_SOURCE=mock npx next dev
```

Visit:
- `http://localhost:3000/leaderboard` — should redirect to `/leaderboard/euw1`
- `http://localhost:3000/leaderboard/euw1` — should show Challenger tab with 300 players
- Switch to Grandmaster tab — should show 700 players
- Switch to Master tab — should show 3000 players with pagination
- Click a player name — should navigate to `/summoner/euw1/PlayerName-...`

**Step 3: Squash commit if needed**

If all tasks were committed individually, optionally squash into a single feature commit.
