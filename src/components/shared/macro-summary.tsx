"use client";

import { cn } from "@/lib/utils";

interface MacroSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  size?: "sm" | "md" | "lg";
}

/**
 * Shared macro summary component.
 * - sm: inline text (used in slot headers)
 * - md: grid with labels (used in page-level summaries)
 * - lg: larger grid (unused for now, reserved)
 */
export function MacroSummary({ calories, protein, carbs, fat, size = "md" }: MacroSummaryProps) {
  if (size === "sm") {
    return (
      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
        <span>{Math.round(calories)} cal</span>
        <span>{Math.round(protein)}p</span>
        <span>{Math.round(carbs)}c</span>
        <span>{Math.round(fat)}f</span>
      </div>
    );
  }

  // md and lg use the grid layout
  return (
    <div className={cn(
      "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 text-center",
      size === "lg" && "gap-4"
    )}>
      <div className="rounded-xl bg-white/[0.03] py-2.5 px-3">
        <p className={cn("font-bold text-white", size === "lg" ? "text-xl" : "text-lg")}>{Math.round(calories)}</p>
        <p className="text-[10px] text-zinc-500 uppercase mt-0.5">kcal</p>
      </div>
      <div className="rounded-xl bg-white/[0.03] py-2.5 px-3">
        <p className={cn("font-bold text-emerald-400", size === "lg" ? "text-xl" : "text-lg")}>{Math.round(protein)}g</p>
        <p className="text-[10px] text-zinc-500 uppercase mt-0.5">protein</p>
      </div>
      <div className="rounded-xl bg-white/[0.03] py-2.5 px-3">
        <p className={cn("font-bold text-sky-400", size === "lg" ? "text-xl" : "text-lg")}>{Math.round(carbs)}g</p>
        <p className="text-[10px] text-zinc-500 uppercase mt-0.5">carbs</p>
      </div>
      <div className="rounded-xl bg-white/[0.03] py-2.5 px-3">
        <p className={cn("font-bold text-amber-400", size === "lg" ? "text-xl" : "text-lg")}>{Math.round(fat)}g</p>
        <p className="text-[10px] text-zinc-500 uppercase mt-0.5">fat</p>
      </div>
    </div>
  );
}
