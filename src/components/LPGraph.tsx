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
import type { LeagueEntryDTO } from "@/types/riot";
import { toTotalLP, labelFromTotalLP, RANKED_TIERS } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LPSnapshot {
  tier: string;
  rank: string;
  lp: number;
  totalLP: number;
  timestamp: string;
}

interface LPGraphProps {
  /** Historical LP snapshots from the database. */
  data: LPSnapshot[];
  /** Current ranked entry (used as fallback single point when no history). */
  currentEntry?: LeagueEntryDTO | null;
}

// ─── Tier reference lines ─────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  IRON: "#6b6b6b",
  BRONZE: "#a0714f",
  SILVER: "#8b9bb4",
  GOLD: "#c89b3c",
  PLATINUM: "#21c8b0",
  EMERALD: "#2ecc71",
  DIAMOND: "#576cce",
  MASTER: "#9d48e0",
};

interface TierLine {
  label: string;
  totalLP: number;
  color: string;
}

function getTierLines(minLP: number, maxLP: number): TierLine[] {
  const lines: TierLine[] = [];
  const tiers = RANKED_TIERS.slice(0, 8); // Up to Master

  for (let i = 0; i < tiers.length; i++) {
    const boundary = i * 400;
    if (boundary > minLP - 100 && boundary < maxLP + 100 && boundary > 0) {
      lines.push({
        label: tiers[i].charAt(0) + tiers[i].slice(1).toLowerCase(),
        totalLP: boundary,
        color: TIER_COLORS[tiers[i]] ?? "#6b7280",
      });
    }
  }
  // Master boundary at 2800
  if (2800 > minLP - 100 && 2800 < maxLP + 100) {
    lines.push({ label: "Master", totalLP: 2800, color: TIER_COLORS.MASTER! });
  }

  return lines;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: LPSnapshot }[] }) {
  if (!active || !payload?.length) return null;
  const snap = payload[0].payload;
  const tierLabel = labelFromTotalLP(snap.totalLP);

  return (
    <div className="rounded-lg border border-gray-700/50 bg-gray-900/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-medium text-gray-300">{snap.timestamp}</p>
      <p className="mt-0.5 font-semibold text-cyan">{tierLabel}</p>
      <p className="text-gray-400">{snap.lp} LP</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LPGraph({ data, currentEntry }: LPGraphProps) {
  let chartData = data;

  // If no history but we have a current entry, show a single-point chart
  if (chartData.length === 0 && currentEntry) {
    const now = new Date();
    const total = toTotalLP(currentEntry.tier, currentEntry.rank, currentEntry.leaguePoints);
    chartData = [
      {
        tier: currentEntry.tier,
        rank: currentEntry.rank,
        lp: currentEntry.leaguePoints,
        totalLP: total,
        timestamp: `${now.getMonth() + 1}/${now.getDate()}`,
      },
    ];
  }

  // Duplicate single point so the chart renders a visible line
  if (chartData.length === 1) {
    chartData = [chartData[0], { ...chartData[0], timestamp: chartData[0].timestamp + " " }];
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-gray-700/50 bg-gray-900/80 p-6 backdrop-blur-sm">
        <svg className="mb-2 h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <p className="text-sm font-medium text-gray-400">No LP Data Yet</p>
        <p className="mt-1 text-xs text-gray-500">
          LP history builds up each time you visit this profile.
        </p>
      </div>
    );
  }

  // Compute Y-axis domain with padding
  const allLP = chartData.map((d) => d.totalLP);
  const minLP = Math.min(...allLP);
  const maxLP = Math.max(...allLP);
  const padding = Math.max(50, (maxLP - minLP) * 0.15);
  const yMin = Math.max(0, Math.floor((minLP - padding) / 50) * 50);
  const yMax = Math.ceil((maxLP + padding) / 50) * 50;

  const tierLines = getTierLines(yMin, yMax);

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">LP History</h3>
        <span className="text-xs text-gray-500">{chartData.length} snapshots</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="lpGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="timestamp"
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            width={44}
            tickFormatter={(val: number) => {
              // Show tier abbreviation for clean axis
              if (val >= 2800) return `M ${val - 2800}`;
              const tierIdx = Math.floor(val / 400);
              const tierAbbr = ["I", "B", "S", "G", "P", "E", "D"][tierIdx] ?? "?";
              const divLP = val % 400;
              return `${tierAbbr} ${divLP}`;
            }}
          />
          {/* Tier boundary reference lines */}
          {tierLines.map((line) => (
            <ReferenceLine
              key={line.label}
              y={line.totalLP}
              stroke={line.color}
              strokeDasharray="6 4"
              strokeOpacity={0.5}
              label={{
                value: line.label,
                position: "right",
                fill: line.color,
                fontSize: 10,
                fontWeight: 600,
              }}
            />
          ))}
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="totalLP"
            stroke="#00d4ff"
            strokeWidth={2}
            fill="url(#lpGradient)"
            dot={{ fill: "#00d4ff", r: 3, stroke: "#0a0f1a", strokeWidth: 1 }}
            activeDot={{ r: 5, fill: "#C89B3C", stroke: "#C89B3C" }}
            name="LP"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
