"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { MatchTimelineDTO, MatchParticipantDTO } from "@/types/riot";

interface TimelineTabProps {
  matchId: string;
  region: string;
  participants: MatchParticipantDTO[];
  gameDuration: number;
}

export default function TimelineTab({
  matchId,
  region,
  participants,
}: TimelineTabProps) {
  const [timeline, setTimeline] = useState<MatchTimelineDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTimeline() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/match/${region}/${matchId}/timeline`);
        if (!res.ok) throw new Error("Failed to load timeline data");
        const data = await res.json();
        if (!cancelled) setTimeline(data.timeline);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTimeline();
    return () => { cancelled = true; };
  }, [matchId, region]);

  // Gold advantage: blue team total - red team total per frame
  const goldAdvantageData = useMemo(() => {
    if (!timeline) return [];
    return timeline.info.frames.map((frame) => {
      let blueGold = 0;
      let redGold = 0;
      for (const [key, pf] of Object.entries(frame.participantFrames)) {
        const pid = parseInt(key, 10);
        if (pid <= 5) blueGold += pf.totalGold;
        else redGold += pf.totalGold;
      }
      return {
        minute: Math.round(frame.timestamp / 60000),
        advantage: blueGold - redGold,
      };
    });
  }, [timeline]);

  // Extract key events (kills, objectives, towers)
  const keyEvents = useMemo(() => {
    if (!timeline) return [];

    const events: Array<{
      timestamp: number;
      minute: number;
      type: "kill" | "objective" | "tower";
      description: string;
      teamSide: "blue" | "red";
      icon: string;
    }> = [];

    const monsterNames: Record<string, string> = {
      DRAGON: "Dragon",
      BARON_NASHOR: "Baron Nashor",
      RIFTHERALD: "Rift Herald",
      ELDER_DRAGON: "Elder Dragon",
    };
    const subTypes: Record<string, string> = {
      FIRE_DRAGON: "Infernal",
      WATER_DRAGON: "Ocean",
      EARTH_DRAGON: "Mountain",
      AIR_DRAGON: "Cloud",
      HEXTECH_DRAGON: "Hextech",
      CHEMTECH_DRAGON: "Chemtech",
    };

    for (const frame of timeline.info.frames) {
      for (const event of frame.events) {
        const minute = Math.round(event.timestamp / 60000);

        if (event.type === "CHAMPION_KILL" && event.killerId && event.victimId) {
          const killer = participants[event.killerId - 1]?.championName ?? `P${event.killerId}`;
          const victim = participants[event.victimId - 1]?.championName ?? `P${event.victimId}`;
          events.push({
            timestamp: event.timestamp,
            minute,
            type: "kill",
            description: `${killer} killed ${victim}`,
            teamSide: event.killerId <= 5 ? "blue" : "red",
            icon: "\u{1F480}",
          });
        }

        if (event.type === "ELITE_MONSTER_KILL") {
          const name = monsterNames[event.monsterType ?? ""] ?? event.monsterType ?? "Monster";
          const sub = event.monsterSubType ? subTypes[event.monsterSubType] ?? "" : "";
          events.push({
            timestamp: event.timestamp,
            minute,
            type: "objective",
            description: sub ? `${sub} ${name}` : name,
            teamSide: (event.killerId ?? 0) <= 5 ? "blue" : "red",
            icon: event.monsterType === "BARON_NASHOR" ? "\u{1F451}" : event.monsterType === "RIFTHERALD" ? "\u{1F980}" : "\u{1F409}",
          });
        }

        if (event.type === "BUILDING_KILL" && event.buildingType === "TOWER_BUILDING") {
          const lane = event.laneType?.replace("_LANE", "") ?? "";
          const tower = event.towerType?.replace("_TURRET", "").replace("_", " ") ?? "";
          // teamId = team that LOST the tower, so invert for display
          events.push({
            timestamp: event.timestamp,
            minute,
            type: "tower",
            description: `${lane} ${tower} Tower`,
            teamSide: event.teamId === 100 ? "red" : "blue",
            icon: "\u{1F3F0}",
          });
        }
      }
    }

    events.sort((a, b) => a.timestamp - b.timestamp);
    return events;
  }, [timeline, participants]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading timeline...
        </div>
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-red-400">{error ?? "No timeline data available"}</p>
      </div>
    );
  }

  const maxAdv = Math.max(...goldAdvantageData.map((d) => Math.abs(d.advantage)), 1000);
  const yDomain = Math.ceil(maxAdv / 1000) * 1000;

  return (
    <div className="space-y-6">
      {/* Gold Advantage Chart */}
      <div>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          Team Gold Advantage
        </h5>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={goldAdvantageData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`blueGrad-${matchId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`redGrad-${matchId}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="minute"
              stroke="#6b7280"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              label={{ value: "min", position: "insideBottomRight", offset: -5, fill: "#6b7280", fontSize: 10 }}
            />
            <YAxis
              domain={[-yDomain, yDomain]}
              stroke="#6b7280"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              width={50}
              tickFormatter={(val) => `${val >= 0 ? "+" : ""}${(Number(val) / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid rgba(107,114,128,0.5)",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: 12,
              }}
              labelFormatter={(label) => `${label} min`}
              formatter={(value) => {
                const v = Number(value);
                return [
                  `${v >= 0 ? "+" : ""}${v.toLocaleString()} gold`,
                  v >= 0 ? "Blue Lead" : "Red Lead",
                ];
              }}
            />
            <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="advantage"
              stroke="#3b82f6"
              fill={`url(#blueGrad-${matchId})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-text-secondary">Blue Team Ahead</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            <span className="text-text-secondary">Red Team Ahead</span>
          </span>
        </div>
      </div>

      {/* Key Events */}
      <div>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
          Key Events
        </h5>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {keyEvents.length === 0 ? (
            <p className="py-4 text-center text-xs text-text-muted">No key events recorded</p>
          ) : (
            keyEvents.map((event, idx) => (
              <div
                key={`${event.timestamp}-${idx}`}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                  event.teamSide === "blue" ? "bg-blue-500/10" : "bg-red-500/10"
                }`}
              >
                <span className="w-10 flex-shrink-0 text-right text-text-muted">
                  {event.minute}m
                </span>
                <span className="flex-shrink-0">{event.icon}</span>
                <span className={event.teamSide === "blue" ? "text-blue-400" : "text-red-400"}>
                  {event.description}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
