"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getDishes } from "@/lib/db";
import { filterDishes } from "@/lib/template-validation";
import { cn } from "@/lib/utils";
import type { Dish, ComponentCategory } from "@/types";

export default function DishesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <DishesPageInner />
    </Suspense>
  );
}

const demoDishes: Dish[] = [
  { id: "demo-1", coachId: "demo", name: "Overnight Oats", emoji: "🥣", componentCategory: "carbohydrate", totalCalories: 380, totalProtein: 35, totalCarbs: 45, totalFat: 8, items: [], createdAt: "" },
  { id: "demo-2", coachId: "demo", name: "Palak Paneer", emoji: "🧀", componentCategory: "protein", totalCalories: 265, totalProtein: 18, totalCarbs: 5, totalFat: 21, items: [], createdAt: "" },
  { id: "demo-3", coachId: "demo", name: "Steamed Broccoli", emoji: "🥦", componentCategory: "fiber", totalCalories: 55, totalProtein: 4, totalCarbs: 11, totalFat: 0, items: [], createdAt: "" },
  { id: "demo-4", coachId: "demo", name: "Chicken Biryani", emoji: "🍚", componentCategory: "complete_meal", totalCalories: 450, totalProtein: 28, totalCarbs: 55, totalFat: 12, items: [], createdAt: "" },
];

const categories: { value: ComponentCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "carbohydrate", label: "Carbs" },
  { value: "protein", label: "Protein" },
  { value: "fiber", label: "Fiber" },
  { value: "complete_meal", label: "Complete" },
];

const categoryColors: Record<ComponentCategory, string> = {
  carbohydrate: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  protein: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20",
  fiber: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  complete_meal: "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20",
};

function DishesPageInner() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ComponentCategory | "all">("all");

  // 300ms debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isDemo) {
      setDishes(demoDishes);
      setLoading(false);
      return;
    }
    if (user) loadDishes();
  }, [user, isDemo]);

  async function loadDishes() {
    if (!user) return;
    const data = await getDishes(user.id);
    setDishes(data);
    setLoading(false);
  }

  const filteredDishes = filterDishes(
    dishes,
    debouncedQuery || null,
    categoryFilter === "all" ? null : categoryFilter
  );

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Dishes</h1>
          <p className="text-zinc-500 mt-1 text-sm">{dishes.length} dishes in your library</p>
        </div>
        <Link href={`/coach/dishes/create${demoSuffix}`}>
          <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Create Dish</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold border whitespace-nowrap",
              categoryFilter === cat.value
                ? "border-gold bg-gold/10 text-gold"
                : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dishes grid */}
      {filteredDishes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-zinc-500 text-sm">
            {dishes.length === 0
              ? "No dishes yet. Create your first dish to get started."
              : "No dishes match your search."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDishes.map((dish) => (
            <Link key={dish.id} href={`/coach/dishes/${dish.id}${demoSuffix}`}>
              <Card hover className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{dish.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{dish.name}</p>
                    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide mt-1", categoryColors[dish.componentCategory])}>
                      {dish.componentCategory.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <MacroBadge label="Cal" value={dish.totalCalories} />
                  <MacroBadge label="P" value={dish.totalProtein} />
                  <MacroBadge label="C" value={dish.totalCarbs} />
                  <MacroBadge label="F" value={dish.totalFat} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MacroBadge({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-400">
      <span className="font-medium text-zinc-300">{value}</span>
      <span>{label}</span>
    </span>
  );
}
