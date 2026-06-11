"use client";

import { useState, useMemo } from "react";
import { Search, X, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dish, ComponentCategory, DishTag } from "@/types";

// ---- Props ----

interface DishPickerModalProps {
  dishes: Dish[];
  componentCategory?: ComponentCategory;
  existingDishIds: string[];
  /** Called with each selected dishId + size multiplier when the user confirms */
  onSelect: (dishId: string, multiplier: 1 | 1.5 | 2) => void;
  onClose: () => void;
}

// ---- Constants ----

const categories: { key: ComponentCategory | "all"; label: string; emoji: string; color: string }[] = [
  { key: "all",          label: "All",      emoji: "📋", color: "border-gold/50 bg-gold/10 text-gold" },
  { key: "protein",      label: "Protein",  emoji: "🍗", color: "border-sky-500/40 bg-sky-500/10 text-sky-400" },
  { key: "carbs",        label: "Carbs",    emoji: "🍚", color: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  { key: "fats",         label: "Fats",     emoji: "🥜", color: "border-orange-500/40 bg-orange-500/10 text-orange-400" },
  { key: "fiber",        label: "Fiber",    emoji: "🥦", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
  { key: "complete_meal",label: "Complete", emoji: "🍱", color: "border-purple-500/40 bg-purple-500/10 text-purple-400" },
  { key: "supplements",  label: "Supps",    emoji: "💊", color: "border-pink-500/40 bg-pink-500/10 text-pink-400" },
];

const categoryBadgeColors: Record<ComponentCategory, string> = {
  protein:      "bg-sky-500/10 text-sky-400 border-sky-500/30",
  carbs:        "bg-amber-500/10 text-amber-400 border-amber-500/30",
  fats:         "bg-orange-500/10 text-orange-400 border-orange-500/30",
  fiber:        "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  complete_meal:"bg-purple-500/10 text-purple-400 border-purple-500/30",
  supplements:  "bg-pink-500/10 text-pink-400 border-pink-500/30",
};

const categoryLabels: Record<ComponentCategory, string> = {
  protein: "Protein", carbs: "Carbs", fats: "Fats",
  fiber: "Fiber", complete_meal: "Complete", supplements: "Supps",
};

type Multiplier = 1 | 1.5 | 2;

interface Selection {
  dishId: string;
  multiplier: Multiplier;
}

// ---- Component ----

export function DishPickerModal({
  dishes,
  componentCategory,
  existingDishIds,
  onSelect,
  onClose,
}: DishPickerModalProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | "all">("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  // Multi-select: map of dishId → multiplier
  const [selections, setSelections] = useState<Map<string, Multiplier>>(new Map());

  const allTags = useMemo(() => {
    const tagMap = new Map<string, DishTag>();
    for (const dish of dishes) {
      if (dish.tags) for (const tag of dish.tags) tagMap.set(tag.id, tag);
    }
    return Array.from(tagMap.values());
  }, [dishes]);

  const filtered = useMemo(() => {
    let list = dishes.filter((d) => !existingDishIds.includes(d.id));
    if (activeCategory !== "all") list = list.filter((d) => d.componentCategory === activeCategory);
    if (tagFilter) list = list.filter((d) => d.tags?.some((t) => t.id === tagFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }
    return list;
  }, [dishes, existingDishIds, search, activeCategory, tagFilter]);

  function toggleDish(dishId: string) {
    setSelections((prev) => {
      const next = new Map(prev);
      if (next.has(dishId)) next.delete(dishId);
      else next.set(dishId, 1);
      return next;
    });
  }

  function setMultiplier(dishId: string, m: Multiplier) {
    setSelections((prev) => {
      const next = new Map(prev);
      next.set(dishId, m);
      return next;
    });
  }

  function handleConfirm() {
    for (const [dishId, multiplier] of selections.entries()) {
      onSelect(dishId, multiplier);
    }
    onClose();
  }

  const selectedCount = selections.size;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] min-w-[min(28rem,100vw-2rem)] rounded-t-3xl sm:rounded-2xl border border-white/[0.08] bg-[#1a1a1a] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold text-white">Add Dishes</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {selectedCount > 0 ? `${selectedCount} selected` : `${filtered.length} available`}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="grid grid-cols-7 gap-1.5 p-3 border-b border-white/[0.06]">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[10px] font-semibold border transition-all",
                activeCategory === cat.key ? cat.color : "border-white/[0.06] text-zinc-500 hover:bg-white/[0.04]"
              )}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 px-3 py-2.5 border-b border-white/[0.06]">
            {[{ id: "__all__", name: "All" }, ...allTags].map((tag) => {
              const isActive = tag.id === "__all__" ? !tagFilter : tagFilter === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setTagFilter(tag.id === "__all__" ? null : (tagFilter === tag.id ? null : tag.id))}
                  className={cn("rounded-xl py-2.5 text-[11px] font-medium border text-center",
                    isActive ? "border-gold/50 bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
                  )}
                >{tag.name}</button>
              );
            })}
          </div>
        )}

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

        {/* Dish list */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-8">No matching dishes found.</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((dish) => {
                const isSelected = selections.has(dish.id);
                const multiplier = selections.get(dish.id) ?? 1;
                return (
                  <div
                    key={dish.id}
                    className={cn(
                      "rounded-xl border transition-colors",
                      isSelected ? "border-gold/30 bg-gold/5" : "border-white/[0.06]"
                    )}
                  >
                    {/* Dish row */}
                    <button
                      onClick={() => toggleDish(dish.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                    >
                      {/* Checkbox */}
                      <div className={cn(
                        "h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                        isSelected ? "border-gold bg-gold" : "border-white/[0.2]"
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-black" />}
                      </div>
                      {dish.imageUrl ? (
                        <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-white/[0.08]">
                          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-lg">{dish.emoji}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{dish.name}</p>
                        <p className="text-[11px] text-zinc-500">
                          {dish.totalCalories} cal · {dish.totalProtein}p · {dish.totalCarbs}c · {dish.totalFat}f · {dish.totalFiber}fib
                        </p>
                      </div>
                      <span className={cn("rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase shrink-0", categoryBadgeColors[dish.componentCategory])}>
                        {categoryLabels[dish.componentCategory]}
                      </span>
                    </button>

                    {/* Size picker — only shown when dish is selected */}
                    {isSelected && (
                      <div className="flex items-center gap-2 px-3 pb-2.5">
                        <span className="text-[11px] text-zinc-500 mr-1">Size:</span>
                        {([1, 1.5, 2] as Multiplier[]).map((m) => {
                          const calLabel = m === 1
                            ? `${dish.totalCalories} cal`
                            : m === 1.5
                            ? `${Math.round(dish.totalCalories * 1.5)} cal`
                            : `${dish.totalCalories * 2} cal`;
                          return (
                            <button
                              key={m}
                              onClick={() => setMultiplier(dish.id, m)}
                              className={cn(
                                "flex-1 rounded-lg py-1.5 text-xs font-medium border transition-all",
                                multiplier === m
                                  ? "border-gold bg-gold/10 text-gold"
                                  : "border-white/[0.06] text-zinc-500 hover:bg-white/[0.04]"
                              )}
                            >
                              <span className="block font-semibold">{m}×</span>
                              <span className="block text-[10px] opacity-70">{calLabel}</span>
                            </button>
                          );
                        })}
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
            Add {selectedCount > 0 ? `${selectedCount} dish${selectedCount > 1 ? "es" : ""}` : "Dishes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DishPickerModal;
