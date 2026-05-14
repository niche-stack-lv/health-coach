/**
 * Pure macro calculation functions.
 * No side effects, no DB calls — just math.
 */

export interface MacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Calculate macro contribution of a single food item at a given gram amount.
 * Formula: (grams / 100) * per100g value for each macro field.
 */
export function calculateItemMacros(per100g: MacroValues, grams: number): MacroValues {
  const factor = grams / 100;
  return {
    calories: per100g.calories * factor,
    protein: per100g.protein * factor,
    carbs: per100g.carbs * factor,
    fat: per100g.fat * factor,
  };
}

/**
 * Sum macros across multiple items to get a dish total.
 * Each item provides its per-100g values and gram amount.
 */
export function calculateDishMacros(
  items: { per100g: MacroValues; grams: number }[]
): MacroValues {
  return items.reduce<MacroValues>(
    (total, item) => {
      const contribution = calculateItemMacros(item.per100g, item.grams);
      return {
        calories: total.calories + contribution.calories,
        protein: total.protein + contribution.protein,
        carbs: total.carbs + contribution.carbs,
        fat: total.fat + contribution.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Round each macro field to the nearest integer for display.
 */
export function roundMacros(macros: MacroValues): MacroValues {
  return {
    calories: Math.round(macros.calories),
    protein: Math.round(macros.protein),
    carbs: Math.round(macros.carbs),
    fat: Math.round(macros.fat),
  };
}

/**
 * Calculate daily macro totals from an array of selected dishes.
 * Each dish has pre-calculated totalCalories, totalProtein, totalCarbs, totalFat.
 */
export function calculateDailyMacros(
  selectedDishes: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  }[]
): MacroValues {
  return selectedDishes.reduce<MacroValues>(
    (total, dish) => ({
      calories: total.calories + dish.totalCalories,
      protein: total.protein + dish.totalProtein,
      carbs: total.carbs + dish.totalCarbs,
      fat: total.fat + dish.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Calculate adherence score as a percentage (0-100).
 *
 * A component is adherent if the client selected one of the prescribed dish alternatives.
 * Skipped components count as non-adherent UNLESS isIntermittentFasting=true AND
 * the component's parent slot is in skippedSlotIds.
 */
export function calculateAdherenceScore(
  components: { componentId: string; slotId: string; prescribedDishIds: string[] }[],
  selections: { componentId: string; dishId: string | null; isSkipped: boolean }[],
  isIntermittentFasting: boolean,
  skippedSlotIds: string[]
): number {
  if (components.length === 0) return 100;

  const selectionMap = new Map(
    selections.map((s) => [s.componentId, s])
  );

  let adherentCount = 0;
  let totalCount = 0;

  for (const component of components) {
    // If intermittent fasting and this component's slot is marked as skipped in the template,
    // exclude it from the calculation entirely
    if (isIntermittentFasting && skippedSlotIds.includes(component.slotId)) {
      continue;
    }

    totalCount++;

    const selection = selectionMap.get(component.componentId);

    if (!selection) {
      // No selection made — non-adherent
      continue;
    }

    if (selection.isSkipped || selection.dishId === null) {
      // Client skipped this component — non-adherent
      continue;
    }

    // Check if the selected dish is one of the prescribed alternatives
    if (component.prescribedDishIds.includes(selection.dishId)) {
      adherentCount++;
    }
  }

  if (totalCount === 0) return 100;
  return (adherentCount / totalCount) * 100;
}

/**
 * Calculate weekly adherence as the arithmetic mean of submitted daily scores.
 * Only days with scores are included (not all 7 days).
 */
export function calculateWeeklyAdherence(dailyScores: number[]): number {
  if (dailyScores.length === 0) return 0;
  const sum = dailyScores.reduce((acc, score) => acc + score, 0);
  return sum / dailyScores.length;
}

/**
 * Map a JS Date to the template day number (1-7).
 * JS Date.getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
 * Template dayNumber: 1=Sunday, 2=Monday, ..., 7=Saturday
 */
export function getTemplateDayForDate(date: Date): number {
  return date.getDay() + 1;
}
