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
      version: "25.S1.6",
      title: "Patch 25.S1.6 Notes",
      date: "2025-03-12",
      highlights: [
        "Mel, the Mage Marksman, released to live servers",
        "Bruiser item adjustments targeting Sterak's Gage and Spear of Shojin",
        "Skarner and Ksante nerfs after pro play dominance",
        "New Porcelain and Crystalis Motus skins",
        "Vanguard anti-cheat improvements and detection updates",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-s1-6-notes/",
    },
    {
      version: "25.S1.5",
      title: "Patch 25.S1.5 Notes",
      date: "2025-02-26",
      highlights: [
        "Substantial mid-patch hotfixes for Zeri and Smolder",
        "Support item gold generation tuning",
        "Void Grub reward scaling reduced in early game",
        "New Broken Covenant skins line",
        "Ranked Split 1 rewards preview announced",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-s1-5-notes/",
    },
    {
      version: "25.S1.4",
      title: "Patch 25.S1.4 Notes",
      date: "2025-02-12",
      highlights: [
        "Major AP assassin item pass targeting Stormsurge and Shadowflame",
        "Varus and Jinx buffs to increase ADC diversity",
        "Atakhan objective balance adjustments",
        "New Heartache and Heartthrob Valentine's Day skins",
        "Quickplay champion select improvements",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-s1-4-notes/",
    },
    {
      version: "25.S1.3",
      title: "Patch 25.S1.3 Notes",
      date: "2025-01-22",
      highlights: [
        "Season 2025 ranked placements fully enabled",
        "Tank support buffs for Leona, Nautilus, and Braum",
        "Heartsteel and Warmog's Armor cost adjustments",
        "New Lunar New Year Porcelain skins",
        "ARAM balance overhaul with champion-specific changes",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-s1-3-notes/",
    },
    {
      version: "25.S1.2",
      title: "Patch 25.S1.2 Notes",
      date: "2025-01-08",
      highlights: [
        "Season 2025 officially begins with new ranked split",
        "Ambessa follow-up nerfs to W shield and passive damage",
        "New Atakhan epic monster introduced in top-side river",
        "Lethal Tempo rune reworked after preseason removal",
        "First Strike and Fleet Footwork tuning",
      ],
      url: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-s1-2-notes/",
    },
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
  ];
}
