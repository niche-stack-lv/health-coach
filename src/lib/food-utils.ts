/**
 * Food utility types and helpers.
 * FoodItem is the runtime shape used by the food picker and quantity sheet.
 * All food data comes from the DB (foods table) — no static array.
 */

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
  unit?: string;         // e.g. "egg", "scoop", "roti", "tbsp"
  gramsPerUnit?: number; // how many grams per 1 unit
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

/** Map a DB food row to FoodItem */
export function mapDbFoodToFoodItem(f: any): FoodItem {
  return {
    id: f.id,
    name: f.name,
    category: f.category,
    emoji: f.emoji || "🍽️",
    unit: f.unit || undefined,
    gramsPerUnit: f.gramsPerUnit ?? f.grams_per_unit ?? undefined,
    per100g: {
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
    },
  };
}

/** Get display label for a food amount */
export function formatFoodAmount(food: FoodItem, grams: number): string {
  if (food.unit && food.gramsPerUnit) {
    const units = Math.round((grams / food.gramsPerUnit) * 10) / 10;
    const plural = units !== 1 && !["tbsp", "tsp"].includes(food.unit);
    return `${units} ${food.unit}${plural ? "s" : ""}`;
  }
  return `${grams}g`;
}

/** Get quick amount options — always 1x, 1.5x, 2x of the serving size */
export function getQuickAmounts(food: FoodItem): { label: string; grams: number }[] {
  const g = food.gramsPerUnit ?? 100;
  return [
    { label: "1",   grams: g },
    { label: "1.5", grams: Math.round(g * 1.5) },
    { label: "2",   grams: g * 2 },
  ];
}
