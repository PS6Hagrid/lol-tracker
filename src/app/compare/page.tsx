import type { Metadata } from "next";
import SummonerCompare from "@/components/SummonerCompare";

export const metadata: Metadata = {
  title: "Summoner Comparison",
  description:
    "Compare two League of Legends summoners side by side — ranked stats, KDA, CS/min, top champions, and more.",
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SummonerCompare />
    </div>
  );
}
