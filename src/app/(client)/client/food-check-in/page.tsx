"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsDemo } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getClientActiveAssignment, getFoodCheckIn, createFoodCheckIn } from "@/lib/db";
import { calculateDailyMacros, calculateAdherenceScore } from "@/lib/macro-calc";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { MealSlotView } from "@/components/shared/meal-slot-view";
import { MacroSummary } from "@/components/shared/macro-summary";
import type { TemplateAssignment, TemplateMealSlot, MealSlotComponent, Dish } from "@/types";

export default function FoodCheckInPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <FoodCheckInPageInner />
    </Suspense>
  );
}

// Demo data
const demoDishes: Dish[] = [
  { id: "d1", coachId: "demo", name: "Overnight Oats", emoji: "🥣", componentCategory: "carbohydrate", totalCalories: 320, totalProtein: 22, totalCarbs: 38, totalFat: 10, items: [], createdAt: "" },
  { id: "d2", coachId: "demo", name: "Smoothie", emoji: "🥤", componentCategory: "carbohydrate", totalCalories: 250, totalProtein: 28, totalCarbs: 30, totalFat: 4, items: [], createdAt: "" },
  { id: "d3", coachId: "demo", name: "Chicken Breast 150g", emoji: "🍗", componentCategory: "protein", totalCalories: 248, totalProtein: 46, totalCarbs: 0, totalFat: 5, items: [], createdAt: "" },
  { id: "d4", coachId: "demo", name: "Palak Paneer 60g", emoji: "🥬", componentCategory: "protein", totalCalories: 180, totalProtein: 12, totalCarbs: 6, totalFat: 12, items: [], createdAt: "" },
  { id: "d5", coachId: "demo", name: "Mixed Salad", emoji: "🥗", componentCategory: "fiber", totalCalories: 45, totalProtein: 2, totalCarbs: 8, totalFat: 1, items: [], createdAt: "" },
];

function buildDemoSlots(): TemplateMealSlot[] {
  return [
    {
      id: "slot-breakfast", templateId: "demo-template", name: "Breakfast", targetCalories: 350, isSkipped: false, sortOrder: 0,
      components: [{
        id: "comp-b-carb", slotId: "slot-breakfast", componentCategory: "carbohydrate", sortOrder: 0,
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

function FoodCheckInPageInner() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [assignment, setAssignment] = useState<TemplateAssignment | null>(null);
  const [todaySlots, setTodaySlots] = useState<TemplateMealSlot[]>([]);
  const [existingCheckIn, setExistingCheckIn] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weight, setWeight] = useState("");

  // Selections: componentId -> dishId | "other" | "skipped"
  const [selections, setSelections] = useState<Record<string, string>>({});
  // Other food details: componentId -> { name, calories }
  const [otherDetails, setOtherDetails] = useState<Record<string, { name: string; calories: string }>>({});
  // Skipped slots
  const [skippedSlots, setSkippedSlots] = useState<Set<string>>(new Set());

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isDemo) {
      const slots = buildDemoSlots();
      setTodaySlots(slots);
      // Pre-select first option for demo
      const demoSelections: Record<string, string> = {};
      for (const slot of slots) {
        for (const comp of slot.components) {
          if (comp.dishes.length > 0) {
            demoSelections[comp.id] = comp.dishes[0].dishId;
          }
        }
      }
      setSelections(demoSelections);
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const [assignmentData, checkIn] = await Promise.all([
      getClientActiveAssignment(user.id),
      getFoodCheckIn(user.id, today),
    ]);
    setAssignment(assignmentData);

    if (checkIn) {
      setExistingCheckIn(checkIn);
      if (checkIn.weight) setWeight(String(checkIn.weight));
      // Populate selections from existing check-in
      const existingSelections: Record<string, string> = {};
      const existingSkipped = new Set<string>();
      for (const item of checkIn.items || []) {
        if (!item.componentId) continue;
        if (item.isSkipped) {
          existingSelections[item.componentId] = "skipped";
          if (item.slotId) existingSkipped.add(item.slotId);
        } else if (item.dishId) {
          existingSelections[item.componentId] = item.dishId;
        }
      }
      setSelections(existingSelections);
      setSkippedSlots(existingSkipped);
    }

    if (assignmentData?.template) {
      setTodaySlots(assignmentData.template.mealSlots || []);
    }
    setLoading(false);
  }

  function handleSelectDish(componentId: string, dishId: string) {
    setSelections((prev) => ({ ...prev, [componentId]: dishId }));
  }

  function handleSkipSlot(slotId: string, components: MealSlotComponent[]) {
    setSkippedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) {
        next.delete(slotId);
        // Remove skipped state from components
        const newSelections = { ...selections };
        for (const comp of components) {
          if (newSelections[comp.id] === "skipped") {
            delete newSelections[comp.id];
          }
        }
        setSelections(newSelections);
      } else {
        next.add(slotId);
        // Mark all components as skipped
        const newSelections = { ...selections };
        for (const comp of components) {
          newSelections[comp.id] = "skipped";
        }
        setSelections(newSelections);
      }
      return next;
    });
  }

  // Calculate running macros
  function getRunningMacros() {
    const selectedDishes: Dish[] = [];
    let otherCalories = 0;
    for (const slot of todaySlots) {
      if (skippedSlots.has(slot.id)) continue;
      for (const comp of slot.components) {
        const sel = selections[comp.id];
        if (sel && sel !== "skipped" && sel !== "other") {
          const msd = comp.dishes.find((d) => d.dishId === sel);
          if (msd?.dish) selectedDishes.push(msd.dish);
        } else if (sel === "other") {
          const other = otherDetails[comp.id];
          if (other?.calories) otherCalories += parseFloat(other.calories) || 0;
        }
      }
    }
    const macros = calculateDailyMacros(selectedDishes);
    return { ...macros, calories: macros.calories + otherCalories };
  }

  async function handleSubmit() {
    if (!user || !assignment) return;
    setSubmitting(true);
    setError(null);

    // Build components list for adherence calculation
    const components = todaySlots.flatMap((slot) =>
      slot.components.map((comp) => ({
        componentId: comp.id,
        slotId: slot.id,
        prescribedDishIds: comp.dishes.map((d) => d.dishId),
      }))
    );

    const selectionsList = Object.entries(selections).map(([componentId, value]) => ({
      componentId,
      dishId: (value === "skipped" || value === "other") ? null : value,
      isSkipped: value === "skipped",
    }));

    const isIF = assignment.template?.planType === "intermittent_fasting";
    const templateSkippedSlotIds = todaySlots.filter((s) => s.isSkipped).map((s) => s.id);

    const adherenceScore = calculateAdherenceScore(
      components,
      selectionsList,
      isIF,
      templateSkippedSlotIds
    );

    const macros = getRunningMacros();

    const items = Object.entries(selections)
      .map(([componentId, value]) => {
        const slot = todaySlots.find((s) => s.components.some((c) => c.id === componentId));
        const other = otherDetails[componentId];
        return {
          slotId: slot?.id || null,
          componentId: componentId || null,
          dishId: (value === "skipped" || value === "other") ? null : value,
          isSkipped: value === "skipped",
          customName: value === "other" ? (other?.name || "Other") : undefined,
          customCalories: value === "other" && other?.calories ? parseFloat(other.calories) : undefined,
        };
      })
      .filter((item) => item.slotId && item.componentId);

    const { error: err } = await createFoodCheckIn({
      clientId: user.id,
      assignmentId: assignment.id,
      date: today,
      totalCalories: Math.round(macros.calories),
      totalProtein: Math.round(macros.protein),
      totalCarbs: Math.round(macros.carbs),
      totalFat: Math.round(macros.fat),
      adherenceScore: Math.round(adherenceScore),
      weight: weight ? parseFloat(weight) : null,
      items,
    });

    if (err) {
      setError(err);
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  if (loading) return (
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
          <p className="text-white font-semibold">Meals logged successfully!</p>
          <p className="text-zinc-500 text-sm mt-1">Your coach can now see today&apos;s food log.</p>
        </Card>
      </div>
    );
  }

  const macros = getRunningMacros();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Daily Check-in</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {existingCheckIn ? "Update today's log" : "Log your food & weight for today"}
        </p>
      </div>

      {existingCheckIn && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <p className="text-xs text-emerald-300">Already submitted today — you can update your selections below.</p>
        </div>
      )}

      {/* Running macro totals */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <MacroSummary calories={macros.calories} protein={macros.protein} carbs={macros.carbs} fat={macros.fat} />
      </div>

      {/* Weight input */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <label className="block text-xs text-zinc-500 mb-1.5">Today&apos;s Weight (kg)</label>
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="e.g. 72.5"
          className="w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
      </div>

      {/* Meal slots */}
      {/* Meal slots */}
      <div className="space-y-3">
        {todaySlots
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((slot) => (
            <div key={slot.id}>
              <MealSlotView
                slot={slot}
                mode="select"
                selections={selections}
                isSlotSkipped={skippedSlots.has(slot.id)}
                onSelectDish={handleSelectDish}
                onSkipSlot={() => handleSkipSlot(slot.id, slot.components)}
                onSelectOther={(componentId) => {
                  setSelections((prev) => ({ ...prev, [componentId]: "other" }));
                  if (!otherDetails[componentId]) {
                    setOtherDetails((prev) => ({ ...prev, [componentId]: { name: "", calories: "" } }));
                  }
                }}
                disabled={isDemo}
              />
              {/* Inline "Other" detail inputs for this slot */}
              {slot.components
                .filter((comp) => selections[comp.id] === "other")
                .map((comp) => (
                  <div key={comp.id} className="mt-2 ml-4 flex gap-2">
                    <input
                      type="text"
                      value={otherDetails[comp.id]?.name || ""}
                      onChange={(e) => setOtherDetails((prev) => ({ ...prev, [comp.id]: { ...prev[comp.id], name: e.target.value } }))}
                      placeholder="What did you eat?"
                      className="flex-1 h-10 rounded-xl border border-purple-500/20 bg-purple-500/5 px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                    <input
                      type="number"
                      value={otherDetails[comp.id]?.calories || ""}
                      onChange={(e) => setOtherDetails((prev) => ({ ...prev, [comp.id]: { ...prev[comp.id], calories: e.target.value } }))}
                      placeholder="cal"
                      className="w-20 h-10 rounded-xl border border-purple-500/20 bg-purple-500/5 px-3 text-sm text-white text-center placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>
                ))}
            </div>
          ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button
        variant="gold"
        className="w-full h-12 text-base rounded-xl"
        onClick={handleSubmit}
        disabled={isDemo || submitting}
      >
        {isDemo ? "Demo Mode — Submit Disabled" : submitting ? "Submitting..." : existingCheckIn ? "Update Check-in" : "Submit Check-in"}
      </Button>
    </div>
  );
}

