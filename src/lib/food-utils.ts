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

/** Get quick amount options for the quantity sheet */
export function getQuickAmounts(food: FoodItem): { label: string; grams: number }[] {
  if (food.unit && food.gramsPerUnit) {
    const g = food.gramsPerUnit;
    const isGramUnit = /^\d+g/.test(food.unit) || /~\d+g/.test(food.unit);
    if (isGramUnit) {
      return [
        { label: `${g}g`, grams: g },
        { label: `${Math.round(g * 1.5)}g`, grams: Math.round(g * 1.5) },
        { label: `${g * 2}g`, grams: g * 2 },
        { label: `${Math.round(g * 2.5)}g`, grams: Math.round(g * 2.5) },
        { label: `${g * 3}g`, grams: g * 3 },
        { label: `${g * 4}g`, grams: g * 4 },
      ];
    }
    return [
      { label: `1 ${food.unit}`, grams: g },
      { label: `2 ${food.unit}s`, grams: g * 2 },
      { label: `3 ${food.unit}s`, grams: g * 3 },
      { label: `4 ${food.unit}s`, grams: g * 4 },
      { label: `5 ${food.unit}s`, grams: g * 5 },
      { label: `6 ${food.unit}s`, grams: g * 6 },
    ];
  }
  return [
    { label: "50g",  grams: 50  },
    { label: "100g", grams: 100 },
    { label: "150g", grams: 150 },
    { label: "200g", grams: 200 },
    { label: "250g", grams: 250 },
    { label: "300g", grams: 300 },
  ];
}
