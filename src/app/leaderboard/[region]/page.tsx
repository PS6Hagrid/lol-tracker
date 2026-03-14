import { REGIONS } from "@/lib/constants";
import LeaderboardTable from "@/components/LeaderboardTable";

export function generateMetadata({ params }: { params: { region: string } }) {
  const regionLabel =
    REGIONS.find((r) => r.value === params.region)?.label ?? params.region;
  return {
    title: `Leaderboard — ${regionLabel} | Trackerino`,
    description: `Top Challenger, Grandmaster, and Master players in ${regionLabel}.`,
  };
}

export default function LeaderboardPage({
  params,
}: {
  params: { region: string };
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <LeaderboardTable region={params.region} />
    </div>
  );
}
