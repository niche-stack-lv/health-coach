"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { BodyMeasurement } from "@/lib/mock-data";

interface Props {
  data: BodyMeasurement[];
  metrics: { key: keyof BodyMeasurement; label: string; color: string }[];
  height?: number;
}

export function MeasurementsChart({ data, metrics, height = 220 }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={{ stroke: "#27272a" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={{ stroke: "#27272a" }} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#1a1a1a", fontSize: 12, color: "#fff" }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#71717a" }} />
        {metrics.map((m) => (
          <Line key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={m.color} strokeWidth={2}
            dot={{ r: 3, fill: m.color, strokeWidth: 1.5, stroke: "#0a0a0a" }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
