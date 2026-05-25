"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { useIsDemo } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getClientActiveAssignment } from "@/lib/db";
import { calculateDailyMacros } from "@/lib/macro-calc";
import { MealSlotView } from "@/components/shared/meal-slot-view";
import { MacroSummary } from "@/components/shared/macro-summary";
import { DishDetailSheet } from "@/components/shared/dish-detail-sheet";
import type { TemplateAssignment, TemplateMealSlot, Dish } from "@/types";

export default function ClientDietPlanPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <ClientDietPlanPageInner />
    </Suspense>
  );
}

// Demo mock data
const demoDishes: Dish[] = [
  { id: "d1", coachId: "demo", name: "Overnight Oats", emoji: "🥣", componentCategory: "carbs", totalCalories: 320, totalProtein: 22, totalCarbs: 38, totalFat: 10, items: [], createdAt: "" },
  { id: "d2", coachId: "demo", name: "Smoothie", emoji: "🥤", componentCategory: "carbs", totalCalories: 250, totalProtein: 28, totalCarbs: 30, totalFat: 4, items: [], createdAt: "" },
  { id: "d3", coachId: "demo", name: "Chicken Breast 150g", emoji: "🍗", componentCategory: "protein", totalCalories: 248, totalProtein: 46, totalCarbs: 0, totalFat: 5, items: [], createdAt: "" },
  { id: "d4", coachId: "demo", name: "Palak Paneer 60g", emoji: "🥬", componentCategory: "protein", totalCalories: 180, totalProtein: 12, totalCarbs: 6, totalFat: 12, items: [], createdAt: "" },
  { id: "d5", coachId: "demo", name: "Mixed Salad", emoji: "🥗", componentCategory: "fiber", totalCalories: 45, totalProtein: 2, totalCarbs: 8, totalFat: 1, items: [], createdAt: "" },
  { id: "d6", coachId: "demo", name: "Brown Rice 150g", emoji: "🍚", componentCategory: "carbs", totalCalories: 170, totalProtein: 4, totalCarbs: 36, totalFat: 1, items: [], createdAt: "" },
];

function buildDemoAssignment(): TemplateAssignment {
  return {
    id: "demo-assignment",
    templateId: "demo-template",
    clientId: "demo-client",
    coachId: "demo-coach",
    status: "active",
    template: {
      id: "demo-template",
      coachId: "demo-coach",
      name: "Demo Veg Plan",
      planType: "veg",
      mealSlots: [
        {
          id: "slot-breakfast",
          templateId: "demo-template",
          name: "Breakfast",
          targetCalories: 350,
          isSkipped: false,
          sortOrder: 0,
          components: [
            {
              id: "comp-b-carb",
              slotId: "slot-breakfast",
              componentCategory: "carbs",
              sortOrder: 0,
              dishes: [
                { id: "msd-1", componentId: "comp-b-carb", dishId: "d1", dish: demoDishes[0], sortOrder: 0 },
                { id: "msd-2", componentId: "comp-b-carb", dishId: "d2", dish: demoDishes[1], sortOrder: 1 },
              ],
            },
          ],
        },
        {
          id: "slot-lunch",
          templateId: "demo-template",
          name: "Lunch",
          targetCalories: 500,
          isSkipped: false,
          sortOrder: 1,
          components: [
            {
              id: "comp-l-protein",
              slotId: "slot-lunch",
              componentCategory: "protein",
              sortOrder: 0,
              dishes: [
                { id: "msd-3", componentId: "comp-l-protein", dishId: "d3", dish: demoDishes[2], sortOrder: 0 },
                { id: "msd-4", componentId: "comp-l-protein", dishId: "d4", dish: demoDishes[3], sortOrder: 1 },
              ],
            },
            {
              id: "comp-l-carb",
              slotId: "slot-lunch",
              componentCategory: "carbs",
              sortOrder: 1,
              dishes: [
                { id: "msd-5", componentId: "comp-l-carb", dishId: "d6", dish: demoDishes[5], sortOrder: 0 },
              ],
            },
            {
              id: "comp-l-fiber",
              slotId: "slot-lunch",
              componentCategory: "fiber",
              sortOrder: 2,
              dishes: [
                { id: "msd-6", componentId: "comp-l-fiber", dishId: "d5", dish: demoDishes[4], sortOrder: 0 },
              ],
            },
          ],
        },
        {
          id: "slot-dinner",
          templateId: "demo-template",
          name: "Dinner",
          targetCalories: 480,
          isSkipped: false,
          sortOrder: 2,
          components: [
            {
              id: "comp-d-protein",
              slotId: "slot-dinner",
              componentCategory: "protein",
              sortOrder: 0,
              dishes: [
                { id: "msd-7", componentId: "comp-d-protein", dishId: "d3", dish: demoDishes[2], sortOrder: 0 },
              ],
            },
            {
              id: "comp-d-fiber",
              slotId: "slot-dinner",
              componentCategory: "fiber",
              sortOrder: 1,
              dishes: [
                { id: "msd-8", componentId: "comp-d-fiber", dishId: "d5", dish: demoDishes[4], sortOrder: 0 },
              ],
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  };
}

function ClientDietPlanPageInner() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [assignment, setAssignment] = useState<TemplateAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  useEffect(() => {
    if (isDemo) {
      setAssignment(buildDemoAssignment());
      setLoading(false);
      return;
    }
    if (user) loadAssignment();
  }, [user, isDemo]);

  async function loadAssignment() {
    if (!user) return;
    const data = await getClientActiveAssignment(user.id);
    setAssignment(data);
    setLoading(false);
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  if (!assignment || !assignment.template) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-white">Diet Plan</h1>
        <Card className="p-8 text-center">
          <p className="text-zinc-400 text-sm">No plan assigned yet.</p>
          <p className="text-zinc-600 text-xs mt-1">Contact your coach to get a diet plan assigned.</p>
        </Card>
      </div>
    );
  }

  const template = assignment.template;

  // Calculate daily macros from all first-option dishes
  function getDailyMacros() {
    const dishes: Dish[] = [];
    for (const slot of template.mealSlots) {
      if (slot.isSkipped) continue;
      for (const comp of slot.components) {
        if (comp.dishes.length > 0 && comp.dishes[0].dish) {
          dishes.push(comp.dishes[0].dish);
        }
      }
    }
    return calculateDailyMacros(dishes);
  }

  const dayMacros = getDailyMacros();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">{template.name}</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Your daily diet plan</p>
      </div>

      {/* Daily macro totals */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <MacroSummary calories={dayMacros.calories} protein={dayMacros.protein} carbs={dayMacros.carbs} fat={dayMacros.fat} />
      </div>

      {/* Meal slots — each is its own card */}
      <div className="space-y-3">
        {template.mealSlots
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((slot) => (
            <MealSlotView key={slot.id} slot={slot} mode="view" onDishClick={setSelectedDish} />
          ))}
      </div>

      {/* Dish detail sheet */}
      {selectedDish && <DishDetailSheet dish={selectedDish} onClose={() => setSelectedDish(null)} />}
    </div>
  );
}

