"use client";

import { cn } from "@/lib/utils";

interface MacroSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  /** Optional daily targets — when present, renders progress bars + over/under indicators. */
  targets?: {
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    fiber?: number | null;
  };
  size?: "sm" | "md" | "lg";
}

// Helper: format a macro value — calories as integer, others to 1 decimal
function fmt(val: number, isCalories = false): string {
  return isCalories ? Math.round(val).toString() : (Math.round(val * 10) / 10).toString();
}

/**
 * Pick a status colour for a value vs its target.
 * For calories/carbs/fat/fiber: under = grey, near = green, over = amber/red.
 * For protein (`isProtein=true`): the rule flips — under is the warning.
 */
function getStatusColour(value: number, target: number, isProtein = false): string {
  if (target <= 0) return "text-white";
  const ratio = value / target;
  if (isProtein) {
    if (ratio >= 0.95) return "text-emerald-400";
    if (ratio >= 0.7) return "text-amber-400";
    return "text-zinc-400";
  }
  if (ratio < 0.85) return "text-zinc-300";
  if (ratio <= 1.05) return "text-emerald-400";
  if (ratio <= 1.15) return "text-amber-400";
  return "text-red-400";
}

function getBarFillColour(value: number, target: number, isProtein = false): string {
  if (target <= 0) return "bg-zinc-700";
  const ratio = value / target;
  if (isProtein) {
    if (ratio >= 0.95) return "bg-emerald-500";
    if (ratio >= 0.7) return "bg-amber-500";
    return "bg-zinc-600";
  }
  if (ratio < 0.85) return "bg-zinc-600";
  if (ratio <= 1.05) return "bg-emerald-500";
  if (ratio <= 1.15) return "bg-amber-500";
  return "bg-red-500";
}

interface MacroTileProps {
  label: string;
  value: number;
  target?: number | null;
  unit?: string;
  isCalories?: boolean;
  isProtein?: boolean;
  accent?: string;
}

function MacroTile({ label, value, target, unit = "g", isCalories, isProtein, accent }: MacroTileProps) {
  const hasTarget = typeof target === "number" && target > 0;
  const statusClass = hasTarget ? getStatusColour(value, target!, isProtein) : (accent ?? "text-white");
  const barClass = hasTarget ? getBarFillColour(value, target!, isProtein) : "bg-zinc-700";
  const ratio = hasTarget ? Math.min(value / target!, 1) : 0;
  return (
    <div className="rounded-xl bg-white/[0.03] py-2.5 px-3">
      <div className="flex items-baseline justify-center gap-1">
        <p className={cn("font-bold text-lg", statusClass)}>{fmt(value, isCalories)}</p>
        {hasTarget && (
          <span className="text-[11px] text-zinc-500">/ {fmt(target!, isCalories)}</span>
        )}
      </div>
      <p className="text-[10px] text-zinc-500 uppercase mt-0.5 text-center">{label}{!isCalories && hasTarget ? ` ${unit}` : ""}</p>
      {hasTarget && (
        <div className="mt-1.5 h-1 rounded-full bg-white/[0.04] overflow-hidden">
          <div className={cn("h-full transition-all", barClass)} style={{ width: `${Math.round(ratio * 100)}%` }} />
        </div>
      )}
    </div>
  );
}

/**
 * Shared macro summary component.
 * - sm: inline text (used in slot headers)
 * - md: grid with labels (used in page-level summaries)
 * - lg: larger grid (unused for now, reserved)
 *
 * If `targets` is provided, each tile shows the value vs target with a small bar.
 */
export function MacroSummary({ calories, protein, carbs, fat, fiber, targets, size = "md" }: MacroSummaryProps) {
  if (size === "sm") {
    return (
      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
        <span>{fmt(calories, true)} cal</span>
        <span>{fmt(protein)}p</span>
        <span>{fmt(carbs)}c</span>
        <span>{fmt(fat)}f</span>
        {fiber !== undefined && <span>{fmt(fiber)} fib</span>}
      </div>
    );
  }

  const overshootCalories = targets?.calories != null && targets.calories > 0 && calories > targets.calories;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2">
        <MacroTile label="kcal" value={calories} target={targets?.calories} isCalories accent="text-white" />
        <MacroTile label="protein" value={protein} target={targets?.protein} isProtein accent="text-emerald-400" />
        <MacroTile label="carbs" value={carbs} target={targets?.carbs} accent="text-sky-400" />
        <MacroTile label="fat" value={fat} target={targets?.fat} accent="text-amber-400" />
      </div>
      {fiber !== undefined && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2">
          <MacroTile label="fiber" value={fiber} target={targets?.fiber} accent="text-lime-400" />
        </div>
      )}
      {overshootCalories && (
        <p className="text-[11px] text-red-400 text-center">
          Over by {Math.round(calories - (targets!.calories!))} cal
        </p>
      )}
    </div>
  );
}
