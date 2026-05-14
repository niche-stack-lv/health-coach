"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dish, ComponentCategory } from "@/types";

// ---- Props ----

interface DishPickerModalProps {
  dishes: Dish[];
  componentCategory: ComponentCategory;
  existingDishIds: string[];
  onSelect: (dishId: string) => void;
  onClose: () => void;
}

// ---- Constants ----

const categoryLabels: Record<ComponentCategory, string> = {
  carbohydrate: "Carb",
  protein: "Protein",
  fiber: "Fiber",
  complete_meal: "Complete",
};

const categoryColors: Record<ComponentCategory, string> = {
  carbohydrate: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  protein: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  fiber: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  complete_meal: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

// ---- Component ----

export function DishPickerModal({
  dishes,
  componentCategory,
  existingDishIds,
  onSelect,
  onClose,
}: DishPickerModalProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    // Show only dishes matching the exact component category
    let list = dishes.filter(
      (d) =>
        d.componentCategory === componentCategory &&
        !existingDishIds.includes(d.id)
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }
    return list;
  }, [dishes, componentCategory, existingDishIds, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[80vh] rounded-t-2xl sm:rounded-2xl border border-white/[0.08] bg-[#1a1a1a] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold text-white">Add Dish</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Showing {categoryLabels[componentCategory]} dishes
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-white/[0.06]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-8">
              No matching dishes found. Create dishes in the Dishes library first.
            </p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((dish) => (
                <button
                  key={dish.id}
                  onClick={() => onSelect(dish.id)}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-lg">{dish.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{dish.name}</p>
                    <p className="text-[11px] text-zinc-500">
                      {dish.totalCalories} cal · {dish.totalProtein}p · {dish.totalCarbs}c · {dish.totalFat}f
                    </p>
                  </div>
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase", categoryColors[dish.componentCategory])}>
                    {categoryLabels[dish.componentCategory]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DishPickerModal;
