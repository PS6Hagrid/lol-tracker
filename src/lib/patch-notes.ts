export interface PatchNote {
  version: string;
  title: string;
  date: string;
  highlights: string[];
  url: string;
}

/**
 * Get recent patch notes.
 * In production, this could be scraped or fetched from a CMS.
 * For now, we maintain a static list of recent patches.
 */
export function getRecentPatchNotes(): PatchNote[] {
  return [
    {
      version: "26.S1.6",
      title: "Patch 26.S1.6 Notes",
      date: "2026-03-11",
      highlights: [
        "New champion Elara, the Starbound Sentinel released",
        "Major ADC item overhaul targeting crit build paths",
        "Ambessa and Mel follow-up balance adjustments",
        "New Cosmic and Dark Star skin line",
        "Ranked Split 1 final rewards announced",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-s1-6-notes/",
    },
    {
      version: "26.S1.5",
      title: "Patch 26.S1.5 Notes",
      date: "2026-02-25",
      highlights: [
        "Tank mythic items rebalanced for top lane diversity",
        "Smolder and Zeri hotfixed after pro play dominance",
        "Support gold generation tuning across all items",
        "New Broken Covenant 2026 skins collection",
        "Arena mode returns with new augments and maps",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-s1-5-notes/",
    },
    {
      version: "26.S1.4",
      title: "Patch 26.S1.4 Notes",
      date: "2026-02-11",
      highlights: [
        "AP assassin itemization pass targeting burst windows",
        "Jungle companion system reworked for Season 2026",
        "Varus, Jinx, and Kai'Sa buffs for bot lane diversity",
        "Valentine's Day Heartthrob skins released",
        "Quickplay queue matchmaking improvements",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-s1-4-notes/",
    },
    {
      version: "26.S1.3",
      title: "Patch 26.S1.3 Notes",
      date: "2026-01-28",
      highlights: [
        "Season 2026 ranked placements fully enabled",
        "Leona, Nautilus, and Braum tank support buffs",
        "New Lunar New Year Porcelain skins",
        "Heartsteel and Warmog's Armor cost adjustments",
        "ARAM balance overhaul with 40+ champion changes",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-s1-3-notes/",
    },
    {
      version: "26.S1.2",
      title: "Patch 26.S1.2 Notes",
      date: "2026-01-14",
      highlights: [
        "Season 2026 officially begins with new ranked split",
        "Major map changes to top-side jungle pathing",
        "Lethal Tempo and Conqueror keystone rebalancing",
        "New Winterblessed prestige skins",
        "First Strike and Fleet Footwork tuning",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-s1-2-notes/",
    },
    {
      version: "26.S1.1",
      title: "Patch 26.S1.1 Notes",
      date: "2025-12-18",
      highlights: [
        "Preseason 2026 launches with new item system overhaul",
        "New epic monster objectives replacing Atakhan",
        "Mastery system rework with champion-specific challenges",
        "End of Season 2025 ranked rewards distributed",
        "New Snowdown Showdown event and skins",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-s1-1-notes/",
    },
  ];
}
