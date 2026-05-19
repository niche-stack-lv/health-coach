export type UserRole = "coach" | "client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Client extends User {
  role: "client";
  coachId: string;
  status: "active" | "inactive";
  goal: string;
  startDate: string;
  currentWeight?: number;
  targetWeight?: number;
}

export interface DietPlan {
  id: string;
  coachId: string;
  clientId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  weeks: number;
  meals: Meal[];
  status: "active" | "completed" | "draft";
  createdAt: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  items: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface CheckIn {
  id: string;
  clientId: string;
  planId: string;
  date: string;
  week: number;
  photos: Photo[];
  weight?: number;
  notes?: string;
  coachFeedback?: string;
  status: "pending" | "reviewed";
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  type: "front" | "side" | "back";
  uploadedAt: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

// Component categories for dishes
export type ComponentCategory = "carbohydrate" | "protein" | "fiber" | "complete_meal";

// Diet plan template types
export type PlanType = "veg" | "nonveg" | "low_carb_nonveg" | "intermittent_fasting";

// A food item within a dish (standard or custom)
export interface DishItem {
  id: string;
  dishId: string;
  foodId: string | null;       // null = custom food item
  customName?: string;         // only for custom items
  customEmoji?: string;        // only for custom items
  customCalories?: number;     // per 100g, only for custom items
  customProtein?: number;      // per 100g, only for custom items
  customCarbs?: number;        // per 100g, only for custom items
  customFat?: number;          // per 100g, only for custom items
  grams: number;
  sortOrder: number;
}

// A reusable dish (recipe)
export interface Dish {
  id: string;
  coachId: string;
  name: string;
  emoji: string;
  componentCategory: ComponentCategory;
  description?: string | null;
  imageUrl?: string | null;
  mealSize?: "small" | "medium" | "large" | null;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: DishItem[];
  tags?: DishTag[];
  createdAt: string;
}

// Custom tag for organizing dishes
export interface DishTag {
  id: string;
  coachId: string;
  name: string;
  color: string;
  createdAt: string;
}

// A diet plan template (flat list of meal slots, same every day)
export interface DietTemplate {
  id: string;
  coachId: string;
  name: string;
  planType: PlanType;
  mealSlots: TemplateMealSlot[];
  createdAt: string;
}

// A meal slot within a template
export interface TemplateMealSlot {
  id: string;
  templateId: string;
  name: string;                // e.g., "Breakfast", "Lunch"
  targetCalories: number | null;
  isSkipped: boolean;          // for intermittent_fasting
  sortOrder: number;
  components: MealSlotComponent[];
}

// A component position within a meal slot
export interface MealSlotComponent {
  id: string;
  slotId: string;
  componentCategory: ComponentCategory;
  sortOrder: number;
  dishes: MealSlotDish[];      // alternatives
}

// A dish option within a component (one of the alternatives)
export interface MealSlotDish {
  id: string;
  componentId: string;
  dishId: string;
  dish?: Dish;                 // populated on read
  mealSize?: "small" | "medium" | "large" | null;
  sortOrder: number;
}

// Assignment of a template to a client (simple: one active at a time)
export interface TemplateAssignment {
  id: string;
  templateId: string;
  clientId: string;
  coachId: string;
  status: "active" | "inactive";
  template?: DietTemplate;     // populated on read
  createdAt: string;
}

// Daily food check-in
export interface FoodCheckIn {
  id: string;
  clientId: string;
  assignmentId: string | null;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  adherenceScore: number;      // 0-100 percentage
  weight?: number | null;
  waterLitres?: number | null;
  steps?: number | null;
  sleepHours?: number | null;
  energyLevel?: number | null;
  mood?: string | null;
  notes?: string | null;
  coachFeedback?: string | null;
  status?: string;
  items: FoodCheckInItem[];
  createdAt: string;
}

// Individual selection within a check-in
export interface FoodCheckInItem {
  id: string;
  checkInId: string;
  slotId: string | null;
  componentId: string | null;
  dishId: string | null;       // null = skipped or other
  isSkipped: boolean;
  customName?: string | null;
  customCalories?: number | null;
}

// Workout template system
export interface WorkoutSlotExercise {
  id: string;
  slotId: string;
  exerciseId: string | null;
  customName?: string;
  customEmoji?: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  sortOrder: number;
}

export interface WorkoutTemplateSlot {
  id: string;
  templateId: string;
  name: string;
  sortOrder: number;
  exercises: WorkoutSlotExercise[];
}

export interface WorkoutTemplate {
  id: string;
  coachId: string;
  name: string;
  isTemplate: boolean;
  slots: WorkoutTemplateSlot[];
  createdAt: string;
}

export interface WorkoutAssignment {
  id: string;
  templateId: string;
  clientId: string;
  coachId: string;
  template?: WorkoutTemplate;
  createdAt: string;
}
