import { NextRequest, NextResponse } from "next/server";
import { getDataService } from "@/lib/data-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { region: string } },
) {
  const { region } = params;
  const tier = (request.nextUrl.searchParams.get("tier") ?? "challenger") as
    | "challenger"
    | "grandmaster"
    | "master";

  if (!["challenger", "grandmaster", "master"].includes(tier)) {
    return NextResponse.json(
      { error: "Invalid tier. Must be challenger, grandmaster, or master." },
      { status: 400 },
    );
  }

  try {
    const dataService = await getDataService();
    const league = await dataService.getLeagueByTier(
      region,
      "RANKED_SOLO_5x5",
      tier,
    );

    // Sort by LP descending
    league.entries.sort((a, b) => b.leaguePoints - a.leaguePoints);

    return NextResponse.json({ league });
  } catch (error: unknown) {
    console.error("Leaderboard API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      (error as { status?: number }).status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}
