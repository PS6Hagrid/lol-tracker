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
      version: "14.24",
      title: "Patch 14.24 Notes",
      date: "2024-12-11",
      highlights: [
        "Ambessa nerfs across the board",
        "Yone base stats adjustments",
        "New Winterblessed skins",
        "Ranked Split 3 rewards distributed",
        "Several item adjustments for marksmen",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-14-24-notes/",
    },
    {
      version: "14.23",
      title: "Patch 14.23 Notes",
      date: "2024-11-20",
      highlights: [
        "Ambessa, the Matriarch of War released",
        "Major preseason item overhaul",
        "New jungle companion changes",
        "Ranked Season 2025 Split 1 begins",
        "AP item rework with new Blackfire Torch",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-14-23-notes/",
    },
    {
      version: "14.22",
      title: "Patch 14.22 Notes",
      date: "2024-11-06",
      highlights: [
        "Worlds 2024 celebration event",
        "Viktor and Swain mid-scope updates",
        "Tank mythic item adjustments",
        "ARAM balance changes",
        "Ranked Split 2 ends",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-14-22-notes/",
    },
    {
      version: "14.21",
      title: "Patch 14.21 Notes",
      date: "2024-10-23",
      highlights: [
        "Worlds 2024 in-client viewing",
        "Skarner follow-up adjustments",
        "Support item gold changes",
        "New Arcane skins collection",
        "Quickplay queue improvements",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-14-21-notes/",
    },
    {
      version: "14.20",
      title: "Patch 14.20 Notes",
      date: "2024-10-09",
      highlights: [
        "Worlds 2024 patch (competitive)",
        "Rek'Sai mini rework",
        "ADC crit item rebalancing",
        "Emerald rank adjustments",
        "Arena mode returns temporarily",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-14-20-notes/",
    },
  ];
}
