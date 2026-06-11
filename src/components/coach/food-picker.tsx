"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mapDbFoodToFoodItem, type FoodItem } from "@/lib/food-utils";
import { getFoods } from "@/lib/db";

// ---- Props ----

export interface FoodPickerProps {
  foods?: FoodItem[];
  onAdd: (food: FoodItem, grams: number) => void;
  onClose: () => void;
}

// ---- Constants ----

const categoryMeta: Record<string, { label: string; emoji: string; color: string }> = {
  protein:      { label: "Protein",  emoji: "🥩", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  carbs:        { label: "Carbs",    emoji: "🍚", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  fats:         { label: "Fats",     emoji: "🥜", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  fiber:        { label: "Fiber",    emoji: "🥦", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  complete_meal:{ label: "Complete", emoji: "🍱", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  supplements:  { label: "Supps",   emoji: "💊", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
};

// ---- Multi-select state ----
interface Selection {
  food: FoodItem;
  grams: number; // editable gram amount
}

// ---- Component ----

export function FoodPicker({ foods: externalFoods, onAdd, onClose }: FoodPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("protein");
  const [search, setSearch] = useState("");
  const [dbFoods, setDbFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(!externalFoods);
  // Map of foodId → Selection
  const [selections, setSelections] = useState<Map<string, Selection>>(new Map());

  useEffect(() => {
    if (externalFoods) return;
    getFoods().then((data) => {
      setDbFoods(data.map(mapDbFoodToFoodItem));
      setLoading(false);
    });
  }, [externalFoods]);

  const allFoods = useMemo(() => {
    if (externalFoods) return externalFoods;
    return dbFoods;
  }, [externalFoods, dbFoods]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const f of allFoods) cats.add(f.category);
    const order = ["protein", "carbs", "fats", "fiber", "complete_meal", "supplements"];
    return Array.from(cats).sort((a, b) => {
      const ai = order.indexOf(a), bi = order.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [allFoods]);

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(activeCategory)) {
      setActiveCategory(availableCategories[0]);
    }
  }, [availableCategories]);

  const filtered = useMemo(() => {
    let list = allFoods.filter((f) => f.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    return list;
  }, [allFoods, activeCategory, search]);

  function toggleFood(food: FoodItem) {
    setSelections((prev) => {
      const next = new Map(prev);
      if (next.has(food.id)) {
        next.delete(food.id);
      } else {
        // Default grams = gramsPerUnit if set, else 100
        const defaultGrams = food.gramsPerUnit ?? 100;
        next.set(food.id, { food, grams: defaultGrams });
      }
      return next;
    });
  }

  function updateGrams(foodId: string, grams: number) {
    setSelections((prev) => {
      const next = new Map(prev);
      const sel = next.get(foodId);
      if (sel) next.set(foodId, { ...sel, grams: Math.max(1, grams) });
      return next;
    });
  }

  function handleConfirm() {
    for (const { food, grams } of selections.values()) {
      onAdd(food, grams);
    }
    onClose();
  }

  const selectedCount = selections.size;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-2xl border border-white/[0.08] bg-[#1a1a1a] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold text-white">Add Foods</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {selectedCount > 0 ? `${selectedCount} selected` : `${filtered.length} available`}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Category tabs */}
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
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-8">No foods found</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((food) => {
                const isSelected = selections.has(food.id);
                const sel = selections.get(food.id);
                return (
                  <div
                    key={food.id}
                    className={cn(
                      "rounded-xl border transition-colors",
                      isSelected ? "border-gold/30 bg-gold/5" : "border-white/[0.06]"
                    )}
                  >
                    {/* Food row — tap to select */}
                    <button
                      onClick={() => toggleFood(food)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                    >
                      {/* Checkbox */}
                      <div className={cn(
                        "h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                        isSelected ? "border-gold bg-gold" : "border-white/[0.2]"
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-black" />}
                      </div>
                      <span className="text-lg">{food.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{food.name}</p>
                        <p className="text-[11px] text-zinc-500">
                          {food.per100g.calories} kcal · {food.per100g.protein}p · {food.per100g.carbs}c · {food.per100g.fat}f · {food.per100g.fiber}fib
                          {food.unit && food.gramsPerUnit ? ` per ${food.unit}` : " per 100g"}
                        </p>
                      </div>
                    </button>

                    {/* Gram input — only shown when selected */}
                    {isSelected && sel && (
                      <div className="flex items-center gap-2 px-3 pb-2.5">
                        <span className="text-[11px] text-zinc-500">Amount:</span>
                        <input
                          type="number"
                          value={sel.grams}
                          onChange={(e) => updateGrams(food.id, parseFloat(e.target.value) || 1)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-20 h-7 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-gold/50"
                        />
                        <span className="text-[11px] text-zinc-500">g</span>
                        {food.unit && food.gramsPerUnit && (
                          <span className="text-[10px] text-zinc-600">
                            = {(sel.grams / food.gramsPerUnit).toFixed(1)} {food.unit}
                          </span>
                        )}
                        {/* Macro preview */}
                        <span className="text-[10px] text-gold ml-auto">
                          {Math.round(food.per100g.calories * sel.grams / (food.gramsPerUnit ?? 100))} cal
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm footer */}
        <div className="p-3 border-t border-white/[0.06]">
          <Button
            variant="gold"
            className="w-full h-11 rounded-xl"
            disabled={selectedCount === 0}
            onClick={handleConfirm}
          >
            <Plus className="h-4 w-4" />
            Add {selectedCount > 0 ? `${selectedCount} food${selectedCount > 1 ? "s" : ""}` : "Foods"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FoodPicker;
