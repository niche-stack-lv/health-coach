"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, SkipForward, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DishPickerModal } from "@/components/coach/dish-picker-modal";
import { FoodPicker } from "@/components/coach/food-picker";
import { MealSlotView } from "@/components/shared/meal-slot-view";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getDietTemplate, createDietTemplate, updateDietTemplate, deleteDietTemplate, getDishes } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { DietTemplate, PlanType, ComponentCategory, Dish } from "@/types";

export default function TemplateEditPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <TemplateEditPageInner />
    </Suspense>
  );
}

// ---- Types for local state ----

interface LocalComponent {
  localId: string;
  componentCategory: ComponentCategory;
  dishIds: string[];
}

interface LocalMealSlot {
  localId: string;
  name: string;
  targetCalories: string;
  isSkipped: boolean;
  components: LocalComponent[];
}

// ---- Constants ----

const PLAN_TYPE_OPTIONS: { value: PlanType; label: string }[] = [
  { value: "veg", label: "Veg" },
  { value: "nonveg", label: "Nonveg" },
  { value: "low_carb_nonveg", label: "Low Carb Nonveg" },
  { value: "intermittent_fasting", label: "Intermittent Fasting" },
];

const COMPONENT_CATEGORIES: ComponentCategory[] = ["carbohydrate", "protein", "fiber", "complete_meal"];

// ---- Demo template ----

const demoTemplate: DietTemplate = {
  id: "demo-template",
  coachId: "demo",
  name: "Demo Veg Plan",
  planType: "veg",
  mealSlots: [
    {
      id: "demo-slot-1",
      templateId: "demo-template",
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      sortOrder: 0,
      components: [
        { id: "demo-comp-1-1", slotId: "demo-slot-1", componentCategory: "carbohydrate" as ComponentCategory, sortOrder: 0, dishes: [] },
        { id: "demo-comp-1-2", slotId: "demo-slot-1", componentCategory: "protein" as ComponentCategory, sortOrder: 1, dishes: [] },
      ],
    },
    {
      id: "demo-slot-2",
      templateId: "demo-template",
      name: "Lunch",
      targetCalories: 600,
      isSkipped: false,
      sortOrder: 1,
      components: [
        { id: "demo-comp-2-1", slotId: "demo-slot-2", componentCategory: "carbohydrate" as ComponentCategory, sortOrder: 0, dishes: [] },
        { id: "demo-comp-2-2", slotId: "demo-slot-2", componentCategory: "protein" as ComponentCategory, sortOrder: 1, dishes: [] },
        { id: "demo-comp-2-3", slotId: "demo-slot-2", componentCategory: "fiber" as ComponentCategory, sortOrder: 2, dishes: [] },
      ],
    },
    {
      id: "demo-slot-3",
      templateId: "demo-template",
      name: "Dinner",
      targetCalories: 500,
      isSkipped: false,
      sortOrder: 2,
      components: [
        { id: "demo-comp-3-1", slotId: "demo-slot-3", componentCategory: "carbohydrate" as ComponentCategory, sortOrder: 0, dishes: [] },
        { id: "demo-comp-3-2", slotId: "demo-slot-3", componentCategory: "protein" as ComponentCategory, sortOrder: 1, dishes: [] },
        { id: "demo-comp-3-3", slotId: "demo-slot-3", componentCategory: "fiber" as ComponentCategory, sortOrder: 2, dishes: [] },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
};

// ---- Helpers ----

function createEmptySlot(name: string, sortOrder: number): LocalMealSlot {
  return {
    localId: crypto.randomUUID(),
    name,
    targetCalories: "",
    isSkipped: false,
    components: COMPONENT_CATEGORIES.map((cat) => ({
      localId: crypto.randomUUID(),
      componentCategory: cat,
      dishIds: [],
    })),
  };
}

function templateToLocalSlots(template: DietTemplate): LocalMealSlot[] {
  return template.mealSlots
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slot) => {
      // Build a map of existing components from DB
      const existingComps = new Map(
        slot.components.map((comp) => [comp.componentCategory, comp])
      );
      // Ensure all 4 categories are present (fill missing ones with empty)
      const components = COMPONENT_CATEGORIES.map((cat) => {
        const existing = existingComps.get(cat);
        if (existing) {
          return {
            localId: existing.id || crypto.randomUUID(),
            componentCategory: existing.componentCategory,
            dishIds: existing.dishes.map((d) => d.dishId),
          };
        }
        return {
          localId: crypto.randomUUID(),
          componentCategory: cat,
          dishIds: [] as string[],
        };
      });
      return {
        localId: slot.id || crypto.randomUUID(),
        name: slot.name,
        targetCalories: slot.targetCalories?.toString() || "",
        isSkipped: slot.isSkipped,
        components,
      };
    });
}

// ---- Main Component ----

function TemplateEditPageInner() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();

  const templateId = params.id as string;
  const isCreateMode = templateId === "create";

  // Form state
  const [name, setName] = useState("");
  const [planType, setPlanType] = useState<PlanType | null>(null);
  const [mealSlots, setMealSlots] = useState<LocalMealSlot[]>(() => [
    createEmptySlot("Meal 1", 0),
    createEmptySlot("Meal 2", 1),
    createEmptySlot("Meal 3", 2),
    createEmptySlot("Meal 4", 3),
  ]);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPlan, setIsPlan] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; planType?: string; slots?: string }>({});

  // Dishes library for the picker
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [dishPickerState, setDishPickerState] = useState<{
    open: boolean;
    slotIdx: number;
    compIdx: number;
  } | null>(null);
  const [foodPickerState, setFoodPickerState] = useState<{
    open: boolean;
    slotIdx: number;
    compIdx: number;
  } | null>(null);

  // Load template in edit mode
  useEffect(() => {
    if (isCreateMode && isDemo) {
      setName(demoTemplate.name);
      setPlanType(demoTemplate.planType);
      setMealSlots(templateToLocalSlots(demoTemplate));
      return;
    }
    if (isCreateMode) {
      // Expand all slots by default in create mode
      setExpandedSlots(new Set(mealSlots.map((s) => s.localId)));
      return;
    }
    if (isDemo) {
      setName(demoTemplate.name);
      setPlanType(demoTemplate.planType);
      setMealSlots(templateToLocalSlots(demoTemplate));
      setLoading(false);
      return;
    }
    if (user) loadTemplate();
  }, [user, isDemo, templateId]);

  // Load dishes library
  useEffect(() => {
    if (isDemo) return;
    if (user) loadDishes();
  }, [user, isDemo]);

  async function loadTemplate() {
    const template = await getDietTemplate(templateId);
    if (!template) {
      router.push(`/coach/diet-templates${demoSuffix}`);
      return;
    }
    setName(template.name);
    setPlanType(template.planType);
    // Check if this is a plan (is_template = false) by querying directly
    const { getSupabase } = await import("@/lib/supabase");
    const { data: raw } = await getSupabase().from("diet_templates").select("is_template").eq("id", templateId).single();
    if (raw && raw.is_template === false) setIsPlan(true);
    const slots = templateToLocalSlots(template);
    setMealSlots(slots);
    setExpandedSlots(new Set(slots.map((s) => s.localId)));
    setLoading(false);
  }

  async function loadDishes() {
    if (!user) return;
    const data = await getDishes(user.id);
    setAllDishes(data);
  }

  // ---- Validation ----

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Template name is required";
    if (!planType) newErrors.planType = "Select a plan type";

    const hasValidSlot = mealSlots.some(
      (slot) =>
        !slot.isSkipped &&
        slot.components.some((comp) => comp.dishIds.length > 0)
    );
    if (!hasValidSlot) {
      newErrors.slots = "At least one non-skipped slot needs a dish assigned";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ---- Save ----

  async function handleSave() {
    if (!validate()) return;
    if (isDemo || !user) return;
    setSaving(true);

    const templateInput = {
      coachId: user.id,
      name: name.trim(),
      planType: planType!,
      mealSlots: mealSlots.map((slot, slotIdx) => ({
        name: slot.name,
        targetCalories: slot.targetCalories ? parseFloat(slot.targetCalories) : null,
        isSkipped: slot.isSkipped,
        sortOrder: slotIdx,
        components: slot.components.map((comp, compIdx) => ({
          componentCategory: comp.componentCategory,
          sortOrder: compIdx,
          dishIds: comp.dishIds,
        })),
      })),
    };

    if (isCreateMode) {
      const { error } = await createDietTemplate(templateInput);
      if (error) {
        setErrors({ name: error });
        setSaving(false);
        return;
      }
    } else {
      const { error } = await updateDietTemplate(templateId, {
        name: templateInput.name,
        planType: templateInput.planType,
        mealSlots: templateInput.mealSlots,
      });
      if (error) {
        setErrors({ name: error });
        setSaving(false);
        return;
      }
    }

    router.push(`/coach/diet-templates${demoSuffix}`);
  }

  // ---- Delete ----

  async function handleDelete() {
    if (isDemo || isCreateMode) return;
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    const { error } = await deleteDietTemplate(templateId);
    if (error) {
      setErrors({ name: error });
      setDeleting(false);
      return;
    }
    router.push(`/coach/diet-templates${demoSuffix}`);
  }

  // ---- Slot management ----

  function toggleSlotExpanded(localId: string) {
    setExpandedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(localId)) next.delete(localId);
      else next.add(localId);
      return next;
    });
  }

  function addSlot() {
    if (mealSlots.length >= 6) return;
    const newSlot = createEmptySlot("Meal " + (mealSlots.length + 1), mealSlots.length);
    setMealSlots((prev) => [...prev, newSlot]);
    setExpandedSlots((prev) => new Set([...prev, newSlot.localId]));
  }

  function removeSlot(slotIdx: number) {
    if (mealSlots.length <= 1) return;
    setMealSlots((prev) => prev.filter((_, i) => i !== slotIdx));
  }

  function updateSlotName(slotIdx: number, value: string) {
    setMealSlots((prev) => {
      const updated = [...prev];
      updated[slotIdx] = { ...updated[slotIdx], name: value };
      return updated;
    });
  }

  function updateSlotCalories(slotIdx: number, value: string) {
    setMealSlots((prev) => {
      const updated = [...prev];
      updated[slotIdx] = { ...updated[slotIdx], targetCalories: value };
      return updated;
    });
  }

  function toggleSlotSkipped(slotIdx: number) {
    setMealSlots((prev) => {
      const updated = [...prev];
      updated[slotIdx] = { ...updated[slotIdx], isSkipped: !updated[slotIdx].isSkipped };
      return updated;
    });
  }

  // ---- Dish management ----

  function addDishToComponent(slotIdx: number, compIdx: number, dishId: string) {
    setMealSlots((prev) => {
      const updated = [...prev];
      const slot = { ...updated[slotIdx], components: [...updated[slotIdx].components] };
      const comp = { ...slot.components[compIdx], dishIds: [...slot.components[compIdx].dishIds] };
      if (!comp.dishIds.includes(dishId)) {
        comp.dishIds.push(dishId);
      }
      slot.components[compIdx] = comp;
      updated[slotIdx] = slot;
      return updated;
    });
    setDishPickerState(null);
  }

  function removeDishFromComponent(slotIdx: number, compIdx: number, dishId: string) {
    setMealSlots((prev) => {
      const updated = [...prev];
      const slot = { ...updated[slotIdx], components: [...updated[slotIdx].components] };
      const comp = { ...slot.components[compIdx], dishIds: slot.components[compIdx].dishIds.filter((id) => id !== dishId) };
      slot.components[compIdx] = comp;
      updated[slotIdx] = slot;
      return updated;
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={isPlan ? `/coach/plans${demoSuffix}` : `/coach/diet-templates${demoSuffix}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-white">
          {isCreateMode ? "Create Template" : isPlan ? "Diet Plan" : "Edit Template"}
        </h1>
      </div>

      {isDemo && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
          Demo mode — changes won&apos;t be saved
        </div>
      )}

      {/* Name */}
      <Card className="p-5 mb-4">
        <label className="block text-xs text-zinc-500 mb-1.5">Template Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
          placeholder="e.g. Veg Weight Loss Plan"
          className="w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
      </Card>

      {/* Plan Type */}
      <Card className="p-5 mb-4">
        <label className="block text-xs text-zinc-500 mb-2">Plan Type</label>
        <div className="grid grid-cols-2 gap-2">
          {PLAN_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setPlanType(opt.value); setErrors((prev) => ({ ...prev, planType: undefined })); }}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                planType === opt.value
                  ? "border-gold/50 bg-gold/10 text-gold"
                  : "border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.planType && <p className="text-xs text-red-400 mt-2">{errors.planType}</p>}
      </Card>

      {/* Meal Slots */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-zinc-500">Meal Slots</label>
        </div>

        {errors.slots && <p className="text-xs text-red-400 mb-3">{errors.slots}</p>}

        {/* Meal slots list */}
        <div className="space-y-3">
          {mealSlots.map((slot, slotIdx) => {
            const isExpanded = expandedSlots.has(slot.localId);
            return (
              <div
                key={slot.localId}
                className={cn(
                  "rounded-xl border",
                  slot.isSkipped
                    ? "border-zinc-700/50 bg-zinc-900/30 opacity-60"
                    : "border-white/[0.06] bg-white/[0.02]"
                )}
              >
                {/* Slot header — always visible */}
                <div className="flex items-center gap-2 p-4 cursor-pointer" onClick={() => toggleSlotExpanded(slot.localId)}>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <input
                      type="text"
                      value={slot.name}
                      onChange={(e) => updateSlotName(slotIdx, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Meal name"
                      className="flex-1 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                    <input
                      type="number"
                      value={slot.targetCalories}
                      onChange={(e) => updateSlotCalories(slotIdx, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="kcal"
                      className="w-20 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white text-center placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                  </div>
                  {planType === "intermittent_fasting" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSlotSkipped(slotIdx); }}
                      title={slot.isSkipped ? "Unskip" : "Skip (IF)"}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        slot.isSkipped
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-zinc-600 hover:text-purple-400 hover:bg-purple-500/10"
                      )}
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSlot(slotIdx); }}
                    disabled={mealSlots.length <= 1}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="text-zinc-600">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {/* Expanded content — components */}
                {isExpanded && !slot.isSkipped && (
                  <div className="px-4 pb-4">
                    <MealSlotView
                      slot={slot}
                      mode="edit"
                      allDishes={allDishes}
                      onAddDish={(compIdx) => setDishPickerState({ open: true, slotIdx, compIdx })}
                      onRemoveDish={(compIdx, dishId) => removeDishFromComponent(slotIdx, compIdx, dishId)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add slot button */}
        {mealSlots.length < 6 && (
          <button
            onClick={addSlot}
            className="mt-3 w-full rounded-xl border border-dashed border-white/[0.1] py-2.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/[0.2] transition-colors"
          >
            <Plus className="h-3.5 w-3.5 inline mr-1" />
            Add Meal Slot ({mealSlots.length}/6)
          </button>
        )}
      </Card>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Card className="p-4 mb-4 border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400 mb-3">Are you sure you want to delete this template?</p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Confirm Delete"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
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
          {saving ? "Saving..." : isCreateMode ? "Create Template" : "Save Changes"}
        </Button>
        {!isCreateMode && !showDeleteConfirm && (
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

      {/* Dish Picker Modal */}
      {dishPickerState?.open && (
        <DishPickerModal
          dishes={allDishes}
          componentCategory={
            mealSlots[dishPickerState.slotIdx].components[dishPickerState.compIdx].componentCategory
          }
          existingDishIds={
            mealSlots[dishPickerState.slotIdx].components[dishPickerState.compIdx].dishIds
          }
          onSelect={(dishId) =>
            addDishToComponent(dishPickerState.slotIdx, dishPickerState.compIdx, dishId)
          }
          onClose={() => setDishPickerState(null)}
        />
      )}

      {/* Food Picker */}
      {foodPickerState?.open && (
        <FoodPicker
          onAdd={async (food, grams) => {
            // Create a single-ingredient dish on the fly and add it to the component
            const { createDish } = await import("@/lib/db");
            const isStaticFood = food.id.length < 36;
            const { dishId } = await createDish({
              coachId: user!.id,
              name: `${food.name} (${grams}g)`,
              emoji: food.emoji,
              componentCategory: food.category === "carbs" ? "carbohydrate" : food.category === "fats" ? "fiber" : food.category === "supplements" ? "complete_meal" : food.category as any,
              totalCalories: Math.round(food.per100g.calories * grams / 100),
              totalProtein: Math.round(food.per100g.protein * grams / 100),
              totalCarbs: Math.round(food.per100g.carbs * grams / 100),
              totalFat: Math.round(food.per100g.fat * grams / 100),
              items: [{
                foodId: isStaticFood ? null : food.id,
                customName: isStaticFood ? food.name : undefined,
                customEmoji: isStaticFood ? food.emoji : undefined,
                customCalories: isStaticFood ? food.per100g.calories : undefined,
                customProtein: isStaticFood ? food.per100g.protein : undefined,
                customCarbs: isStaticFood ? food.per100g.carbs : undefined,
                customFat: isStaticFood ? food.per100g.fat : undefined,
                grams,
                sortOrder: 0,
              }],
            });
            if (dishId) {
              addDishToComponent(foodPickerState.slotIdx, foodPickerState.compIdx, dishId);
              // Refresh dishes list
              loadDishes();
            }
            setFoodPickerState(null);
          }}
          onClose={() => setFoodPickerState(null)}
        />
      )}
    </div>
  );
}
