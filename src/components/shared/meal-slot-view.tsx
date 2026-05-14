"use client";

import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateMealSlot, ComponentCategory, Dish } from "@/types";

// ---- Constants (exported for reuse) ----

export const categoryLabels: Record<ComponentCategory, string> = {
  carbohydrate: "Carb",
  protein: "Protein",
  fiber: "Fiber",
  complete_meal: "Complete",
};

export const categoryColors: Record<ComponentCategory, string> = {
  carbohydrate: "text-amber-400",
  protein: "text-sky-400",
  fiber: "text-emerald-400",
  complete_meal: "text-purple-400",
};

export const categoryBadgeColors: Record<ComponentCategory, string> = {
  carbohydrate: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  protein: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  fiber: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  complete_meal: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

// ---- Editable slot type (used by template editors with local state) ----

export interface EditableComponent {
  localId: string;
  componentCategory: ComponentCategory;
  dishIds: string[];
}

export interface EditableMealSlot {
  localId: string;
  name: string;
  targetCalories: string;
  isSkipped: boolean;
  components: EditableComponent[];
}

// ---- Props ----

export interface MealSlotViewProps {
  /** The slot data — TemplateMealSlot for view/select, EditableMealSlot for edit */
  slot: TemplateMealSlot | EditableMealSlot;
  mode: "edit" | "view" | "select";
  /** All dishes in the library — needed for edit mode to resolve dish names */
  allDishes?: Dish[];
  /** Current selections for select mode: componentId -> dishId | "other" | "skipped" */
  selections?: Record<string, string>;
  /** Whether the entire slot is skipped by the user (select mode) */
  isSlotSkipped?: boolean;
  /** Edit mode: open dish picker for a component */
  onAddDish?: (compIdx: number) => void;
  /** Edit mode: remove a dish from a component */
  onRemoveDish?: (compIdx: number, dishId: string) => void;
  /** Select mode: select a dish for a component */
  onSelectDish?: (componentId: string, dishId: string) => void;
  /** Select mode: select "Other" for a component */
  onSelectOther?: (componentId: string) => void;
  /** Select mode: skip the entire slot */
  onSkipSlot?: () => void;
  /** Whether interactions are disabled (e.g., demo mode in select) */
  disabled?: boolean;
  /** Use compact horizontal chip layout (for coach desktop views) */
  compact?: boolean;
}

// ---- Type guards ----

function isTemplateMealSlot(slot: TemplateMealSlot | EditableMealSlot): slot is TemplateMealSlot {
  return "id" in slot && "templateId" in slot;
}

/**
 * Shared meal slot rendering component.
 *
 * Renders a single meal slot in one of three modes:
 * - "edit": chips with X button to remove + "+ Add Dish" dashed button per component
 * - "view": chips read-only with "or" separators between alternatives
 * - "select": chips as radio buttons that highlight gold when selected + "Other" + "Skip"
 */
export function MealSlotView({
  slot,
  mode,
  allDishes = [],
  selections = {},
  isSlotSkipped = false,
  onAddDish,
  onRemoveDish,
  onSelectDish,
  onSelectOther,
  onSkipSlot,
  disabled = false,
  compact = false,
}: MealSlotViewProps) {
  const isSkipped = isTemplateMealSlot(slot) ? slot.isSkipped : slot.isSkipped;
  const slotName = isTemplateMealSlot(slot) ? slot.name : slot.name;

  // Template-level skipped slot (IF plan)
  if (isSkipped) {
    if (mode === "select") {
      return (
        <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/30 opacity-50 px-4 py-4">
          <p className="text-sm font-medium text-zinc-400">{slotName} — Skipped (fasting)</p>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/30 opacity-50 px-4 py-4">
        <p className="text-sm font-medium text-zinc-400">{slotName}</p>
        <p className="text-xs text-zinc-600 mt-0.5">Skipped</p>
      </div>
    );
  }

  if (mode === "view" && isTemplateMealSlot(slot)) {
    return compact ? <MealSlotCompactView slot={slot} /> : <MealSlotViewMode slot={slot} />;
  }

  if (mode === "select" && isTemplateMealSlot(slot)) {
    return (
      <MealSlotSelectMode
        slot={slot}
        selections={selections}
        isSlotSkipped={isSlotSkipped}
        onSelectDish={onSelectDish}
        onSelectOther={onSelectOther}
        onSkipSlot={onSkipSlot}
        disabled={disabled}
      />
    );
  }

  // Edit mode — works with EditableMealSlot
  if (mode === "edit" && !isTemplateMealSlot(slot)) {
    return (
      <MealSlotEditMode
        slot={slot}
        allDishes={allDishes}
        onAddDish={onAddDish}
        onRemoveDish={onRemoveDish}
      />
    );
  }

  // Fallback: edit mode with TemplateMealSlot (shouldn't happen in practice)
  return null;
}

// ---- Compact View Mode (horizontal chips — for coach desktop) ----

function MealSlotCompactView({ slot }: { slot: TemplateMealSlot }) {
  return (
    <div className="space-y-2">
      {slot.components
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .filter((comp) => comp.dishes.length > 0)
        .map((comp) => (
          <div key={comp.id} className="flex items-start gap-2">
            <span className={cn("flex-shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide", categoryBadgeColors[comp.componentCategory])}>
              {categoryLabels[comp.componentCategory]}
            </span>
            <div className="flex-1 flex flex-wrap gap-1 items-center min-h-[28px]">
              {comp.dishes.map((msd, idx) => (
                <span key={msd.id} className="flex items-center gap-1">
                  {idx > 0 && <span className="text-[10px] text-zinc-600 mx-0.5">or</span>}
                  <span
                    title={msd.dish ? `${msd.dish.totalCalories} cal · ${msd.dish.totalProtein}p · ${msd.dish.totalCarbs}c · ${msd.dish.totalFat}f` : undefined}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-300 cursor-default"
                  >
                    {msd.dish?.emoji || "🍽️"} {msd.dish?.name || "Unknown"}
                    <span className="text-zinc-500 ml-0.5">{msd.dish?.totalCalories}cal</span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

// ---- View Mode (Mobile-first vertical layout) ----

function MealSlotViewMode({ slot }: { slot: TemplateMealSlot }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Slot header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-base font-semibold text-white">{slot.name}</p>
        {slot.targetCalories && (
          <span className="text-xs text-zinc-500">{slot.targetCalories} kcal target</span>
        )}
      </div>
      {/* Component groups — stacked vertically */}
      <div className="px-4 pb-4 space-y-3">
        {slot.components
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .filter((comp) => comp.dishes.length > 0)
          .map((comp) => (
            <div key={comp.id}>
              {/* Category chip above the group */}
              <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide mb-2", categoryBadgeColors[comp.componentCategory])}>
                {categoryLabels[comp.componentCategory]}
              </span>
              {/* Dish rows — stacked vertically */}
              <div className="space-y-1.5">
                {comp.dishes.map((msd, idx) => (
                  <div key={msd.id}>
                    {idx > 0 && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex-1 border-t border-white/[0.04]" />
                        <span className="text-[10px] text-zinc-600 font-medium">or</span>
                        <div className="flex-1 border-t border-white/[0.04]" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 min-h-[44px]">
                      <span className="text-base shrink-0">{msd.dish?.emoji || "🍽️"}</span>
                      <span className="flex-1 text-sm text-white font-medium truncate">{msd.dish?.name || "Unknown"}</span>
                      {msd.dish && (
                        <span className="text-xs text-zinc-500 shrink-0">{msd.dish.totalCalories} cal</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ---- Select Mode (Mobile-first vertical layout) ----

function MealSlotSelectMode({
  slot,
  selections,
  isSlotSkipped,
  onSelectDish,
  onSelectOther,
  onSkipSlot,
  disabled,
}: {
  slot: TemplateMealSlot;
  selections: Record<string, string>;
  isSlotSkipped: boolean;
  onSelectDish?: (componentId: string, dishId: string) => void;
  onSelectOther?: (componentId: string) => void;
  onSkipSlot?: () => void;
  disabled: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden", isSlotSkipped && "opacity-50")}>
      {/* Slot header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-base font-semibold text-white">{slot.name}</p>
        {onSkipSlot && (
          <button
            onClick={onSkipSlot}
            disabled={disabled}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
              isSlotSkipped
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                : "border-white/[0.06] text-zinc-500 active:bg-white/[0.04]"
            )}
          >
            {isSlotSkipped ? "Skipped ✓" : "Skip"}
          </button>
        )}
      </div>

      {!isSlotSkipped && (
        <div className="px-4 pb-4 space-y-4">
          {slot.components
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((comp) => (
              <div key={comp.id}>
                {/* Category chip above */}
                <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide mb-2", categoryBadgeColors[comp.componentCategory])}>
                  {categoryLabels[comp.componentCategory] || comp.componentCategory}
                </span>
                {/* Dish options — stacked vertically */}
                <div className="space-y-1.5">
                  {comp.dishes.map((msd) => {
                    const isSelected = selections[comp.id] === msd.dishId;
                    return (
                      <button
                        key={msd.id}
                        onClick={() => onSelectDish?.(comp.id, msd.dishId)}
                        disabled={disabled}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 min-h-[44px] text-left transition-all",
                          isSelected
                            ? "border-gold bg-gold/10 ring-1 ring-gold/20"
                            : "border-white/[0.06] bg-white/[0.02] active:bg-white/[0.04]"
                        )}
                      >
                        <span className="text-base shrink-0">{msd.dish?.emoji || "🍽️"}</span>
                        <span className={cn("flex-1 text-sm font-medium truncate", isSelected ? "text-gold" : "text-white")}>{msd.dish?.name || "Unknown"}</span>
                        {msd.dish && (
                          <span className={cn("text-xs shrink-0", isSelected ? "text-gold/70" : "text-zinc-500")}>{msd.dish.totalCalories} cal</span>
                        )}
                      </button>
                    );
                  })}
                  {/* Other + Skip row */}
                  <div className="flex gap-2 pt-1">
                    {onSelectOther && (
                      <button
                        onClick={() => onSelectOther(comp.id)}
                        disabled={disabled}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 min-h-[44px] text-xs font-medium transition-all",
                          selections[comp.id] === "other"
                            ? "border-purple-500 bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20"
                            : "border-dashed border-white/[0.08] text-zinc-500 active:bg-white/[0.04]"
                        )}
                      >
                        ✏️ Other
                      </button>
                    )}
                    {onSelectDish && (
                      <button
                        onClick={() => onSelectDish(comp.id, "skipped")}
                        disabled={disabled}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 min-h-[44px] text-xs font-medium transition-all",
                          selections[comp.id] === "skipped"
                            ? "border-zinc-500 bg-zinc-500/10 text-zinc-400"
                            : "border-dashed border-white/[0.08] text-zinc-600 active:bg-white/[0.04]"
                        )}
                      >
                        ⏭️ Skip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ---- Edit Mode ----

function MealSlotEditMode({
  slot,
  allDishes,
  onAddDish,
  onRemoveDish,
}: {
  slot: EditableMealSlot;
  allDishes: Dish[];
  onAddDish?: (compIdx: number) => void;
  onRemoveDish?: (compIdx: number, dishId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {slot.components.map((comp, compIdx) => (
        <div key={comp.localId} className="flex items-start gap-2">
          <span className={cn("flex-shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide", categoryBadgeColors[comp.componentCategory])}>
            {categoryLabels[comp.componentCategory]}
          </span>
          <div className="flex-1 flex flex-wrap gap-1 items-center min-h-[28px]">
            {comp.dishIds.map((dishId) => {
              const dish = allDishes.find((d) => d.id === dishId);
              return (
                <span
                  key={dishId}
                  title={dish ? `${dish.totalCalories} cal · ${dish.totalProtein}p · ${dish.totalCarbs}c · ${dish.totalFat}f` : undefined}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-300 cursor-default"
                >
                  {dish?.emoji || "🍽️"} {dish?.name || "Unknown"}
                  {onRemoveDish && (
                    <button
                      onClick={() => onRemoveDish(compIdx, dishId)}
                      className="ml-0.5 text-zinc-600 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            })}
            {onAddDish && (
              <button
                onClick={() => onAddDish(compIdx)}
                className="inline-flex items-center gap-0.5 rounded-lg border border-dashed border-white/[0.1] px-2 py-0.5 text-[11px] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.2] transition-colors"
              >
                <Plus className="h-3 w-3" /> Add Dish
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
