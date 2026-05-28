"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { mapDbFoodToFoodItem, type FoodItem } from "@/lib/food-utils";
import { getFoods } from "@/lib/db";
import { QuantitySheet } from "@/components/coach/quantity-sheet";

// ---- Props ----

export interface FoodPickerProps {
  foods?: FoodItem[];          // Optional pre-loaded foods (skips DB fetch if provided)
  onAdd: (food: FoodItem, grams: number) => void;
  onClose: () => void;
}

// ---- Constants ----

const categoryMeta: Record<string, { label: string; emoji: string; color: string }> = {
  protein: { label: "Protein", emoji: "🥩", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  carbs: { label: "Carbs", emoji: "🍚", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  fats: { label: "Fats", emoji: "🥜", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  fiber: { label: "Fiber", emoji: "🥦", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  complete_meal: { label: "Complete", emoji: "🍱", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  supplements: { label: "Supps", emoji: "💊", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
};

// ---- Main Component ----

export function FoodPicker({ foods: externalFoods, onAdd, onClose }: FoodPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("protein");
  const [search, setSearch] = useState("");
  const [sheetFood, setSheetFood] = useState<FoodItem | null>(null);
  const [dbFoods, setDbFoods] = useState<FoodItem[]>([]);

  // Load foods from DB if not provided externally
  useEffect(() => {
    if (externalFoods) return;
    getFoods().then((data) => {
      setDbFoods(data.map(mapDbFoodToFoodItem));
    });
  }, [externalFoods]);

  // Use DB foods directly (no static fallback)
  const allFoods = useMemo(() => {
    if (externalFoods) return externalFoods;
    return dbFoods;
  }, [externalFoods, dbFoods]);

  // Derive unique categories from actual food data
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const f of allFoods) {
      cats.add(f.category);
    }
    // Sort in a sensible order: known categories first, then any new ones
    const order = ["protein", "carbs", "fats", "fiber", "complete_meal", "supplements"];
    return Array.from(cats).sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [allFoods]);

  // Set initial active category to first available
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(activeCategory)) {
      setActiveCategory(availableCategories[0]);
    }
  }, [availableCategories]);

  // Filter by category + search
  const filtered = useMemo(() => {
    let list = allFoods.filter((f) => f.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    return list;
  }, [allFoods, activeCategory, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-2xl border border-white/[0.08] bg-[#1a1a1a] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Add Food Item</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Category tabs — derived from data */}
        <div className="flex gap-2 p-3 border-b border-white/[0.06] overflow-x-auto">
          {availableCategories.map((catKey) => {
            const meta = categoryMeta[catKey] || { label: catKey, emoji: "📦", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" };
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-semibold border transition-all whitespace-nowrap shrink-0",
                  activeCategory === catKey ? meta.color : "border-white/[0.06] text-zinc-500 hover:bg-white/[0.04]"
                )}
              >
                <span>{meta.emoji}</span> {meta.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="p-3 border-b border-white/[0.06]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search foods..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
        </div>

        {/* Food list */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-8">No foods found</p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSheetFood(food)}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-lg">{food.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{food.name}</p>
                    <p className="text-[11px] text-zinc-500">
                      {food.per100g.calories} kcal · {food.per100g.protein}p · {food.per100g.carbs}c · {food.per100g.fat}f
                      {food.unit ? ` · ${food.unit} (${food.gramsPerUnit}g)` : " /100g"}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-zinc-500 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quantity bottom sheet */}
      {sheetFood && (
        <QuantitySheet
          food={sheetFood}
          onConfirm={(grams) => { onAdd(sheetFood, grams); setSheetFood(null); }}
          onClose={() => setSheetFood(null)}
        />
      )}
    </div>
  );
}

export default FoodPicker;
