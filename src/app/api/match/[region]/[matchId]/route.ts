import { NextResponse } from "next/server";
import { getDataService } from "@/lib/data-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ region: string; matchId: string }> },
) {
  try {
    const { region, matchId } = await params;

    if (!region || !matchId) {
      return NextResponse.json(
        { error: "Missing region or matchId parameter" },
        { status: 400 },
      );
    }

    const dataService = getDataService();
    const match = await dataService.getMatchDetails(region, matchId);

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Error fetching match details:", error);
    return NextResponse.json(
      { error: "Failed to fetch match details" },
      { status: 500 },
    );
  }
}
