"use client";

import { cn } from "@/lib/utils";

interface MacroSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  size?: "sm" | "md" | "lg";
}

// Helper: format a macro value — calories as integer, others to 1 decimal
function fmt(val: number, isCalories = false): string {
  return isCalories ? Math.round(val).toString() : (Math.round(val * 10) / 10).toString();
}

/**
 * Shared macro summary component.
 * - sm: inline text (used in slot headers)
 * - md: grid with labels (used in page-level summaries)
 * - lg: larger grid (unused for now, reserved)
 */
export function MacroSummary({ calories, protein, carbs, fat, fiber, size = "md" }: MacroSummaryProps) {
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

  // md and lg use the grid layout
  return (
    <div className="space-y-2">
      <div className={cn(
        "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 text-center",
        size === "lg" && "gap-4"
      )}>
        <div className="rounded-xl bg-white/[0.03] py-2.5 px-3">
          <p className={cn("font-bold text-white", size === "lg" ? "text-xl" : "text-lg")}>{fmt(calories, true)}</p>
          <p className="text-[10px] text-zinc-500 uppercase mt-0.5">kcal</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] py-2.5 px-3">
          <p className={cn("font-bold text-emerald-400", size === "lg" ? "text-xl" : "text-lg")}>{fmt(protein)}g</p>
          <p className="text-[10px] text-zinc-500 uppercase mt-0.5">protein</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] py-2.5 px-3">
          <p className={cn("font-bold text-sky-400", size === "lg" ? "text-xl" : "text-lg")}>{fmt(carbs)}g</p>
          <p className="text-[10px] text-zinc-500 uppercase mt-0.5">carbs</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] py-2.5 px-3">
          <p className={cn("font-bold text-amber-400", size === "lg" ? "text-xl" : "text-lg")}>{fmt(fat)}g</p>
          <p className="text-[10px] text-zinc-500 uppercase mt-0.5">fat</p>
        </div>
      </div>
      {fiber !== undefined && (
        <div className="rounded-xl bg-white/[0.03] py-2 px-3 flex items-center justify-center gap-2">
          <p className={cn("font-bold text-lime-400", size === "lg" ? "text-lg" : "text-base")}>{fmt(fiber)}g</p>
          <p className="text-[10px] text-zinc-500 uppercase">fiber</p>
        </div>
      )}
    </div>
  );
}
