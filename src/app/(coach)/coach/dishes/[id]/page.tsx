"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getDish, createDish, updateDish, deleteDish, getDishReferences, createFood } from "@/lib/db";
import { calculateDishMacros, calculateItemMacros, roundMacros } from "@/lib/macro-calc";
import { foodDatabase, type FoodItem } from "@/lib/food-database";
import { FoodPickerSheet } from "@/components/coach/food-picker-sheet";
import { cn } from "@/lib/utils";
import type { Dish, DishItem, ComponentCategory } from "@/types";

export default function DishEditPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <DishEditPageInner />
    </Suspense>
  );
}

interface LocalDishItem {
  localId: string;
  foodId: string | null;
  foodName: string;
  foodEmoji: string;
  grams: number;
  per100g: { calories: number; protein: number; carbs: number; fat: number };
  isCustom: boolean;
}

const categoryOptions: { value: ComponentCategory; label: string }[] = [
  { value: "carbohydrate", label: "Carbohydrate" },
  { value: "protein", label: "Protein" },
  { value: "fiber", label: "Fiber" },
  { value: "complete_meal", label: "Complete Meal" },
];

const categoryColors: Record<ComponentCategory, string> = {
  carbohydrate: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  protein: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  fiber: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  complete_meal: "border-purple-500/40 bg-purple-500/10 text-purple-400",
};

const demoDish: Dish = {
  id: "demo-1",
  coachId: "demo",
  name: "Overnight Oats",
  emoji: "🥣",
  componentCategory: "carbohydrate",
  totalCalories: 380,
  totalProtein: 35,
  totalCarbs: 45,
  totalFat: 8,
  items: [
    { id: "di-1", dishId: "demo-1", foodId: "c3", grams: 28, sortOrder: 0 },
    { id: "di-2", dishId: "demo-1", foodId: "p6", grams: 30, sortOrder: 1 },
    { id: "di-3", dishId: "demo-1", foodId: "p5", grams: 30, sortOrder: 2 },
  ],
  createdAt: "",
};

function DishEditPageInner() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();

  const dishId = params.id as string;
  const isCreateMode = dishId === "create";

  // Form state
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [componentCategory, setComponentCategory] = useState<ComponentCategory | null>(null);
  const [items, setItems] = useState<LocalDishItem[]>([]);
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string[] | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<{ name?: string; items?: string; category?: string }>({});

  // Load dish in edit mode
  useEffect(() => {
    if (isCreateMode) return;
    if (isDemo) {
      populateFromDish(demoDish);
      setLoading(false);
      return;
    }
    if (user) loadDish();
  }, [user, isDemo, dishId]);

  async function loadDish() {
    const dish = await getDish(dishId);
    if (!dish) {
      router.push(`/coach/dishes${demoSuffix}`);
      return;
    }
    populateFromDish(dish);
    setLoading(false);
  }

  function populateFromDish(dish: Dish) {
    setName(dish.name);
    setEmoji(dish.emoji);
    setComponentCategory(dish.componentCategory);
    setItems(
      dish.items.map((item) => {
        const food = item.foodId ? foodDatabase.find((f) => f.id === item.foodId) : null;
        return {
          localId: item.id || crypto.randomUUID(),
          foodId: item.foodId,
          foodName: food?.name || item.customName || "Unknown",
          foodEmoji: food?.emoji || item.customEmoji || "🍽️",
          grams: item.grams,
          per100g: food
            ? food.per100g
            : {
                calories: item.customCalories || 0,
                protein: item.customProtein || 0,
                carbs: item.customCarbs || 0,
                fat: item.customFat || 0,
              },
          isCustom: !item.foodId,
        };
      })
    );
  }

  // Live macro totals
  const macroTotals = useMemo(() => {
    const raw = calculateDishMacros(
      items.map((item) => ({ per100g: item.per100g, grams: item.grams }))
    );
    return roundMacros(raw);
  }, [items]);

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Dish name is required";
    if (items.length === 0) newErrors.items = "Add at least one food item";
    if (!componentCategory) newErrors.category = "Select a component category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    if (isDemo) return;
    if (!user) return;
    if (saving) return; // Prevent double submission
    setSaving(true);

    const dishInput = {
      name: name.trim(),
      emoji,
      componentCategory: componentCategory!,
      totalCalories: macroTotals.calories,
      totalProtein: macroTotals.protein,
      totalCarbs: macroTotals.carbs,
      totalFat: macroTotals.fat,
      items: items.map((item, idx) => {
        // Static food database items have short IDs like "c2", "p1" — not valid UUIDs
        // Treat them as custom items with inline macros
        const isStaticFood = item.foodId && item.foodId.length < 36;
        const isCustomOrStatic = item.isCustom || isStaticFood;
        return {
          foodId: isCustomOrStatic ? null : item.foodId,
          customName: isCustomOrStatic ? item.foodName : undefined,
          customEmoji: isCustomOrStatic ? item.foodEmoji : undefined,
          customCalories: isCustomOrStatic ? item.per100g.calories : undefined,
          customProtein: isCustomOrStatic ? item.per100g.protein : undefined,
          customCarbs: isCustomOrStatic ? item.per100g.carbs : undefined,
          customFat: isCustomOrStatic ? item.per100g.fat : undefined,
          grams: item.grams,
          sortOrder: idx,
        };
      }),
    };

    if (isCreateMode) {
      const { error } = await createDish({ coachId: user.id, ...dishInput });
      if (error) {
        setErrors({ name: error });
        setSaving(false);
        return;
      }
    } else {
      const { error } = await updateDish(dishId, dishInput);
      if (error) {
        setErrors({ name: error });
        setSaving(false);
        return;
      }
    }

    router.push(`/coach/dishes${demoSuffix}`);
  }

  async function handleDelete() {
    if (isDemo || isCreateMode) return;
    if (!deleteWarning) {
      // Check references first
      const refs = await getDishReferences(dishId);
      if (refs.length > 0) {
        setDeleteWarning(refs.map((r) => r.templateName));
        return;
      }
      // No references, proceed with confirmation
      setDeleteWarning([]);
      return;
    }
    // User confirmed
    setDeleting(true);
    const { error } = await deleteDish(dishId);
    if (error) {
      setErrors({ name: error });
      setDeleting(false);
      return;
    }
    router.push(`/coach/dishes${demoSuffix}`);
  }

  function addFoodItem(food: FoodItem, grams: number) {
    setItems((prev) => [
      ...prev,
      {
        localId: crypto.randomUUID(),
        foodId: food.id,
        foodName: food.name,
        foodEmoji: food.emoji,
        grams,
        per100g: food.per100g,
        isCustom: false,
      },
    ]);
    setShowFoodPicker(false);
    setErrors((prev) => ({ ...prev, items: undefined }));
  }

  function addCustomItem(custom: { name: string; emoji: string; calories: number; protein: number; carbs: number; fat: number; grams: number }) {
    // Also save to foods table so it's reusable in future dishes
    if (!isDemo) {
      createFood({
        name: custom.name,
        category: "protein", // default category
        emoji: custom.emoji,
        calories: custom.calories,
        protein: custom.protein,
        carbs: custom.carbs,
        fat: custom.fat,
      });
    }

    setItems((prev) => [
      ...prev,
      {
        localId: crypto.randomUUID(),
        foodId: null,
        foodName: custom.name,
        foodEmoji: custom.emoji,
        grams: custom.grams,
        per100g: { calories: custom.calories, protein: custom.protein, carbs: custom.carbs, fat: custom.fat },
        isCustom: true,
      },
    ]);
    setShowCustomForm(false);
    setErrors((prev) => ({ ...prev, items: undefined }));
  }

  function removeItem(localId: string) {
    setItems((prev) => prev.filter((i) => i.localId !== localId));
  }

  function updateItemGrams(localId: string, grams: number) {
    setItems((prev) =>
      prev.map((i) => (i.localId === localId ? { ...i, grams: Math.max(0, grams) } : i))
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/coach/dishes${demoSuffix}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-white">
          {isCreateMode ? "Create Dish" : "Edit Dish"}
        </h1>
      </div>

      {isDemo && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
          Demo mode — changes won&apos;t be saved
        </div>
      )}

      {/* Name & Emoji */}
      <Card className="p-5 mb-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <label className="block text-xs text-zinc-500 mb-1.5">Emoji</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-14 h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] text-center text-xl focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1.5">Dish Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
              placeholder="e.g. Overnight Oats"
              className="w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>
        </div>
      </Card>

      {/* Component Category */}
      <Card className="p-5 mb-4">
        <label className="block text-xs text-zinc-500 mb-2">Component Category</label>
        <div className="grid grid-cols-2 gap-2">
          {categoryOptions.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setComponentCategory(cat.value); setErrors((prev) => ({ ...prev, category: undefined })); }}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                componentCategory === cat.value
                  ? categoryColors[cat.value]
                  : "border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {errors.category && <p className="text-xs text-red-400 mt-2">{errors.category}</p>}
      </Card>

      {/* Food Items */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-zinc-500">Food Items</label>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCustomForm(true)}>
              <Plus className="h-3 w-3" /> Custom
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowFoodPicker(true)}>
              <Plus className="h-3 w-3" /> Add Food
            </Button>
          </div>
        </div>

        {errors.items && <p className="text-xs text-red-400 mb-2">{errors.items}</p>}

        {items.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-6">No food items added yet</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const itemMacros = roundMacros(calculateItemMacros(item.per100g, item.grams));
              return (
                <div
                  key={item.localId}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3",
                    item.isCustom
                      ? "border-orange-500/20 bg-orange-500/5"
                      : "border-white/[0.06] bg-white/[0.02]"
                  )}
                >
                  <span className="text-lg">{item.foodEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white truncate">{item.foodName}</p>
                      {item.isCustom && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {itemMacros.calories} cal · {itemMacros.protein}p · {itemMacros.carbs}c · {itemMacros.fat}f
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.grams}
                      onChange={(e) => updateItemGrams(item.localId, parseFloat(e.target.value) || 0)}
                      className="w-16 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white text-center focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                    <span className="text-[11px] text-zinc-500">g</span>
                    <button
                      onClick={() => removeItem(item.localId)}
                      className="p-1 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Macro Totals */}
      {items.length > 0 && (
        <Card className="p-5 mb-6">
          <label className="block text-xs text-zinc-500 mb-2">Total Macros</label>
          <div className="grid grid-cols-4 gap-3">
            <MacroTotal label="Calories" value={macroTotals.calories} unit="kcal" />
            <MacroTotal label="Protein" value={macroTotals.protein} unit="g" />
            <MacroTotal label="Carbs" value={macroTotals.carbs} unit="g" />
            <MacroTotal label="Fat" value={macroTotals.fat} unit="g" />
          </div>
        </Card>
      )}

      {/* Delete Warning */}
      {deleteWarning !== null && (
        <Card className="p-4 mb-4 border-red-500/20 bg-red-500/5">
          {deleteWarning.length > 0 ? (
            <>
              <p className="text-sm text-red-400 font-medium mb-1">This dish is used in templates:</p>
              <ul className="text-xs text-red-300 list-disc list-inside mb-3">
                {deleteWarning.map((name, i) => <li key={i}>{name}</li>)}
              </ul>
              <p className="text-xs text-zinc-400 mb-3">Deleting it will remove it from these templates.</p>
            </>
          ) : (
            <p className="text-sm text-red-400 mb-3">Are you sure you want to delete this dish?</p>
          )}
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Confirm Delete"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteWarning(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="gold"
          size="lg"
          className="flex-1"
          onClick={handleSave}
          disabled={saving || isDemo}
        >
          {saving ? "Saving..." : isCreateMode ? "Create Dish" : "Save Changes"}
        </Button>
        {!isCreateMode && !deleteWarning && (
          <Button
            variant="danger"
            size="lg"
            onClick={handleDelete}
            disabled={isDemo}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Food Picker Sheet */}
      {showFoodPicker && (
        <FoodPickerSheet
          onAdd={(food, grams) => addFoodItem(food, grams)}
          onClose={() => setShowFoodPicker(false)}
        />
      )}

      {/* Custom Item Form Modal */}
      {showCustomForm && (
        <CustomItemModal
          onAdd={addCustomItem}
          onClose={() => setShowCustomForm(false)}
        />
      )}
    </div>
  );
}

function MacroTotal({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="text-[11px] text-zinc-500">{label} ({unit})</p>
    </div>
  );
}

// ---- Custom Item Modal ----
function CustomItemModal({ onAdd, onClose }: {
  onAdd: (item: { name: string; emoji: string; calories: number; protein: number; carbs: number; fat: number; grams: number }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [grams, setGrams] = useState(100);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    onAdd({ name: name.trim(), emoji, calories, protein, carbs, fat, grams });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-white/[0.08] bg-[#1a1a1a] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Add Custom Food Item</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <label className="block text-[11px] text-zinc-500 mb-1">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-12 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] text-center text-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] text-zinc-500 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="e.g. Homemade Granola"
                className="w-full h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <p className="text-[11px] text-zinc-500 pt-1">Macros per 100g</p>
          <div className="grid grid-cols-4 gap-2">
            <NumberInput label="Calories" value={calories} onChange={setCalories} />
            <NumberInput label="Protein" value={protein} onChange={setProtein} />
            <NumberInput label="Carbs" value={carbs} onChange={setCarbs} />
            <NumberInput label="Fat" value={fat} onChange={setFat} />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-500 mb-1">Amount (grams)</label>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(parseFloat(e.target.value) || 0)}
              className="w-24 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          <Button variant="gold" size="md" className="w-full mt-2" onClick={handleSubmit}>
            Add Item
          </Button>
        </div>
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-[10px] text-zinc-600 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white text-center focus:outline-none focus:ring-2 focus:ring-gold/50"
      />
    </div>
  );
}
