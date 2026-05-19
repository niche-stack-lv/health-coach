"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dish } from "@/types";

interface DishDetailSheetProps {
  dish: Dish;
  onClose: () => void;
}

/**
 * Bottom sheet showing full dish details.
 * Used on client side when tapping a dish in diet plan or food check-in.
 */
export function DishDetailSheet({ dish, onClose }: DishDetailSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-zinc-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        {/* Image */}
        {dish.imageUrl && (
          <div className="w-full aspect-video overflow-hidden rounded-t-3xl">
            <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{dish.emoji}</span>
              <h2 className="text-lg font-bold text-white">{dish.name}</h2>
            </div>
            {dish.mealSize && (
              <span className="inline-flex mt-1.5 rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400 capitalize">{dish.mealSize} meal</span>
            )}
          </div>

          {/* Description */}
          {dish.description && (
            <p className="text-sm text-zinc-400 leading-relaxed">{dish.description}</p>
          )}

          {/* Macros */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-xl bg-white/[0.04] p-3 text-center">
              <p className="text-base font-bold text-white">{dish.totalCalories}</p>
              <p className="text-[9px] text-zinc-500 uppercase mt-0.5">kcal</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3 text-center">
              <p className="text-base font-bold text-emerald-400">{dish.totalProtein}g</p>
              <p className="text-[9px] text-zinc-500 uppercase mt-0.5">protein</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3 text-center">
              <p className="text-base font-bold text-sky-400">{dish.totalCarbs}g</p>
              <p className="text-[9px] text-zinc-500 uppercase mt-0.5">carbs</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3 text-center">
              <p className="text-base font-bold text-amber-400">{dish.totalFat}g</p>
              <p className="text-[9px] text-zinc-500 uppercase mt-0.5">fat</p>
            </div>
          </div>

          {/* Ingredients */}
          {dish.items && dish.items.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mb-2">Ingredients</p>
              <div className="space-y-1.5">
                {dish.items.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.customEmoji || "🍽️"}</span>
                      <span className="text-sm text-white">{item.customName || "Ingredient"}</span>
                    </div>
                    <span className="text-xs text-zinc-500">{item.grams}g</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {dish.tags && dish.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dish.tags.map((tag) => (
                <span key={tag.id} className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-500">{tag.name}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
