"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { foodDatabase, mealTypes, type FoodItem, formatFoodAmount, getQuickAmounts } from "@/lib/food-database";
import { mockClients } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { getClients, createDietPlan } from "@/lib/db";
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, X, Pencil } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SelectedFood { food: FoodItem; grams: number; }
interface MealData { mealType: string; label: string; emoji: string; time: string; items: SelectedFood[]; }

function calcMacros(items: SelectedFood[]) {
  return items.reduce((acc, { food, grams }) => {
    const m = grams / 100;
    return {
      calories: acc.calories + Math.round(food.per100g.calories * m),
      protein: acc.protein + Math.round(food.per100g.protein * m),
      carbs: acc.carbs + Math.round(food.per100g.carbs * m),
      fat: acc.fat + Math.round(food.per100g.fat * m),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function allMacros(meals: MealData[]) {
  return calcMacros(meals.flatMap((m) => m.items));
}

const categories = [
  { key: "protein" as const, label: "Protein", emoji: "🥩", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { key: "carbs" as const, label: "Carbs", emoji: "🍚", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { key: "fats" as const, label: "Fats", emoji: "🥜", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { key: "supplements" as const, label: "Supps", emoji: "💊", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
];

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

// Bottom sheet for adding food amount
function AmountSheet({ food, onAdd, onClose }: { food: FoodItem; onAdd: (grams: number) => void; onClose: () => void; }) {
  const [grams, setGrams] = useState("");
  const quickOpts = getQuickAmounts(food);
  const g = Number(grams) || 0;
  const m = g / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] p-5 pb-8 safe-area-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{food.emoji}</span>
            <div>
              <p className="font-semibold text-white">{food.name}</p>
              <p className="text-xs text-zinc-500">{food.per100g.protein}p · {food.per100g.carbs}c · {food.per100g.fat}f per 100g</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06]"><X className="h-5 w-5 text-zinc-400" /></button>
        </div>

        {/* Quick amount buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickOpts.map((opt) => (
            <button key={opt.grams} onClick={() => setGrams(String(opt.grams))}
              className={cn("rounded-xl py-2.5 text-sm font-medium transition-all border",
                Number(grams) === opt.grams ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-400 hover:bg-white/[0.04]"
              )}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="relative mb-4">
          <input type="number" value={grams} onChange={(e) => setGrams(e.target.value)} placeholder={food.unit ? `Amount in grams` : "Custom amount"}
            className={inputClass} autoFocus />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">g</span>
        </div>

        {/* Preview macros */}
        {g > 0 && (
          <div className="mb-1 text-center text-xs text-gold font-medium">{formatFoodAmount(food, g)}</div>
        )}
        {g > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="rounded-lg bg-white/[0.03] p-2 text-center">
              <p className="text-sm font-bold text-gold">{Math.round(food.per100g.calories * m)}</p>
              <p className="text-[10px] text-zinc-500">kcal</p>
            </div>
            <div className="rounded-lg bg-red-500/5 p-2 text-center">
              <p className="text-sm font-bold text-red-400">{Math.round(food.per100g.protein * m)}g</p>
              <p className="text-[10px] text-zinc-500">protein</p>
            </div>
            <div className="rounded-lg bg-amber-500/5 p-2 text-center">
              <p className="text-sm font-bold text-amber-400">{Math.round(food.per100g.carbs * m)}g</p>
              <p className="text-[10px] text-zinc-500">carbs</p>
            </div>
            <div className="rounded-lg bg-emerald-500/5 p-2 text-center">
              <p className="text-sm font-bold text-emerald-400">{Math.round(food.per100g.fat * m)}g</p>
              <p className="text-[10px] text-zinc-500">fat</p>
            </div>
          </div>
        )}

        <Button variant="gold" className="w-full h-12 text-base rounded-2xl" disabled={g <= 0} onClick={() => { onAdd(g); onClose(); }}>
          <Plus className="h-5 w-5" /> Add {food.name}
        </Button>
      </div>
    </div>
  );
}

// Bottom sheet for adding a custom food not in the database
function CustomFoodSheet({ category, onAdd, onClose }: { category: "protein" | "carbs" | "fats" | "supplements"; onAdd: (food: FoodItem, grams: number) => void; onClose: () => void; }) {
  const [name, setName] = useState("");
  const [grams, setGrams] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const canAdd = name && Number(grams) > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    const customFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name,
      category,
      emoji: "🍽️",
      per100g: {
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      },
    };
    onAdd(customFood, Number(grams));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] p-5 pb-8 safe-area-bottom max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold text-white">Add Custom Food</p>
            <p className="text-xs text-zinc-500">Enter the details manually</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06]"><X className="h-5 w-5 text-zinc-400" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Food Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Moong Dal" className={inputClass} autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Amount (grams)</label>
            <input type="number" value={grams} onChange={(e) => setGrams(e.target.value)} placeholder="e.g. 100" className={inputClass} />
          </div>
          <p className="text-xs text-zinc-500 font-medium pt-1">Macros per 100g (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Calories</label>
              <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Protein (g)</label>
              <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Carbs (g)</label>
              <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Fat (g)</label>
              <input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" className={inputClass} />
            </div>
          </div>
        </div>

        <Button variant="gold" className="w-full h-12 text-base rounded-2xl mt-5" disabled={!canAdd} onClick={handleAdd}>
          <Plus className="h-5 w-5" /> Add {name || "Food"}
        </Button>
      </div>
    </div>
  );
}

export default function CreatePlanPage() {
  const [step, setStep] = useState(0); // 0=details, 1-4=meals, 5=review
  const [planName, setPlanName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [weeks, setWeeks] = useState("4");
  const [saved, setSaved] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"protein" | "carbs" | "fats" | "supplements">("protein");
  const [sheetFood, setSheetFood] = useState<FoodItem | null>(null);
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [returnToReview, setReturnToReview] = useState(false);
  const [meals, setMeals] = useState<MealData[]>(
    mealTypes.map((m) => ({ mealType: m.id, label: m.label, emoji: m.emoji, time: m.time, items: [] }))
  );

  const { user } = useAuth();
  const [dbClients, setDbClients] = useState<any[]>([]);
  useEffect(() => { if (user) getClients(user.id).then(setDbClients); }, [user]);
  const activeClients = dbClients.filter((c: any) => c.status === "active").map((c: any) => ({ id: c.id, name: c.profile?.name || "Unknown" }));
  const totals = allMacros(meals);
  const totalItems = meals.reduce((sum, m) => sum + m.items.length, 0);
  const currentMeal = step >= 1 && step <= 4 ? meals[step - 1] : null;
  const currentMacros = currentMeal ? calcMacros(currentMeal.items) : null;

  const addFood = (mealIndex: number, food: FoodItem, grams: number) => {
    setMeals((prev) => prev.map((m, i) => i === mealIndex ? { ...m, items: [...m.items, { food, grams }] } : m));
  };
  const removeFood = (mealIndex: number, foodIndex: number) => {
    setMeals((prev) => prev.map((m, i) => i === mealIndex ? { ...m, items: m.items.filter((_, fi) => fi !== foodIndex) } : m));
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-gold" /></div>
        <h1 className="text-xl font-bold text-white">Diet Plan Created!</h1>
        <p className="text-sm text-zinc-500 mt-2">The plan has been saved and assigned.</p>
        <Link href="/coach/plans"><Button variant="gold" className="mt-6">Back to Plans</Button></Link>
      </div>
    );
  }

  const canProceedFromDetails = planName && selectedClient;
  const isLastMeal = step === 4;
  const isReview = step === 5;

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {step === 0 ? (
          <Link href="/coach/plans" className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06]"><ArrowLeft className="h-5 w-5 text-zinc-400" /></Link>
        ) : (
          <button onClick={() => {
            if (returnToReview) { setReturnToReview(false); setStep(5); }
            else { setStep(step - 1); }
          }} className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06]"><ArrowLeft className="h-5 w-5 text-zinc-400" /></button>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">
            {step === 0 ? "New Diet Plan" : isReview ? "Review Plan" : `${currentMeal?.emoji} ${currentMeal?.label}`}
          </h1>
          <p className="text-xs text-zinc-500">
            {step === 0 ? "Step 1 of 6 · Plan details" : isReview ? "Step 6 of 6 · Confirm" : `Step ${step + 1} of 6 · Add foods`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6">
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={cn("h-1 flex-1 rounded-full transition-all", s <= step ? "gradient-gold" : "bg-white/[0.06]")} />
        ))}
      </div>

      {/* Step 0: Plan details */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Plan Name</label>
            <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. Fat Loss Phase 1" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Client</label>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className={inputClass}>
              <option value="">Select client</option>
              {activeClients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {["2", "3", "4", "6"].map((w) => (
                <button key={w} onClick={() => setWeeks(w)}
                  className={cn("rounded-xl py-3 text-sm font-medium border transition-all",
                    weeks === w ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-400 hover:bg-white/[0.04]"
                  )}>
                  {w} weeks
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Steps 1-4: Meal builder */}
      {currentMeal && (
        <div>
          {/* Added items */}
          {currentMeal.items.length > 0 && (
            <div className="space-y-2 mb-5">
              {currentMeal.items.map((item, i) => {
                const m = item.grams / 100;
                return (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{item.food.emoji}</span>
                      <span className="text-sm font-medium text-white truncate">{item.food.name}</span>
                      <Badge variant="gold">{formatFoodAmount(item.food, item.grams)}</Badge>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-zinc-500">{Math.round(item.food.per100g.calories * m)} kcal</span>
                      <button onClick={() => removeFood(step - 1, i)} className="p-1 text-zinc-600 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                );
              })}
              {currentMacros && (
                <div className="flex items-center justify-between px-1 pt-1">
                  <span className="text-xs text-zinc-500">Meal total</span>
                  <span className="text-xs text-gold font-semibold">{currentMacros.calories} kcal · {currentMacros.protein}p · {currentMacros.carbs}c · {currentMacros.fat}f</span>
                </div>
              )}
            </div>
          )}

          {/* Category tabs */}
          <div className="flex gap-2 mb-4">
            {categories.map((cat) => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold border transition-all",
                  activeCategory === cat.key ? cat.color : "border-white/[0.06] text-zinc-500 hover:bg-white/[0.04]"
                )}>
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Food grid */}
          <div className="grid grid-cols-1 gap-2">
            {foodDatabase.filter((f) => f.category === activeCategory).map((food) => (
              <button key={food.id} onClick={() => setSheetFood(food)}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] px-4 py-3 text-left hover:bg-white/[0.04] hover:border-white/[0.1] transition-all active:scale-[0.98]">
                <span className="text-xl">{food.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{food.name}</p>
                  <p className="text-xs text-zinc-500">{food.per100g.calories} kcal · {food.per100g.protein}p · {food.per100g.carbs}c · {food.per100g.fat}f {food.unit ? `/ 100g · 1 ${food.unit} = ${food.gramsPerUnit}g` : "/100g"}</p>
                </div>
                <Plus className="h-4 w-4 text-zinc-500 shrink-0" />
              </button>
            ))}

            {/* Custom food option */}
            <button onClick={() => setShowCustomFood(true)}
              className="flex items-center gap-3 rounded-xl border border-dashed border-gold/30 px-4 py-3 text-left hover:bg-gold/5 hover:border-gold/50 transition-all active:scale-[0.98]">
              <span className="text-xl">✏️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gold">Add Custom Food</p>
                <p className="text-xs text-zinc-500">Not in the list? Add your own</p>
              </div>
              <Plus className="h-4 w-4 text-gold shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {isReview && (
        <div className="space-y-4">
          <Card>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Plan</p>
            <p className="text-white font-semibold">{planName}</p>
            <p className="text-xs text-zinc-500 mt-1">{weeks} weeks · {activeClients.find((c) => c.id === selectedClient)?.name}</p>
          </Card>

          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <p className="text-lg font-bold text-gold">{totals.calories}</p>
              <p className="text-[10px] text-zinc-500">kcal</p>
            </div>
            <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3 text-center">
              <p className="text-lg font-bold text-red-400">{totals.protein}g</p>
              <p className="text-[10px] text-zinc-500">protein</p>
            </div>
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 text-center">
              <p className="text-lg font-bold text-amber-400">{totals.carbs}g</p>
              <p className="text-[10px] text-zinc-500">carbs</p>
            </div>
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3 text-center">
              <p className="text-lg font-bold text-emerald-400">{totals.fat}g</p>
              <p className="text-[10px] text-zinc-500">fat</p>
            </div>
          </div>

          {meals.map((meal, mealIndex) => (
            <Card key={meal.mealType}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{meal.emoji}</span>
                <p className="font-semibold text-white">{meal.label}</p>
                <button
                  onClick={() => { setReturnToReview(true); setStep(mealIndex + 1); setActiveCategory("protein"); }}
                  className="ml-auto flex items-center gap-1 text-xs text-gold font-medium hover:text-gold-light transition-colors"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              </div>
              {meal.items.length === 0 ? (
                <p className="text-xs text-zinc-600">No items added</p>
              ) : (
                <div className="space-y-1.5">
                  {meal.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{item.food.emoji} {item.food.name}</span>
                      <span className="text-zinc-500">{item.grams}g · {Math.round(item.food.per100g.calories * item.grams / 100)} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Custom food sheet */}
      {showCustomFood && currentMeal && (
        <CustomFoodSheet
          category={activeCategory}
          onAdd={(food, grams) => addFood(step - 1, food, grams)}
          onClose={() => setShowCustomFood(false)}
        />
      )}

      {/* Bottom sheet for amount input */}
      {sheetFood && currentMeal && (
        <AmountSheet food={sheetFood} onClose={() => setSheetFood(null)} onAdd={(grams) => addFood(step - 1, sheetFood, grams)} />
      )}

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/[0.06] safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 py-3 lg:pl-68">
          {totalItems > 0 && !isReview && step > 0 && (
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-zinc-500">Daily total</span>
              <span className="text-gold font-semibold">{totals.calories} kcal · {totals.protein}p · {totals.carbs}c · {totals.fat}f</span>
            </div>
          )}
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="secondary" className="flex-1" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step === 0 && (
              <Button variant="gold" className="flex-1 h-12 text-base rounded-2xl" disabled={!canProceedFromDetails} onClick={() => setStep(1)}>
                Start Building <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {step >= 1 && step <= 4 && !isLastMeal && (
              <Button variant="gold" className="flex-1" onClick={() => {
                if (returnToReview) { setReturnToReview(false); setStep(5); }
                else { setStep(step + 1); setActiveCategory("protein"); }
              }}>
                {returnToReview ? (<>Done Editing <Check className="h-4 w-4" /></>) : (<>Next: {mealTypes[step]?.label} <ArrowRight className="h-4 w-4" /></>)}
              </Button>
            )}
            {isLastMeal && (
              <Button variant="gold" className="flex-1" onClick={() => setStep(5)}>
                {returnToReview ? "Done Editing" : "Review Plan"} {returnToReview ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            )}
            {isReview && (
              <Button variant="gold" className="flex-1 h-12 text-base rounded-2xl" onClick={async () => {
                if (!user) return;
                const now = new Date().toISOString().split("T")[0];
                const endDate = new Date(Date.now() + Number(weeks) * 7 * 86400000).toISOString().split("T")[0];
                await createDietPlan({
                  coach_id: user.id,
                  client_id: selectedClient,
                  title: planName,
                  description: "",
                  start_date: now,
                  end_date: endDate,
                  weeks: Number(weeks),
                  meals: meals.map((m, i) => ({
                    name: m.label,
                    time: m.time,
                    items: m.items.map((item) => item.food.name + ` (${formatFoodAmount(item.food, item.grams)})`),
                    calories: m.items.reduce((s, it) => s + Math.round(it.food.per100g.calories * it.grams / 100), 0),
                    protein: m.items.reduce((s, it) => s + Math.round(it.food.per100g.protein * it.grams / 100), 0),
                    carbs: m.items.reduce((s, it) => s + Math.round(it.food.per100g.carbs * it.grams / 100), 0),
                    fat: m.items.reduce((s, it) => s + Math.round(it.food.per100g.fat * it.grams / 100), 0),
                    sort_order: i,
                  })),
                });
                setSaved(true);
              }} disabled={totalItems === 0}>
                <Check className="h-5 w-5" /> Save Diet Plan
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
