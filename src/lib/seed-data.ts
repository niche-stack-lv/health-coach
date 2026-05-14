/**
 * Seed data for the Dishes & Diet Directory feature.
 * Contains all dishes and 4 diet plan templates from the user's spreadsheet.
 *
 * Uses deterministic IDs for easy reference in seed SQL.
 * Days map: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday
 */

import type {
  Dish,
  DishItem,
  DietTemplate,
  TemplateMealSlot,
  MealSlotComponent,
  MealSlotDish,
  ComponentCategory,
  PlanType,
} from "@/types";
import { calculateDishMacros, roundMacros } from "@/lib/macro-calc";
import { foodDatabase } from "@/lib/food-database";

// ============================================================
// HELPERS
// ============================================================

const COACH_ID = "seed-coach-001";
const CREATED_AT = "2025-01-01T00:00:00Z";

function getFoodPer100g(foodId: string) {
  const food = foodDatabase.find((f) => f.id === foodId);
  if (!food) throw new Error(`Food not found: ${foodId}`);
  return food.per100g;
}

/** Build a DishItem from a food database reference */
function dbItem(
  id: string,
  dishId: string,
  foodId: string,
  grams: number,
  sortOrder: number
): DishItem {
  return { id, dishId, foodId, grams, sortOrder };
}

/** Build a DishItem from custom food data (per 100g) */
function customItem(
  id: string,
  dishId: string,
  name: string,
  emoji: string,
  per100g: { calories: number; protein: number; carbs: number; fat: number },
  grams: number,
  sortOrder: number
): DishItem {
  return {
    id,
    dishId,
    foodId: null,
    customName: name,
    customEmoji: emoji,
    customCalories: per100g.calories,
    customProtein: per100g.protein,
    customCarbs: per100g.carbs,
    customFat: per100g.fat,
    grams,
    sortOrder,
  };
}

/** Calculate total macros for a dish from its items */
function calcMacros(items: DishItem[]) {
  const mapped = items.map((item) => {
    if (item.foodId) {
      return { per100g: getFoodPer100g(item.foodId), grams: item.grams };
    }
    return {
      per100g: {
        calories: item.customCalories!,
        protein: item.customProtein!,
        carbs: item.customCarbs!,
        fat: item.customFat!,
      },
      grams: item.grams,
    };
  });
  return roundMacros(calculateDishMacros(mapped));
}

/** Build a complete Dish object */
function makeDish(
  id: string,
  name: string,
  emoji: string,
  componentCategory: ComponentCategory,
  items: DishItem[]
): Dish {
  const macros = calcMacros(items);
  return {
    id,
    coachId: COACH_ID,
    name,
    emoji,
    componentCategory,
    totalCalories: macros.calories,
    totalProtein: macros.protein,
    totalCarbs: macros.carbs,
    totalFat: macros.fat,
    items,
    createdAt: CREATED_AT,
  };
}


// ============================================================
// CARBOHYDRATE DISHES
// ============================================================

const dish200gRice = makeDish(
  "dish-200g-rice",
  "200g Cooked Rice",
  "🍚",
  "carbohydrate",
  [dbItem("item-200g-rice-1", "dish-200g-rice", "c2", 200, 0)]
);

const dish2Roti = makeDish(
  "dish-2-roti",
  "2 Roti",
  "🫓",
  "carbohydrate",
  [dbItem("item-2-roti-1", "dish-2-roti", "c5", 80, 0)] // 2 rotis × 40g each
);

const dish300gCauliflowerRice = makeDish(
  "dish-300g-cauliflower-rice",
  "300g Cauliflower Rice",
  "🥦",
  "carbohydrate",
  [
    customItem(
      "item-cauli-rice-1",
      "dish-300g-cauliflower-rice",
      "Cauliflower Rice",
      "🥦",
      { calories: 25, protein: 2, carbs: 5, fat: 0.3 },
      300,
      0
    ),
  ]
);

const dish2LowCarbTortillas = makeDish(
  "dish-2-low-carb-tortillas",
  "2 Low Carb Tortillas",
  "🫓",
  "carbohydrate",
  [
    customItem(
      "item-lc-tortilla-1",
      "dish-2-low-carb-tortillas",
      "Low Carb Tortilla",
      "🫓",
      { calories: 156, protein: 11.1, carbs: 33.3, fat: 4.4 }, // per 100g (70cal/45g each)
      90, // 2 × 45g
      0
    ),
  ]
);

const dish150gRice = makeDish(
  "dish-150g-rice",
  "150g Cooked Rice",
  "🍚",
  "carbohydrate",
  [dbItem("item-150g-rice-1", "dish-150g-rice", "c2", 150, 0)]
);

const dishHalfCaesarSalad = makeDish(
  "dish-half-caesar-salad",
  "Half Packet Caesar Salad",
  "🥗",
  "carbohydrate",
  [
    customItem(
      "item-caesar-1",
      "dish-half-caesar-salad",
      "Caesar Salad (packaged)",
      "🥗",
      { calories: 133, protein: 4.7, carbs: 10, fat: 8 }, // per 100g (200cal/150g)
      150,
      0
    ),
  ]
);

const dishHalfAppleWalnutSalad = makeDish(
  "dish-half-apple-walnut-salad",
  "Half Packet Apple Walnut Salad",
  "🥗",
  "carbohydrate",
  [
    customItem(
      "item-apple-walnut-1",
      "dish-half-apple-walnut-salad",
      "Apple Walnut Salad (packaged)",
      "🥗",
      { calories: 147, protein: 3.3, carbs: 13.3, fat: 9.3 }, // per 100g (220cal/150g)
      150,
      0
    ),
  ]
);


// ============================================================
// PROTEIN DISHES
// ============================================================

const dishPalakPaneer60g = makeDish(
  "dish-palak-paneer-60g",
  "Palak Paneer 60g",
  "🧀",
  "protein",
  [
    dbItem("item-pp60-paneer", "dish-palak-paneer-60g", "p4", 60, 0),
    customItem(
      "item-pp60-gravy",
      "dish-palak-paneer-60g",
      "Spinach Gravy",
      "🥬",
      { calories: 30, protein: 2, carbs: 3, fat: 1 },
      100,
      1
    ),
  ]
);

const dishSoyCurry60g = makeDish(
  "dish-soy-curry-60g",
  "Soy Curry 60g",
  "🫘",
  "protein",
  [
    customItem(
      "item-soy-curry-1",
      "dish-soy-curry-60g",
      "Soy Curry",
      "🫘",
      { calories: 150, protein: 15, carbs: 10, fat: 5 },
      60,
      0
    ),
  ]
);

const dishRajmaCurry60g = makeDish(
  "dish-rajma-curry-60g",
  "Rajma Curry 60g",
  "🫘",
  "protein",
  [
    customItem(
      "item-rajma-1",
      "dish-rajma-curry-60g",
      "Rajma Curry",
      "🫘",
      { calories: 120, protein: 8, carbs: 18, fat: 2 },
      60,
      0
    ),
  ]
);

const dishCholeMasala60g = makeDish(
  "dish-chole-masala-60g",
  "Chole Masala 60g",
  "🫘",
  "protein",
  [
    customItem(
      "item-chole-60-1",
      "dish-chole-masala-60g",
      "Chole Masala",
      "🫘",
      { calories: 160, protein: 9, carbs: 20, fat: 5 },
      60,
      0
    ),
  ]
);

const dishPalakDal50g = makeDish(
  "dish-palak-dal-50g",
  "Palak Dal 50g",
  "🥬",
  "protein",
  [
    customItem(
      "item-palak-dal-1",
      "dish-palak-dal-50g",
      "Palak Dal",
      "🥬",
      { calories: 110, protein: 7, carbs: 15, fat: 2 },
      50,
      0
    ),
  ]
);

const dishKarelaOkraTindora = makeDish(
  "dish-karela-okra-tindora",
  "Karela/Okra/Tindora",
  "🥒",
  "protein",
  [
    customItem(
      "item-karela-1",
      "dish-karela-okra-tindora",
      "Karela/Okra/Tindora",
      "🥒",
      { calories: 40, protein: 2, carbs: 7, fat: 0.5 },
      150,
      0
    ),
  ]
);

const dish150gGroundTurkeyFry = makeDish(
  "dish-150g-ground-turkey-fry",
  "150g Ground Turkey Fry",
  "🍖",
  "protein",
  [
    customItem(
      "item-turkey-fry-1",
      "dish-150g-ground-turkey-fry",
      "Ground Turkey (lean)",
      "🍖",
      { calories: 170, protein: 27, carbs: 0, fat: 7 },
      150,
      0
    ),
  ]
);

const dish150gChickenBreast = makeDish(
  "dish-150g-chicken-breast",
  "150g Chicken Breast",
  "🍗",
  "protein",
  [dbItem("item-chicken-150-1", "dish-150g-chicken-breast", "p1", 150, 0)]
);

const dish2Eggs2EggWhitesFry = makeDish(
  "dish-2-eggs-2-egg-whites-fry",
  "2 Eggs + 2 Egg Whites Fry",
  "🥚",
  "protein",
  [
    dbItem("item-eggs-fry-whole", "dish-2-eggs-2-egg-whites-fry", "p2", 100, 0), // 2 eggs × 50g
    dbItem("item-eggs-fry-whites", "dish-2-eggs-2-egg-whites-fry", "p3", 66, 1), // 2 egg whites × 33g
  ]
);

const dish60gChole = makeDish(
  "dish-60g-chole",
  "60g Chole",
  "🫘",
  "protein",
  [
    customItem(
      "item-chole-alt-1",
      "dish-60g-chole",
      "Chole Masala",
      "🫘",
      { calories: 160, protein: 9, carbs: 20, fat: 5 },
      60,
      0
    ),
  ]
);

const dish4EggWhitesVeggies = makeDish(
  "dish-4-egg-whites-veggies",
  "4 Egg Whites + Veggies",
  "🥚",
  "protein",
  [
    dbItem("item-4ew-whites", "dish-4-egg-whites-veggies", "p3", 132, 0), // 4 × 33g
    customItem(
      "item-4ew-veggies",
      "dish-4-egg-whites-veggies",
      "Mixed Veggies",
      "🥬",
      { calories: 30, protein: 1.5, carbs: 5, fat: 0.3 },
      100,
      1
    ),
  ]
);

const dishEggBhurji100gWhites = makeDish(
  "dish-egg-bhurji-100g-whites",
  "Egg Bhurji 100g Egg Whites",
  "🥚",
  "protein",
  [dbItem("item-bhurji-whites", "dish-egg-bhurji-100g-whites", "p3", 100, 0)]
);

const dish60gPaneerBhurji = makeDish(
  "dish-60g-paneer-bhurji",
  "60g Paneer Bhurji",
  "🧀",
  "protein",
  [dbItem("item-paneer-bhurji-1", "dish-60g-paneer-bhurji", "p4", 60, 0)]
);

const dish4ozGrilledChicken = makeDish(
  "dish-4oz-grilled-chicken",
  "4oz Grilled Chicken Breast",
  "🍗",
  "protein",
  [dbItem("item-4oz-chicken-1", "dish-4oz-grilled-chicken", "p1", 113, 0)] // 4oz ≈ 113g
);

const dish6ozGrilledSalmon = makeDish(
  "dish-6oz-grilled-salmon",
  "6oz Grilled Salmon",
  "🐟",
  "protein",
  [dbItem("item-6oz-salmon-1", "dish-6oz-grilled-salmon", "p7", 170, 0)] // 6oz ≈ 170g
);

const dish2SmallLambChops = makeDish(
  "dish-2-small-lamb-chops",
  "2 Small Grilled Lamb Chops",
  "🥩",
  "protein",
  [
    customItem(
      "item-lamb-chops-1",
      "dish-2-small-lamb-chops",
      "Grilled Lamb Chops",
      "🥩",
      { calories: 250, protein: 25, carbs: 0, fat: 16 },
      150,
      0
    ),
  ]
);

const dishAirFriedTilapia = makeDish(
  "dish-air-fried-tilapia",
  "Air Fried Tilapia",
  "🐟",
  "protein",
  [
    customItem(
      "item-tilapia-1",
      "dish-air-fried-tilapia",
      "Air Fried Tilapia",
      "🐟",
      { calories: 130, protein: 26, carbs: 0, fat: 3 },
      150,
      0
    ),
  ]
);

const dish80gGrilledPaneer = makeDish(
  "dish-80g-grilled-paneer",
  "80g Grilled Paneer",
  "🧀",
  "protein",
  [dbItem("item-80g-paneer-1", "dish-80g-grilled-paneer", "p4", 80, 0)]
);

const dish3AirFriedChickenTenders = makeDish(
  "dish-3-air-fried-chicken-tenders",
  "3 Air Fried Chicken Tenders",
  "🍗",
  "protein",
  [
    customItem(
      "item-chicken-tenders-1",
      "dish-3-air-fried-chicken-tenders",
      "Air Fried Chicken Tenders",
      "🍗",
      { calories: 200, protein: 20, carbs: 10, fat: 9 },
      150,
      0
    ),
  ]
);

const dish100gPalakPaneer = makeDish(
  "dish-100g-palak-paneer",
  "100g Palak Paneer",
  "🧀",
  "protein",
  [
    dbItem("item-100pp-paneer", "dish-100g-palak-paneer", "p4", 100, 0),
    customItem(
      "item-100pp-gravy",
      "dish-100g-palak-paneer",
      "Spinach Gravy",
      "🥬",
      { calories: 30, protein: 2, carbs: 3, fat: 1 },
      100,
      1
    ),
  ]
);

const dish100gChole = makeDish(
  "dish-100g-chole",
  "100g Chole",
  "🫘",
  "protein",
  [
    customItem(
      "item-100-chole-1",
      "dish-100g-chole",
      "Chole Masala",
      "🫘",
      { calories: 160, protein: 9, carbs: 20, fat: 5 },
      100,
      0
    ),
  ]
);

const dish2Eggs50gWhitesCurry = makeDish(
  "dish-2-eggs-50g-whites-curry",
  "2 Eggs + 50g Egg Whites Curry",
  "🥚",
  "protein",
  [
    dbItem("item-2e50w-whole", "dish-2-eggs-50g-whites-curry", "p2", 100, 0), // 2 eggs × 50g
    dbItem("item-2e50w-whites", "dish-2-eggs-50g-whites-curry", "p3", 50, 1),
  ]
);


// ============================================================
// FIBER DISHES
// ============================================================

const dish300gCucumber = makeDish(
  "dish-300g-cucumber",
  "300g Cucumber",
  "🥒",
  "fiber",
  [
    customItem(
      "item-cucumber-1",
      "dish-300g-cucumber",
      "Cucumber",
      "🥒",
      { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
      300,
      0
    ),
  ]
);

const dish200gCarrot = makeDish(
  "dish-200g-carrot",
  "200g Carrot",
  "🥕",
  "fiber",
  [
    customItem(
      "item-carrot-1",
      "dish-200g-carrot",
      "Carrot",
      "🥕",
      { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
      200,
      0
    ),
  ]
);

const dish200gSteamedBroccoli = makeDish(
  "dish-200g-steamed-broccoli",
  "200g Steamed Broccoli",
  "🥦",
  "fiber",
  [
    customItem(
      "item-broccoli-1",
      "dish-200g-steamed-broccoli",
      "Steamed Broccoli",
      "🥦",
      { calories: 35, protein: 2.8, carbs: 7, fat: 0.4 },
      200,
      0
    ),
  ]
);

const dish200gSteamedMixedVeggies = makeDish(
  "dish-200g-steamed-mixed-veggies",
  "200g Steamed Mixed Veggies",
  "🥬",
  "fiber",
  [
    customItem(
      "item-mixed-veggies-1",
      "dish-200g-steamed-mixed-veggies",
      "Steamed Mixed Veggies",
      "🥬",
      { calories: 50, protein: 2, carbs: 10, fat: 0.5 },
      200,
      0
    ),
  ]
);

const dishHalfAvocado = makeDish(
  "dish-half-avocado",
  "Half Avocado",
  "🥑",
  "fiber",
  [dbItem("item-avocado-1", "dish-half-avocado", "f7", 75, 0)]
);

const dish200gBrusselsSprouts = makeDish(
  "dish-200g-brussels-sprouts",
  "200g Brussels Sprouts",
  "🥬",
  "fiber",
  [
    customItem(
      "item-brussels-1",
      "dish-200g-brussels-sprouts",
      "Brussels Sprouts",
      "🥬",
      { calories: 43, protein: 3.4, carbs: 9, fat: 0.3 },
      200,
      0
    ),
  ]
);

const dishWatermelon300g = makeDish(
  "dish-watermelon-300g",
  "Watermelon 300g",
  "🍉",
  "fiber",
  [
    customItem(
      "item-watermelon-1",
      "dish-watermelon-300g",
      "Watermelon",
      "🍉",
      { calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2 },
      300,
      0
    ),
  ]
);

const dishCantaloupe300g = makeDish(
  "dish-cantaloupe-300g",
  "Cantaloupe 300g",
  "🍈",
  "fiber",
  [
    customItem(
      "item-cantaloupe-1",
      "dish-cantaloupe-300g",
      "Cantaloupe",
      "🍈",
      { calories: 34, protein: 0.8, carbs: 8, fat: 0.2 },
      300,
      0
    ),
  ]
);

const dish200gBlueberries = makeDish(
  "dish-200g-blueberries",
  "200g Blueberries",
  "🫐",
  "fiber",
  [
    customItem(
      "item-blueberries-200-1",
      "dish-200g-blueberries",
      "Blueberries",
      "🫐",
      { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
      200,
      0
    ),
  ]
);

const dish1Apple = makeDish(
  "dish-1-apple",
  "1 Apple",
  "🍎",
  "fiber",
  [
    customItem(
      "item-apple-1",
      "dish-1-apple",
      "Apple",
      "🍎",
      { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      180,
      0
    ),
  ]
);

const dish1Banana = makeDish(
  "dish-1-banana",
  "1 Banana",
  "🍌",
  "fiber",
  [dbItem("item-banana-1", "dish-1-banana", "c6", 120, 0)]
);

const dish250gStrawberries = makeDish(
  "dish-250g-strawberries",
  "250g Strawberries",
  "🍓",
  "fiber",
  [
    customItem(
      "item-strawberries-250-1",
      "dish-250g-strawberries",
      "Strawberries",
      "🍓",
      { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
      250,
      0
    ),
  ]
);

const dishStrawberry200g = makeDish(
  "dish-strawberry-200g",
  "Strawberry",
  "🍓",
  "fiber",
  [
    customItem(
      "item-strawberry-200-1",
      "dish-strawberry-200g",
      "Strawberries",
      "🍓",
      { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
      200,
      0
    ),
  ]
);

const dishBlueberries150g = makeDish(
  "dish-blueberries-150g",
  "Blueberries",
  "🫐",
  "fiber",
  [
    customItem(
      "item-blueberries-150-1",
      "dish-blueberries-150g",
      "Blueberries",
      "🫐",
      { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
      150,
      0
    ),
  ]
);


// ============================================================
// COMPLETE MEAL DISHES
// ============================================================

const dishOvernightOats = makeDish(
  "dish-overnight-oats",
  "Overnight Oats",
  "🥣",
  "complete_meal",
  [
    dbItem("item-oo-oats", "dish-overnight-oats", "c3", 28, 0), // 28g oats
    dbItem("item-oo-yogurt", "dish-overnight-oats", "p6", 30, 1), // 30g greek yogurt
    dbItem("item-oo-whey", "dish-overnight-oats", "p5", 30, 2), // 30g whey protein
    customItem(
      "item-oo-coconut",
      "dish-overnight-oats",
      "Coconut (shredded)",
      "🥥",
      { calories: 650, protein: 0, carbs: 65, fat: 35 },
      20,
      3
    ),
    customItem(
      "item-oo-almond-milk",
      "dish-overnight-oats",
      "Almond Milk",
      "🥛",
      { calories: 15, protein: 0.5, carbs: 0.5, fat: 1.2 },
      200,
      4
    ),
  ]
);

const dishSmoothie = makeDish(
  "dish-smoothie",
  "Smoothie",
  "🥤",
  "complete_meal",
  [
    dbItem("item-sm-banana", "dish-smoothie", "c6", 40, 0), // 1/3 banana
    customItem(
      "item-sm-berries",
      "dish-smoothie",
      "Mixed Berries (frozen)",
      "🫐",
      { calories: 50, protein: 1, carbs: 12, fat: 0.3 },
      100,
      1
    ),
    customItem(
      "item-sm-almond-milk",
      "dish-smoothie",
      "Almond Milk",
      "🥛",
      { calories: 15, protein: 0.5, carbs: 0.5, fat: 1.2 },
      250,
      2
    ),
    dbItem("item-sm-whey", "dish-smoothie", "p5", 30, 3), // 30g whey protein
  ]
);

const dishProteinShake = makeDish(
  "dish-protein-shake",
  "Protein Shake",
  "🥤",
  "complete_meal",
  [
    customItem(
      "item-pshake-1",
      "dish-protein-shake",
      "Protein Shake (ready mix)",
      "🥤",
      { calories: 46, protein: 8.6, carbs: 1.4, fat: 0.9 }, // 160cal/350ml → per 100g
      350,
      0
    ),
  ]
);

const dish60gPohaWithVeggies = makeDish(
  "dish-60g-poha-with-veggies",
  "60g Poha with Veggies",
  "🍚",
  "complete_meal",
  [
    customItem(
      "item-poha-1",
      "dish-60g-poha-with-veggies",
      "Poha (flattened rice)",
      "🍚",
      { calories: 350, protein: 6, carbs: 75, fat: 2 },
      60,
      0
    ),
    customItem(
      "item-poha-yogurt",
      "dish-60g-poha-with-veggies",
      "Dannon Yogurt",
      "🥛",
      { calories: 53, protein: 8, carbs: 4.7, fat: 0 }, // 80cal/150g
      150,
      1
    ),
  ]
);

const dish3to4IdliSambar = makeDish(
  "dish-3-4-idli-sambar",
  "3-4 Idli + Sambar",
  "🍚",
  "complete_meal",
  [
    customItem(
      "item-idli-1",
      "dish-3-4-idli-sambar",
      "Idli",
      "🍚",
      { calories: 80, protein: 4, carbs: 16, fat: 0.4 }, // 40cal each, ~50g each, per 100g
      200, // 4 idlis
      0
    ),
    customItem(
      "item-sambar-1",
      "dish-3-4-idli-sambar",
      "Sambar",
      "🍲",
      { calories: 50, protein: 3, carbs: 7, fat: 1 },
      150,
      1
    ),
    customItem(
      "item-idli-yogurt",
      "dish-3-4-idli-sambar",
      "Dannon Yogurt",
      "🥛",
      { calories: 53, protein: 8, carbs: 4.7, fat: 0 },
      150,
      2
    ),
  ]
);

const dish2DosasAlooCurry = makeDish(
  "dish-2-dosas-aloo-curry",
  "2 Dosas + Aloo Curry",
  "🫓",
  "complete_meal",
  [
    customItem(
      "item-dosa-1",
      "dish-2-dosas-aloo-curry",
      "Dosa",
      "🫓",
      { calories: 200, protein: 5, carbs: 30, fat: 6.7 }, // 120cal/60g each, per 100g
      120, // 2 dosas
      0
    ),
    customItem(
      "item-aloo-curry-1",
      "dish-2-dosas-aloo-curry",
      "Aloo Curry",
      "🥔",
      { calories: 100, protein: 2, carbs: 15, fat: 4 },
      100,
      1
    ),
    customItem(
      "item-dosa-yogurt",
      "dish-2-dosas-aloo-curry",
      "Dannon Yogurt",
      "🥛",
      { calories: 53, protein: 8, carbs: 4.7, fat: 0 },
      150,
      2
    ),
  ]
);

const dishBiryani = makeDish(
  "dish-biryani",
  "Biryani",
  "🍛",
  "complete_meal",
  [
    customItem(
      "item-biryani-1",
      "dish-biryani",
      "Biryani",
      "🍛",
      { calories: 200, protein: 8, carbs: 25, fat: 8 },
      600,
      0
    ),
  ]
);

const dishChickenTurkeyPatties = makeDish(
  "dish-chicken-turkey-patties",
  "Chicken/Turkey Patties",
  "🍔",
  "complete_meal",
  [
    customItem(
      "item-patties-1",
      "dish-chicken-turkey-patties",
      "Chicken/Turkey Patties",
      "🍔",
      { calories: 180, protein: 20, carbs: 5, fat: 9 },
      150,
      0
    ),
  ]
);

const dish2WholeEggsHalfAvocado = makeDish(
  "dish-2-whole-eggs-half-avocado",
  "2 Whole Eggs + Half Avocado",
  "🥚",
  "complete_meal",
  [
    dbItem("item-2eha-eggs", "dish-2-whole-eggs-half-avocado", "p2", 100, 0), // 2 eggs × 50g
    dbItem("item-2eha-avocado", "dish-2-whole-eggs-half-avocado", "f7", 75, 1),
  ]
);


// ============================================================
// EXPORTED SEED DISHES ARRAY
// ============================================================

export const seedDishes: Dish[] = [
  // Carbohydrate
  dish200gRice,
  dish2Roti,
  dish300gCauliflowerRice,
  dish2LowCarbTortillas,
  dish150gRice,
  dishHalfCaesarSalad,
  dishHalfAppleWalnutSalad,
  // Protein
  dishPalakPaneer60g,
  dishSoyCurry60g,
  dishRajmaCurry60g,
  dishCholeMasala60g,
  dishPalakDal50g,
  dishKarelaOkraTindora,
  dish150gGroundTurkeyFry,
  dish150gChickenBreast,
  dish2Eggs2EggWhitesFry,
  dish60gChole,
  dish4EggWhitesVeggies,
  dishEggBhurji100gWhites,
  dish60gPaneerBhurji,
  dish4ozGrilledChicken,
  dish6ozGrilledSalmon,
  dish2SmallLambChops,
  dishAirFriedTilapia,
  dish80gGrilledPaneer,
  dish3AirFriedChickenTenders,
  dish100gPalakPaneer,
  dish100gChole,
  dish2Eggs50gWhitesCurry,
  // Fiber
  dish300gCucumber,
  dish200gCarrot,
  dish200gSteamedBroccoli,
  dish200gSteamedMixedVeggies,
  dishHalfAvocado,
  dish200gBrusselsSprouts,
  dishWatermelon300g,
  dishCantaloupe300g,
  dish200gBlueberries,
  dish1Apple,
  dish1Banana,
  dish250gStrawberries,
  dishStrawberry200g,
  dishBlueberries150g,
  // Complete Meal
  dishOvernightOats,
  dishSmoothie,
  dishProteinShake,
  dish60gPohaWithVeggies,
  dish3to4IdliSambar,
  dish2DosasAlooCurry,
  dishBiryani,
  dishChickenTurkeyPatties,
  dish2WholeEggsHalfAvocado,
];

// ============================================================
// TEMPLATE BUILDER HELPERS
// ============================================================

let _componentCounter = 0;
let _slotCounter = 0;
let _dishLinkCounter = 0;

function makeComponent(
  slotId: string,
  category: ComponentCategory,
  dishIds: string[],
  sortOrder: number
): MealSlotComponent {
  const compId = `comp-${++_componentCounter}`;
  const dishes: MealSlotDish[] = dishIds.map((dishId, idx) => ({
    id: `msd-${++_dishLinkCounter}`,
    componentId: compId,
    dishId,
    sortOrder: idx,
  }));
  return {
    id: compId,
    slotId,
    componentCategory: category,
    sortOrder,
    dishes,
  };
}

function makeSlot(
  templateId: string,
  name: string,
  targetCalories: number | null,
  isSkipped: boolean,
  sortOrder: number,
  components: { category: ComponentCategory; dishIds: string[] }[]
): TemplateMealSlot {
  const slotId = `slot-${++_slotCounter}`;
  const comps = components.map((c, idx) =>
    makeComponent(slotId, c.category, c.dishIds, idx)
  );
  return {
    id: slotId,
    templateId,
    name,
    targetCalories,
    isSkipped,
    sortOrder,
    components: comps,
  };
}

function makeDay(
  templateId: string,
  dayNumber: number,
  slots: {
    name: string;
    targetCalories: number | null;
    isSkipped: boolean;
    components: { category: ComponentCategory; dishIds: string[] }[];
  }[]
): TemplateMealSlot[] {
  return slots.map((s, idx) =>
    makeSlot(templateId, s.name, s.targetCalories, s.isSkipped, idx, s.components)
  );
}


// ============================================================
// TEMPLATE 1: VEG PLAN
// ============================================================

// Standard veg lunch components: rice/roti + protein + fiber
// Standard veg dinner components: rice/roti + protein + fiber
// Breakfast: overnight oats or poha/idli/dosa (complete_meal)
// Snack: protein shake or fruit

const vegTemplateId = "template-veg";

const vegDays: TemplateMealSlot[][] = [
  // Day 1 = Sunday
  makeDay(vegTemplateId, 1, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishOvernightOats.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dishPalakPaneer60g.id, dishSoyCurry60g.id] },
        { category: "fiber", dishIds: [dish300gCucumber.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishRajmaCurry60g.id, dishCholeMasala60g.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 2 = Monday
  makeDay(vegTemplateId, 2, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish60gPohaWithVeggies.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dishCholeMasala60g.id, dishPalakDal50g.id] },
        { category: "fiber", dishIds: [dish200gSteamedBroccoli.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dishWatermelon300g.id, dishCantaloupe300g.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishPalakPaneer60g.id, dishKarelaOkraTindora.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 3 = Tuesday
  makeDay(vegTemplateId, 3, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish3to4IdliSambar.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dishSoyCurry60g.id, dishRajmaCurry60g.id] },
        { category: "fiber", dishIds: [dish300gCucumber.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dish200gBlueberries.id, dish1Apple.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishCholeMasala60g.id, dishPalakDal50g.id] },
        { category: "fiber", dishIds: [dish200gSteamedMixedVeggies.id] },
      ],
    },
  ]),
  // Day 4 = Wednesday
  makeDay(vegTemplateId, 4, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish2DosasAlooCurry.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dishPalakPaneer60g.id, dishCholeMasala60g.id] },
        { category: "fiber", dishIds: [dish200gSteamedBroccoli.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishRajmaCurry60g.id, dishSoyCurry60g.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 5 = Thursday
  makeDay(vegTemplateId, 5, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishOvernightOats.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dishSoyCurry60g.id, dishPalakDal50g.id] },
        { category: "fiber", dishIds: [dish300gCucumber.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dish1Banana.id, dish250gStrawberries.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishPalakPaneer60g.id, dishKarelaOkraTindora.id] },
        { category: "fiber", dishIds: [dish200gSteamedMixedVeggies.id] },
      ],
    },
  ]),
  // Day 6 = Friday
  makeDay(vegTemplateId, 6, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish60gPohaWithVeggies.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dishRajmaCurry60g.id, dishCholeMasala60g.id] },
        { category: "fiber", dishIds: [dish200gSteamedBroccoli.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishPalakDal50g.id, dishSoyCurry60g.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 7 = Saturday (No Breakfast, Biryani for lunch)
  makeDay(vegTemplateId, 7, [
    {
      name: "Breakfast",
      targetCalories: null,
      isSkipped: true,
      components: [],
    },
    {
      name: "Lunch",
      targetCalories: 1200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishBiryani.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dishWatermelon300g.id, dish1Apple.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishSmoothie.id] },
      ],
    },
  ]),
];


// ============================================================
// TEMPLATE 2: NONVEG PLAN
// ============================================================

const nonvegTemplateId = "template-nonveg";

const nonvegDays: TemplateMealSlot[][] = [
  // Day 1 = Sunday
  makeDay(nonvegTemplateId, 1, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishOvernightOats.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish150gGroundTurkeyFry.id] },
        { category: "fiber", dishIds: [dish300gCucumber.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dish2Eggs2EggWhitesFry.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 2 = Monday
  makeDay(nonvegTemplateId, 2, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish60gPohaWithVeggies.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish150gChickenBreast.id] },
        { category: "fiber", dishIds: [dish200gSteamedBroccoli.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dishWatermelon300g.id, dishCantaloupe300g.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishPalakPaneer60g.id, dish60gChole.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 3 = Tuesday
  makeDay(nonvegTemplateId, 3, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish3to4IdliSambar.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish150gGroundTurkeyFry.id] },
        { category: "fiber", dishIds: [dish300gCucumber.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dish200gBlueberries.id, dish1Apple.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dish4EggWhitesVeggies.id] },
        { category: "fiber", dishIds: [dish200gSteamedMixedVeggies.id] },
      ],
    },
  ]),
  // Day 4 = Wednesday
  makeDay(nonvegTemplateId, 4, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish2DosasAlooCurry.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish150gChickenBreast.id] },
        { category: "fiber", dishIds: [dish200gSteamedBroccoli.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishEggBhurji100gWhites.id, dish60gPaneerBhurji.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 5 = Thursday
  makeDay(nonvegTemplateId, 5, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishOvernightOats.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish150gGroundTurkeyFry.id] },
        { category: "fiber", dishIds: [dish300gCucumber.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dish1Banana.id, dish250gStrawberries.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dish2Eggs2EggWhitesFry.id] },
        { category: "fiber", dishIds: [dish200gSteamedMixedVeggies.id] },
      ],
    },
  ]),
  // Day 6 = Friday
  makeDay(nonvegTemplateId, 6, [
    {
      name: "Breakfast",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish60gPohaWithVeggies.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish150gChickenBreast.id] },
        { category: "fiber", dishIds: [dish200gSteamedBroccoli.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishPalakPaneer60g.id, dish60gChole.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 7 = Saturday (Biryani for lunch, Smoothie for dinner)
  makeDay(nonvegTemplateId, 7, [
    {
      name: "Breakfast",
      targetCalories: null,
      isSkipped: true,
      components: [],
    },
    {
      name: "Lunch",
      targetCalories: 1200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishBiryani.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dishWatermelon300g.id, dish1Apple.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishSmoothie.id] },
      ],
    },
  ]),
];


// ============================================================
// TEMPLATE 3: LOW CARB NONVEG PLAN
// ============================================================

const lowCarbTemplateId = "template-low-carb-nonveg";

const lowCarbDays: TemplateMealSlot[][] = [
  // Day 1 = Sunday
  makeDay(lowCarbTemplateId, 1, [
    {
      name: "Breakfast",
      targetCalories: 250,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish2WholeEggsHalfAvocado.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish300gCauliflowerRice.id] },
        { category: "protein", dishIds: [dish4ozGrilledChicken.id] },
        { category: "fiber", dishIds: [dish200gSteamedBroccoli.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2LowCarbTortillas.id] },
        { category: "protein", dishIds: [dish6ozGrilledSalmon.id] },
        { category: "fiber", dishIds: [dishStrawberry200g.id, dishBlueberries150g.id] },
      ],
    },
  ]),
  // Day 2 = Monday
  makeDay(lowCarbTemplateId, 2, [
    {
      name: "Breakfast",
      targetCalories: 250,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish2WholeEggsHalfAvocado.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish300gCauliflowerRice.id] },
        { category: "protein", dishIds: [dish150gGroundTurkeyFry.id] },
        { category: "fiber", dishIds: [dish200gBrusselsSprouts.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dishWatermelon300g.id, dishCantaloupe300g.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dishHalfCaesarSalad.id] },
        { category: "protein", dishIds: [dish2SmallLambChops.id] },
        { category: "fiber", dishIds: [dishBlueberries150g.id, dishStrawberry200g.id] },
      ],
    },
  ]),
  // Day 3 = Tuesday
  makeDay(lowCarbTemplateId, 3, [
    {
      name: "Breakfast",
      targetCalories: 250,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish2WholeEggsHalfAvocado.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish300gCauliflowerRice.id] },
        { category: "protein", dishIds: [dishAirFriedTilapia.id] },
        { category: "fiber", dishIds: [dish200gSteamedMixedVeggies.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dish200gBlueberries.id, dish1Apple.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2LowCarbTortillas.id] },
        { category: "protein", dishIds: [dish80gGrilledPaneer.id] },
        { category: "fiber", dishIds: [dishStrawberry200g.id] },
      ],
    },
  ]),
  // Day 4 = Wednesday
  makeDay(lowCarbTemplateId, 4, [
    {
      name: "Breakfast",
      targetCalories: 250,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish2WholeEggsHalfAvocado.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish300gCauliflowerRice.id] },
        { category: "protein", dishIds: [dish3AirFriedChickenTenders.id] },
        { category: "fiber", dishIds: [dish200gSteamedBroccoli.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dishHalfAppleWalnutSalad.id] },
        { category: "protein", dishIds: [dish6ozGrilledSalmon.id] },
        { category: "fiber", dishIds: [dishBlueberries150g.id] },
      ],
    },
  ]),
  // Day 5 = Thursday
  makeDay(lowCarbTemplateId, 5, [
    {
      name: "Breakfast",
      targetCalories: 250,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish2WholeEggsHalfAvocado.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish300gCauliflowerRice.id] },
        { category: "protein", dishIds: [dish4ozGrilledChicken.id] },
        { category: "fiber", dishIds: [dish200gBrusselsSprouts.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dish1Banana.id, dish250gStrawberries.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2LowCarbTortillas.id] },
        { category: "protein", dishIds: [dish2SmallLambChops.id] },
        { category: "fiber", dishIds: [dishStrawberry200g.id] },
      ],
    },
  ]),
  // Day 6 = Friday
  makeDay(lowCarbTemplateId, 6, [
    {
      name: "Breakfast",
      targetCalories: 250,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dish2WholeEggsHalfAvocado.id] },
      ],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish300gCauliflowerRice.id] },
        { category: "protein", dishIds: [dishAirFriedTilapia.id] },
        { category: "fiber", dishIds: [dish200gSteamedMixedVeggies.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dishHalfCaesarSalad.id] },
        { category: "protein", dishIds: [dish80gGrilledPaneer.id, dish4ozGrilledChicken.id] },
        { category: "fiber", dishIds: [dishBlueberries150g.id] },
      ],
    },
  ]),
  // Day 7 = Saturday (No Breakfast, Biryani for lunch, Smoothie for dinner)
  makeDay(lowCarbTemplateId, 7, [
    {
      name: "Breakfast",
      targetCalories: null,
      isSkipped: true,
      components: [],
    },
    {
      name: "Lunch",
      targetCalories: 1200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishBiryani.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dishWatermelon300g.id, dish1Apple.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishSmoothie.id] },
      ],
    },
  ]),
];


// ============================================================
// TEMPLATE 4: INTERMITTENT FASTING PLAN
// ============================================================

const ifTemplateId = "template-intermittent-fasting";

const ifDays: TemplateMealSlot[][] = [
  // Day 1 = Sunday (Breakfast skipped)
  makeDay(ifTemplateId, 1, [
    {
      name: "Breakfast",
      targetCalories: null,
      isSkipped: true,
      components: [],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish100gPalakPaneer.id, dish100gChole.id] },
        { category: "fiber", dishIds: [dish300gCucumber.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dish2Eggs50gWhitesCurry.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 2 = Monday (Breakfast skipped)
  makeDay(ifTemplateId, 2, [
    {
      name: "Breakfast",
      targetCalories: null,
      isSkipped: true,
      components: [],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish150gChickenBreast.id] },
        { category: "fiber", dishIds: [dish200gSteamedBroccoli.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dishWatermelon300g.id, dishCantaloupe300g.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishPalakPaneer60g.id, dish60gChole.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 3 = Tuesday (Breakfast skipped)
  makeDay(ifTemplateId, 3, [
    {
      name: "Breakfast",
      targetCalories: null,
      isSkipped: true,
      components: [],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish150gGroundTurkeyFry.id] },
        { category: "fiber", dishIds: [dish300gCucumber.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dish200gBlueberries.id, dish1Apple.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dish4EggWhitesVeggies.id] },
        { category: "fiber", dishIds: [dish200gSteamedMixedVeggies.id] },
      ],
    },
  ]),
  // Day 4 = Wednesday (Breakfast skipped)
  makeDay(ifTemplateId, 4, [
    {
      name: "Breakfast",
      targetCalories: null,
      isSkipped: true,
      components: [],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish150gChickenBreast.id] },
        { category: "fiber", dishIds: [dish200gSteamedBroccoli.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishEggBhurji100gWhites.id, dish60gPaneerBhurji.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 5 = Thursday (Breakfast skipped)
  makeDay(ifTemplateId, 5, [
    {
      name: "Breakfast",
      targetCalories: null,
      isSkipped: true,
      components: [],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish150gGroundTurkeyFry.id] },
        { category: "fiber", dishIds: [dish300gCucumber.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dish1Banana.id, dish250gStrawberries.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dish2Eggs2EggWhitesFry.id] },
        { category: "fiber", dishIds: [dish200gSteamedMixedVeggies.id] },
      ],
    },
  ]),
  // Day 6 = Friday (Breakfast skipped)
  makeDay(ifTemplateId, 6, [
    {
      name: "Breakfast",
      targetCalories: null,
      isSkipped: true,
      components: [],
    },
    {
      name: "Lunch",
      targetCalories: 500,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish200gRice.id] },
        { category: "protein", dishIds: [dish150gChickenBreast.id] },
        { category: "fiber", dishIds: [dish200gSteamedBroccoli.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishProteinShake.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "carbohydrate", dishIds: [dish2Roti.id] },
        { category: "protein", dishIds: [dishPalakPaneer60g.id, dish60gChole.id] },
        { category: "fiber", dishIds: [dish200gCarrot.id] },
      ],
    },
  ]),
  // Day 7 = Saturday (Breakfast skipped, Biryani for lunch, Smoothie for dinner)
  makeDay(ifTemplateId, 7, [
    {
      name: "Breakfast",
      targetCalories: null,
      isSkipped: true,
      components: [],
    },
    {
      name: "Lunch",
      targetCalories: 1200,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishBiryani.id] },
      ],
    },
    {
      name: "Snack",
      targetCalories: 200,
      isSkipped: false,
      components: [
        { category: "fiber", dishIds: [dishWatermelon300g.id, dish1Apple.id] },
      ],
    },
    {
      name: "Dinner",
      targetCalories: 400,
      isSkipped: false,
      components: [
        { category: "complete_meal", dishIds: [dishSmoothie.id] },
      ],
    },
  ]),
];


// ============================================================
// EXPORTED SEED TEMPLATES ARRAY
// ============================================================

export const seedTemplates: DietTemplate[] = [
  {
    id: vegTemplateId,
    coachId: COACH_ID,
    name: "Veg Plan",
    planType: "veg" as PlanType,
    mealSlots: vegDays[0],
    createdAt: CREATED_AT,
  },
  {
    id: nonvegTemplateId,
    coachId: COACH_ID,
    name: "Nonveg Plan",
    planType: "nonveg" as PlanType,
    mealSlots: nonvegDays[0],
    createdAt: CREATED_AT,
  },
  {
    id: lowCarbTemplateId,
    coachId: COACH_ID,
    name: "Low Carb Nonveg Plan",
    planType: "low_carb_nonveg" as PlanType,
    mealSlots: lowCarbDays[0],
    createdAt: CREATED_AT,
  },
  {
    id: ifTemplateId,
    coachId: COACH_ID,
    name: "Intermittent Fasting Plan",
    planType: "intermittent_fasting" as PlanType,
    mealSlots: ifDays[0],
    createdAt: CREATED_AT,
  },
];
