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

    const dataService = await getDataService();
    const timeline = await dataService.getMatchTimeline(region, matchId);

    return NextResponse.json({ timeline });
  } catch (error) {
    console.error("Error fetching match timeline:", error);

    if (error && typeof error === "object" && "status" in error) {
      const status = (error as { status: number }).status;
      if (status === 404) {
        return NextResponse.json(
          { error: "Timeline not found" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch match timeline" },
      { status: 500 },
    );
  }
}
