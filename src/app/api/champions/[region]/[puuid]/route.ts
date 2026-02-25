import { NextResponse } from "next/server";
import { getDataService } from "@/lib/data-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ region: string; puuid: string }> },
) {
  try {
    const { region, puuid } = await params;

    if (!region || !puuid) {
      return NextResponse.json(
        { error: "Missing region or puuid parameter" },
        { status: 400 },
      );
    }

    const dataService = getDataService();
    const masteries = await dataService.getChampionMasteries(region, puuid);

    return NextResponse.json({ masteries });
  } catch (error) {
    console.error("Error fetching champion masteries:", error);
    return NextResponse.json(
      { error: "Failed to fetch champion mastery data" },
      { status: 500 },
    );
  }
}
