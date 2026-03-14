# Champion Meta/Tier List Design

## Overview

A champion tier list page showing all League of Legends champions with tier ratings (S/A/B/C/D), lane role filters, and search. Tier data is maintained via patch-versioned JSON config files.

## Data Sources

### Champion Data (DDragon API)
- Endpoint: `https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json`
- Provides: name, title, icon, tags (Fighter, Mage, etc.), info (difficulty)
- Cached for 1 hour via server component fetch

### Tier Config (Static JSON)
- Location: `src/data/tiers/patch-{version}.json`
- Format: Map of champion name to tier + roles
- Imported at build time, no API route needed
- New file per patch, fallback to latest available

### Champion Roles (Static JSON)
- Merged into tier config — each champion entry includes `roles: string[]`
- Lanes: top, jungle, mid, bot, support

## Tier Config Format

```json
{
  "patch": "14.24",
  "tiers": {
    "Ahri": { "tier": "S", "roles": ["mid"] },
    "LeeSin": { "tier": "S", "roles": ["jungle"] },
    "Jinx": { "tier": "B", "roles": ["bot"] },
    "Thresh": { "tier": "A", "roles": ["support"] }
  }
}
```

## Page Layout

### Route: `/champions`

### Header
- Title: "Champion Tier List"
- Current patch version badge

### Filter Bar
- **Lane tabs**: All | Top | Jungle | Mid | Bot | Support
- **Tier filter**: All | S | A | B | C | D
- **Search field**: Filter by champion name
- **Sort**: Tier (default) | Name A-Z

### Champion Grid
Responsive card grid (3-4 columns on desktop, 2 on mobile, 1 on small).

Each card shows:
- Champion icon (48x48 from DDragon)
- Champion name (bold) + title (subtitle)
- Tier badge with color: S=gold, A=blue, B=green, C=gray, D=red
- Lane role icons/labels
- Riot tags as small pills (Fighter, Mage, etc.)

### Tier Sections (default view)
Champions grouped by tier, each section with colored header:
- S Tier — gold accent
- A Tier — blue accent
- B Tier — green accent
- C Tier — gray accent
- D Tier — red accent

## Architecture

### New Files
- `src/data/tiers/patch-14.24.json` — Initial tier config
- `src/lib/champion-data.ts` — Helper to fetch DDragon champion data + merge with tier config
- `src/components/ChampionTierList.tsx` — Client component with filters/search
- `src/app/champions/page.tsx` — Server component page

### Data Flow
1. Server component fetches DDragon champion list (cached 1h)
2. Server component imports tier config JSON
3. Merges champion data with tier ratings
4. Passes merged data as props to client component
5. Client component handles filtering, search, sorting (no additional API calls)

### No DataService Changes
This feature doesn't use the Riot API directly — all data comes from DDragon (public CDN) and static JSON. No changes to DataService interface needed.

## Design Decisions
- **Static tier config** over algorithmic — more accurate, patch-aware, professional
- **Lane roles in tier config** — keeps it in one place, easy to update per patch
- **Server-side DDragon fetch** — better SEO, cached, no client-side loading flash
- **Client-side filtering** — instant response, no round-trips for filter changes
- **Grid layout** over table — more visual, better for champion icons, mobile-friendly
