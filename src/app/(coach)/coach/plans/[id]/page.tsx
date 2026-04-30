"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { foodDatabase, mealTypes, type FoodItem } from "@/lib/food-database";
import { getDietPlans, updateDietPlanMeals } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import { formatDate, cn } from "@/lib/utils";
import { ArrowLeft, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import Link from "next/link";

interface SelectedFood { food: FoodItem; grams: number; }
interface MealEdit { id?: string; label: string; emoji: string; time: string; items: SelectedFood[]; }

const categories = [
  { key: "protein" as const, label: "Protein", emoji: "🥩", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { key: "carbs" as const, label: "Carbs", emoji: "🍚", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { key: "fats" as const, label: "Fats", emoji: "🥜", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { key: "supplements" as const, label: "Supps", emoji: "💊", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
];

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

function calcMacros(items: SelectedFood[]) {
  return items.reduce((acc, { food, grams }) => {
    const m = grams / 100;
    return { calories: acc.calories + Math.round(food.per100g.calories * m), protein: acc.protein + Math.round(food.per100g.protein * m), carbs: acc.carbs + Math.round(food.per100g.carbs * m), fat: acc.fat + Math.round(food.per100g.fat * m) };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function formatFoodAmount(food: FoodItem, grams: number) {
  return `${grams}g`;
}

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [meals, setMeals] = useState<MealEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingMeal, setEditingMeal] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<"protein" | "carbs" | "fats" | "supplements">("protein");
  const [sheetFood, setSheetFood] = useState<FoodItem | null>(null);
  const [sheetGrams, setSheetGrams] = useState("");

  useEffect(() => {
    if (user) loadPlan();
  }, [user, id]);

  async function loadPlan() {
    if (!user) return;
    const plans = await getDietPlans(user.id);
    const found = plans.find((p: any) => p.id === id);
    if (!found) { setLoading(false); return; }
    setPlan(found);
    setMeals((found.meals || []).map((meal: any, i: number) => ({
      id: meal.id,
      label: meal.name,
      emoji: mealTypes[i]?.emoji || "🍽️",
      time: meal.time,
      items: (meal.items || []).map((itemName: string) => {
        const found = foodDatabase.find((f) => f.name.toLowerCase() === itemName.toLowerCase());
        return {
          food: found || { id: `existing-${itemName}`, name: itemName, category: "protein" as const, emoji: "🍽️", per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          grams: 100,
        };
      }),
    })));
    setLoading(false);
  }

  const addFood = (mealIndex: number, food: FoodItem, grams: number) => {
    setMeals((prev) => prev.map((m, i) => i === mealIndex ? { ...m, items: [...m.items, { food, grams }] } : m));
  };
  const removeFood = (mealIndex: number, foodIndex: number) => {
    setMeals((prev) => prev.map((m, i) => i === mealIndex ? { ...m, items: m.items.filter((_, fi) => fi !== foodIndex) } : m));
  };
  const handleAddFromSheet = () => {
    if (sheetFood && editingMeal !== null && Number(sheetGrams) > 0) {
      addFood(editingMeal, sheetFood, Number(sheetGrams));
      setSheetFood(null); setSheetGrams("");
    }
  };

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    await updateDietPlanMeals(plan.id, meals.map((m, i) => {
      const macros = calcMacros(m.items);
      return {
        name: m.label, time: m.time, sort_order: i,
        items: m.items.map((item) => `${item.food.name} (${formatFoodAmount(item.food, item.grams)})`),
        calories: macros.calories, protein: macros.protein, carbs: macros.carbs, fat: macros.fat,
      };
    }));
    setSaving(false);
    setSaved(true);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;
  if (!plan) return <div className="py-20 text-center"><p className="text-zinc-500">Plan not found.</p><Link href="/coach/plans"><Button variant="secondary" className="mt-4">Back to Plans</Button></Link></div>;

  if (saved) return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-gold" /></div>
      <h1 className="text-xl font-bold text-white">Plan Updated!</h1>
      <p className="text-sm text-zinc-500 mt-2">Changes have been saved.</p>
      <Link href="/coach/plans"><Button variant="gold" className="mt-6">Back to Plans</Button></Link>
    </div>
  );

  const totalMacros = calcMacros(meals.flatMap((m) => m.items));

  return (
    <div className="pb-24">
      <Link href="/coach/plans" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-gold mb-4"><ArrowLeft className="h-4 w-4" /> Back to Plans</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">{plan.title}</h1>
            <Badge variant={plan.status === "active" ? "success" : "default"}>{plan.status}</Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">{plan.description}</p>
        </div>
      </div>

      {plan.client && (
        <Card className="mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={plan.client.name} />
            <div>
              <p className="text-sm font-semibold text-white">{plan.client.name}</p>
              <p className="text-xs text-zinc-500">{plan.start_date && formatDate(plan.start_date)} — {plan.end_date && formatDate(plan.end_date)} · {plan.weeks} weeks</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 text-center"><p className="text-base font-bold text-gold">{totalMacros.calories}</p><p className="text-[10px] text-zinc-500">kcal</p></div>
        <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-2.5 text-center"><p className="text-base font-bold text-red-400">{totalMacros.protein}g</p><p className="text-[10px] text-zinc-500">protein</p></div>
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-2.5 text-center"><p className="text-base font-bold text-amber-400">{totalMacros.carbs}g</p><p className="text-[10px] text-zinc-500">carbs</p></div>
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-2.5 text-center"><p className="text-base font-bold text-emerald-400">{totalMacros.fat}g</p><p className="text-[10px] text-zinc-500">fat</p></div>
      </div>

      <div className="space-y-4">
        {meals.map((meal, mealIndex) => {
          const mealMacros = calcMacros(meal.items);
          const isEditing = editingMeal === mealIndex;
          return (
            <Card key={mealIndex}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meal.emoji}</span>
                  <div><p className="font-semibold text-white">{meal.label}</p><p className="text-xs text-zinc-500">{meal.time} · {mealMacros.calories} kcal</p></div>
                </div>
                <button onClick={() => { setEditingMeal(isEditing ? null : mealIndex); setActiveCategory("protein"); }}
                  className={cn("flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all", isEditing ? "bg-gold/10 text-gold" : "text-zinc-500 hover:text-gold hover:bg-white/[0.04]")}>
                  <Pencil className="h-3 w-3" /> {isEditing ? "Done" : "Edit"}
                </button>
              </div>
              <div className="space-y-2">
                {meal.items.map((item, i) => {
                  const m = item.grams / 100;
                  return (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{item.food.emoji}</span>
                        <span className="text-sm text-zinc-300 truncate">{item.food.name}</span>
                        <Badge variant="gold">{item.grams}g</Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-zinc-500">{Math.round(item.food.per100g.calories * m)} kcal</span>
                        {isEditing && <button onClick={() => removeFood(mealIndex, i)} className="p-1 text-zinc-600 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>}
                      </div>
                    </div>
                  );
                })}
                {meal.items.length === 0 && <p className="text-xs text-zinc-600 py-2">No items yet</p>}
              </div>
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <div className="flex gap-2 mb-3">
                    {categories.map((cat) => (
                      <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                        className={cn("flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-semibold border transition-all", activeCategory === cat.key ? cat.color : "border-white/[0.06] text-zinc-500")}>
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {foodDatabase.filter((f) => f.category === activeCategory).map((food) => (
                      <button key={food.id} onClick={() => { setSheetFood(food); setSheetGrams(""); }}
                        className="w-full flex items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-2 text-left hover:bg-white/[0.04] transition-all text-sm">
                        <span>{food.emoji}</span><span className="flex-1 text-zinc-300 truncate">{food.name}</span><Plus className="h-3.5 w-3.5 text-zinc-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {sheetFood && editingMeal !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => { setSheetFood(null); setSheetGrams(""); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] p-5 pb-8 safe-area-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><span className="text-xl">{sheetFood.emoji}</span><p className="font-semibold text-white">{sheetFood.name}</p></div>
              <button onClick={() => { setSheetFood(null); setSheetGrams(""); }} className="p-2 rounded-xl hover:bg-white/[0.06]"><X className="h-5 w-5 text-zinc-400" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[100, 150, 200].map((amt) => (
                <button key={amt} onClick={() => setSheetGrams(String(amt))}
                  className={cn("rounded-xl py-2.5 text-sm font-medium border transition-all", Number(sheetGrams) === amt ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-400")}>{amt}g</button>
              ))}
            </div>
            <div className="relative mb-4">
              <input type="number" value={sheetGrams} onChange={(e) => setSheetGrams(e.target.value)} placeholder="Custom amount" className={inputClass} autoFocus />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">g</span>
            </div>
            <Button variant="gold" className="w-full h-12 text-base rounded-2xl" disabled={Number(sheetGrams) <= 0} onClick={handleAddFromSheet}><Plus className="h-5 w-5" /> Add</Button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/[0.06] safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Button variant="gold" className="w-full h-12 text-base rounded-2xl" onClick={handleSave} disabled={saving}>
            <Check className="h-5 w-5" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
