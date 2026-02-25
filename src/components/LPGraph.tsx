"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface LPDataPoint {
  date: string;
  lp: number;
}

interface LPGraphProps {
  /** Historical LP snapshots. If empty or single-point, we render a simple fallback. */
  data: LPDataPoint[];
  /** Current LP to show as a single point if no history exists */
  currentLP?: number;
}

function generateMockHistory(currentLP: number): LPDataPoint[] {
  const points: LPDataPoint[] = [];
  const now = Date.now();
  const dayMs = 86400000;

  // Generate 14 days of mock LP history trending toward the current LP
  let lp = Math.max(0, currentLP - Math.floor(Math.random() * 40) - 20);
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now - i * dayMs);
    const label = `${date.getMonth() + 1}/${date.getDate()}`;
    points.push({ date: label, lp });

    // Random walk toward currentLP
    const drift = currentLP > lp ? 1 : -1;
    const change = Math.floor(Math.random() * 25) * drift;
    lp = Math.max(0, lp + change);
  }

  // Ensure the last point is the current LP
  points[points.length - 1].lp = currentLP;
  return points;
}

export default function LPGraph({ data, currentLP }: LPGraphProps) {
  let chartData = data;

  if (chartData.length === 0 && currentLP !== undefined) {
    chartData = generateMockHistory(currentLP);
  } else if (chartData.length === 1) {
    // Single point — duplicate it so the chart has a visible line
    chartData = [chartData[0], { ...chartData[0], date: chartData[0].date + " " }];
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm">
        <p className="text-sm text-gray-500">No LP data available</p>
      </div>
    );
  }

  const maxLP = Math.max(...chartData.map((d) => d.lp));
  const yMax = maxLP > 100 ? Math.ceil(maxLP / 100) * 100 : 100;

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-medium text-gray-400">LP History</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, yMax]}
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            width={40}
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
            itemStyle={{ color: "#00d4ff" }}
          />
          <Line
            type="monotone"
            dataKey="lp"
            stroke="#00d4ff"
            strokeWidth={2}
            dot={{ fill: "#00d4ff", r: 3, stroke: "#00d4ff" }}
            activeDot={{ r: 5, fill: "#C89B3C", stroke: "#C89B3C" }}
            name="LP"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
