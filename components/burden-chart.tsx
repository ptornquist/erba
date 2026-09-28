"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PLACEHOLDER_INDUSTRY_AVERAGES,
  type IndustryAverage,
} from "@/lib/visualization-placeholders";
import { formatEurCompact } from "@/lib/utils";

type BurdenChartProps = {
  data?: IndustryAverage[];
  /** Defaults to true when `data` is omitted (isolated placeholder). */
  isPlaceholder?: boolean;
};

export function BurdenChart({
  data,
  isPlaceholder = data === undefined,
}: BurdenChartProps) {
  const rows = [...(data ?? PLACEHOLDER_INDUSTRY_AVERAGES)].sort(
    (a, b) => b.averageCostEur - a.averageCostEur,
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Industry breakdown
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Average compliance cost by industry
          </h2>
        </div>
        {isPlaceholder && (
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Placeholder pending live query
          </p>
        )}
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Mean annual SCM figure per industry. Journalists and members can compare
        where the documented burden sits today.
      </p>
      <div className="mt-6 h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
          >
            <CartesianGrid
              stroke="#c5d4ea"
              strokeDasharray="3 3"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickFormatter={(value: number) => formatEurCompact(value)}
              tick={{ fill: "#4a5d7a", fontSize: 12 }}
              axisLine={{ stroke: "#c5d4ea" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="industry"
              width={148}
              tick={{ fill: "#0a1628", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#e8eef8" }}
              formatter={(value) => [
                formatEurCompact(Number(value ?? 0)),
                "Average cost",
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #c5d4ea",
                background: "#ffffff",
                color: "#0a1628",
                fontSize: 13,
              }}
            />
            <Bar
              dataKey="averageCostEur"
              fill="#003399"
              radius={[0, 6, 6, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
