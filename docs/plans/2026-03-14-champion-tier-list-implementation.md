# Champion Tier List Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a champion tier list page showing all 169+ champions with S/A/B/C/D tier ratings, lane role filters, search, and responsive card grid.

**Architecture:** Server component fetches DDragon champion data (cached 1h), imports static tier config JSON, merges them, and passes to a client component that handles filtering/search/sorting with zero API calls.

**Tech Stack:** Next.js 14 App Router, DDragon CDN, static JSON tier config, Tailwind CSS.

---

### Task 1: Create tier config JSON

**Files:**
- Create: `src/data/tiers/patch-14.24.json`

**Step 1: Create the tier config file**

Create `src/data/tiers/patch-14.24.json` containing all 169 champions with tier ratings and lane roles. Structure:

```json
{
  "patch": "14.24",
  "tiers": {
    "Aatrox": { "tier": "A", "roles": ["top"] },
    "Ahri": { "tier": "A", "roles": ["mid"] },
    ...
  }
}
```

Tier distribution (realistic meta spread):
- S tier: ~15% of champions (25-26)
- A tier: ~25% (42-43)
- B tier: ~30% (50-51)
- C tier: ~20% (33-34)
- D tier: ~10% (16-17)

Lane roles: `"top"`, `"jungle"`, `"mid"`, `"bot"`, `"support"`. Champions can have multiple roles (e.g., Pantheon: `["top", "mid", "support"]`).

Use real-world meta knowledge to assign plausible tiers and roles. Every champion in DDragon must have an entry.

**Step 2: Commit**

```bash
git add src/data/tiers/
git commit -m "feat: add patch 14.24 champion tier config"
```

---

### Task 2: Create champion data helper

**Files:**
- Create: `src/lib/champion-data.ts`

**Step 1: Create the helper module**

```typescript
import { DDRAGON_BASE_URL, getLatestGameVersion } from "@/lib/constants";
import tierConfig from "@/data/tiers/patch-14.24.json";

export type ChampionTier = "S" | "A" | "B" | "C" | "D";
export type Lane = "top" | "jungle" | "mid" | "bot" | "support";

export interface ChampionMeta {
  id: string;           // DDragon ID e.g. "Ahri"
  key: string;          // Numeric key e.g. "103"
  name: string;         // Display name e.g. "Ahri"
  title: string;        // e.g. "the Nine-Tailed Fox"
  tags: string[];       // Riot tags e.g. ["Mage", "Assassin"]
  difficulty: number;   // 1-10
  iconUrl: string;      // Full DDragon icon URL
  tier: ChampionTier;
  roles: Lane[];
}

interface DDragonChampion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  info: { difficulty: number };
}

interface DDragonResponse {
  data: Record<string, DDragonChampion>;
}

/**
 * Fetch all champion data from DDragon and merge with tier config.
 * Intended to be called from a server component (cached via fetch revalidate).
 */
export async function getChampionTierList(): Promise<ChampionMeta[]> {
  const version = await getLatestGameVersion();

  const res = await fetch(
    `${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion.json`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch DDragon champions: ${res.status}`);
  }

  const data: DDragonResponse = await res.json();
  const tiers = tierConfig.tiers as Record<string, { tier: string; roles: string[] }>;

  return Object.values(data.data).map((champ) => {
    const tierEntry = tiers[champ.id];
    return {
      id: champ.id,
      key: champ.key,
      name: champ.name,
      title: champ.title,
      tags: champ.tags,
      difficulty: champ.info.difficulty,
      iconUrl: `${DDRAGON_BASE_URL}/cdn/${version}/img/champion/${champ.id}.png`,
      tier: (tierEntry?.tier as ChampionTier) ?? "C",
      roles: (tierEntry?.roles as Lane[]) ?? [],
    };
  });
}

/** Tier display config */
export const TIER_CONFIG: Record<ChampionTier, { label: string; color: string; bgColor: string }> = {
  S: { label: "S", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  A: { label: "A", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  B: { label: "B", color: "text-green-400", bgColor: "bg-green-500/20" },
  C: { label: "C", color: "text-gray-400", bgColor: "bg-gray-500/20" },
  D: { label: "D", color: "text-red-400", bgColor: "bg-red-500/20" },
};

/** Lane display config */
export const LANE_CONFIG: Record<Lane, { label: string; emoji: string }> = {
  top: { label: "Top", emoji: "🛡️" },
  jungle: { label: "Jungle", emoji: "🌿" },
  mid: { label: "Mid", emoji: "⚡" },
  bot: { label: "Bot", emoji: "🏹" },
  support: { label: "Support", emoji: "💚" },
};
```

**Step 2: Commit**

```bash
git add src/lib/champion-data.ts
git commit -m "feat: add champion data helper with DDragon fetch and tier merge"
```

---

### Task 3: Create ChampionTierList client component

**Files:**
- Create: `src/components/ChampionTierList.tsx`

**Step 1: Create the component**

This is a `"use client"` component receiving the full champion list as props.

Props:
- `champions: ChampionMeta[]`
- `patch: string`

State:
- `lane`: Lane | "all" (default "all")
- `tierFilter`: ChampionTier | "all" (default "all")
- `search`: string (default "")
- `sort`: "tier" | "name" (default "tier")

Filtering logic:
1. Filter by lane (if not "all")
2. Filter by tier (if not "all")
3. Filter by search (case-insensitive name match)
4. Sort: by tier uses order S>A>B>C>D then alphabetical; by name uses alphabetical

UI sections:
- **Patch badge**: "Patch {patch}" in top-right
- **Lane tabs**: All | Top (🛡️) | Jungle (🌿) | Mid (⚡) | Bot (🏹) | Support (💚)
- **Filter row**: Tier dropdown + Search input + Sort toggle
- **Results count**: "Showing X of Y champions"
- **Tier-grouped grid** (when sort=tier): H2 section per tier with colored accent, then responsive grid of champion cards
- **Flat grid** (when sort=name): Just the responsive grid sorted alphabetically

Champion card:
- 48x48 icon with rounded corners
- Name (bold, text-sm), Title (text-xs, text-gray-400)
- Tier badge (colored pill)
- Role labels (small, text-xs)
- Tags as tiny pills (border-only style)
- Hover: subtle scale + border glow
- Dark card: bg-[#111827], border-gray-700/50, rounded-xl

**Step 2: Commit**

```bash
git add src/components/ChampionTierList.tsx
git commit -m "feat: add ChampionTierList client component with filters and card grid"
```

---

### Task 4: Create champions page

**Files:**
- Create: `src/app/champions/page.tsx`
- Modify: `src/app/layout.tsx` (add nav link)

**Step 1: Create the page**

```typescript
import { getChampionTierList } from "@/lib/champion-data";
import ChampionTierList from "@/components/ChampionTierList";
import { getLatestGameVersion } from "@/lib/constants";

export const metadata = {
  title: "Champion Tier List | Trackerino",
  description: "Browse all League of Legends champions by tier, role, and more.",
};

export default async function ChampionsPage() {
  const [champions, version] = await Promise.all([
    getChampionTierList(),
    getLatestGameVersion(),
  ]);

  // Extract patch number (e.g. "14.24.1" -> "14.24")
  const patch = version.split(".").slice(0, 2).join(".");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ChampionTierList champions={champions} patch={patch} />
    </div>
  );
}
```

**Step 2: Add nav link**

In `src/app/layout.tsx`, add a "Champions" link in the desktop nav (after Leaderboard) and mobile bottom nav (after Leaderboard):

Desktop nav:
```tsx
<Link href="/champions" className="hidden text-xs font-medium text-gray-400 transition-colors hover:text-white sm:block">
  Champions
</Link>
```

Mobile nav: Add trophy/sword icon with "Champions" label, same pattern as existing mobile nav items.

**Step 3: Commit**

```bash
git add src/app/champions/ src/app/layout.tsx
git commit -m "feat: add champions page with nav links"
```

---

### Task 5: Build verification

**Step 1: Type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 2: Build**

```bash
npx next build
```

Expected: Build succeeds, `/champions` route appears in output.

**Step 3: Smoke test**

```bash
DATA_SOURCE=mock npx next dev
```

Visit `http://localhost:3000/champions`:
- Page loads with all champions
- Filter by lane works
- Filter by tier works
- Search works
- Sort toggle works
- Cards display correctly with icons, tier badges, roles
