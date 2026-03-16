import type { MetadataRoute } from "next";
import tierData from "@/data/tiers/patch-14.24.json";
import { REGIONS } from "@/lib/constants";

const BASE_URL = "https://trackerino.gg";

export default function sitemap(): MetadataRoute.Sitemap {
  const championIds = Object.keys(tierData.tiers);

  const championPages: MetadataRoute.Sitemap = championIds.map((id) => ({
    url: `${BASE_URL}/champions/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const regionPages: MetadataRoute.Sitemap = REGIONS.map((region) => ({
    url: `${BASE_URL}/leaderboard/${region.value}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/champions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/patch-notes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/multi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...championPages,
    ...regionPages,
  ];
}
