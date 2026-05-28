"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type FoodItem, formatFoodAmount, getQuickAmounts } from "@/lib/food-utils";

// ---- Props ----

export interface QuantitySheetProps {
  food: FoodItem;
  onConfirm: (grams: number) => void;
  onClose: () => void;
}

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

// ---- Component ----

export function QuantitySheet({ food, onConfirm, onClose }: QuantitySheetProps) {
  const [grams, setGrams] = useState("");
  const quickOpts = getQuickAmounts(food);
  const g = Number(grams) || 0;
  const m = g / 100;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] p-5 pb-8 safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{food.emoji}</span>
            <div>
              <p className="font-semibold text-white">{food.name}</p>
              <p className="text-xs text-zinc-500">
                {food.per100g.calories} kcal · {food.per100g.protein}p · {food.per100g.carbs}c · {food.per100g.fat}f
                {food.unit ? ` per ${food.unit}` : " per 100g"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06]">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Quick amount buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickOpts.map((opt) => (
            <button
              key={opt.grams}
              onClick={() => setGrams(String(opt.grams))}
              className={cn(
                "rounded-xl py-2.5 text-sm font-medium transition-all border",
                Number(grams) === opt.grams
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/[0.06] text-zinc-400 hover:bg-white/[0.04]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="relative mb-4">
          <input
            type="number"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            placeholder="Custom amount"
            className={inputClass}
            autoFocus
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">g</span>
        </div>

        {/* Preview macros */}
        {g > 0 && (
          <div className="mb-1 text-center text-xs text-gold font-medium">{formatFoodAmount(food, g)}</div>
        )}
        {g > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="rounded-lg bg-white/[0.03] p-2 text-center">
              <p className="text-sm font-bold text-gold">{Math.round(food.per100g.calories * m)}</p>
              <p className="text-[10px] text-zinc-500">kcal</p>
            </div>
            <div className="rounded-lg bg-red-500/5 p-2 text-center">
              <p className="text-sm font-bold text-red-400">{Math.round(food.per100g.protein * m)}g</p>
              <p className="text-[10px] text-zinc-500">protein</p>
            </div>
            <div className="rounded-lg bg-amber-500/5 p-2 text-center">
              <p className="text-sm font-bold text-amber-400">{Math.round(food.per100g.carbs * m)}g</p>
              <p className="text-[10px] text-zinc-500">carbs</p>
            </div>
            <div className="rounded-lg bg-emerald-500/5 p-2 text-center">
              <p className="text-sm font-bold text-emerald-400">{Math.round(food.per100g.fat * m)}g</p>
              <p className="text-[10px] text-zinc-500">fat</p>
            </div>
          </div>
        )}

        <Button variant="gold" className="w-full h-12 text-base rounded-2xl" disabled={g <= 0} onClick={() => onConfirm(g)}>
          <Plus className="h-5 w-5" /> Add {food.name}
        </Button>
      </div>
    </div>
  );
}

export default QuantitySheet;
