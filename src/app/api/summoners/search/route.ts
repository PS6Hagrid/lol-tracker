import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim();
    const region = searchParams.get("region");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "6", 10), 8);

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const where: Record<string, unknown> = {
      gameName: { contains: q },
    };

    if (region) {
      where.region = region;
    }

    const summoners = await prisma.summoner.findMany({
      where,
      select: {
        gameName: true,
        tagLine: true,
        region: true,
        profileIconId: true,
        summonerLevel: true,
      },
      orderBy: { lastUpdated: "desc" },
      take: limit,
    });

    return NextResponse.json({ suggestions: summoners });
  } catch (error) {
    console.error("Error searching summoners:", error);
    return NextResponse.json(
      { error: "Failed to search summoners" },
      { status: 500 },
    );
  }
}
