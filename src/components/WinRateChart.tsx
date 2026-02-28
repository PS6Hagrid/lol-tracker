"use client";

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
import type { MatchDTO } from "@/types/riot";

interface WinRateChartProps {
  matches: MatchDTO[];
  puuid: string;
}

function findPlayer(match: MatchDTO, puuid: string) {
  return (
    match.info.participants.find((p) => p.puuid === puuid) ??
    match.info.participants[0]
  );
}

export default function WinRateChart({ matches, puuid }: WinRateChartProps) {
  // Filter out remakes and reverse so oldest first
  const validMatches = matches
    .filter((m) => m.info.gameDuration >= 300)
    .reverse();

  if (validMatches.length < 3) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm">
        <p className="text-sm text-gray-500">
          Not enough matches for win rate chart
        </p>
      </div>
    );
  }

  // Build rolling win rate data
  let wins = 0;
  const data = validMatches.map((match, idx) => {
    const player = findPlayer(match, puuid);
    if (player.win) wins++;
    const gameNum = idx + 1;
    const winRate = Math.round((wins / gameNum) * 100);
    return {
      game: gameNum,
      winRate,
      result: player.win ? "W" : "L",
    };
  });

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-medium text-gray-400">
        Win Rate Trend
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="wrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="game"
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            width={35}
            tickFormatter={(v) => `${v}%`}
          />
          <ReferenceLine
            y={50}
            stroke="#6b7280"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid rgba(107,114,128,0.5)",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: 12,
            }}
            labelStyle={{ color: "#9ca3af" }}
            labelFormatter={(label) => `Game ${label}`}
            formatter={(value: unknown) => [`${value}%`, "Win Rate"]}
          />
          <Area
            type="monotone"
            dataKey="winRate"
            stroke="#00d4ff"
            strokeWidth={2}
            fill="url(#wrGradient)"
            name="Win Rate"
            dot={(dotProps: Record<string, unknown>) => {
              const cx = dotProps.cx as number;
              const cy = dotProps.cy as number;
              const payload = dotProps.payload as { result: string };
              return (
                <circle
                  key={`dot-${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill={payload?.result === "W" ? "#22c55e" : "#ef4444"}
                  stroke="none"
                />
              );
            }}
            activeDot={{
              r: 5,
              stroke: "#00d4ff",
              strokeWidth: 2,
              fill: "#111827",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          <span className="text-gray-400">Win</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          <span className="text-gray-400">Loss</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-gray-500" style={{ opacity: 0.5 }} />
          <span className="text-gray-400">50% line</span>
        </span>
      </div>
    </div>
  );
}
