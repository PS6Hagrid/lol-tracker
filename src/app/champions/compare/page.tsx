import { getAllChampionNames } from "@/lib/champion-compare";
import ChampionCompare from "@/components/ChampionCompare";

export const metadata = {
  title: "Champion Comparison | Trackerino",
  description: "Compare League of Legends champions side by side.",
};

export default async function ComparePage() {
  const champions = await getAllChampionNames();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <ChampionCompare champions={champions} />
    </div>
  );
}
