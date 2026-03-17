import { NextResponse } from "next/server";
import { getChampionFullData } from "@/lib/champion-compare";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const data = await getChampionFullData(params.id);
    return NextResponse.json({ champion: data });
  } catch {
    return NextResponse.json({ error: "Champion not found" }, { status: 404 });
  }
}
