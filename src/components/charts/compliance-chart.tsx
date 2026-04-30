"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ComplianceChartProps {
  data: { week: string; compliance: number }[];
  height?: number;
}

export function ComplianceChart({ data, height = 200 }: ComplianceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 12, fill: "#71717a" }}
          axisLine={{ stroke: "#27272a" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#71717a" }}
          axisLine={{ stroke: "#27272a" }}
          tickLine={false}
          unit="%"
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
          formatter={(value) => [`${value}%`, "Compliance"]}
        />
        <Bar dataKey="compliance" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.compliance >= 90 ? "#d4a853" : entry.compliance >= 80 ? "#a1a1aa" : "#f59e0b"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
