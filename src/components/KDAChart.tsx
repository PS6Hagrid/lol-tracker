"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface KDADataPoint {
  match: number;
  kills: number;
  deaths: number;
  assists: number;
}

interface KDAChartProps {
  data: KDADataPoint[];
}

export default function KDAChart({ data }: KDAChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm">
        <p className="text-sm text-gray-500">No match data for KDA chart</p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.kills, d.deaths, d.assists)),
  );
  const yMax = Math.ceil(maxValue / 5) * 5 + 5;

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-medium text-gray-400">
        KDA per Match (Recent)
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="killsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="deathsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="assistsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C89B3C" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#C89B3C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="match"
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, yMax]}
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            width={30}
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
            labelFormatter={(label) => `Match ${label}`}
          />
          <Area
            type="monotone"
            dataKey="kills"
            stroke="#00d4ff"
            strokeWidth={2}
            fill="url(#killsGradient)"
            name="Kills"
          />
          <Area
            type="monotone"
            dataKey="deaths"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#deathsGradient)"
            name="Deaths"
          />
          <Area
            type="monotone"
            dataKey="assists"
            stroke="#C89B3C"
            strokeWidth={2}
            fill="url(#assistsGradient)"
            name="Assists"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
          <span className="text-gray-400">Kills</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
          <span className="text-gray-400">Deaths</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-gray-400">Assists</span>
        </span>
      </div>
    </div>
  );
}
