"use client";

/**
 * Backward-compatible re-export.
 * The actual implementation now lives in food-picker.tsx + quantity-sheet.tsx.
 * Existing imports of FoodPickerSheet continue to work.
 */

import { FoodPicker, type FoodPickerProps } from "@/components/coach/food-picker";
export { QuantitySheet, type QuantitySheetProps } from "@/components/coach/quantity-sheet";

// Re-export FoodPicker under the old name for backward compatibility
export type FoodPickerSheetProps = FoodPickerProps;
export const FoodPickerSheet = FoodPicker;
export default FoodPickerSheet;
