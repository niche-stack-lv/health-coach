"use client";

/**
 * Diet Plan Creation Page
 *
 * Uses the SAME UI as the template editor (meal slots with component rows + dish picker)
 * but with a client selector. Optionally pre-fills from a template (copies, doesn't modify original).
 * Saves as a new template assigned to the client.
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, SkipForward, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DishPickerModal } from "@/components/coach/dish-picker-modal";
import { FoodPicker } from "@/components/coach/food-picker";
import { MealSlotView } from "@/components/shared/meal-slot-view";
import { useAuth } from "@/lib/auth-context";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { getClients, getDishes, getDietTemplates, createDietTemplate, assignTemplate } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { DietTemplate, PlanType, ComponentCategory, Dish } from "@/types";

export default function CreatePlanPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <CreatePlanPageInner />
    </Suspense>
  );
}

// ---- Types ----

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

const COMPONENT_CATEGORIES: ComponentCategory[] = ["carbohydrate", "protein", "fiber", "complete_meal"];

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

// ---- Helpers ----

function createEmptySlot(name: string): LocalMealSlot {
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
      const existingComps = new Map(
        slot.components.map((comp) => [comp.componentCategory, comp])
      );
      const components = COMPONENT_CATEGORIES.map((cat) => {
        const existing = existingComps.get(cat);
        if (existing) {
          return {
            localId: crypto.randomUUID(),
            componentCategory: existing.componentCategory,
            dishIds: existing.dishes.filter((d) => d.dishId).map((d) => d.dishId!) as string[],
          };
        }
        return {
          localId: crypto.randomUUID(),
          componentCategory: cat,
          dishIds: [] as string[],
        };
      });
      return {
        localId: crypto.randomUUID(),
        name: slot.name,
        targetCalories: slot.targetCalories?.toString() || "",
        isSkipped: slot.isSkipped,
        components,
      };
    });
}

// ---- Main Component ----

function CreatePlanPageInner() {
  const router = useRouter();
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();

  // Form state
  const [planName, setPlanName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [mealSlots, setMealSlots] = useState<LocalMealSlot[]>([
    createEmptySlot("Meal 1"),
    createEmptySlot("Meal 2"),
    createEmptySlot("Meal 3"),
    createEmptySlot("Meal 4"),
  ]);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());

  // Picker state
  const [dishPickerState, setDishPickerState] = useState<{ slotIdx: number; compIdx: number } | null>(null);
  const [foodPickerState, setFoodPickerState] = useState<{ slotIdx: number; compIdx: number } | null>(null);

  // Data
  const [dbClients, setDbClients] = useState<any[]>([]);
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [templates, setTemplates] = useState<DietTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Load data
  useEffect(() => {
    if (isDemo) {
      setDbClients([{ id: "demo", status: "active", profile: { name: "Demo Client" } }]);
      setLoading(false);
      return;
    }
    if (!user) return;
    Promise.all([
      getClients(user.id),
      getDishes(user.id),
      getDietTemplates(user.id),
    ]).then(([clients, dishes, tmpls]) => {
      setDbClients(clients);
      setAllDishes(dishes);
      setTemplates(tmpls);
      setLoading(false);
    });
  }, [user, isDemo]);

  // Expand all slots by default
  useEffect(() => {
    setExpandedSlots(new Set(mealSlots.map((s) => s.localId)));
  }, []);

  const activeClients = dbClients
    .filter((c: any) => c.status === "active")
    .map((c: any) => ({ id: c.id, name: c.profile?.name || "Unknown" }));

  // ---- Template pre-fill (copies, doesn't modify original) ----

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      const slots = [createEmptySlot("Meal 1"), createEmptySlot("Meal 2"), createEmptySlot("Meal 3"), createEmptySlot("Meal 4")];
      setMealSlots(slots);
      setExpandedSlots(new Set(slots.map((s) => s.localId)));
      return;
    }
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) return;
    const slots = templateToLocalSlots(tmpl);
    setMealSlots(slots);
    setExpandedSlots(new Set(slots.map((s) => s.localId)));
    if (!planName) setPlanName(tmpl.name + " — Custom");
  }

  // ---- Slot management ----

  function toggleSlotExpanded(localId: string) {
    setExpandedSlots((prev) => { const n = new Set(prev); if (n.has(localId)) n.delete(localId); else n.add(localId); return n; });
  }
  function addSlot() {
    if (mealSlots.length >= 6) return;
    const s = createEmptySlot("Meal " + (mealSlots.length + 1));
    setMealSlots((p) => [...p, s]);
    setExpandedSlots((p) => new Set([...p, s.localId]));
  }
  function removeSlot(i: number) { if (mealSlots.length <= 1) return; setMealSlots((p) => p.filter((_, idx) => idx !== i)); }
  function updateSlotName(i: number, v: string) { setMealSlots((p) => { const u = [...p]; u[i] = { ...u[i], name: v }; return u; }); }
  function updateSlotCalories(i: number, v: string) { setMealSlots((p) => { const u = [...p]; u[i] = { ...u[i], targetCalories: v }; return u; }); }
  function toggleSlotSkipped(i: number) { setMealSlots((p) => { const u = [...p]; u[i] = { ...u[i], isSkipped: !u[i].isSkipped }; return u; }); }

  // ---- Dish management ----

  function addDish(slotIdx: number, compIdx: number, dishId: string) {
    setMealSlots((prev) => {
      const u = [...prev];
      const slot = { ...u[slotIdx], components: [...u[slotIdx].components] };
      const comp = { ...slot.components[compIdx], dishIds: [...slot.components[compIdx].dishIds] };
      if (!comp.dishIds.includes(dishId)) comp.dishIds.push(dishId);
      slot.components[compIdx] = comp;
      u[slotIdx] = slot;
      return u;
    });
    setDishPickerState(null);
  }

  function removeDish(slotIdx: number, compIdx: number, dishId: string) {
    setMealSlots((prev) => {
      const u = [...prev];
      const slot = { ...u[slotIdx], components: [...u[slotIdx].components] };
      slot.components[compIdx] = { ...slot.components[compIdx], dishIds: slot.components[compIdx].dishIds.filter((id) => id !== dishId) };
      u[slotIdx] = slot;
      return u;
    });
  }

  // ---- Save: creates a new template + assigns to client ----

  async function handleSave() {
    if (!user || !selectedClient || saving) return;
    setSaving(true);

    // Create a new template from the current state (marked as NOT a template — it's a plan)
    const { error: createErr, templateId } = await createDietTemplate({
      coachId: user.id,
      name: planName.trim() || "Custom Plan",
      planType: "nonveg" as PlanType,
      isTemplate: false,
      mealSlots: mealSlots.map((slot, i) => ({
        name: slot.name,
        targetCalories: slot.targetCalories ? parseFloat(slot.targetCalories) : null,
        isSkipped: slot.isSkipped,
        sortOrder: i,
        components: slot.components.map((comp, ci) => ({
          componentCategory: comp.componentCategory,
          sortOrder: ci,
          dishIds: comp.dishIds,
        })),
      })),
    });

    if (createErr || !templateId) { setSaving(false); return; }

    // Assign to client
    const { error: assignErr } = await assignTemplate({
      templateId,
      clientId: selectedClient,
      coachId: user.id,
    });

    if (assignErr) { setSaving(false); return; }
    setDone(true);
  }

  // ---- Render ----

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-gold" /></div>
        <h1 className="text-xl font-bold text-white">Diet Plan Assigned!</h1>
        <p className="text-sm text-zinc-500 mt-2">The plan has been created and assigned to the client.</p>
        <Link href="/coach/plans"><Button variant="gold" className="mt-6">Back to Plans</Button></Link>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/coach/plans${demoSuffix}`} className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06]">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <h1 className="text-lg font-bold text-white">New Diet Plan</h1>
      </div>

      {/* Plan details */}
      <Card className="p-5 mb-4">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Plan Name</label>
            <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. Fat Loss Phase 1" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Client</label>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className={inputClass}>
              <option value="">Select client</option>
              {activeClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Start from Template (optional)</label>
            <select value={selectedTemplateId} onChange={(e) => handleTemplateSelect(e.target.value)} className={inputClass}>
              <option value="">Start from scratch</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <p className="text-[10px] text-zinc-600 mt-1">Pre-fills meals from template. Original template stays unchanged.</p>
          </div>
        </div>
      </Card>

      {/* Meal Slots — SAME UI as template editor */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-zinc-500">Meal Slots</label>
        </div>

        <div className="space-y-3">
          {mealSlots.map((slot, slotIdx) => {
            const isExpanded = expandedSlots.has(slot.localId);
            return (
              <div key={slot.localId} className={cn("rounded-xl border", slot.isSkipped ? "border-zinc-700/50 bg-zinc-900/30 opacity-60" : "border-white/[0.06] bg-white/[0.02]")}>
                {/* Header */}
                <div className="flex items-center gap-2 p-4 cursor-pointer" onClick={() => toggleSlotExpanded(slot.localId)}>
                  <input type="text" value={slot.name} onChange={(e) => updateSlotName(slotIdx, e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Meal name" className="flex-1 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50" />
                  <input type="number" value={slot.targetCalories} onChange={(e) => updateSlotCalories(slotIdx, e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="kcal" className="w-20 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white text-center placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50" />
                  <button onClick={(e) => { e.stopPropagation(); toggleSlotSkipped(slotIdx); }} className={cn("p-1.5 rounded-lg transition-colors", slot.isSkipped ? "bg-purple-500/20 text-purple-400" : "text-zinc-600 hover:text-purple-400 hover:bg-purple-500/10")}><SkipForward className="h-3.5 w-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); removeSlot(slotIdx); }} disabled={mealSlots.length <= 1} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
                  <div className="text-zinc-600">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
                </div>

                {/* Expanded: component rows with dishes */}
                {isExpanded && !slot.isSkipped && (
                  <div className="px-4 pb-4">
                    <MealSlotView
                      slot={slot}
                      mode="edit"
                      allDishes={allDishes}
                      onAddDish={(compIdx) => setDishPickerState({ slotIdx, compIdx })}
                      onRemoveDish={(compIdx, dishId) => removeDish(slotIdx, compIdx, dishId)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {mealSlots.length < 6 && (
          <button onClick={addSlot} className="mt-3 w-full rounded-xl border border-dashed border-white/[0.1] py-2.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/[0.2] transition-colors">
            <Plus className="h-3.5 w-3.5 inline mr-1" /> Add Meal Slot ({mealSlots.length}/6)
          </button>
        )}
      </Card>

      {/* Save */}
      <Button variant="gold" className="w-full h-12 text-base rounded-2xl" disabled={!selectedClient || saving || isDemo} onClick={handleSave}>
        {saving ? "Creating..." : <><Check className="h-5 w-5" /> Create & Assign Plan</>}
      </Button>

      {/* Dish Picker Modal */}
      {dishPickerState && (
        <DishPickerModal
          dishes={allDishes}
          componentCategory={mealSlots[dishPickerState.slotIdx].components[dishPickerState.compIdx].componentCategory}
          existingDishIds={mealSlots[dishPickerState.slotIdx].components[dishPickerState.compIdx].dishIds}
          onSelect={(dishId) => addDish(dishPickerState.slotIdx, dishPickerState.compIdx, dishId)}
          onClose={() => setDishPickerState(null)}
        />
      )}

      {/* Food Picker */}
      {foodPickerState && (
        <FoodPicker
          onAdd={async (food, grams) => {
            // Create a single-ingredient dish on the fly and add it
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
              addDish(foodPickerState.slotIdx, foodPickerState.compIdx, dishId);
              // Refresh dishes list
              const dishes = await getDishes(user!.id);
              setAllDishes(dishes);
            }
            setFoodPickerState(null);
          }}
          onClose={() => setFoodPickerState(null)}
        />
      )}
    </div>
  );
}
