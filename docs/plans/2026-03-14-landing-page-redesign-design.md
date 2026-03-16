# Landing Page Redesign — Design

## Goal
Transform the minimal search-only landing page into a professional, op.gg-style experience with feature highlights and social proof while keeping search as the primary focus.

## Approach
Pure Static (Server Component). Trending players fetched from DB at render time. No client-side data fetching for new sections.

## Sections

### 1. Hero (existing, enhanced)
- Keep: Trackerino title with gradient, subtitle, SearchBar, quick links, HomeSidebar
- Add: Stagger animation on load (existing `animate-fade-in` classes)
- No changes to SearchBar or HomeSidebar components

### 2. Feature Cards (new)
- 4 cards in responsive grid: 1col mobile, 2col md, 4col lg
- Features: Match History, Live Game, Champion Mastery, Match Timeline
- Each card: SVG icon + title + one-line description
- Style: `bg-bg-card`, `border-gray-700/50`, gold/cyan gradient border on hover
- Stagger fade-in animation

### 3. Trending Players (new)
- Horizontal scrollable row of up to 8 summoner mini-cards
- Data: `prisma.summoner.findMany({ orderBy: { updatedAt: 'desc' }, take: 8 })`
- Each card: profile icon, GameName#TagLine, region badge
- Click navigates to summoner profile
- Hidden if DB is empty

## Files Changed

| Action | File |
|--------|------|
| EDIT | `src/app/page.tsx` — Add feature cards + trending section, make async server component |
| NEW | `src/components/FeatureCards.tsx` — Static feature cards grid |
| NEW | `src/components/TrendingPlayers.tsx` — Server component, Prisma query for recent summoners |

## Design Tokens
- Background: `bg-bg-card` / `bg-bg-page`
- Borders: `border-gray-700/50`
- Accents: `gold`, `cyan`
- Text: `text-gray-400` (descriptions), `text-white` (titles)
