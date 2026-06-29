"use client";

import { useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WeightChart } from "@/components/charts/weight-chart";
import { WeightDisplay } from "@/components/shared/weight-display";
import { getTodayLocal } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

type Range = "1w" | "1m" | "3m" | "all";

const RANGES: { key: Range; label: string; days: number | null }[] = [
  { key: "1w", label: "1W", days: 7 },
  { key: "1m", label: "1M", days: 30 },
  { key: "3m", label: "3M", days: 90 },
  { key: "all", label: "All", days: null },
];

interface WeightTrendCardProps {
  /** Weight points in kg, ascending by date (YYYY-MM-DD). */
  data: { date: string; weight: number }[];
  targetWeight?: number;
  title?: string;
  /** Default selected range. */
  defaultRange?: Range;
  chartHeight?: number;
  className?: string;
}

/** Subtract `days` from today and return a YYYY-MM-DD cutoff string. */
function cutoffDate(days: number): string {
  const d = new Date(`${getTodayLocal()}T00:00:00`);
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Weight progression card with selectable time range (1W / 1M / 3M / All).
 * Shared by the client home and the coach's client detail view.
 */
export function WeightTrendCard({
  data,
  targetWeight,
  title = "Weight Progress",
  defaultRange = "1m",
  chartHeight = 200,
  className,
}: WeightTrendCardProps) {
  const [range, setRange] = useState<Range>(defaultRange);

  const sorted = useMemo(
    () => [...data].sort((a, b) => a.date.localeCompare(b.date)),
    [data]
  );

  const filtered = useMemo(() => {
    const cfg = RANGES.find((r) => r.key === range);
    if (!cfg?.days) return sorted;
    const cutoff = cutoffDate(cfg.days);
    const within = sorted.filter((d) => d.date >= cutoff);
    // Keep at least the last 2 points so a chart still renders for sparse logs.
    if (within.length < 2 && sorted.length >= 2) return sorted.slice(-2);
    return within;
  }, [sorted, range]);

  const current = filtered.length > 0 ? filtered[filtered.length - 1].weight : null;
  const delta = filtered.length >= 2 ? filtered[filtered.length - 1].weight - filtered[0].weight : null;

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-white mt-0.5">
            {current != null ? <WeightDisplay kg={current} /> : "—"}
          </p>
        </div>
        {delta != null && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold rounded-lg px-2 py-1",
              delta <= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
            )}
          >
            {delta <= 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
            {delta <= 0 ? "−" : "+"}
            <WeightDisplay kg={Math.abs(delta)} />
          </span>
        )}
      </div>

      {/* Range toggle */}
      <div className="mb-3 inline-flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={cn(
              "rounded-md px-3 py-1 text-[11px] font-semibold transition-colors",
              range === r.key ? "bg-gold text-black" : "text-zinc-400 hover:text-white"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {filtered.length >= 2 ? (
        <WeightChart data={filtered} targetWeight={targetWeight} height={chartHeight} />
      ) : (
        <div className="flex h-[120px] items-center justify-center text-xs text-zinc-600">
          Not enough weight logs in this range yet.
        </div>
      )}
    </Card>
  );
}
