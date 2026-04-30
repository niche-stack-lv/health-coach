import { getSupabase } from "./supabase";

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

// ---- Diet Plans ----
export async function getDietPlans(coachId: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from("diet_plans")
    .select("*, meals:diet_meals(*), client:profiles!diet_plans_client_id_fkey(name, email)")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getClientDietPlans(clientId: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from("diet_plans")
    .select("*, meals:diet_meals(*)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function createDietPlan(plan: {
  coach_id: string; client_id: string; title: string; description?: string;
  start_date: string; end_date: string; weeks: number;
  meals: { name: string; time: string; items: string[]; calories: number; protein: number; carbs: number; fat: number; sort_order: number }[];
}) {
  const sb = getSupabase();
  const { data, error } = await sb.from("diet_plans").insert({
    coach_id: plan.coach_id, client_id: plan.client_id, title: plan.title,
    description: plan.description, start_date: plan.start_date, end_date: plan.end_date, weeks: plan.weeks,
  }).select().single();
  if (error || !data) return { error: error?.message || "Failed" };

  const mealsToInsert = plan.meals.map((m) => ({
    plan_id: data.id, name: m.name, time: m.time, items: m.items,
    calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat, sort_order: m.sort_order,
  }));
  await sb.from("diet_meals").insert(mealsToInsert);
  return { error: null, planId: data.id };
}

// ---- Workout Plans ----
export async function getWorkoutPlans(coachId: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from("workout_plans")
    .select("*, days:workout_days(*), client:profiles!workout_plans_client_id_fkey(name, email)")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getClientWorkoutPlans(clientId: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from("workout_plans")
    .select("*, days:workout_days(*)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function createWorkoutPlan(plan: {
  coach_id: string; client_id: string; title: string;
  days: { day_label: string; name: string; exercises: unknown[]; sort_order: number }[];
}) {
  const sb = getSupabase();
  const { data, error } = await sb.from("workout_plans").insert({
    coach_id: plan.coach_id, client_id: plan.client_id, title: plan.title,
  }).select().single();
  if (error || !data) return { error: error?.message || "Failed" };

  const daysToInsert = plan.days.map((d) => ({
    plan_id: data.id, day_label: d.day_label, name: d.name, exercises: d.exercises, sort_order: d.sort_order,
  }));
  await sb.from("workout_days").insert(daysToInsert);
  return { error: null, planId: data.id };
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

// ---- Update Workout Plan Days ----
export async function updateWorkoutPlanDays(planId: string, days: {
  day_label: string; name: string; exercises: unknown[]; sort_order: number;
}[]) {
  const sb = getSupabase();
  const { error: deleteError } = await sb.from("workout_days").delete().eq("plan_id", planId);
  if (deleteError) return { error: deleteError.message };
  if (days.length > 0) {
    const { error: insertError } = await sb.from("workout_days").insert(
      days.map((d) => ({ plan_id: planId, ...d }))
    );
    if (insertError) return { error: insertError.message };
  }
  return { error: null };
}

// ---- Get single workout plan by ID ----
export async function getWorkoutPlan(planId: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from("workout_plans")
    .select("*, days:workout_days(*), client:profiles!workout_plans_client_id_fkey(name, email)")
    .eq("id", planId)
    .single();
  return data;
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
