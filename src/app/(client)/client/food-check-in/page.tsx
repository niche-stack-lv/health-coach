"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsDemo } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getClientActiveAssignment, getFoodCheckIn, createFoodCheckIn, getDishes, getFoods } from "@/lib/db";
import { calculateAdherenceScore, calculateDailyMaxTargets, type MaxMeal } from "@/lib/macro-calc";
import { getTodayLocal } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { MacroSummary } from "@/components/shared/macro-summary";
import { DishDetailSheet } from "@/components/shared/dish-detail-sheet";
import { DailyPulseStrip } from "@/components/client/daily-pulse-strip";
import { MealCard, type CheckInPick } from "@/components/client/meal-card";
import { useWeightUnit } from "@/lib/use-weight-unit";
import { fromKg, toKg } from "@/lib/units";
import type { TemplateAssignment, TemplateMealSlot, MealSlotComponent, Dish, Food } from "@/types";

export default function FoodCheckInPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <FoodCheckInPageInner />
    </Suspense>
  );
}

// ─── Demo data ────────────────────────────────────────────────────────────

const demoDishes: Dish[] = [
  { id: "d1", coachId: "demo", name: "Overnight Oats", emoji: "🥣", componentCategory: "carbs", totalCalories: 320, totalProtein: 22, totalCarbs: 38, totalFat: 10, totalFiber: 5, items: [], createdAt: "" },
  { id: "d2", coachId: "demo", name: "Smoothie", emoji: "🥤", componentCategory: "carbs", totalCalories: 250, totalProtein: 28, totalCarbs: 30, totalFat: 4, totalFiber: 3, items: [], createdAt: "" },
  { id: "d3", coachId: "demo", name: "Chicken Breast 150g", emoji: "🍗", componentCategory: "protein", totalCalories: 248, totalProtein: 46, totalCarbs: 0, totalFat: 5, totalFiber: 0, items: [], createdAt: "" },
  { id: "d4", coachId: "demo", name: "Palak Paneer 60g", emoji: "🥬", componentCategory: "protein", totalCalories: 180, totalProtein: 12, totalCarbs: 6, totalFat: 12, totalFiber: 2, items: [], createdAt: "" },
  { id: "d5", coachId: "demo", name: "Mixed Salad", emoji: "🥗", componentCategory: "fiber", totalCalories: 45, totalProtein: 2, totalCarbs: 8, totalFat: 1, totalFiber: 4, items: [], createdAt: "" },
];

function buildDemoSlots(): TemplateMealSlot[] {
  return [
    {
      id: "slot-breakfast", templateId: "demo-template", name: "Breakfast", targetCalories: 350, isSkipped: false, sortOrder: 0,
      components: [{
        id: "comp-b-carb", slotId: "slot-breakfast", componentCategory: "carbs", sortOrder: 0,
        dishes: [
          { id: "msd-1", componentId: "comp-b-carb", dishId: "d1", dish: demoDishes[0], sortOrder: 0 },
          { id: "msd-2", componentId: "comp-b-carb", dishId: "d2", dish: demoDishes[1], sortOrder: 1 },
        ],
      }],
    },
    {
      id: "slot-lunch", templateId: "demo-template", name: "Lunch", targetCalories: 500, isSkipped: false, sortOrder: 1,
      components: [
        {
          id: "comp-l-protein", slotId: "slot-lunch", componentCategory: "protein", sortOrder: 0,
          dishes: [
            { id: "msd-3", componentId: "comp-l-protein", dishId: "d3", dish: demoDishes[2], sortOrder: 0 },
            { id: "msd-4", componentId: "comp-l-protein", dishId: "d4", dish: demoDishes[3], sortOrder: 1 },
          ],
        },
        {
          id: "comp-l-fiber", slotId: "slot-lunch", componentCategory: "fiber", sortOrder: 1,
          dishes: [
            { id: "msd-5", componentId: "comp-l-fiber", dishId: "d5", dish: demoDishes[4], sortOrder: 0 },
          ],
        },
      ],
    },
    {
      id: "slot-dinner", templateId: "demo-template", name: "Dinner", targetCalories: 480, isSkipped: false, sortOrder: 2,
      components: [{
        id: "comp-d-protein", slotId: "slot-dinner", componentCategory: "protein", sortOrder: 0,
        dishes: [
          { id: "msd-6", componentId: "comp-d-protein", dishId: "d3", dish: demoDishes[2], sortOrder: 0 },
        ],
      }],
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Resolve macros for a single pick into a MaxMacroAlt-shaped value. */
function macrosForPick(pick: CheckInPick, comp: MealSlotComponent, allDishes: Dish[], allFoods: Food[]) {
  let cal = 0, p = 0, c = 0, f = 0, fib = 0;
  if (pick.kind === "alternative") {
    const msd = comp.dishes.find((d) => d.id === pick.refId);
    if (msd?.dish) {
      const m = pick.multiplier ?? 1;
      cal = msd.dish.totalCalories * m;
      p = msd.dish.totalProtein * m;
      c = msd.dish.totalCarbs * m;
      f = msd.dish.totalFat * m;
      fib = (msd.dish.totalFiber || 0) * m;
    } else if (msd?.food) {
      const grams = msd.foodQuantity || 100;
      const factor = grams / 100;
      cal = msd.food.calories * factor;
      p = msd.food.protein * factor;
      c = msd.food.carbs * factor;
      f = msd.food.fat * factor;
      fib = (msd.food.fiber || 0) * factor;
    }
  } else if (pick.kind === "extra-dish") {
    const dish = allDishes.find((d) => d.id === pick.resolvedDishId);
    if (dish) {
      const m = pick.multiplier ?? 1;
      cal = dish.totalCalories * m;
      p = dish.totalProtein * m;
      c = dish.totalCarbs * m;
      f = dish.totalFat * m;
      fib = (dish.totalFiber || 0) * m;
    }
  } else if (pick.kind === "extra-food") {
    const food = allFoods.find((fd) => fd.id === pick.resolvedFoodId);
    if (food) {
      const grams = pick.grams || 100;
      const factor = grams / 100;
      cal = food.calories * factor;
      p = food.protein * factor;
      c = food.carbs * factor;
      f = food.fat * factor;
      fib = (food.fiber || 0) * factor;
    }
  } else if (pick.kind === "custom") {
    cal = pick.customCalories || 0;
  }
  return { calories: cal, protein: p, carbs: c, fat: f, fiber: fib };
}

function buildMacrosFromPicks(
  slots: TemplateMealSlot[],
  picks: Record<string, CheckInPick[]>,
  skippedSlots: Set<string>,
  allDishes: Dish[],
  allFoods: Food[]
) {
  const meals: MaxMeal[] = slots.map((slot) => {
    if (skippedSlots.has(slot.id) || slot.isSkipped) return { isSkipped: true, components: [] };
    return {
      isSkipped: false,
      components: slot.components
        .filter((c) => c.dishes.length > 0)
        .map((comp) => ({
          alternatives: (picks[comp.id] || []).map((pick) => macrosForPick(pick, comp, allDishes, allFoods)),
        })),
    };
  });
  // calculateDailyMaxTargets uses max-per-component; here we pass ALL picks as
  // alternatives so we'd lose extras. Instead, sum directly:
  return meals.reduce(
    (total, meal) => {
      if (meal.isSkipped) return total;
      for (const comp of meal.components) {
        for (const alt of comp.alternatives) {
          total.calories += alt.calories;
          total.protein += alt.protein;
          total.carbs += alt.carbs;
          total.fat += alt.fat;
          total.fiber += alt.fiber;
        }
      }
      return total;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

function getMealLoggedCalories(
  slot: TemplateMealSlot,
  picks: Record<string, CheckInPick[]>,
  skippedSlots: Set<string>,
  allDishes: Dish[],
  allFoods: Food[]
): number | undefined {
  if (skippedSlots.has(slot.id) || slot.isSkipped) return undefined;
  let cal = 0;
  for (const comp of slot.components) {
    for (const pick of picks[comp.id] || []) {
      cal += macrosForPick(pick, comp, allDishes, allFoods).calories;
    }
  }
  return cal > 0 ? Math.round(cal) : undefined;
}

function countDecidedMeals(
  slots: TemplateMealSlot[],
  picks: Record<string, CheckInPick[]>,
  skippedSlots: Set<string>
) {
  let decided = 0;
  let total = 0;
  for (const slot of slots) {
    if (slot.isSkipped) continue;
    const renderable = slot.components.filter((c) => c.dishes.length > 0);
    if (renderable.length === 0) continue;
    total++;
    if (skippedSlots.has(slot.id)) {
      decided++;
      continue;
    }
    const allPicked = renderable.every((c) => (picks[c.id] || []).length > 0);
    if (allPicked) decided++;
  }
  return { decided, total };
}

// ─── Page ─────────────────────────────────────────────────────────────────

function FoodCheckInPageInner() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const { unit: weightUnit, setUnit: setWeightUnit } = useWeightUnit();

  const [assignment, setAssignment] = useState<TemplateAssignment | null>(null);
  const [todaySlots, setTodaySlots] = useState<TemplateMealSlot[]>([]);
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [existingCheckIn, setExistingCheckIn] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  // Daily pulse fields
  const [weight, setWeight] = useState(""); // displayed in current unit
  const [steps, setSteps] = useState("");
  const [weightTraining, setWeightTraining] = useState<"yes" | "no" | "rest" | "">("");
  const [notes, setNotes] = useState("");

  // Multi-select picks per component
  const [picks, setPicks] = useState<Record<string, CheckInPick[]>>({});
  const [skippedSlots, setSkippedSlots] = useState<Set<string>>(new Set());

  const today = getTodayLocal();

  useEffect(() => {
    if (isDemo) {
      setTodaySlots(buildDemoSlots());
      setLoading(false);
      return;
    }
    if (user) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isDemo]);

  // Re-format weight input when unit changes (preserve underlying kg)
  const [weightKg, setWeightKg] = useState<number | null>(null);
  useEffect(() => {
    if (weightKg != null) {
      setWeight(fromKg(weightKg, weightUnit).toFixed(1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightUnit]);

  // When user types weight, sync underlying kg
  useEffect(() => {
    const n = parseFloat(weight);
    if (!isNaN(n)) setWeightKg(toKg(n, weightUnit));
    else setWeightKg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weight]);

  async function loadData() {
    if (!user) return;
    const [assignmentData, checkIn, foods] = await Promise.all([
      getClientActiveAssignment(user.id),
      getFoodCheckIn(user.id, today),
      getFoods(),
    ]);
    setAssignment(assignmentData);
    setAllFoods(foods);

    // Dishes belong to the coach, not the client. Use the coach id from the
    // active assignment so the "Add extra → Dish" picker shows the coach's
    // library.
    if (assignmentData?.coachId) {
      const dishes = await getDishes(assignmentData.coachId).catch(() => [] as Dish[]);
      setAllDishes(dishes);
    }

    if (checkIn) {
      setExistingCheckIn(checkIn);
      if (checkIn.weight != null) {
        setWeightKg(checkIn.weight);
        setWeight(fromKg(checkIn.weight, weightUnit).toFixed(1));
      }
      if (checkIn.steps != null) setSteps(String(checkIn.steps));
      if (checkIn.weightTraining) setWeightTraining(checkIn.weightTraining as any);
      if (checkIn.notes) setNotes(checkIn.notes);

      const existingPicks: Record<string, CheckInPick[]> = {};
      const existingSkipped = new Set<string>();
      const componentLookup = new Map<string, MealSlotComponent>();
      if (assignmentData?.template) {
        for (const slot of assignmentData.template.mealSlots || []) {
          for (const comp of slot.components || []) componentLookup.set(comp.id, comp);
        }
      }

      for (const item of checkIn.items || []) {
        if (!item.componentId) continue;
        if (item.isSkipped) {
          if (item.slotId) existingSkipped.add(item.slotId);
          continue;
        }
        const comp = componentLookup.get(item.componentId);
        if (!comp) continue;

        let pick: CheckInPick | null = null;

        if (item.dishId) {
          // Match a prescribed alternative (dish), else treat as extra dish
          const msd = comp.dishes.find((d) => d.dishId === item.dishId);
          if (msd) {
            pick = {
              localId: crypto.randomUUID(),
              kind: "alternative",
              refId: msd.id,
              resolvedDishId: msd.dishId,
              multiplier: 1,
            };
          } else {
            pick = {
              localId: crypto.randomUUID(),
              kind: "extra-dish",
              refId: item.dishId,
              resolvedDishId: item.dishId,
              multiplier: 1,
            };
          }
        } else if (item.customName) {
          // Try food alternative match
          const foodMsd = comp.dishes.find((d) => {
            if (!d.foodId || !d.food) return false;
            const qty = d.foodQuantity || 100;
            return item.customName === `${d.food.name} (${qty}g)`;
          });
          if (foodMsd) {
            pick = {
              localId: crypto.randomUUID(),
              kind: "alternative",
              refId: foodMsd.id,
              resolvedFoodId: foodMsd.foodId,
              grams: foodMsd.foodQuantity || 100,
            };
          } else {
            // Unmatched custom — could be extra-food (parsed name with grams) or fully custom
            const m = /^(.+) \((\d+(?:\.\d+)?)g\)$/.exec(item.customName);
            if (m) {
              const food = foods.find((fd) => fd.name === m[1]);
              if (food) {
                pick = {
                  localId: crypto.randomUUID(),
                  kind: "extra-food",
                  refId: food.id,
                  resolvedFoodId: food.id,
                  grams: parseFloat(m[2]),
                  customName: item.customName,
                  customCalories: item.customCalories ?? undefined,
                };
              }
            }
            if (!pick) {
              pick = {
                localId: crypto.randomUUID(),
                kind: "custom",
                customName: item.customName,
                customCalories: item.customCalories ?? 0,
              };
            }
          }
        }

        if (pick) {
          if (!existingPicks[item.componentId]) existingPicks[item.componentId] = [];
          existingPicks[item.componentId].push(pick);
        }
      }

      setPicks(existingPicks);
      setSkippedSlots(existingSkipped);
    }

    if (assignmentData?.template) {
      setTodaySlots(assignmentData.template.mealSlots || []);
    }
    setLoading(false);
  }

  // ── Selection handlers ────────────────────────────────────────────────

  function handleChangePicks(componentId: string, next: CheckInPick[]) {
    setPicks((prev) => ({ ...prev, [componentId]: next }));
  }

  function handleSkipSlot(slotId: string, components: MealSlotComponent[]) {
    setSkippedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) {
        next.delete(slotId);
      } else {
        next.add(slotId);
        // Clear picks in this slot
        const newPicks = { ...picks };
        for (const comp of components) delete newPicks[comp.id];
        setPicks(newPicks);
      }
      return next;
    });
  }

  // ── Derived ──────────────────────────────────────────────────────────

  const macros = useMemo(
    () => buildMacrosFromPicks(todaySlots, picks, skippedSlots, allDishes, allFoods),
    [todaySlots, picks, skippedSlots, allDishes, allFoods]
  );
  const mealsCount = useMemo(
    () => countDecidedMeals(todaySlots, picks, skippedSlots),
    [todaySlots, picks, skippedSlots]
  );

  const targets = assignment?.template
    ? {
        calories: assignment.template.dailyCalories,
        protein: assignment.template.dailyProtein,
        carbs: assignment.template.dailyCarbs,
        fat: assignment.template.dailyFat,
        fiber: assignment.template.dailyFiber,
      }
    : undefined;
  const hasAnyTarget =
    targets &&
    (targets.calories != null ||
      targets.protein != null ||
      targets.carbs != null ||
      targets.fat != null ||
      targets.fiber != null);

  // ── Submit ───────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!user || !assignment) return;
    setSubmitting(true);
    setError(null);

    // Build flat items list from picks
    const items: Array<{
      slotId: string | null;
      componentId: string | null;
      dishId: string | null;
      isSkipped: boolean;
      customName?: string;
      customCalories?: number;
    }> = [];

    for (const slot of todaySlots) {
      const isSkipped = skippedSlots.has(slot.id);
      for (const comp of slot.components) {
        if (comp.dishes.length === 0) continue;
        if (isSkipped) {
          items.push({
            slotId: slot.id,
            componentId: comp.id,
            dishId: null,
            isSkipped: true,
          });
          continue;
        }
        const compPicks = picks[comp.id] || [];
        if (compPicks.length === 0) continue;
        for (const pick of compPicks) {
          let dishId: string | null = null;
          let customName: string | undefined;
          let customCalories: number | undefined;
          if (pick.kind === "alternative") {
            const msd = comp.dishes.find((d) => d.id === pick.refId);
            if (msd?.dishId) {
              dishId = msd.dishId;
            } else if (msd?.foodId && msd.food) {
              const grams = msd.foodQuantity || 100;
              customName = `${msd.food.name} (${grams}g)`;
              customCalories = Math.round((msd.food.calories * grams) / 100);
            }
          } else if (pick.kind === "extra-dish") {
            dishId = pick.resolvedDishId || null;
          } else if (pick.kind === "extra-food") {
            customName = pick.customName;
            customCalories = pick.customCalories;
          } else if (pick.kind === "custom") {
            customName = pick.customName;
            customCalories = pick.customCalories;
          }
          items.push({
            slotId: slot.id,
            componentId: comp.id,
            dishId,
            isSkipped: false,
            customName,
            customCalories,
          });
        }
      }
    }

    // Adherence score using the alternative picks
    const components = todaySlots.flatMap((slot) =>
      slot.components.map((comp) => ({
        componentId: comp.id,
        slotId: slot.id,
        prescribedDishIds: comp.dishes.map((d) => d.dishId || d.id).filter(Boolean) as string[],
      }))
    );
    const selectionsList: Array<{ componentId: string; dishId: string | null; isSkipped: boolean }> = [];
    for (const slot of todaySlots) {
      const isSkipped = skippedSlots.has(slot.id);
      for (const comp of slot.components) {
        if (comp.dishes.length === 0) continue;
        if (isSkipped) {
          selectionsList.push({ componentId: comp.id, dishId: null, isSkipped: true });
          continue;
        }
        const altPick = (picks[comp.id] || []).find((p) => p.kind === "alternative");
        if (altPick) {
          selectionsList.push({
            componentId: comp.id,
            dishId: altPick.resolvedDishId || altPick.refId || null,
            isSkipped: false,
          });
        }
      }
    }
    const isIF = assignment.template?.planType === "intermittent_fasting";
    const templateSkippedSlotIds = todaySlots.filter((s) => s.isSkipped).map((s) => s.id);
    const adherenceScore = calculateAdherenceScore(components, selectionsList, isIF, templateSkippedSlotIds);

    const { error: err } = await createFoodCheckIn({
      clientId: user.id,
      assignmentId: assignment.id,
      date: today,
      totalCalories: Math.round(macros.calories),
      totalProtein: Math.round(macros.protein),
      totalCarbs: Math.round(macros.carbs),
      totalFat: Math.round(macros.fat),
      adherenceScore: Math.round(adherenceScore),
      weight: weightKg,
      steps: steps ? parseInt(steps, 10) : null,
      weightTraining: weightTraining || null,
      notes: notes.trim() || null,
      items,
    });

    if (err) setError(err);
    else setSubmitted(true);
    setSubmitting(false);
  }

  // ── Render ───────────────────────────────────────────────────────────

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );

  if (!isDemo && (!assignment || !assignment.template)) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-white">Food Check-in</h1>
        <Card className="p-8 text-center">
          <p className="text-zinc-400 text-sm">No plan assigned yet.</p>
          <p className="text-zinc-600 text-xs mt-1">Contact your coach to get a diet plan assigned.</p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-white">Food Check-in</h1>
        <Card className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-white font-semibold">Logged successfully!</p>
          <p className="text-zinc-500 text-sm mt-1">Your coach can now see today&apos;s check-in.</p>
        </Card>
      </div>
    );
  }

  const submitLabel = submitting
    ? "Submitting..."
    : mealsCount.decided < mealsCount.total
    ? `Submit anyway · ${mealsCount.total - mealsCount.decided} pending`
    : existingCheckIn
    ? "Update check-in"
    : "Submit check-in";

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-bold text-white">Daily Check-in</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {existingCheckIn ? "Update today's log" : "Log your meals & body for today"}
        </p>
      </div>

      {existingCheckIn && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <p className="text-xs text-emerald-300">Submitted earlier — edit and resubmit anytime.</p>
        </div>
      )}

      {/* Daily Pulse */}
      <DailyPulseStrip
        weight={weight}
        onWeightChange={setWeight}
        weightUnit={weightUnit}
        onWeightUnitChange={setWeightUnit}
        steps={steps}
        onStepsChange={setSteps}
        weightTraining={weightTraining}
        onWeightTrainingChange={setWeightTraining}
        mealsDecided={mealsCount.decided}
        mealsTotal={mealsCount.total}
      />

      {/* Macro progress vs targets */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <MacroSummary
          calories={macros.calories}
          protein={macros.protein}
          carbs={macros.carbs}
          fat={macros.fat}
          fiber={macros.fiber}
          targets={hasAnyTarget ? targets : undefined}
        />
        {!hasAnyTarget && (
          <p className="mt-3 text-[11px] text-zinc-500 text-center">
            Coach hasn&apos;t set daily targets yet — progress bars will show once they do.
          </p>
        )}
      </div>

      {/* Meal cards */}
      <div className="space-y-3">
        {todaySlots
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((slot) => (
            <MealCard
              key={slot.id}
              slot={slot}
              picks={picks}
              isSlotSkipped={skippedSlots.has(slot.id)}
              allDishes={allDishes}
              allFoods={allFoods}
              onChangePicks={handleChangePicks}
              onSkipSlot={() => handleSkipSlot(slot.id, slot.components)}
              onDishClick={setSelectedDish}
              loggedCalories={getMealLoggedCalories(slot, picks, skippedSlots, allDishes, allFoods)}
              disabled={isDemo}
            />
          ))}
      </div>

      {/* Notes */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <label className="block text-xs text-zinc-500 mb-1.5">Notes for coach (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did today feel? Any cravings, energy dips, wins?"
          rows={2}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Sticky submit */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="gold"
            className={cn("w-full h-12 text-base rounded-xl")}
            onClick={handleSubmit}
            disabled={isDemo || submitting}
          >
            {isDemo ? "Demo mode — submit disabled" : submitLabel}
          </Button>
        </div>
      </div>

      {/* Dish detail sheet */}
      {selectedDish && <DishDetailSheet dish={selectedDish} onClose={() => setSelectedDish(null)} />}
    </div>
  );
}
