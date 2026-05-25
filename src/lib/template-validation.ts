/**
 * Pure validation functions for dishes and diet templates.
 * No side effects, no DB calls — just validation logic.
 */

// Local type definitions (will be imported from @/types after task 6.1)
export type ComponentCategory = string;
export type PlanType = string;

const VALID_COMPONENT_CATEGORIES: string[] = [
  "protein",
  "carbs",
  "fats",
  "fiber",
  "complete_meal",
  "supplements",
];

export interface DishInput {
  name: string;
  componentCategory: string;
  items: { foodId?: string; grams: number }[];
}

export interface TemplateDayInput {
  dayNumber: number;
  mealSlots: {
    isSkipped: boolean;
    components: {
      dishes: { dishId: string }[];
    }[];
  }[];
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export type CompletenessValidationResult =
  | { valid: true }
  | { valid: false; error: string; invalidDays: number[] };

/**
 * Validate a dish input before creation/update.
 * Rejects if:
 * - name is empty or whitespace-only
 * - items array is empty
 * - componentCategory is not one of the valid categories
 */
export function validateDishInput(input: DishInput): ValidationResult {
  if (!input.name || input.name.trim().length === 0) {
    return { valid: false, error: "Dish name is required" };
  }

  if (!input.items || input.items.length === 0) {
    return { valid: false, error: "At least one food item is required" };
  }

  if (
    !VALID_COMPONENT_CATEGORIES.includes(
      input.componentCategory as ComponentCategory
    )
  ) {
    return {
      valid: false,
      error: `Invalid component category. Must be one of: ${VALID_COMPONENT_CATEGORIES.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Validate that a meal slot count is within the allowed range (1-6).
 */
export function validateMealSlotCount(count: number): ValidationResult {
  if (count < 1) {
    return { valid: false, error: "Each day must have at least 1 meal slot" };
  }

  if (count > 6) {
    return { valid: false, error: "Each day can have at most 6 meal slots" };
  }

  return { valid: true };
}

/**
 * Validate that a dish's component category matches the target component category.
 * Returns true if categories match OR the dish category is 'complete_meal'.
 */
export function validateComponentCategoryMatch(
  dishCategory: string,
  componentCategory: string
): boolean {
  if (dishCategory === "complete_meal") {
    return true;
  }
  return dishCategory === componentCategory;
}

/**
 * Validate that a 7-day template is complete.
 * All 7 days must have at least one meal slot with at least one component
 * that has at least one dish.
 *
 * Exception: for 'intermittent_fasting' plan type, days where ALL slots
 * are marked isSkipped: true are exempt from the dish requirement.
 */
export function validateTemplateCompleteness(
  days: TemplateDayInput[],
  planType: PlanType
): CompletenessValidationResult {
  const invalidDays: number[] = [];

  for (let dayNumber = 1; dayNumber <= 7; dayNumber++) {
    const day = days.find((d) => d.dayNumber === dayNumber);

    if (!day || !day.mealSlots || day.mealSlots.length === 0) {
      invalidDays.push(dayNumber);
      continue;
    }

    // For intermittent_fasting: if ALL slots are skipped, the day is exempt
    if (planType === "intermittent_fasting") {
      const allSkipped = day.mealSlots.every((slot) => slot.isSkipped);
      if (allSkipped) {
        continue;
      }
    }

    // Check if at least one non-skipped slot has at least one component with at least one dish
    const hasValidSlot = day.mealSlots.some((slot) => {
      if (slot.isSkipped) return false;
      return slot.components.some(
        (component) => component.dishes && component.dishes.length > 0
      );
    });

    if (!hasValidSlot) {
      invalidDays.push(dayNumber);
    }
  }

  if (invalidDays.length > 0) {
    return {
      valid: false,
      error: `Days ${invalidDays.join(", ")} are incomplete. Each day must have at least one meal slot with a dish assigned.`,
      invalidDays,
    };
  }

  return { valid: true };
}

/**
 * Filter dishes by name substring (case-insensitive) and/or component category.
 * - If query is empty/null/undefined, don't filter by name
 * - If categoryFilter is null/undefined, don't filter by category
 */
export function filterDishes<
  T extends { name: string; componentCategory: string },
>(dishes: T[], query: string | null | undefined, categoryFilter: string | null | undefined): T[] {
  return dishes.filter((dish) => {
    // Filter by name if query is provided and non-empty
    if (query && query.trim().length > 0) {
      if (!dish.name.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
    }

    // Filter by category if categoryFilter is provided
    if (categoryFilter) {
      if (dish.componentCategory !== categoryFilter) {
        return false;
      }
    }

    return true;
  });
}
