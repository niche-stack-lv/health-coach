"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: { month: string; revenue: number; clients: number }[];
  height?: number;
}

export function RevenueChart({ data, height = 220 }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a853" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#d4a853" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={{ stroke: "#27272a" }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#71717a" }} axisLine={{ stroke: "#27272a" }} tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#1a1a1a", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)", fontSize: 13, color: "#fff" }}
          formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
        />
        <Area type="monotone" dataKey="revenue" stroke="#d4a853" strokeWidth={2.5} fill="url(#goldGradient)"
          dot={{ r: 4, fill: "#d4a853", strokeWidth: 2, stroke: "#0a0a0a" }}
          activeDot={{ r: 6, fill: "#d4a853", strokeWidth: 2, stroke: "#0a0a0a" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
