"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface WeightChartProps {
  data: { date: string; weight: number }[];
  targetWeight?: number;
  height?: number;
}

export function WeightChart({ data, targetWeight, height = 250 }: WeightChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const weights = data.map((d) => d.weight);
  const min = Math.floor(Math.min(...weights, targetWeight || Infinity) - 1);
  const max = Math.ceil(Math.max(...weights) + 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#71717a" }}
          axisLine={{ stroke: "#27272a" }}
          tickLine={false}
        />
        <YAxis
          domain={[min, max]}
          tick={{ fontSize: 12, fill: "#71717a" }}
          axisLine={{ stroke: "#27272a" }}
          tickLine={false}
          unit=" kg"
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "#1a1a1a",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
            fontSize: 13,
            color: "#fff",
          }}
          formatter={(value) => [`${value} kg`, "Weight"]}
        />
        {targetWeight && (
          <ReferenceLine
            y={targetWeight}
            stroke="#d4a853"
            strokeDasharray="6 4"
            label={{
              value: `Target: ${targetWeight} kg`,
              position: "right",
              fill: "#d4a853",
              fontSize: 11,
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#d4a853"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#d4a853", strokeWidth: 2, stroke: "#0a0a0a" }}
          activeDot={{ r: 6, fill: "#d4a853", strokeWidth: 2, stroke: "#0a0a0a" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
