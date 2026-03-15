import type { Metadata } from "next";
import { getChampionDetail } from "@/lib/champion-detail";
import ChampionDetailView from "@/components/ChampionDetailView";

interface ChampionDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ChampionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const champion = await getChampionDetail(id);

  return {
    title: `${champion.name} - ${champion.title} | Trackerino`,
    description: `${champion.name}, ${champion.title}. View abilities, skins, lore, and tips for ${champion.name} in League of Legends.`,
  };
}

export default async function ChampionDetailPage({
  params,
}: ChampionDetailPageProps) {
  const { id } = await params;
  const champion = await getChampionDetail(id);

  return <ChampionDetailView champion={champion} />;
}
