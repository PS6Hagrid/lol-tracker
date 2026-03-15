import { getChampionTierList } from "@/lib/champion-data";
import ChampionTierList from "@/components/ChampionTierList";
import { getLatestGameVersion } from "@/lib/constants";

export const metadata = {
  title: "Champion Tier List | Trackerino",
  description:
    "Browse all League of Legends champions by tier, role, and more.",
};

export default async function ChampionsPage() {
  const [champions, version] = await Promise.all([
    getChampionTierList(),
    getLatestGameVersion(),
  ]);

  const patch = version.split(".").slice(0, 2).join(".");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ChampionTierList champions={champions} patch={patch} />
    </div>
  );
}
