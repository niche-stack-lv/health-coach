"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { foodDatabase as staticFoodDatabase, type FoodItem } from "@/lib/food-database";
import { getFoods } from "@/lib/db";
import { QuantitySheet } from "@/components/coach/quantity-sheet";

// ---- Props ----

export interface FoodPickerProps {
  foods?: FoodItem[];          // Optional pre-loaded foods (skips DB fetch if provided)
  onAdd: (food: FoodItem, grams: number) => void;
  onClose: () => void;
}

// ---- Constants ----

const categories = [
  { key: "protein" as const, label: "Protein", emoji: "🥩", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { key: "carbs" as const, label: "Carbs", emoji: "🍚", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { key: "fats" as const, label: "Fats", emoji: "🥜", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { key: "supplements" as const, label: "Supps", emoji: "💊", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
];

// ---- Main Component ----

export function FoodPicker({ foods: externalFoods, onAdd, onClose }: FoodPickerProps) {
  const [activeCategory, setActiveCategory] = useState<"protein" | "carbs" | "fats" | "supplements">("protein");
  const [search, setSearch] = useState("");
  const [sheetFood, setSheetFood] = useState<FoodItem | null>(null);
  const [dbFoods, setDbFoods] = useState<FoodItem[]>([]);

  // Load foods from DB if not provided externally
  useEffect(() => {
    if (externalFoods) return;
    getFoods().then((data) => {
      const mapped: FoodItem[] = data.map((f: any) => ({
        id: f.id,
        name: f.name,
        category: f.category,
        emoji: f.emoji || "🍽️",
        unit: f.unit || undefined,
        gramsPerUnit: f.gramsPerUnit || undefined,
        per100g: { calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat },
      }));
      setDbFoods(mapped);
    });
  }, [externalFoods]);

  // Merge static + DB foods (DB foods take priority by name)
  const allFoods = useMemo(() => {
    if (externalFoods) return externalFoods;
    const dbNames = new Set(dbFoods.map((f) => f.name.toLowerCase()));
    const staticFiltered = staticFoodDatabase.filter((f) => !dbNames.has(f.name.toLowerCase()));
    return [...dbFoods, ...staticFiltered];
  }, [externalFoods, dbFoods]);

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

        {/* Category tabs */}
        <div className="flex gap-2 p-3 border-b border-white/[0.06]">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold border transition-all",
                activeCategory === cat.key ? cat.color : "border-white/[0.06] text-zinc-500 hover:bg-white/[0.04]"
              )}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
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
