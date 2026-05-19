import { getSupabase } from "./supabase";
import type {
  Dish,
  DishItem,
  DishTag,
  ComponentCategory,
  DietTemplate,
  TemplateMealSlot,
  MealSlotComponent,
  MealSlotDish,
  TemplateAssignment,
  FoodCheckIn,
  FoodCheckInItem,
  PlanType,
  WorkoutTemplate,
  WorkoutTemplateSlot,
  WorkoutSlotExercise,
  WorkoutAssignment,
} from "@/types";

// ---- Clients ----
export async function getClients(coachId: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from("clients")
    .select("*, profile:profiles!clients_id_fkey(name, email)")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function addClient(coachId: string, email: string, name: string, goal: string) {
  const sb = getSupabase();
  // Create auth user with a secure temp password
  const tempPassword = crypto.randomUUID().slice(0, 12) + "A1!";
  const { data: authData, error: authError } = await sb.auth.signUp({
    email,
    password: tempPassword,
  });
  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Failed to create user" };

  const userId = authData.user.id;

  // Create profile — clean up auth user on failure
  const { error: profileError } = await sb.from("profiles").insert({
    id: userId,
    email,
    name,
    role: "client",
  });
  if (profileError) {
    await sb.auth.admin.deleteUser(userId).catch(() => {
      // admin.deleteUser requires service role key which we don't have client-side.
      // Log for manual cleanup.
      console.error(`[addClient] Orphaned auth user ${userId} — profile insert failed: ${profileError.message}`);
    });
    return { error: profileError.message };
  }

  // Create client record — clean up profile on failure
  const { error: clientError } = await sb.from("clients").insert({
    id: userId,
    coach_id: coachId,
    goal,
    status: "active",
  });
  if (clientError) {
    await sb.from("profiles").delete().eq("id", userId);
    console.error(`[addClient] Cleaned up profile for ${userId} — client insert failed: ${clientError.message}`);
    return { error: clientError.message };
  }

  return { error: null, clientId: userId, tempPassword };
}

// ---- Diet Plans (legacy — used by coach pages for backward compat) ----
export async function getDietPlans(coachId: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from("diet_plans")
    .select("*, meals:diet_meals(*), client:profiles!diet_plans_client_id_fkey(name, email)")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  return data || [];
}

// ---- Check-ins ----
export async function getCheckIns(clientId: string) {
  const sb = getSupabase();
  const { data } = await sb.from("check_ins").select("*").eq("client_id", clientId).order("date", { ascending: false });
  return data || [];
}

export async function getCoachCheckIns(coachId: string) {
  const sb = getSupabase();
  // Get client IDs belonging to this coach first
  const { data: clientRows } = await sb.from("clients").select("id").eq("coach_id", coachId);
  const clientIds = (clientRows || []).map((c) => c.id);
  if (clientIds.length === 0) return [];
  const { data } = await sb
    .from("check_ins")
    .select("*, client:profiles!check_ins_client_id_fkey(name, email)")
    .in("client_id", clientIds)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function createCheckIn(checkIn: {
  client_id: string; plan_id?: string; week: number; weight?: number; notes?: string; photos?: unknown[];
}) {
  const sb = getSupabase();
  const { error } = await sb.from("check_ins").insert(checkIn);
  return { error: error?.message || null };
}

// ---- Measurements ----
export async function getMeasurements(clientId: string) {
  const sb = getSupabase();
  const { data } = await sb.from("measurements").select("*").eq("client_id", clientId).order("date", { ascending: true });
  return data || [];
}

export async function addMeasurement(m: {
  client_id: string; weight?: number; body_fat?: number; chest?: number; waist?: number; hips?: number; arms?: number; thighs?: number;
}) {
  const sb = getSupabase();
  const { error } = await sb.from("measurements").insert(m);
  return { error: error?.message || null };
}

// ---- Habits ----
export async function getHabits(clientId: string) {
  const sb = getSupabase();
  const { data } = await sb.from("habits").select("*").eq("client_id", clientId);
  return data || [];
}

export async function getHabitLogs(clientId: string, date: string) {
  const sb = getSupabase();
  const { data } = await sb.from("habit_logs").select("*").eq("client_id", clientId).eq("date", date);
  return data || [];
}

export async function toggleHabitLog(habitId: string, clientId: string, date: string, completed: boolean, value?: string) {
  const sb = getSupabase();
  const { data: existing } = await sb.from("habit_logs").select("id").eq("habit_id", habitId).eq("client_id", clientId).eq("date", date).single();
  if (existing) {
    await sb.from("habit_logs").update({ completed, value: value || null }).eq("id", existing.id);
  } else {
    await sb.from("habit_logs").insert({ habit_id: habitId, client_id: clientId, date, completed, value: value || null });
  }
}

// ---- Habit management (coach) ----
export async function addHabit(coachId: string, clientId: string, name: string, emoji: string, target: string) {
  const sb = getSupabase();
  const { error } = await sb.from("habits").insert({ coach_id: coachId, client_id: clientId, name, emoji, target });
  return { error: error?.message || null };
}

export async function deleteHabit(habitId: string) {
  const sb = getSupabase();
  const { error } = await sb.from("habits").delete().eq("id", habitId);
  return { error: error?.message || null };
}

// ---- Profile ----
export async function getProfile(userId: string) {
  const sb = getSupabase();
  const { data } = await sb.from("profiles").select("*").eq("id", userId).single();
  return data;
}

export async function updateProfile(userId: string, updates: { name?: string; email?: string }) {
  const sb = getSupabase();
  const { error } = await sb.from("profiles").update(updates).eq("id", userId);
  return { error: error?.message || null };
}

// ---- Leads ----
export async function saveLead(lead: {
  source: "pricing" | "enquiry" | "book-call";
  name?: string;
  email?: string;
  phone?: string;
  goal?: string;
  program?: string;
  plan_type?: string;
  plan_label?: string;
  price?: string;
  duration?: string;
  age?: string;
  gender?: string;
  weight?: string;
  height?: string;
  diet?: string;
  gym?: string;
  experience?: string;
  injuries?: string;
  referral_source?: string;
  message?: string;
}) {
  const sb = getSupabase();
  const { error } = await sb.from("leads").insert(lead);
  return { error: error?.message || null };
}

export async function getLeads() {
  const sb = getSupabase();
  const { data } = await sb.from("leads").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function updateLeadStatus(id: string, status: "new" | "contacted" | "converted") {
  const sb = getSupabase();
  const { error } = await sb.from("leads").update({ status }).eq("id", id);
  return { error: error?.message || null };
}

// ---- Update Diet Plan Meals ----
export async function updateDietPlanMeals(planId: string, meals: {
  id?: string; name: string; time: string; items: string[];
  calories: number; protein: number; carbs: number; fat: number; sort_order: number;
}[]) {
  const sb = getSupabase();
  // Delete existing meals and re-insert
  const { error: deleteError } = await sb.from("diet_meals").delete().eq("plan_id", planId);
  if (deleteError) return { error: deleteError.message };
  if (meals.length > 0) {
    const { error: insertError } = await sb.from("diet_meals").insert(meals.map((m) => ({ plan_id: planId, ...m })));
    if (insertError) return { error: insertError.message };
  }
  return { error: null };
}

// ---- Search signed-up profiles (not yet clients) ----
export async function searchProfiles(query: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from("profiles")
    .select("id, name, email, role, created_at")
    .eq("role", "client")
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);
  return data || [];
}

// ---- Promote a profile to client under a coach ----
export async function promoteToClient(coachId: string, profileId: string, goal: string) {
  const sb = getSupabase();
  // Check if already a client
  const { data: existing } = await sb.from("clients").select("id").eq("id", profileId).maybeSingle();
  if (existing) return { error: "This user is already a client." };
  const { error } = await sb.from("clients").insert({
    id: profileId,
    coach_id: coachId,
    goal,
    status: "active",
  });
  return { error: error?.message || null };
}

// ---- Check-in Photo URLs ----
export async function getCheckInPhotoUrls(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];
  const sb = getSupabase();
  const urls: string[] = [];
  for (const path of paths) {
    const { data } = await sb.storage.from("check-in-photos").createSignedUrl(path, 3600);
    if (data?.signedUrl) urls.push(data.signedUrl);
  }
  return urls;
}

// ---- Foods ----
export async function getFoods() {
  const sb = getSupabase();
  const { data } = await sb
    .from("foods")
    .select("*")
    .order("category")
    .order("name");
  return data || [];
}

export async function createFood(food: {
  name: string;
  category: string;
  emoji: string;
  unit?: string;
  grams_per_unit?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}) {
  const sb = getSupabase();
  const { error } = await sb.from("foods").insert({ ...food, is_default: false });
  return { error: error?.message || null };
}

export async function updateFood(id: string, updates: {
  name?: string;
  category?: string;
  emoji?: string;
  unit?: string | null;
  grams_per_unit?: number | null;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}) {
  const sb = getSupabase();
  const { error } = await sb.from("foods").update(updates).eq("id", id);
  return { error: error?.message || null };
}

export async function deleteFood(id: string) {
  const sb = getSupabase();
  const { error } = await sb.from("foods").delete().eq("id", id);
  return { error: error?.message || null };
}

// ---- Exercises ----
export async function getExercises() {
  const sb = getSupabase();
  const { data } = await sb
    .from("exercises")
    .select("*")
    .order("category")
    .order("name");
  return data || [];
}

export async function createExercise(exercise: {
  name: string;
  category: string;
  emoji: string;
  equipment?: string;
  video_id?: string;
}) {
  const sb = getSupabase();
  const { error } = await sb.from("exercises").insert({ ...exercise, is_default: false });
  return { error: error?.message || null };
}

export async function updateExercise(id: string, updates: {
  name?: string;
  category?: string;
  emoji?: string;
  equipment?: string | null;
  video_id?: string | null;
}) {
  const sb = getSupabase();
  const { error } = await sb.from("exercises").update(updates).eq("id", id);
  return { error: error?.message || null };
}

export async function deleteExercise(id: string) {
  const sb = getSupabase();
  const { error } = await sb.from("exercises").delete().eq("id", id);
  return { error: error?.message || null };
}

// ---- Client Onboarding ----
export async function getOnboarding(clientId: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from("client_onboarding")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();
  return data;
}

export async function saveOnboarding(onboarding: {
  client_id: string;
  primary_goal?: string;
  other_goals?: string;
  motivation?: string;
  target_weight?: number;
  timeline?: string;
  age?: number;
  height?: string;
  current_weight?: number;
  weight_history?: string;
  activity_level?: string;
  work_type?: string;
  sleep_schedule?: string;
  breakfast?: string;
  lunch?: string;
  snacks?: string;
  dinner?: string;
  weekends?: string;
  pitfalls?: string;
  medical_conditions?: string;
  injuries?: string;
  notes?: string;
  city?: string;
  gym_access?: string;
  diet_type?: string;
  protein_preferences?: string[];
  veg_proteins?: string[];
  dals?: string[];
  vegetables?: string[];
  carb_sources?: string[];
  fruits?: string[];
  snack_preference?: string;
  open_to_yogurt?: string;
  open_to_shakes?: string;
  open_to_bars?: string;
  chai_coffee?: string;
  food_allergies?: string;
  cravings?: string[];
  alcohol?: string;
  meals_out?: string;
  fast_food?: string[];
  breakfast_person?: string;
  vacation_plans?: string;
  day_structure?: string;
  weekend_routine?: string;
  last_meal_sleep?: string;
  energy_level?: string;
  coaching_style?: string;
  biggest_struggle?: string;
  daily_steps?: string;
  cooking_comfort?: string;
  urgency?: string;
}) {
  const sb = getSupabase();
  // Upsert — update if exists, insert if not
  const { data: existing } = await sb
    .from("client_onboarding")
    .select("id")
    .eq("client_id", onboarding.client_id)
    .maybeSingle();

  if (existing) {
    const { error } = await sb.from("client_onboarding").update(onboarding).eq("id", existing.id);
    return { error: error?.message || null };
  } else {
    const { error } = await sb.from("client_onboarding").insert(onboarding);
    return { error: error?.message || null };
  }
}

// ---- Daily Check-ins (merged into food_check_ins) ----
export async function getDailyCheckIns(clientId: string, limit = 30) {
  const sb = getSupabase();
  const { data } = await sb
    .from("food_check_ins")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getTodayCheckIn(clientId: string) {
  const sb = getSupabase();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await sb
    .from("food_check_ins")
    .select("*")
    .eq("client_id", clientId)
    .eq("date", today)
    .maybeSingle();
  return data;
}

export async function getCoachDailyCheckIns(coachId: string, date?: string) {
  const sb = getSupabase();
  const { data: clients } = await sb.from("clients").select("id").eq("coach_id", coachId);
  if (!clients || clients.length === 0) return [];
  const clientIds = clients.map((c: any) => c.id);
  let query = sb
    .from("food_check_ins")
    .select("*, profile:profiles!food_check_ins_client_id_fkey(name), food_check_in_items(slot_id, component_id, dish_id, is_skipped, custom_name, custom_calories, dish:dishes(name, emoji, total_calories), slot:template_meal_slots(name))")
    .in("client_id", clientIds)
    .order("date", { ascending: false });
  if (date) query = query.eq("date", date);
  else query = query.limit(100);
  const { data } = await query;
  return data || [];
}

export async function createDailyCheckIn(checkIn: {
  client_id: string;
  date?: string;
  weight?: number;
  water_litres?: number;
  steps?: number;
  sleep_hours?: number;
  energy_level?: number;
  mood?: string;
  notes?: string;
}) {
  const sb = getSupabase();
  const today = checkIn.date || new Date().toISOString().split("T")[0];
  // Upsert: if a food check-in already exists for today, update it with daily fields
  const { data: existing } = await sb
    .from("food_check_ins")
    .select("id")
    .eq("client_id", checkIn.client_id)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    const { error } = await sb.from("food_check_ins").update({
      weight: checkIn.weight,
      water_litres: checkIn.water_litres,
      steps: checkIn.steps,
      sleep_hours: checkIn.sleep_hours,
      energy_level: checkIn.energy_level,
      mood: checkIn.mood,
      notes: checkIn.notes,
    }).eq("id", existing.id);
    return { error: error?.message || null };
  } else {
    const { error } = await sb.from("food_check_ins").insert({
      client_id: checkIn.client_id,
      date: today,
      weight: checkIn.weight,
      water_litres: checkIn.water_litres,
      steps: checkIn.steps,
      sleep_hours: checkIn.sleep_hours,
      energy_level: checkIn.energy_level,
      mood: checkIn.mood,
      notes: checkIn.notes,
      status: "submitted",
    });
    return { error: error?.message || null };
  }
}

export async function updateDailyCheckIn(id: string, updates: {
  weight?: number;
  water_litres?: number;
  steps?: number;
  sleep_hours?: number;
  energy_level?: number;
  mood?: string;
  notes?: string;
}) {
  const sb = getSupabase();
  const { error } = await sb.from("food_check_ins").update(updates).eq("id", id);
  return { error: error?.message || null };
}

export async function updateDailyCheckInFeedback(id: string, feedback: string) {
  const sb = getSupabase();
  const { error } = await sb
    .from("food_check_ins")
    .update({ coach_feedback: feedback, status: "reviewed" })
    .eq("id", id);
  return { error: error?.message || null };
}


// ---- Dishes ----

function mapDishItemRow(row: any): DishItem {
  // If food_id is set and food data is joined, use it as custom fields
  const food = row.food;
  return {
    id: row.id,
    dishId: row.dish_id,
    foodId: row.food_id,
    customName: row.custom_name ?? food?.name ?? undefined,
    customEmoji: row.custom_emoji ?? food?.emoji ?? undefined,
    customCalories: row.custom_calories ?? (food ? Number(food.calories) : undefined),
    customProtein: row.custom_protein ?? (food ? Number(food.protein) : undefined),
    customCarbs: row.custom_carbs ?? (food ? Number(food.carbs) : undefined),
    customFat: row.custom_fat ?? (food ? Number(food.fat) : undefined),
    grams: row.grams,
    sortOrder: row.sort_order,
  };
}

function mapDishRow(row: any): Dish {
  return {
    id: row.id,
    coachId: row.coach_id,
    name: row.name,
    emoji: row.emoji,
    componentCategory: row.component_category as ComponentCategory,
    description: row.description,
    imageUrl: row.image_url,
    mealSize: row.meal_size,
    totalCalories: row.total_calories,
    totalProtein: row.total_protein,
    totalCarbs: row.total_carbs,
    totalFat: row.total_fat,
    items: (row.dish_items || []).map(mapDishItemRow),
    tags: (row.dish_tag_links || []).map((link: any) => link.tag).filter(Boolean),
    createdAt: row.created_at,
  };
}

export async function getDishes(coachId: string): Promise<Dish[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("dishes")
    .select(`*, dish_items(*, food:foods(*)), dish_tag_links(tag:dish_tags(*))`)
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  return (data || []).map(mapDishRow);
}

export async function getDish(dishId: string): Promise<Dish | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from("dishes")
    .select(`*, dish_items(*, food:foods(*)), dish_tag_links(tag:dish_tags(*))`)
    .eq("id", dishId)
    .single();
  return data ? mapDishRow(data) : null;
}

// ---- Dish Tags ----

export async function getDishTags(coachId: string): Promise<DishTag[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("dish_tags")
    .select("*")
    .eq("coach_id", coachId)
    .order("name");
  return (data || []).map((row: any) => ({
    id: row.id,
    coachId: row.coach_id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
  }));
}

export async function createDishTag(coachId: string, name: string, color?: string): Promise<{ id: string | null; error: string | null }> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("dish_tags")
    .insert({ coach_id: coachId, name, color: color || "#6b7280" })
    .select()
    .single();
  return { id: data?.id || null, error: error?.message || null };
}

export async function deleteDishTag(tagId: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const { error } = await sb.from("dish_tags").delete().eq("id", tagId);
  return { error: error?.message || null };
}

export async function setDishTags(dishId: string, tagIds: string[]): Promise<{ error: string | null }> {
  const sb = getSupabase();
  // Delete existing links
  await sb.from("dish_tag_links").delete().eq("dish_id", dishId);
  // Insert new links
  if (tagIds.length > 0) {
    const rows = tagIds.map((tagId) => ({ dish_id: dishId, tag_id: tagId }));
    const { error } = await sb.from("dish_tag_links").insert(rows);
    if (error) return { error: error.message };
  }
  return { error: null };
}

export async function createDish(input: {
  coachId: string;
  name: string;
  emoji: string;
  componentCategory: ComponentCategory;
  description?: string;
  imageUrl?: string;
  mealSize?: "small" | "medium" | "large";
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: Array<{
    foodId: string | null;
    customName?: string;
    customEmoji?: string;
    customCalories?: number;
    customProtein?: number;
    customCarbs?: number;
    customFat?: number;
    grams: number;
    sortOrder: number;
  }>;
  tagIds?: string[];
}): Promise<{ error: string | null; dishId?: string }> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("dishes")
    .insert({
      coach_id: input.coachId,
      name: input.name,
      emoji: input.emoji,
      component_category: input.componentCategory,
      description: input.description || null,
      image_url: input.imageUrl || null,
      meal_size: input.mealSize || null,
      total_calories: input.totalCalories,
      total_protein: input.totalProtein,
      total_carbs: input.totalCarbs,
      total_fat: input.totalFat,
    })
    .select()
    .single();
  if (error || !data) return { error: error?.message || "Failed to create dish" };

  const itemsToInsert = input.items.map((item) => ({
    dish_id: data.id,
    food_id: item.foodId,
    custom_name: item.customName || null,
    custom_emoji: item.customEmoji || null,
    custom_calories: item.customCalories ?? null,
    custom_protein: item.customProtein ?? null,
    custom_carbs: item.customCarbs ?? null,
    custom_fat: item.customFat ?? null,
    grams: item.grams,
    sort_order: item.sortOrder,
  }));

  if (itemsToInsert.length > 0) {
    const { error: itemsError } = await sb.from("dish_items").insert(itemsToInsert);
    if (itemsError) return { error: itemsError.message };
  }

  // Link tags if provided
  if (input.tagIds && input.tagIds.length > 0) {
    const tagRows = input.tagIds.map((tagId) => ({ dish_id: data.id, tag_id: tagId }));
    await sb.from("dish_tag_links").insert(tagRows);
  }

  return { error: null, dishId: data.id };
}

export async function updateDish(dishId: string, input: {
  name: string;
  emoji: string;
  componentCategory: ComponentCategory;
  description?: string;
  imageUrl?: string;
  mealSize?: "small" | "medium" | "large";
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: Array<{
    foodId: string | null;
    customName?: string;
    customEmoji?: string;
    customCalories?: number;
    customProtein?: number;
    customCarbs?: number;
    customFat?: number;
    grams: number;
    sortOrder: number;
  }>;
}): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const { error: updateError } = await sb
    .from("dishes")
    .update({
      name: input.name,
      emoji: input.emoji,
      component_category: input.componentCategory,
      description: input.description || null,
      image_url: input.imageUrl || null,
      meal_size: input.mealSize || null,
      total_calories: input.totalCalories,
      total_protein: input.totalProtein,
      total_carbs: input.totalCarbs,
      total_fat: input.totalFat,
    })
    .eq("id", dishId);
  if (updateError) return { error: updateError.message };

  // Delete existing items and re-insert
  const { error: deleteError } = await sb
    .from("dish_items")
    .delete()
    .eq("dish_id", dishId);
  if (deleteError) return { error: deleteError.message };

  if (input.items.length > 0) {
    const itemsToInsert = input.items.map((item) => ({
      dish_id: dishId,
      food_id: item.foodId,
      custom_name: item.customName || null,
      custom_emoji: item.customEmoji || null,
      custom_calories: item.customCalories ?? null,
      custom_protein: item.customProtein ?? null,
      custom_carbs: item.customCarbs ?? null,
      custom_fat: item.customFat ?? null,
      grams: item.grams,
      sort_order: item.sortOrder,
    }));
    const { error: insertError } = await sb.from("dish_items").insert(itemsToInsert);
    if (insertError) return { error: insertError.message };
  }

  return { error: null };
}

export async function deleteDish(dishId: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const { error } = await sb.from("dishes").delete().eq("id", dishId);
  return { error: error?.message || null };
}

export async function getDishReferences(dishId: string): Promise<{ templateName: string; templateId: string }[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("meal_slot_dishes")
    .select(`
      dish_id,
      component:meal_slot_components!meal_slot_dishes_component_id_fkey(
        slot:template_meal_slots!meal_slot_components_slot_id_fkey(
          template:diet_templates!template_meal_slots_template_id_fkey(id, name)
        )
      )
    `)
    .eq("dish_id", dishId);

  if (!data || data.length === 0) return [];

  // Extract unique template references
  const templateMap = new Map<string, string>();
  for (const row of data) {
    const component = row.component as any;
    const slot = component?.slot as any;
    const template = slot?.template as any;
    if (template?.id && template?.name) {
      templateMap.set(template.id, template.name);
    }
  }

  return Array.from(templateMap.entries()).map(([templateId, templateName]) => ({
    templateId,
    templateName,
  }));
}


// ---- Diet Templates ----

function mapMealSlotDishRow(row: any): MealSlotDish {
  return {
    id: row.id,
    componentId: row.component_id,
    dishId: row.dish_id,
    dish: row.dish ? mapDishRow(row.dish) : undefined,
    sortOrder: row.sort_order,
  };
}

function mapMealSlotComponentRow(row: any): MealSlotComponent {
  return {
    id: row.id,
    slotId: row.slot_id,
    componentCategory: row.component_category as ComponentCategory,
    sortOrder: row.sort_order,
    dishes: (row.meal_slot_dishes || []).map(mapMealSlotDishRow),
  };
}

function mapTemplateMealSlotRow(row: any): TemplateMealSlot {
  return {
    id: row.id,
    templateId: row.template_id,
    name: row.name,
    targetCalories: row.target_calories,
    isSkipped: row.is_skipped,
    sortOrder: row.sort_order,
    components: (row.meal_slot_components || []).map(mapMealSlotComponentRow),
  };
}

function mapDietTemplateRow(row: any): DietTemplate {
  return {
    id: row.id,
    coachId: row.coach_id,
    name: row.name,
    planType: row.plan_type as PlanType,
    mealSlots: (row.template_meal_slots || []).map(mapTemplateMealSlotRow),
    createdAt: row.created_at,
  };
}

const TEMPLATE_NESTED_SELECT = `
  *,
  template_meal_slots(
    *,
    meal_slot_components(
      *,
      meal_slot_dishes(
        *,
        dish:dishes(*, dish_items(*))
      )
    )
  )
`;

export async function getDietTemplates(coachId: string): Promise<DietTemplate[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("diet_templates")
    .select(TEMPLATE_NESTED_SELECT)
    .eq("coach_id", coachId)
    .eq("is_template", true)
    .order("created_at", { ascending: false });
  return (data || []).map(mapDietTemplateRow);
}

export async function getDietTemplate(templateId: string): Promise<DietTemplate | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from("diet_templates")
    .select(TEMPLATE_NESTED_SELECT)
    .eq("id", templateId)
    .single();
  return data ? mapDietTemplateRow(data) : null;
}

export async function createDietTemplate(input: {
  coachId: string;
  name: string;
  planType: PlanType;
  isTemplate?: boolean;
  mealSlots: Array<{
    name: string;
    targetCalories: number | null;
    isSkipped: boolean;
    sortOrder: number;
    components: Array<{
      componentCategory: ComponentCategory;
      sortOrder: number;
      dishIds: string[];
    }>;
  }>;
}): Promise<{ error: string | null; templateId?: string }> {
  const sb = getSupabase();

  // Insert template row
  const { data: template, error: templateError } = await sb
    .from("diet_templates")
    .insert({
      coach_id: input.coachId,
      name: input.name,
      plan_type: input.planType,
      is_template: input.isTemplate !== false, // defaults to true
    })
    .select()
    .single();
  if (templateError || !template) return { error: templateError?.message || "Failed to create template" };

  // Insert meal slots
  for (const slot of input.mealSlots) {
    const { data: slotData, error: slotError } = await sb
      .from("template_meal_slots")
      .insert({
        template_id: template.id,
        name: slot.name,
        target_calories: slot.targetCalories,
        is_skipped: slot.isSkipped,
        sort_order: slot.sortOrder,
      })
      .select()
      .single();
    if (slotError || !slotData) return { error: slotError?.message || "Failed to create meal slot" };

    // Insert components
    for (const component of slot.components) {
      const { data: compData, error: compError } = await sb
        .from("meal_slot_components")
        .insert({
          slot_id: slotData.id,
          component_category: component.componentCategory,
          sort_order: component.sortOrder,
        })
        .select()
        .single();
      if (compError || !compData) return { error: compError?.message || "Failed to create component" };

      // Insert dish alternatives
      if (component.dishIds.length > 0) {
        const dishRows = component.dishIds.map((dishId, idx) => ({
          component_id: compData.id,
          dish_id: dishId,
          sort_order: idx,
        }));
        const { error: dishError } = await sb.from("meal_slot_dishes").insert(dishRows);
        if (dishError) return { error: dishError.message };
      }
    }
  }

  return { error: null, templateId: template.id };
}

export async function updateDietTemplate(templateId: string, input: {
  name: string;
  planType: PlanType;
  mealSlots: Array<{
    name: string;
    targetCalories: number | null;
    isSkipped: boolean;
    sortOrder: number;
    components: Array<{
      componentCategory: ComponentCategory;
      sortOrder: number;
      dishIds: string[];
    }>;
  }>;
}): Promise<{ error: string | null }> {
  const sb = getSupabase();

  // Update template row
  const { error: updateError } = await sb
    .from("diet_templates")
    .update({
      name: input.name,
      plan_type: input.planType,
    })
    .eq("id", templateId);
  if (updateError) return { error: updateError.message };

  // Delete all template_meal_slots (cascade deletes components and dishes)
  const { error: deleteError } = await sb
    .from("template_meal_slots")
    .delete()
    .eq("template_id", templateId);
  if (deleteError) return { error: deleteError.message };

  // Re-insert meal slots and nested structure
  for (const slot of input.mealSlots) {
    const { data: slotData, error: slotError } = await sb
      .from("template_meal_slots")
      .insert({
        template_id: templateId,
        name: slot.name,
        target_calories: slot.targetCalories,
        is_skipped: slot.isSkipped,
        sort_order: slot.sortOrder,
      })
      .select()
      .single();
    if (slotError || !slotData) return { error: slotError?.message || "Failed to create meal slot" };

    for (const component of slot.components) {
      const { data: compData, error: compError } = await sb
        .from("meal_slot_components")
        .insert({
          slot_id: slotData.id,
          component_category: component.componentCategory,
          sort_order: component.sortOrder,
        })
        .select()
        .single();
      if (compError || !compData) return { error: compError?.message || "Failed to create component" };

      if (component.dishIds.length > 0) {
        const dishRows = component.dishIds.map((dishId, idx) => ({
          component_id: compData.id,
          dish_id: dishId,
          sort_order: idx,
        }));
        const { error: dishError } = await sb.from("meal_slot_dishes").insert(dishRows);
        if (dishError) return { error: dishError.message };
      }
    }
  }

  return { error: null };
}

export async function deleteDietTemplate(templateId: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  // Delete assignments referencing this template first
  await sb.from("template_assignments").delete().eq("template_id", templateId);
  // Now delete the template (cascade removes meal slots, components, dishes)
  const { error } = await sb.from("diet_templates").delete().eq("id", templateId);
  return { error: error?.message || null };
}

// ---- Template Assignments ----

function mapTemplateAssignmentRow(row: any): TemplateAssignment {
  return {
    id: row.id,
    templateId: row.template_id,
    clientId: row.client_id,
    coachId: row.coach_id,
    status: row.status,
    template: row.template ? mapDietTemplateRow(row.template) : undefined,
    createdAt: row.created_at,
  };
}

export async function getClientActiveAssignment(clientId: string): Promise<TemplateAssignment | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from("template_assignments")
    .select(`
      *,
      template:diet_templates(
        *,
        template_meal_slots(
          *,
          meal_slot_components(
            *,
            meal_slot_dishes(
              *,
              dish:dishes(*, dish_items(*))
            )
          )
        )
      )
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapTemplateAssignmentRow(data) : null;
}

export async function assignTemplate(input: { templateId: string; clientId: string; coachId: string }): Promise<{ error: string | null }> {
  const sb = getSupabase();

  // Just insert new assignment — the latest one is always the active one
  const { error } = await sb
    .from("template_assignments")
    .insert({
      template_id: input.templateId,
      client_id: input.clientId,
      coach_id: input.coachId,
      status: "active",
    });
  return { error: error?.message || null };
}

export async function deactivateAssignment(assignmentId: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const { error } = await sb
    .from("template_assignments")
    .update({ status: "inactive" })
    .eq("id", assignmentId);
  return { error: error?.message || null };
}

export async function getCoachAssignments(coachId: string): Promise<TemplateAssignment[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("template_assignments")
    .select(`
      *,
      template:diet_templates(
        *,
        template_meal_slots(
          *,
          meal_slot_components(
            *,
            meal_slot_dishes(
              *,
              dish:dishes(*, dish_items(*))
            )
          )
        )
      ),
      client:profiles!template_assignments_client_id_fkey(name, email)
    `)
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });

  return (data || []).map((row: any) => ({
    id: row.id,
    templateId: row.template_id,
    clientId: row.client_id,
    coachId: row.coach_id,
    status: row.status,
    template: row.template ? mapDietTemplateRow(row.template) : undefined,
    clientName: row.client?.name || "Client",
    createdAt: row.created_at,
  })) as TemplateAssignment[];
}

// ---- Food Check-ins ----

function mapFoodCheckInItemRow(row: any): FoodCheckInItem {
  return {
    id: row.id,
    checkInId: row.check_in_id,
    slotId: row.slot_id,
    componentId: row.component_id,
    dishId: row.dish_id,
    isSkipped: row.is_skipped,
    customName: row.custom_name,
    customCalories: row.custom_calories,
  };
}

function mapFoodCheckInRow(row: any): FoodCheckIn {
  return {
    id: row.id,
    clientId: row.client_id,
    assignmentId: row.assignment_id,
    date: row.date,
    totalCalories: row.total_calories,
    totalProtein: row.total_protein,
    totalCarbs: row.total_carbs,
    totalFat: row.total_fat,
    adherenceScore: row.adherence_score,
    weight: row.weight,
    waterLitres: row.water_litres,
    steps: row.steps,
    sleepHours: row.sleep_hours,
    energyLevel: row.energy_level,
    mood: row.mood,
    notes: row.notes,
    coachFeedback: row.coach_feedback,
    status: row.status,
    items: (row.food_check_in_items || []).map(mapFoodCheckInItemRow),
    createdAt: row.created_at,
  };
}

export async function getFoodCheckIn(clientId: string, date: string): Promise<FoodCheckIn | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from("food_check_ins")
    .select(`*, food_check_in_items(*)`)
    .eq("client_id", clientId)
    .eq("date", date)
    .maybeSingle();
  return data ? mapFoodCheckInRow(data) : null;
}

export async function createFoodCheckIn(input: {
  clientId: string;
  assignmentId: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  adherenceScore: number;
  weight?: number | null;
  items: Array<{
    slotId: string | null;
    componentId: string | null;
    dishId: string | null;
    isSkipped: boolean;
    customName?: string;
    customCalories?: number;
  }>;
}): Promise<{ error: string | null }> {
  const sb = getSupabase();

  // Check if check-in already exists for this client+date
  const { data: existing } = await sb
    .from("food_check_ins")
    .select("id")
    .eq("client_id", input.clientId)
    .eq("date", input.date)
    .maybeSingle();

  if (existing) {
    // Update existing check-in totals
    const { error: updateError } = await sb
      .from("food_check_ins")
      .update({
        assignment_id: input.assignmentId,
        total_calories: input.totalCalories,
        total_protein: input.totalProtein,
        total_carbs: input.totalCarbs,
        total_fat: input.totalFat,
        adherence_score: input.adherenceScore,
        weight: input.weight || null,
        status: "submitted",
      })
      .eq("id", existing.id);
    if (updateError) return { error: updateError.message };

    // Delete old items
    const { error: deleteError } = await sb
      .from("food_check_in_items")
      .delete()
      .eq("check_in_id", existing.id);
    if (deleteError) return { error: deleteError.message };

    // Insert new items
    const validItems = input.items.filter((item) => item.slotId && item.componentId);
    if (validItems.length > 0) {
      const itemRows = validItems.map((item) => ({
        check_in_id: existing.id,
        slot_id: item.slotId,
        component_id: item.componentId,
        dish_id: item.dishId,
        is_skipped: item.isSkipped,
        custom_name: item.customName || null,
        custom_calories: item.customCalories || null,
      }));
      const { error: insertError } = await sb.from("food_check_in_items").insert(itemRows);
      if (insertError) return { error: insertError.message };
    }
  } else {
    // Insert new check-in
    const { data: checkIn, error: insertError } = await sb
      .from("food_check_ins")
      .insert({
        client_id: input.clientId,
        assignment_id: input.assignmentId,
        date: input.date,
        total_calories: input.totalCalories,
        total_protein: input.totalProtein,
        total_carbs: input.totalCarbs,
        total_fat: input.totalFat,
        adherence_score: input.adherenceScore,
        weight: input.weight || null,
        status: "submitted",
      })
      .select()
      .single();
    if (insertError || !checkIn) return { error: insertError?.message || "Failed to create check-in" };

    // Insert items
    const validItems2 = input.items.filter((item) => item.slotId && item.componentId);
    if (validItems2.length > 0) {
      const itemRows = validItems2.map((item) => ({
        check_in_id: checkIn.id,
        slot_id: item.slotId,
        component_id: item.componentId,
        dish_id: item.dishId,
        is_skipped: item.isSkipped,
        custom_name: item.customName || null,
        custom_calories: item.customCalories || null,
      }));
      const { error: itemsError } = await sb.from("food_check_in_items").insert(itemRows);
      if (itemsError) return { error: itemsError.message };
    }
  }

  return { error: null };
}

export async function getClientFoodCheckIns(clientId: string, limit = 30): Promise<FoodCheckIn[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("food_check_ins")
    .select(`*, food_check_in_items(*)`)
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(limit);
  return (data || []).map(mapFoodCheckInRow);
}

export async function getCoachClientAdherence(coachId: string, clientId: string): Promise<FoodCheckIn[]> {
  const sb = getSupabase();
  // Verify client belongs to coach by checking the clients table
  const { data: clientRow } = await sb
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("coach_id", coachId)
    .maybeSingle();
  if (!clientRow) return [];

  const { data } = await sb
    .from("food_check_ins")
    .select(`*, food_check_in_items(*)`)
    .eq("client_id", clientId)
    .order("date", { ascending: false });
  return (data || []).map(mapFoodCheckInRow);
}


// ---- Workout Templates ----

// Types imported from @/types (WorkoutTemplate, WorkoutTemplateSlot, WorkoutSlotExercise, WorkoutAssignment)

function mapWorkoutSlotExerciseRow(row: any): WorkoutSlotExercise {
  return {
    id: row.id,
    slotId: row.slot_id,
    exerciseId: row.exercise_id,
    customName: row.custom_name ?? undefined,
    customEmoji: row.custom_emoji ?? undefined,
    sets: row.sets,
    reps: row.reps,
    restSeconds: row.rest_seconds,
    notes: row.notes ?? undefined,
    sortOrder: row.sort_order,
  };
}

function mapWorkoutTemplateSlotRow(row: any): WorkoutTemplateSlot {
  return {
    id: row.id,
    templateId: row.template_id,
    name: row.name,
    sortOrder: row.sort_order,
    exercises: (row.workout_slot_exercises || []).map(mapWorkoutSlotExerciseRow),
  };
}

function mapWorkoutTemplateRow(row: any): WorkoutTemplate {
  return {
    id: row.id,
    coachId: row.coach_id,
    name: row.name,
    isTemplate: row.is_template,
    slots: (row.workout_template_slots || []).map(mapWorkoutTemplateSlotRow),
    createdAt: row.created_at,
  };
}

const WORKOUT_TEMPLATE_NESTED_SELECT = `
  *,
  workout_template_slots(
    *,
    workout_slot_exercises(*)
  )
`;

export async function getWorkoutTemplates(coachId: string): Promise<WorkoutTemplate[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("workout_templates")
    .select(WORKOUT_TEMPLATE_NESTED_SELECT)
    .eq("coach_id", coachId)
    .eq("is_template", true)
    .order("created_at", { ascending: false });
  return (data || []).map(mapWorkoutTemplateRow);
}

export async function getWorkoutTemplate(templateId: string): Promise<WorkoutTemplate | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from("workout_templates")
    .select(WORKOUT_TEMPLATE_NESTED_SELECT)
    .eq("id", templateId)
    .single();
  return data ? mapWorkoutTemplateRow(data) : null;
}

export async function createWorkoutTemplate(input: {
  coachId: string;
  name: string;
  isTemplate?: boolean;
  slots: Array<{
    name: string;
    sortOrder: number;
    exercises: Array<{
      exerciseId: string | null;
      customName?: string;
      customEmoji?: string;
      sets: number;
      reps: string;
      restSeconds: number;
      notes?: string;
      sortOrder: number;
    }>;
  }>;
}): Promise<{ error: string | null; templateId?: string }> {
  const sb = getSupabase();

  // Insert template row
  const { data: template, error: templateError } = await sb
    .from("workout_templates")
    .insert({
      coach_id: input.coachId,
      name: input.name,
      is_template: input.isTemplate !== false,
    })
    .select()
    .single();
  if (templateError || !template) return { error: templateError?.message || "Failed to create workout template" };

  // Insert slots and exercises
  for (const slot of input.slots) {
    const { data: slotData, error: slotError } = await sb
      .from("workout_template_slots")
      .insert({
        template_id: template.id,
        name: slot.name,
        sort_order: slot.sortOrder,
      })
      .select()
      .single();
    if (slotError || !slotData) return { error: slotError?.message || "Failed to create workout slot" };

    if (slot.exercises.length > 0) {
      const exerciseRows = slot.exercises.map((ex) => ({
        slot_id: slotData.id,
        exercise_id: ex.exerciseId,
        custom_name: ex.customName || null,
        custom_emoji: ex.customEmoji || null,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.restSeconds,
        notes: ex.notes || null,
        sort_order: ex.sortOrder,
      }));
      const { error: exError } = await sb.from("workout_slot_exercises").insert(exerciseRows);
      if (exError) return { error: exError.message };
    }
  }

  return { error: null, templateId: template.id };
}

export async function updateWorkoutTemplate(templateId: string, input: {
  name: string;
  slots: Array<{
    name: string;
    sortOrder: number;
    exercises: Array<{
      exerciseId: string | null;
      customName?: string;
      customEmoji?: string;
      sets: number;
      reps: string;
      restSeconds: number;
      notes?: string;
      sortOrder: number;
    }>;
  }>;
}): Promise<{ error: string | null }> {
  const sb = getSupabase();

  // Update template row
  const { error: updateError } = await sb
    .from("workout_templates")
    .update({ name: input.name })
    .eq("id", templateId);
  if (updateError) return { error: updateError.message };

  // Delete all slots (cascade deletes exercises)
  const { error: deleteError } = await sb
    .from("workout_template_slots")
    .delete()
    .eq("template_id", templateId);
  if (deleteError) return { error: deleteError.message };

  // Re-insert slots and exercises
  for (const slot of input.slots) {
    const { data: slotData, error: slotError } = await sb
      .from("workout_template_slots")
      .insert({
        template_id: templateId,
        name: slot.name,
        sort_order: slot.sortOrder,
      })
      .select()
      .single();
    if (slotError || !slotData) return { error: slotError?.message || "Failed to create workout slot" };

    if (slot.exercises.length > 0) {
      const exerciseRows = slot.exercises.map((ex) => ({
        slot_id: slotData.id,
        exercise_id: ex.exerciseId,
        custom_name: ex.customName || null,
        custom_emoji: ex.customEmoji || null,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.restSeconds,
        notes: ex.notes || null,
        sort_order: ex.sortOrder,
      }));
      const { error: exError } = await sb.from("workout_slot_exercises").insert(exerciseRows);
      if (exError) return { error: exError.message };
    }
  }

  return { error: null };
}

export async function deleteWorkoutTemplate(templateId: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  // Delete assignments referencing this template first
  await sb.from("workout_assignments").delete().eq("template_id", templateId);
  // Now delete the template (cascade removes slots and exercises)
  const { error } = await sb.from("workout_templates").delete().eq("id", templateId);
  return { error: error?.message || null };
}

export async function getWorkoutAssignments(coachId: string): Promise<WorkoutAssignment[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("workout_assignments")
    .select(`
      *,
      template:workout_templates(
        *,
        workout_template_slots(
          *,
          workout_slot_exercises(*)
        )
      ),
      client:profiles!workout_assignments_client_id_fkey(name, email)
    `)
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });

  return (data || []).map((row: any) => ({
    id: row.id,
    templateId: row.template_id,
    clientId: row.client_id,
    coachId: row.coach_id,
    template: row.template ? mapWorkoutTemplateRow(row.template) : undefined,
    clientName: row.client?.name || "Client",
    createdAt: row.created_at,
  })) as WorkoutAssignment[];
}

export async function getClientActiveWorkoutAssignment(clientId: string): Promise<WorkoutAssignment | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from("workout_assignments")
    .select(`
      *,
      template:workout_templates(
        *,
        workout_template_slots(
          *,
          workout_slot_exercises(*)
        )
      )
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? {
    id: data.id,
    templateId: data.template_id,
    clientId: data.client_id,
    coachId: data.coach_id,
    template: data.template ? mapWorkoutTemplateRow(data.template) : undefined,
    createdAt: data.created_at,
  } : null;
}

export async function assignWorkoutTemplate(input: { templateId: string; clientId: string; coachId: string }): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const { error } = await sb
    .from("workout_assignments")
    .insert({
      template_id: input.templateId,
      client_id: input.clientId,
      coach_id: input.coachId,
    });
  return { error: error?.message || null };
}

export async function removeWorkoutAssignment(assignmentId: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const { error } = await sb
    .from("workout_assignments")
    .delete()
    .eq("id", assignmentId);
  return { error: error?.message || null };
}
