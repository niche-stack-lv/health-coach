"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Check, SkipForward, Plus, Trash2, Search, X, ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateMealSlot, Dish, MealSlotComponent, Food } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────

/**
 * One picked item in a component. Multiple items per component allowed —
 * user can stack the prescribed alternative + extras.
 */
export type CheckInPickKind = "alternative" | "extra-dish" | "extra-food" | "custom";

export interface CheckInPick {
  /** unique id within the selection list (for keying + deletion) */
  localId: string;
  kind: CheckInPickKind;
  /** for alternative: the meal_slot_dishes.id; for extras: the actual dishId or foodId; for custom: free name */
  refId?: string;
  /** for alternatives, this is the cached dishId / foodId / etc — copied so we don't have to re-find */
  resolvedDishId?: string | null;
  resolvedFoodId?: string | null;
  /** quantity multiplier for dishes (1, 1.5, 2) */
  multiplier?: 1 | 1.5 | 2;
  /** for foods, gram quantity override */
  grams?: number;
  /** for custom: free-text label + calories */
  customName?: string;
  customCalories?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────

const categoryLabels: Record<string, string> = {
  protein: "Protein",
  carbs: "Carbs",
  fats: "Fats",
  fiber: "Fiber",
  complete_meal: "Complete",
  supplements: "Supps",
};

const categoryColors: Record<string, string> = {
  protein: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  carbs: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  fats: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  fiber: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  complete_meal: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  supplements: "bg-pink-500/10 text-pink-400 border-pink-500/30",
};

// ─── Props ────────────────────────────────────────────────────────────────

export interface MealCardProps {
  slot: TemplateMealSlot;
  /** Map of componentId -> ordered list of picks the user has logged for that component */
  picks: Record<string, CheckInPick[]>;
  /** Whether the entire meal is marked skipped */
  isSlotSkipped: boolean;
  /** All dishes — used by "add extra dish" sheet */
  allDishes: Dish[];
  /** All foods — used by "add extra food" sheet */
  allFoods: Food[];
  /** Replace the entire pick list for a component */
  onChangePicks: (componentId: string, picks: CheckInPick[]) => void;
  onSkipSlot: () => void;
  onDishClick?: (dish: Dish) => void;
  /** Computed running calories for this meal (live as user picks) */
  loggedCalories?: number;
  disabled?: boolean;
  /** Display URL for an already-attached meal photo (signed or object URL). */
  photoUrl?: string | null;
  /** Called when the user selects a photo file for this meal. */
  onPickPhoto?: (file: File) => void;
  /** Remove the attached photo. */
  onRemovePhoto?: () => void;
  /** Whether a photo upload is in progress for this meal. */
  photoUploading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function getRenderedComponents(slot: TemplateMealSlot): MealSlotComponent[] {
  return slot.components
    .filter((comp) => comp.dishes.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function isComponentDecided(comp: MealSlotComponent, picks: Record<string, CheckInPick[]>): boolean {
  return (picks[comp.id] || []).length > 0;
}

// ─── Component ────────────────────────────────────────────────────────────

export function MealCard({
  slot,
  picks,
  isSlotSkipped,
  allDishes,
  allFoods,
  onChangePicks,
  onSkipSlot,
  onDishClick,
  loggedCalories,
  disabled = false,
  photoUrl,
  onPickPhoto,
  onRemovePhoto,
  photoUploading = false,
}: MealCardProps) {
  const renderedComponents = getRenderedComponents(slot);
  const anyUndecided = renderedComponents.some((c) => !isComponentDecided(c, picks));
  const [expanded, setExpanded] = useState(anyUndecided && !isSlotSkipped);

  // Auto-collapse once everything is decided
  useEffect(() => {
    if (!anyUndecided && expanded) setExpanded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyUndecided]);

  // Template-level forced skip
  if (slot.isSkipped) {
    return (
      <div className="rounded-2xl border border-zinc-700/30 bg-zinc-900/20 px-4 py-3 opacity-60">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-400">{slot.name}</p>
          <span className="text-[11px] text-zinc-500">Fasting</span>
        </div>
      </div>
    );
  }

  if (renderedComponents.length === 0) return null;

  const allDecided = !anyUndecided;
  const stateLabel = isSlotSkipped
    ? "Skipped"
    : allDecided
    ? loggedCalories != null
      ? `${loggedCalories} cal · logged`
      : "Logged"
    : `${renderedComponents.filter((c) => !isComponentDecided(c, picks)).length} pending`;

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden transition-colors",
        isSlotSkipped
          ? "border-zinc-700/40 bg-zinc-900/20 opacity-60"
          : allDecided
          ? "border-emerald-500/15 bg-white/[0.02]"
          : "border-white/[0.06] bg-white/[0.02]"
      )}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 py-3 gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 min-w-0 flex-1 text-left"
        >
          {allDecided && !isSlotSkipped && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
          <p className={cn("text-base font-semibold truncate", isSlotSkipped ? "text-zinc-500" : "text-white")}>
            {slot.name}
          </p>
          {slot.targetCalories != null && (
            <span className="text-[11px] text-zinc-500 shrink-0">/ {slot.targetCalories} kcal</span>
          )}
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "text-[11px]",
              isSlotSkipped ? "text-zinc-500" : allDecided ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {stateLabel}
          </span>
          {/* Visible Skip toggle */}
          <button
            type="button"
            onClick={onSkipSlot}
            disabled={disabled}
            title={isSlotSkipped ? "Unskip meal" : "Skip this meal"}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors",
              isSlotSkipped
                ? "border-zinc-500 bg-zinc-500/10 text-zinc-300"
                : "border-white/[0.06] text-zinc-500 hover:text-zinc-200 hover:border-white/[0.15]"
            )}
          >
            <SkipForward className="h-3 w-3" />
            {isSlotSkipped ? "Skipped" : "Skip"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded-lg text-zinc-500 hover:text-white"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && !isSlotSkipped && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.04] pt-3">
          {renderedComponents.map((comp) => (
            <ComponentRow
              key={comp.id}
              comp={comp}
              picks={picks[comp.id] || []}
              allDishes={allDishes}
              allFoods={allFoods}
              onChange={(next) => onChangePicks(comp.id, next)}
              onDishClick={onDishClick}
              disabled={disabled}
            />
          ))}

          {/* Optional meal photo */}
          {(onPickPhoto || photoUrl) && (
            <div className="pt-1">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1.5">Meal photo (optional)</p>
              {photoUrl ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={`${slot.name} photo`}
                    className="h-24 w-24 rounded-xl object-cover border border-white/[0.08]"
                  />
                  {!disabled && onRemovePhoto && (
                    <button
                      type="button"
                      onClick={onRemovePhoto}
                      className="absolute -top-2 -right-2 rounded-full bg-black/80 border border-white/[0.1] p-1 text-zinc-300 hover:text-white"
                      aria-label="Remove photo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <label
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-2.5 text-xs text-zinc-400 cursor-pointer hover:border-white/[0.2] transition-colors",
                    (disabled || photoUploading) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {photoUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  {photoUploading ? "Uploading…" : "Add photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={disabled || photoUploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && onPickPhoto) onPickPhoto(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Component row ────────────────────────────────────────────────────────

function ComponentRow({
  comp,
  picks,
  allDishes,
  allFoods,
  onChange,
  onDishClick,
  disabled,
}: {
  comp: MealSlotComponent;
  picks: CheckInPick[];
  allDishes: Dish[];
  allFoods: Food[];
  onChange: (picks: CheckInPick[]) => void;
  onDishClick?: (dish: Dish) => void;
  disabled?: boolean;
}) {
  const dishAlts = comp.dishes.filter((d) => d.dishId);
  const foodAlts = comp.dishes.filter((d) => d.foodId && !d.dishId);
  const totalAlts = dishAlts.length + foodAlts.length;
  const [extraSheetOpen, setExtraSheetOpen] = useState(false);

  // Auto-pick when there's only one alternative — but only if user has no pick yet
  useEffect(() => {
    if (picks.length === 0 && totalAlts === 1) {
      const only = dishAlts[0] || foodAlts[0];
      addAlternative(only.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Add helpers ────────────────────────────────────────────────────────

  function addAlternative(msdId: string) {
    const msd = comp.dishes.find((d) => d.id === msdId);
    if (!msd) return;
    const pick: CheckInPick = {
      localId: crypto.randomUUID(),
      kind: "alternative",
      refId: msdId,
      resolvedDishId: msd.dishId || null,
      resolvedFoodId: msd.foodId || null,
      multiplier: 1,
      grams: msd.foodQuantity || undefined,
    };
    onChange([...picks, pick]);
  }

  function addExtraDish(dishId: string) {
    const dish = allDishes.find((d) => d.id === dishId);
    if (!dish) return;
    onChange([
      ...picks,
      {
        localId: crypto.randomUUID(),
        kind: "extra-dish",
        refId: dishId,
        resolvedDishId: dishId,
        multiplier: 1,
        customName: dish.name,
      },
    ]);
  }

  function addExtraFood(foodId: string, grams: number) {
    const food = allFoods.find((f) => f.id === foodId);
    if (!food) return;
    const cal = Math.round((food.calories * grams) / 100);
    onChange([
      ...picks,
      {
        localId: crypto.randomUUID(),
        kind: "extra-food",
        refId: foodId,
        resolvedFoodId: foodId,
        grams,
        customName: `${food.name} (${grams}g)`,
        customCalories: cal,
      },
    ]);
  }

  function addCustom(name: string, cal: number) {
    onChange([
      ...picks,
      {
        localId: crypto.randomUUID(),
        kind: "custom",
        customName: name,
        customCalories: cal,
      },
    ]);
  }

  function updatePick(localId: string, patch: Partial<CheckInPick>) {
    onChange(picks.map((p) => (p.localId === localId ? { ...p, ...patch } : p)));
  }

  function removePick(localId: string) {
    onChange(picks.filter((p) => p.localId !== localId));
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            categoryColors[comp.componentCategory] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
          )}
        >
          {categoryLabels[comp.componentCategory] || comp.componentCategory}
        </span>
        <span className="text-[10px] text-zinc-600">
          {totalAlts} option{totalAlts === 1 ? "" : "s"}
        </span>
      </div>

      {/* Logged picks */}
      {picks.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {picks.map((pick) => (
            <PickRow
              key={pick.localId}
              pick={pick}
              comp={comp}
              allDishes={allDishes}
              allFoods={allFoods}
              onUpdate={(patch) => updatePick(pick.localId, patch)}
              onRemove={() => removePick(pick.localId)}
              onDishClick={onDishClick}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Picker row — dropdown (if alternatives exist) + Add extra button */}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        {totalAlts > 0 ? (
          <PlanPicker
            dishAlts={dishAlts}
            foodAlts={foodAlts}
            disabled={disabled}
            onPick={(id) => addAlternative(id)}
          />
        ) : (
          <p className="h-9 inline-flex items-center text-[11px] text-zinc-600 px-1">
            No options in plan — add anything you ate →
          </p>
        )}
        <button
          type="button"
          onClick={() => setExtraSheetOpen(true)}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] px-3 h-9 text-xs text-zinc-400 hover:text-white hover:border-white/[0.2] transition-colors whitespace-nowrap"
          title="Add an extra item"
        >
          <Plus className="h-3 w-3" /> Extra
        </button>
      </div>

      {extraSheetOpen && (
        <ExtraPickerSheet
          allDishes={allDishes}
          allFoods={allFoods}
          onAddDish={(id) => {
            addExtraDish(id);
            setExtraSheetOpen(false);
          }}
          onAddFood={(id, grams) => {
            addExtraFood(id, grams);
            setExtraSheetOpen(false);
          }}
          onAddCustom={(name, cal) => {
            addCustom(name, cal);
            setExtraSheetOpen(false);
          }}
          onClose={() => setExtraSheetOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Searchable "pick from plan" dropdown ───────────────────────────────────

function PlanPicker({
  dishAlts,
  foodAlts,
  disabled,
  onPick,
}: {
  dishAlts: MealSlotComponent["dishes"];
  foodAlts: MealSlotComponent["dishes"];
  disabled?: boolean;
  onPick: (msdId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  // Unified option list for searching/rendering.
  const options = [
    ...dishAlts.map((msd) => ({
      id: msd.id,
      emoji: msd.dish?.emoji || "🍽️",
      label: msd.dish?.name || "Dish",
      cal: msd.dish?.totalCalories ?? 0,
    })),
    ...foodAlts.map((msd) => ({
      id: msd.id,
      emoji: msd.food?.emoji || "🥗",
      label: `${msd.food?.name || "Food"}${msd.foodQuantity ? ` (${msd.foodQuantity}g)` : ""}`,
      cal: msd.food && msd.foodQuantity ? Math.round((msd.food.calories * msd.foodQuantity) / 100) : 0,
    })),
  ];

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  // Close on outside tap.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function choose(id: string) {
    onPick(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 truncate text-left">Pick from plan…</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border border-white/[0.08] bg-[#1a1a1a] shadow-2xl shadow-black/60">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
            <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search options…"
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-zinc-500 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-zinc-600 text-center">No matches</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => choose(o.id)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white active:bg-white/[0.06]"
                >
                  <span className="shrink-0">{o.emoji}</span>
                  <span className="flex-1 truncate">{o.label}</span>
                  <span className="shrink-0 text-[11px] text-zinc-500">{o.cal} cal</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pick row ─────────────────────────────────────────────────────────────

function PickRow({
  pick,
  comp,
  allDishes,
  allFoods,
  onUpdate,
  onRemove,
  onDishClick,
  disabled,
}: {
  pick: CheckInPick;
  comp: MealSlotComponent;
  allDishes: Dish[];
  allFoods: Food[];
  onUpdate: (patch: Partial<CheckInPick>) => void;
  onRemove: () => void;
  onDishClick?: (dish: Dish) => void;
  disabled?: boolean;
}) {
  // Resolve display info
  let emoji = "🍽️";
  let name = pick.customName || "Item";
  let baseCal = 0;
  let dishObj: Dish | undefined;

  if (pick.kind === "alternative") {
    const msd = comp.dishes.find((d) => d.id === pick.refId);
    if (msd?.dish) {
      dishObj = msd.dish;
      emoji = msd.dish.emoji;
      name = msd.dish.name;
      baseCal = msd.dish.totalCalories;
    } else if (msd?.food) {
      const grams = msd.foodQuantity || 100;
      emoji = msd.food.emoji;
      name = `${msd.food.name} (${grams}g)`;
      baseCal = Math.round((msd.food.calories * grams) / 100);
    }
  } else if (pick.kind === "extra-dish") {
    dishObj = allDishes.find((d) => d.id === pick.resolvedDishId);
    if (dishObj) {
      emoji = dishObj.emoji;
      name = dishObj.name;
      baseCal = dishObj.totalCalories;
    }
  } else if (pick.kind === "extra-food") {
    const food = allFoods.find((f) => f.id === pick.resolvedFoodId);
    if (food) {
      emoji = food.emoji;
      const grams = pick.grams || 100;
      name = `${food.name} (${grams}g)`;
      baseCal = Math.round((food.calories * grams) / 100);
    }
  } else if (pick.kind === "custom") {
    emoji = "✏️";
    name = pick.customName || "Custom";
    baseCal = pick.customCalories || 0;
  }

  const mult = pick.multiplier ?? 1;
  const showMult = pick.kind === "alternative" || pick.kind === "extra-dish";
  const displayCal =
    pick.kind === "custom"
      ? pick.customCalories ?? 0
      : pick.kind === "extra-food"
      ? baseCal
      : Math.round(baseCal * mult);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2 min-h-[44px]",
        pick.kind === "alternative" ? "border-gold/30 bg-gold/5" : "border-white/[0.08] bg-white/[0.03]"
      )}
    >
      <span className="text-base shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{name}</p>
        {showMult && (
          <div className="flex gap-1 mt-1">
            {([1, 1.5, 2] as const).map((m) => (
              <button
                key={m}
                type="button"
                disabled={disabled}
                onClick={() => onUpdate({ multiplier: m })}
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium border",
                  mult === m
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-white/[0.06] text-zinc-500"
                )}
              >
                {m}×
              </button>
            ))}
          </div>
        )}
        {pick.kind === "custom" && (
          <input
            type="number"
            value={pick.customCalories ?? ""}
            onChange={(e) => onUpdate({ customCalories: parseFloat(e.target.value) || 0 })}
            placeholder="cal"
            disabled={disabled}
            className="mt-1 w-20 h-7 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/50"
          />
        )}
      </div>
      <span className="text-xs text-zinc-500 shrink-0">{displayCal} cal</span>
      {dishObj && onDishClick && (
        <button
          type="button"
          onClick={() => onDishClick(dishObj!)}
          className="text-zinc-600 hover:text-white text-xs px-1"
        >
          ⓘ
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Extra picker sheet ───────────────────────────────────────────────────

const dishCategoryOrder = ["all", "protein", "carbs", "fats", "fiber", "complete_meal", "supplements"] as const;

const categoryChipMeta: Record<string, { label: string; emoji: string }> = {
  all: { label: "All", emoji: "📋" },
  protein: { label: "Protein", emoji: "🍗" },
  carbs: { label: "Carbs", emoji: "🍚" },
  fats: { label: "Fats", emoji: "🥜" },
  fiber: { label: "Fiber", emoji: "🥦" },
  complete_meal: { label: "Complete", emoji: "🍱" },
  supplements: { label: "Supps", emoji: "💊" },
};

/** Unified item type so dishes + foods render in one list */
type MergedItem =
  | {
      kind: "dish";
      id: string;
      name: string;
      emoji: string;
      category: string;
      cal: number;
      protein: number;
      carbs: number;
      fat: number;
      tagIds: string[];
      raw: Dish;
    }
  | {
      kind: "food";
      id: string;
      name: string;
      emoji: string;
      category: string;
      cal: number;
      protein: number;
      carbs: number;
      fat: number;
      unit: string | null;
      gramsPerUnit: number | null;
      raw: Food;
    };

function ExtraPickerSheet({
  allDishes,
  allFoods,
  onAddDish,
  onAddFood,
  onAddCustom,
  onClose,
}: {
  allDishes: Dish[];
  allFoods: Food[];
  onAddDish: (id: string) => void;
  onAddFood: (id: string, grams: number) => void;
  onAddCustom: (name: string, cal: number) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"items" | "custom">("items");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  // Custom inputs
  const [customName, setCustomName] = useState("");
  const [customCal, setCustomCal] = useState("");

  // Food expansion state
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(null);
  const [foodGrams, setFoodGrams] = useState("100");

  // Build unique tag list from dishes
  const allTags = (() => {
    const tagMap = new Map<string, { id: string; name: string }>();
    for (const d of allDishes) {
      if (d.tags) for (const t of d.tags) tagMap.set(t.id, { id: t.id, name: t.name });
    }
    return Array.from(tagMap.values());
  })();

  // Merge dishes + foods into one searchable list
  const mergedItems: MergedItem[] = [
    ...allDishes.map((d): MergedItem => ({
      kind: "dish",
      id: d.id,
      name: d.name,
      emoji: d.emoji,
      category: d.componentCategory,
      cal: d.totalCalories,
      protein: d.totalProtein,
      carbs: d.totalCarbs,
      fat: d.totalFat,
      tagIds: (d.tags || []).map((t) => t.id),
      raw: d,
    })),
    ...allFoods.map((f): MergedItem => ({
      kind: "food",
      id: f.id,
      name: f.name,
      emoji: f.emoji,
      category: f.category,
      cal: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      unit: f.unit ?? null,
      gramsPerUnit: f.gramsPerUnit ?? null,
      raw: f,
    })),
  ];

  // Filter: category, tag, search
  const filtered = mergedItems
    .filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      // Tag filter only applies to dishes — when a tag is selected, foods are excluded
      if (tagFilter) {
        if (item.kind !== "dish") return false;
        if (!item.tagIds.includes(tagFilter)) return false;
      }
      if (search.trim() && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    // Dishes first within results (they're usually what you ate)
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "dish" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-2xl border border-white/[0.08] bg-[#1a1a1a] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Add extra item</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white">
            ✕
          </button>
        </div>

        {/* Tab switcher — Items vs Custom */}
        <div className="flex gap-2 p-3 border-b border-white/[0.06]">
          {(["items", "custom"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setSearch("");
                setTagFilter(null);
                setCategory("all");
                setExpandedFoodId(null);
              }}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-semibold border capitalize",
                tab === t ? "border-gold/40 bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-400"
              )}
            >
              {t === "items" ? "Search items" : "Custom"}
            </button>
          ))}
        </div>

        {/* Search & filters — only on items tab */}
        {tab === "items" && (
          <div className="p-3 border-b border-white/[0.06] space-y-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes and foods…"
              autoFocus
              className="w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
            />

            {/* Category chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {dishCategoryOrder.map((cat) => {
                const meta = categoryChipMeta[cat] || { label: cat, emoji: "📦" };
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium",
                      active
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <span>{meta.emoji}</span> {meta.label}
                  </button>
                );
              })}
            </div>

            {/* Tag chips */}
            {allTags.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setTagFilter(null)}
                  className={cn(
                    "shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-medium",
                    !tagFilter
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-white/[0.06] text-zinc-500"
                  )}
                >
                  All tags
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setTagFilter(tagFilter === tag.id ? null : tag.id)}
                    className={cn(
                      "shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-medium",
                      tagFilter === tag.id
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-white/[0.06] text-zinc-500"
                    )}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {tab === "items" && (
            <>
              {filtered.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">
                  {mergedItems.length === 0
                    ? "Nothing in your library yet."
                    : "No matches — try clearing filters."}
                </p>
              ) : (
                <>
                  <p className="text-[10px] text-zinc-600 px-2 pb-1">
                    {filtered.length} item{filtered.length === 1 ? "" : "s"}
                  </p>
                  <div className="space-y-1">
                    {filtered.slice(0, 100).map((item) =>
                      item.kind === "dish" ? (
                        <button
                          key={`d-${item.id}`}
                          type="button"
                          onClick={() => onAddDish(item.id)}
                          className="w-full flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] active:bg-white/[0.04] px-3 py-2.5 text-left"
                        >
                          <span className="text-base">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{item.name}</p>
                            <p className="text-[11px] text-zinc-500">
                              {item.cal} cal · {item.protein}p · {item.carbs}c · {item.fat}f
                            </p>
                          </div>
                          <span className="shrink-0 text-[9px] uppercase tracking-wide text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded px-1.5 py-0.5">
                            Dish
                          </span>
                        </button>
                      ) : (
                        <div
                          key={`f-${item.id}`}
                          className={cn(
                            "rounded-xl border px-3 py-2.5",
                            expandedFoodId === item.id
                              ? "border-gold/40 bg-gold/5"
                              : "border-white/[0.06] bg-white/[0.02]"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (expandedFoodId === item.id) {
                                setExpandedFoodId(null);
                              } else {
                                setExpandedFoodId(item.id);
                                setFoodGrams(String(item.gramsPerUnit ?? 100));
                              }
                            }}
                            className="w-full flex items-center gap-3 text-left"
                          >
                            <span className="text-base">{item.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{item.name}</p>
                              <p className="text-[11px] text-zinc-500">
                                {item.cal} cal · {item.protein}p · {item.carbs}c · {item.fat}f
                                {item.unit ? ` per ${item.unit}` : " per 100g"}
                              </p>
                            </div>
                            <span className="shrink-0 text-[9px] uppercase tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded px-1.5 py-0.5">
                              Food
                            </span>
                          </button>
                          {expandedFoodId === item.id && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.04]">
                              <input
                                type="number"
                                value={foodGrams}
                                onChange={(e) => setFoodGrams(e.target.value)}
                                placeholder="grams"
                                className="w-20 h-8 rounded border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-gold/50"
                              />
                              <span className="text-[10px] text-zinc-500">g</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const g = parseFloat(foodGrams) || 100;
                                  onAddFood(item.id, g);
                                }}
                                className="ml-auto rounded-lg bg-gold/10 border border-gold/30 px-3 py-1 text-xs font-semibold text-gold"
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                  {filtered.length > 100 && (
                    <p className="text-[10px] text-zinc-600 text-center py-2">
                      Showing first 100 — narrow your search to see more.
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {tab === "custom" && (
            <div className="p-3 space-y-3">
              <p className="text-xs text-zinc-500">Log something free-form your coach hasn&apos;t added yet.</p>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Office samosa"
                  className="w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">Approx calories</label>
                <input
                  type="number"
                  value={customCal}
                  onChange={(e) => setCustomCal(e.target.value)}
                  placeholder="e.g. 220"
                  className="w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <button
                type="button"
                disabled={!customName.trim() || !customCal}
                onClick={() => onAddCustom(customName.trim(), parseFloat(customCal) || 0)}
                className="w-full h-11 rounded-xl bg-gold text-black font-semibold text-sm disabled:opacity-40"
              >
                Add custom item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
