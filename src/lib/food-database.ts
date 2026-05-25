export interface FoodItem {
  id: string;
  name: string;
  category: "protein" | "carbs" | "fats" | "supplements";
  emoji: string;
  unit?: string;        // e.g. "egg", "scoop", "roti", "tbsp"
  gramsPerUnit?: number; // how many grams per 1 unit
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const foodDatabase: FoodItem[] = [
  // Protein sources
  { id: "p1", name: "Chicken Breast", category: "protein", emoji: "🍗", per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
  { id: "p2", name: "Eggs (whole)", category: "protein", emoji: "🥚", unit: "egg", gramsPerUnit: 50, per100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11 } },
  { id: "p3", name: "Egg Whites", category: "protein", emoji: "🥚", unit: "egg white", gramsPerUnit: 33, per100g: { calories: 52, protein: 11, carbs: 0.7, fat: 0.2 } },
  { id: "p4", name: "Paneer", category: "protein", emoji: "🧀", per100g: { calories: 265, protein: 18, carbs: 1.2, fat: 21 } },
  { id: "p5", name: "Whey Protein", category: "protein", emoji: "🥤", unit: "scoop", gramsPerUnit: 30, per100g: { calories: 400, protein: 80, carbs: 10, fat: 5 } },
  { id: "p6", name: "Greek Yogurt", category: "protein", emoji: "🥛", unit: "cup", gramsPerUnit: 200, per100g: { calories: 97, protein: 9, carbs: 3.6, fat: 5 } },
  { id: "p7", name: "Salmon", category: "protein", emoji: "🐟", per100g: { calories: 208, protein: 20, carbs: 0, fat: 13 } },
  { id: "p8", name: "Tuna", category: "protein", emoji: "🐟", unit: "can", gramsPerUnit: 120, per100g: { calories: 130, protein: 29, carbs: 0, fat: 1 } },
  { id: "p9", name: "Mutton", category: "protein", emoji: "🥩", per100g: { calories: 250, protein: 25, carbs: 0, fat: 16 } },
  { id: "p10", name: "Tofu", category: "protein", emoji: "🫘", per100g: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 } },

  // Carb sources
  { id: "c1", name: "Brown Rice", category: "carbs", emoji: "🍚", unit: "cup", gramsPerUnit: 185, per100g: { calories: 112, protein: 2.6, carbs: 23, fat: 0.9 } },
  { id: "c2", name: "White Rice", category: "carbs", emoji: "🍚", unit: "cup", gramsPerUnit: 185, per100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
  { id: "c3", name: "Oats", category: "carbs", emoji: "🥣", per100g: { calories: 389, protein: 17, carbs: 66, fat: 7 } },
  { id: "c4", name: "Sweet Potato", category: "carbs", emoji: "🍠", unit: "piece", gramsPerUnit: 130, per100g: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 } },
  { id: "c5", name: "Whole Wheat Roti", category: "carbs", emoji: "🫓", unit: "roti", gramsPerUnit: 40, per100g: { calories: 297, protein: 9, carbs: 50, fat: 7 } },
  { id: "c6", name: "Banana", category: "carbs", emoji: "🍌", unit: "banana", gramsPerUnit: 120, per100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 } },
  { id: "c7", name: "Quinoa", category: "carbs", emoji: "🌾", per100g: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9 } },
  { id: "c8", name: "White Bread", category: "carbs", emoji: "🍞", unit: "slice", gramsPerUnit: 30, per100g: { calories: 265, protein: 9, carbs: 49, fat: 3.2 } },
  { id: "c9", name: "Pasta", category: "carbs", emoji: "🍝", per100g: { calories: 131, protein: 5, carbs: 25, fat: 1.1 } },
  { id: "c10", name: "Potato", category: "carbs", emoji: "🥔", unit: "piece", gramsPerUnit: 150, per100g: { calories: 77, protein: 2, carbs: 17, fat: 0.1 } },

  // Fat sources
  { id: "f1", name: "Almonds", category: "fats", emoji: "🥜", unit: "piece", gramsPerUnit: 1.2, per100g: { calories: 579, protein: 21, carbs: 22, fat: 50 } },
  { id: "f2", name: "Peanut Butter", category: "fats", emoji: "🥜", unit: "tbsp", gramsPerUnit: 16, per100g: { calories: 588, protein: 25, carbs: 20, fat: 50 } },
  { id: "f3", name: "Ghee", category: "fats", emoji: "🧈", unit: "tsp", gramsPerUnit: 5, per100g: { calories: 900, protein: 0, carbs: 0, fat: 100 } },
  { id: "f4", name: "Olive Oil", category: "fats", emoji: "🫒", unit: "tbsp", gramsPerUnit: 14, per100g: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
  { id: "f5", name: "Coconut Oil", category: "fats", emoji: "🥥", unit: "tbsp", gramsPerUnit: 14, per100g: { calories: 862, protein: 0, carbs: 0, fat: 100 } },
  { id: "f6", name: "Walnuts", category: "fats", emoji: "🌰", unit: "piece", gramsPerUnit: 4, per100g: { calories: 654, protein: 15, carbs: 14, fat: 65 } },
  { id: "f7", name: "Avocado", category: "fats", emoji: "🥑", unit: "half", gramsPerUnit: 75, per100g: { calories: 160, protein: 2, carbs: 9, fat: 15 } },
  { id: "f8", name: "Cheese", category: "fats", emoji: "🧀", unit: "slice", gramsPerUnit: 20, per100g: { calories: 402, protein: 25, carbs: 1.3, fat: 33 } },
  { id: "f9", name: "Flax Seeds", category: "fats", emoji: "🌱", unit: "tbsp", gramsPerUnit: 10, per100g: { calories: 534, protein: 18, carbs: 29, fat: 42 } },
  { id: "f10", name: "Dark Chocolate", category: "fats", emoji: "🍫", unit: "square", gramsPerUnit: 10, per100g: { calories: 546, protein: 5, carbs: 60, fat: 31 } },

  // Supplements
  { id: "s1", name: "Creatine Monohydrate", category: "supplements", emoji: "💊", unit: "scoop", gramsPerUnit: 5, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { id: "s2", name: "Fish Oil", category: "supplements", emoji: "💊", unit: "capsule", gramsPerUnit: 1, per100g: { calories: 900, protein: 0, carbs: 0, fat: 100 } },
  { id: "s3", name: "CLA", category: "supplements", emoji: "💊", unit: "capsule", gramsPerUnit: 1, per100g: { calories: 900, protein: 0, carbs: 0, fat: 100 } },
  { id: "s4", name: "Multivitamin", category: "supplements", emoji: "💊", unit: "tablet", gramsPerUnit: 1, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { id: "s5", name: "BCAA", category: "supplements", emoji: "💊", unit: "scoop", gramsPerUnit: 10, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { id: "s6", name: "Glutamine", category: "supplements", emoji: "💊", unit: "scoop", gramsPerUnit: 5, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { id: "s7", name: "Pre-Workout", category: "supplements", emoji: "⚡", unit: "scoop", gramsPerUnit: 10, per100g: { calories: 10, protein: 0, carbs: 2, fat: 0 } },
  { id: "s8", name: "Ashwagandha", category: "supplements", emoji: "🌿", unit: "capsule", gramsPerUnit: 0.6, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { id: "s9", name: "Vitamin D3", category: "supplements", emoji: "☀️", unit: "capsule", gramsPerUnit: 0.01, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { id: "s10", name: "Zinc", category: "supplements", emoji: "💊", unit: "tablet", gramsPerUnit: 0.05, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
];

export const mealTypes = [
  { id: "breakfast", label: "Breakfast", emoji: "🌅", time: "7:00 AM" },
  { id: "lunch", label: "Lunch", emoji: "☀️", time: "12:30 PM" },
  { id: "snack", label: "Snack", emoji: "🍎", time: "4:00 PM" },
  { id: "dinner", label: "Dinner", emoji: "🌙", time: "7:30 PM" },
] as const;

// Helper: get display label for amount
export function formatFoodAmount(food: FoodItem, grams: number): string {
  if (food.unit && food.gramsPerUnit) {
    const units = Math.round((grams / food.gramsPerUnit) * 10) / 10;
    const plural = units !== 1 && !["tbsp", "tsp"].includes(food.unit);
    return `${units} ${food.unit}${plural ? "s" : ""}`;
  }
  return `${grams}g`;
}

// Helper: get quick amounts in the food's natural unit
export function getQuickAmounts(food: FoodItem): { label: string; grams: number }[] {
  if (food.unit && food.gramsPerUnit) {
    const g = food.gramsPerUnit;
    // If unit contains 'g' (like "150g", "200g", "60g raw"), use gram-based increments
    const isGramUnit = /^\d+g/.test(food.unit) || /~\d+g/.test(food.unit);
    if (isGramUnit) {
      // Show gram multiples based on the serving size
      return [
        { label: `${g}g`, grams: g },
        { label: `${Math.round(g * 1.5)}g`, grams: Math.round(g * 1.5) },
        { label: `${g * 2}g`, grams: g * 2 },
        { label: `${Math.round(g * 2.5)}g`, grams: Math.round(g * 2.5) },
        { label: `${g * 3}g`, grams: g * 3 },
        { label: `${g * 4}g`, grams: g * 4 },
      ];
    }
    // For countable units (chapati, idli, scoop, etc.), show 1-6 multiples
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
    { label: "50g", grams: 50 },
    { label: "100g", grams: 100 },
    { label: "150g", grams: 150 },
    { label: "200g", grams: 200 },
    { label: "250g", grams: 250 },
    { label: "300g", grams: 300 },
  ];
}
