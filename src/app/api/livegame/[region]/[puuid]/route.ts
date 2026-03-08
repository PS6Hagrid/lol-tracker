import { NextResponse } from "next/server";
import { getDataService } from "@/lib/data-service";
import { enrichLiveGame } from "@/lib/live-game-enrichment";

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ region: string; puuid: string }> },
) {
  try {
    const { region, puuid } = await params;

    if (!region || !puuid) {
      return NextResponse.json({ error: "Missing region or puuid parameter" }, { status: 400 });
    }

    const dataService = await getDataService();
    const liveGame = await dataService.getLiveGame(region, puuid);

    if (!liveGame) {
      return NextResponse.json({ liveGame: null });
    }

    const enrichedGame = await enrichLiveGame(dataService, region, liveGame);
    return NextResponse.json({ liveGame: enrichedGame });
  } catch (error) {
    console.error("Error fetching live game:", error);
    return NextResponse.json({ error: "Failed to fetch live game data" }, { status: 500 });
  }
}
