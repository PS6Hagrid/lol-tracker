"use client";

import { useEffect } from "react";
import { addToSearchHistory } from "@/lib/local-storage";

interface TrackVisitProps {
  gameName: string;
  tagLine: string;
  region: string;
  profileIconId?: number;
}

/**
 * Invisible component that records the summoner visit
 * to localStorage search history on mount.
 */
export default function TrackVisit({
  gameName,
  tagLine,
  region,
  profileIconId,
}: TrackVisitProps) {
  useEffect(() => {
    addToSearchHistory({ gameName, tagLine, region, profileIconId });
  }, [gameName, tagLine, region, profileIconId]);

  return null;
}
