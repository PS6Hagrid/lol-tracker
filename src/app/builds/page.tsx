import { getAllBuilds } from "@/lib/build-data";
import BuildRecommender from "@/components/BuildRecommender";

export const metadata = {
  title: "Build Recommender | Trackerino",
  description:
    "Find recommended builds, runes, and skill orders for popular League of Legends champions.",
};

export default function BuildsPage() {
  const builds = getAllBuilds();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <BuildRecommender builds={builds} />
    </div>
  );
}
