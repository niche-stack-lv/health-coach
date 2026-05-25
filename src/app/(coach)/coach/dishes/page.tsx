"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Pencil, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getDishes, getDishTags, getFoods, createFood, updateFood, deleteFood } from "@/lib/db";
import { filterDishes } from "@/lib/template-validation";
import { cn } from "@/lib/utils";
import type { Dish, Food, ComponentCategory } from "@/types";

export default function DishesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <DishesPageInner />
    </Suspense>
  );
}

type PageTab = "dishes" | "foods";

const demoDishes: Dish[] = [
  { id: "demo-1", coachId: "demo", name: "Overnight Oats", emoji: "🥣", componentCategory: "carbohydrate", totalCalories: 380, totalProtein: 35, totalCarbs: 45, totalFat: 8, items: [], createdAt: "" },
  { id: "demo-2", coachId: "demo", name: "Palak Paneer", emoji: "🧀", componentCategory: "protein", totalCalories: 265, totalProtein: 18, totalCarbs: 5, totalFat: 21, items: [], createdAt: "" },
  { id: "demo-3", coachId: "demo", name: "Steamed Broccoli", emoji: "🥦", componentCategory: "fiber", totalCalories: 55, totalProtein: 4, totalCarbs: 11, totalFat: 0, items: [], createdAt: "" },
  { id: "demo-4", coachId: "demo", name: "Chicken Biryani", emoji: "🍚", componentCategory: "complete_meal", totalCalories: 450, totalProtein: 28, totalCarbs: 55, totalFat: 12, items: [], createdAt: "" },
];

const dishCategories: { value: ComponentCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "carbohydrate", label: "Carbs" },
  { value: "protein", label: "Protein" },
  { value: "fiber", label: "Fiber" },
  { value: "complete_meal", label: "Complete" },
];

const foodCategories = ["all", "protein", "carbs", "fats", "fiber", "supplements"] as const;

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
  const [activeTab, setActiveTab] = useState<PageTab>("dishes");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ComponentCategory | "all">("all");
  const [foodCategoryFilter, setFoodCategoryFilter] = useState<string>("all");

  // 300ms debounce for search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isDemo) {
      setDishes(demoDishes);
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const [dishData, tags, foodData] = await Promise.all([
      getDishes(user.id),
      getDishTags(user.id),
      getFoods(),
    ]);
    setDishes(dishData);
    setAllTags(tags);
    setFoods(foodData);
    setLoading(false);
  }

  // Filtered dishes
  let filteredDishes = filterDishes(
    dishes,
    debouncedQuery || null,
    categoryFilter === "all" ? null : categoryFilter
  );
  if (selectedTagFilter) {
    filteredDishes = filteredDishes.filter((d) => d.tags?.some((t) => t.id === selectedTagFilter));
  }

  // Filtered foods
  const filteredFoods = foods.filter((f) => {
    const matchesCategory = foodCategoryFilter === "all" || f.category === foodCategoryFilter;
    const matchesSearch = !debouncedQuery || f.name.toLowerCase().includes(debouncedQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  async function handleDeleteFood(id: string) {
    if (!confirm("Delete this food item?")) return;
    await deleteFood(id);
    setFoods((prev) => prev.filter((f) => f.id !== id));
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Foods & Dishes</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {activeTab === "dishes"
              ? `${dishes.length} dishes in your library`
              : `${foods.length} food items in your inventory`}
          </p>
        </div>
        {activeTab === "dishes" && (
          <Link href={`/coach/dishes/create${demoSuffix}`}>
            <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Create Dish</Button>
          </Link>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        {(["dishes", "foods"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearchQuery(""); setDebouncedQuery(""); }}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-all",
              activeTab === tab
                ? "bg-gold/10 text-gold border border-gold/30"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder={activeTab === "dishes" ? "Search dishes..." : "Search foods..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
      </div>

      {activeTab === "dishes" ? (
        <DishesTab
          dishes={filteredDishes}
          allDishes={dishes}
          allTags={allTags}
          selectedTagFilter={selectedTagFilter}
          setSelectedTagFilter={setSelectedTagFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          demoSuffix={demoSuffix}
        />
      ) : (
        <FoodsTab
          foods={filteredFoods}
          allFoods={foods}
          foodCategoryFilter={foodCategoryFilter}
          setFoodCategoryFilter={setFoodCategoryFilter}
          onDelete={handleDeleteFood}
          onFoodAdded={loadData}
          onFoodUpdated={loadData}
        />
      )}
    </div>
  );
}

// ─── DISHES TAB ─────────────────────────────────────────────────
function DishesTab({
  dishes, allDishes, allTags, selectedTagFilter, setSelectedTagFilter,
  categoryFilter, setCategoryFilter, demoSuffix,
}: {
  dishes: Dish[];
  allDishes: Dish[];
  allTags: any[];
  selectedTagFilter: string | null;
  setSelectedTagFilter: (v: string | null) => void;
  categoryFilter: ComponentCategory | "all";
  setCategoryFilter: (v: ComponentCategory | "all") => void;
  demoSuffix: string;
}) {
  return (
    <>
      {/* Category filter tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {dishCategories.map((cat) => (
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

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedTagFilter(null)}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-medium border whitespace-nowrap",
              !selectedTagFilter ? "border-gold/50 bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
            )}
          >All Tags</button>
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTagFilter(selectedTagFilter === tag.id ? null : tag.id)}
              className={cn("rounded-lg px-3 py-1.5 text-xs font-medium border whitespace-nowrap",
                selectedTagFilter === tag.id ? "border-gold/50 bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
              )}
            >{tag.name}</button>
          ))}
        </div>
      )}

      {/* Dishes grid */}
      {dishes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-zinc-500 text-sm">
            {allDishes.length === 0
              ? "No dishes yet. Create your first dish to get started."
              : "No dishes match your search."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
          {dishes.map((dish) => (
            <Link key={dish.id} href={`/coach/dishes/${dish.id}${demoSuffix}`}>
              <Card hover className="p-0 h-full flex flex-col overflow-hidden">
                {dish.imageUrl && (
                  <div className="w-full aspect-video overflow-hidden border-b border-white/[0.06] bg-black/50">
                    <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-lg shrink-0">{dish.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{dish.name}</p>
                      <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide mt-0.5", categoryColors[dish.componentCategory])}>
                        {dish.componentCategory.replace("_", " ")}
                      </span>
                    </div>
                    {dish.mealSize && (
                      <span className="text-[9px] text-zinc-600 capitalize border border-white/[0.06] rounded px-1.5 py-0.5 shrink-0">{dish.mealSize}</span>
                    )}
                  </div>
                  {dish.description && (
                    <p className="text-[11px] text-zinc-500 mt-2 line-clamp-2">{dish.description}</p>
                  )}
                  {dish.tags && dish.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {dish.tags.map((tag) => (
                        <span key={tag.id} className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-zinc-500">{tag.name}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-auto pt-3 flex-wrap">
                    <MacroBadge label="Cal" value={dish.totalCalories} />
                    <MacroBadge label="P" value={dish.totalProtein} />
                    <MacroBadge label="C" value={dish.totalCarbs} />
                    <MacroBadge label="F" value={dish.totalFat} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

// ─── FOODS TAB ─────────────────────────────────────────────────
function FoodsTab({
  foods, allFoods, foodCategoryFilter, setFoodCategoryFilter, onDelete, onFoodAdded, onFoodUpdated,
}: {
  foods: Food[];
  allFoods: Food[];
  foodCategoryFilter: string;
  setFoodCategoryFilter: (v: string) => void;
  onDelete: (id: string) => void;
  onFoodAdded: () => void;
  onFoodUpdated: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  return (
    <>
      {/* Category filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {foodCategories.map((c) => (
            <button
              key={c}
              onClick={() => setFoodCategoryFilter(c)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold border whitespace-nowrap capitalize",
                foodCategoryFilter === c
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowAddForm(true)} className="ml-3 shrink-0">
          <Plus className="h-4 w-4" /> Add Food
        </Button>
      </div>

      {/* Add/Edit Food Form */}
      {showAddForm && (
        <FoodFormModal
          onClose={() => setShowAddForm(false)}
          onSaved={() => { setShowAddForm(false); onFoodAdded(); }}
        />
      )}
      {editingFood && (
        <FoodFormModal
          food={editingFood}
          onClose={() => setEditingFood(null)}
          onSaved={() => { setEditingFood(null); onFoodUpdated(); }}
        />
      )}

      {/* Foods list */}
      {foods.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-zinc-500 text-sm">
            {allFoods.length === 0
              ? "No food items yet. Add your first food to get started."
              : "No foods match your search."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {foods.map((food) => (
            <Card key={food.id} className="p-3 flex items-center gap-3">
              <span className="text-lg">{food.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{food.name}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                  {food.calories} cal · {food.protein}g P · {food.carbs}g C · {food.fat}g F
                  {food.unit
                    ? ` — per ${food.unit} (${food.gramsPerUnit}g)`
                    : " — per 100g"}
                </p>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-600 border border-white/[0.06] rounded px-2 py-0.5 shrink-0">
                {food.category}
              </span>
              <button
                onClick={() => setEditingFood(food)}
                className="text-zinc-600 hover:text-gold transition-colors p-1"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {!food.isDefault && (
                <button
                  onClick={() => onDelete(food.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
      <p className="text-[10px] text-zinc-600 mt-4">{foods.length} items shown · {allFoods.length} total</p>
    </>
  );
}

// ─── FOOD FORM MODAL ─────────────────────────────────────────────
function FoodFormModal({ food, onClose, onSaved }: {
  food?: Food;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!food;
  const [name, setName] = useState(food?.name || "");
  const [emoji, setEmoji] = useState(food?.emoji || "🍽️");
  const [category, setCategory] = useState(food?.category || "protein");
  const [unit, setUnit] = useState(food?.unit || "");
  const [gramsPerUnit, setGramsPerUnit] = useState(food?.gramsPerUnit || 100);
  const [calories, setCalories] = useState(food?.calories || 0);
  const [protein, setProtein] = useState(food?.protein || 0);
  const [carbs, setCarbs] = useState(food?.carbs || 0);
  const [fat, setFat] = useState(food?.fat || 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);

    if (isEdit && food) {
      const { error: err } = await updateFood(food.id, {
        name: name.trim(),
        emoji,
        category,
        unit: unit.trim() || null,
        grams_per_unit: unit.trim() ? gramsPerUnit : null,
        calories,
        protein,
        carbs,
        fat,
      });
      if (err) { setError(err); setSaving(false); return; }
    } else {
      const { error: err } = await createFood({
        name: name.trim(),
        emoji,
        category,
        unit: unit.trim() || undefined,
        grams_per_unit: unit.trim() ? gramsPerUnit : undefined,
        calories,
        protein,
        carbs,
        fat,
      });
      if (err) { setError(err); setSaving(false); return; }
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-white/[0.08] bg-[#1a1a1a] p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">{isEdit ? "Edit Food" : "Add Food Item"}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Name + Emoji */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <label className="block text-[11px] text-zinc-500 mb-1">Emoji</label>
              <input type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)}
                className="w-12 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] text-center text-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] text-zinc-500 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="e.g. Chicken Breast"
                className="w-full h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Category */}
          <div>
            <label className="block text-[11px] text-zinc-500 mb-1">Category</label>
            <div className="flex gap-1.5 flex-wrap">
              {["protein", "carbs", "fats", "fiber", "supplements"].map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={cn("rounded-lg px-3 py-1.5 text-xs font-medium border capitalize",
                    category === c ? "border-gold/50 bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
                  )}>{c}</button>
              ))}
            </div>
          </div>

          {/* Macros per serving */}
          <p className="text-[11px] text-zinc-500 pt-1">Macros per serving</p>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] text-zinc-600 mb-1">Calories</label>
              <input type="number" value={calories} onChange={(e) => setCalories(parseFloat(e.target.value) || 0)}
                className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white text-center focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-600 mb-1">Protein</label>
              <input type="number" value={protein} onChange={(e) => setProtein(parseFloat(e.target.value) || 0)}
                className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white text-center focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-600 mb-1">Carbs</label>
              <input type="number" value={carbs} onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)}
                className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white text-center focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-600 mb-1">Fat</label>
              <input type="number" value={fat} onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
                className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white text-center focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
          </div>

          {/* Unit + Grams per unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Serving unit (optional)</label>
              <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. chapati, egg, scoop"
                className="w-full h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Grams per unit</label>
              <input type="number" value={gramsPerUnit} onChange={(e) => setGramsPerUnit(parseFloat(e.target.value) || 0)}
                className="w-full h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
          </div>

          <Button variant="gold" size="md" className="w-full mt-2" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Food"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── SHARED ─────────────────────────────────────────────────
function MacroBadge({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-400">
      <span className="font-medium text-zinc-300">{value}</span>
      <span>{label}</span>
    </span>
  );
}
