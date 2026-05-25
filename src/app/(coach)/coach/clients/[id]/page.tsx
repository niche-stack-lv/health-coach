"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeightChart } from "@/components/charts/weight-chart";
import { MeasurementsChart } from "@/components/charts/measurements-chart";
import { getClients, getCoachCheckIns, getMeasurements, getHabits, addHabit, deleteHabit, getClientActiveAssignment, getClientActiveWorkoutAssignment, deactivateAssignment, removeWorkoutAssignment, getOnboarding, updateClient, updateProfile, getClientFoodCheckIns } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import { formatDate, cn } from "@/lib/utils";
import { ArrowLeft, TrendingDown, Camera, Calendar, Plus, Trash2, Sparkles, X, UtensilsCrossed, Dumbbell, Pencil } from "lucide-react";
import Link from "next/link";
import { MealSlotView } from "@/components/shared/meal-slot-view";
import { WorkoutSlotView } from "@/components/shared/workout-slot-view";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function ClientDetailPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}><ClientDetailPageInner /></Suspense>;
}

function ClientDetailPageInner() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialTab = (searchParams.get("tab") as any) || "overview";
  const [tab, setTab] = useState<"overview" | "checkins" | "diet" | "workout" | "measurements" | "habits" | "profile">(initialTab);
  const [client, setClient] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [dietAssignment, setDietAssignment] = useState<any>(null);
  const [workoutAssignment, setWorkoutAssignment] = useState<any>(null);
  const [onboarding, setOnboarding] = useState<any>(null);
  const [foodCheckIns, setFoodCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWeightGraph, setShowWeightGraph] = useState(false);

  // Habit form state
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [habitEmoji, setHabitEmoji] = useState("✅");
  const [habitTarget, setHabitTarget] = useState("");
  const [habitSaving, setHabitSaving] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user, id]);

  async function loadData() {
    if (!user) return;
    const [clients, cis, meas, habs, dietAsgn, workoutAsgn, onb, fci] = await Promise.all([
      getClients(user.id),
      getCoachCheckIns(user.id),
      getMeasurements(id as string),
      getHabits(id as string),
      getClientActiveAssignment(id as string),
      getClientActiveWorkoutAssignment(id as string),
      getOnboarding(id as string),
      getClientFoodCheckIns(id as string),
    ]);
    const found = clients.find((c: any) => c.id === id);
    setClient(found || null);
    setCheckIns(cis.filter((c: any) => c.client_id === id));
    setMeasurements(meas);
    setHabits(habs);
    setDietAssignment(dietAsgn);
    setWorkoutAssignment(workoutAsgn);
    setOnboarding(onb);
    setFoodCheckIns(fci);
    setLoading(false);
  }

  async function handleAddHabit() {
    if (!user || !habitName) return;
    setHabitSaving(true);
    await addHabit(user.id, id as string, habitName, habitEmoji, habitTarget);
    setHabitName("");
    setHabitEmoji("✅");
    setHabitTarget("");
    setShowHabitForm(false);
    setHabitSaving(false);
    const habs = await getHabits(id as string);
    setHabits(habs);
  }

  async function handleDeleteHabit(habitId: string) {
    await deleteHabit(habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;
  if (!client) return <div className="py-20 text-center"><p className="text-zinc-500">Client not found.</p><Link href="/coach/clients" className="text-gold text-sm mt-2 inline-block">← Back to clients</Link></div>;

  const name = client.profile?.name || "Unknown";
  const weightHistory = measurements.map((m: any) => ({ date: m.date || m.created_at, weight: m.weight })).filter((m: any) => m.weight);
  // Get weight from food check-ins (daily) + weekly check-ins
  const checkInWeights = [
    ...foodCheckIns
      .filter((ci: any) => ci.weight)
      .map((ci: any) => ({ date: ci.date || ci.createdAt, weight: ci.weight })),
    ...checkIns
      .filter((ci: any) => ci.weight)
      .map((ci: any) => ({ date: ci.date || ci.created_at, weight: ci.weight })),
  ].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestCheckInWeight = checkInWeights.length > 0 ? checkInWeights[checkInWeights.length - 1].weight : null;
  const latest = measurements[measurements.length - 1];

  return (
    <div>
      <Link href="/coach/clients" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-gold mb-4"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg lg:text-2xl font-bold text-white">{name}</h1>
            <Badge variant={client.status === "active" ? "success" : "default"}>{client.status}</Badge>
            <button onClick={() => setShowEditModal(true)} className="p-1.5 rounded-lg text-zinc-500 hover:text-gold hover:bg-white/[0.04] transition-colors">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-zinc-500 truncate">{client.goal}</p>
          <p className="text-xs text-zinc-600">{client.profile?.email}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(["overview", "checkins", "profile", "diet", "workout", "measurements", "habits"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-xl px-4 py-2 text-sm font-semibold border capitalize whitespace-nowrap", tab === t ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500")}>{t === "diet" ? "Diet Plan" : t === "workout" ? "Workout" : t === "checkins" ? "Check-ins" : t}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="p-3 cursor-pointer hover:border-gold/30 transition-colors" onClick={() => setShowWeightGraph(true)}>
              <TrendingDown className="h-4 w-4 text-emerald-400 mb-1" />
              <p className="text-xl font-bold text-white">{latestCheckInWeight || latest?.weight || client.current_weight || "—"}{(latestCheckInWeight || latest?.weight || client.current_weight) ? " kg" : ""}</p>
              <p className="text-[10px] text-zinc-500">Current kg</p>
            </Card>
            <Card className="p-3"><Camera className="h-4 w-4 text-sky-400 mb-1" /><p className="text-xl font-bold text-white">{checkIns.length}</p><p className="text-[10px] text-zinc-500">Check-ins</p></Card>
            <Card className="p-3"><Calendar className="h-4 w-4 text-amber-400 mb-1" /><p className="text-xl font-bold text-white">{dietAssignment ? 1 : 0}</p><p className="text-[10px] text-zinc-500">Diet plan</p></Card>
          </div>

          {weightHistory.length > 0 && (
            <Card className="mb-6">
              <h2 className="text-sm font-semibold text-white mb-1">Weight Progress</h2>
              <WeightChart data={weightHistory} targetWeight={client.target_weight} height={250} />
            </Card>
          )}

          <Card>
            <h2 className="text-sm font-semibold text-white mb-4">Check-in History</h2>
            {checkIns.length === 0 ? (
              <p className="text-sm text-zinc-500">No check-ins yet.</p>
            ) : (
              <div className="space-y-3">
                {checkIns.map((c) => (
                  <button key={c.id} onClick={() => setTab("checkins")} className="w-full flex items-center justify-between rounded-xl border border-white/[0.06] p-3 hover:bg-white/[0.03] transition-colors cursor-pointer text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.04] flex items-center justify-center text-xs font-bold text-gold">
                        {c.weight ? `${c.weight} kg` : "—"}
                      </div>
                      <p className="text-sm text-white">{formatDate(c.date || c.created_at)}</p>
                    </div>
                    <Badge variant={c.status === "reviewed" ? "success" : "warning"}>{c.status}</Badge>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "checkins" && (
        <div className="space-y-6">
          {/* Weekly Check-ins */}
          <div>
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Camera className="h-4 w-4 text-sky-400" /> Weekly Check-ins
              {checkIns.length > 0 && <span className="text-[10px] text-zinc-500">({checkIns.length})</span>}
            </h2>
            {checkIns.length === 0 ? (
              <Card className="p-6 text-center"><p className="text-sm text-zinc-500">No weekly check-ins yet.</p></Card>
            ) : (
              <div className="space-y-2">
                {checkIns.map((ci) => (
                  <WeeklyCheckInCard key={ci.id} checkIn={ci} />
                ))}
              </div>
            )}
          </div>

          {/* Daily Food Check-ins */}
          <div>
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" /> Daily Check-ins
              {foodCheckIns.length > 0 && <span className="text-[10px] text-zinc-500">({foodCheckIns.length})</span>}
            </h2>
            {foodCheckIns.length === 0 ? (
              <Card className="p-6 text-center"><p className="text-sm text-zinc-500">No daily check-ins yet.</p></Card>
            ) : (
              <div className="space-y-2">
                {foodCheckIns.map((ci: any) => (
                  <DailyCheckInCard key={ci.id} checkIn={ci} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "profile" && (
        <div>
          {onboarding ? (
            <div className="space-y-4">
              {/* Demographics */}
              <Card className="!p-4">
                <h3 className="text-xs font-semibold text-gold uppercase tracking-wide mb-3">Demographics</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {onboarding.age && <div><span className="text-zinc-500">Age:</span> <span className="text-white">{onboarding.age}</span></div>}
                  {onboarding.height && <div><span className="text-zinc-500">Height:</span> <span className="text-white">{onboarding.height}</span></div>}
                  {onboarding.current_weight && <div><span className="text-zinc-500">Weight:</span> <span className="text-white">{onboarding.current_weight}</span></div>}
                  {onboarding.city && <div><span className="text-zinc-500">City:</span> <span className="text-white">{onboarding.city}</span></div>}
                </div>
              </Card>

              {/* Goals */}
              <Card className="!p-4">
                <h3 className="text-xs font-semibold text-gold uppercase tracking-wide mb-3">Fitness Goals</h3>
                <div className="space-y-2 text-sm">
                  {onboarding.primary_goal && <div><span className="text-zinc-500">Goal:</span> <span className="text-white">{onboarding.primary_goal}</span></div>}
                  {onboarding.target_weight && <div><span className="text-zinc-500">Target weight:</span> <span className="text-white">{onboarding.target_weight}</span></div>}
                  {onboarding.gym_access && <div><span className="text-zinc-500">Gym:</span> <span className="text-white">{onboarding.gym_access}</span></div>}
                  {onboarding.work_type && <div><span className="text-zinc-500">Work:</span> <span className="text-white">{onboarding.work_type}</span></div>}
                  {onboarding.medical_conditions && <div><span className="text-zinc-500">Medical:</span> <span className="text-white">{onboarding.medical_conditions}</span></div>}
                </div>
              </Card>

              {/* Dietary */}
              <Card className="!p-4">
                <h3 className="text-xs font-semibold text-gold uppercase tracking-wide mb-3">Dietary Profile</h3>
                <div className="space-y-2 text-sm">
                  {onboarding.diet_type && <div><span className="text-zinc-500">Diet type:</span> <span className="text-white">{onboarding.diet_type}</span></div>}
                  {onboarding.protein_preferences?.length > 0 && <div><span className="text-zinc-500">Proteins (non-veg):</span> <span className="text-white">{onboarding.protein_preferences.join(", ")}</span></div>}
                  {onboarding.veg_proteins?.length > 0 && <div><span className="text-zinc-500">Proteins (veg):</span> <span className="text-white">{onboarding.veg_proteins.join(", ")}</span></div>}
                  {onboarding.dals?.length > 0 && <div><span className="text-zinc-500">Dals:</span> <span className="text-white">{onboarding.dals.join(", ")}</span></div>}
                  {onboarding.vegetables?.length > 0 && <div><span className="text-zinc-500">Vegetables:</span> <span className="text-white">{onboarding.vegetables.join(", ")}</span></div>}
                  {onboarding.carb_sources?.length > 0 && <div><span className="text-zinc-500">Carbs:</span> <span className="text-white">{onboarding.carb_sources.join(", ")}</span></div>}
                  {onboarding.fruits?.length > 0 && <div><span className="text-zinc-500">Fruits:</span> <span className="text-white">{onboarding.fruits.join(", ")}</span></div>}
                  {onboarding.snack_preference && <div><span className="text-zinc-500">Snacks:</span> <span className="text-white">{onboarding.snack_preference}</span></div>}
                  {onboarding.food_allergies && <div><span className="text-zinc-500">Allergies:</span> <span className="text-white">{onboarding.food_allergies}</span></div>}
                  {onboarding.cravings?.length > 0 && <div><span className="text-zinc-500">Cravings:</span> <span className="text-white">{onboarding.cravings.join(", ")}</span></div>}
                </div>
              </Card>

              {/* Habits */}
              <Card className="!p-4">
                <h3 className="text-xs font-semibold text-gold uppercase tracking-wide mb-3">Habits & Lifestyle</h3>
                <div className="space-y-2 text-sm">
                  {onboarding.chai_coffee && <div><span className="text-zinc-500">Chai/Coffee:</span> <span className="text-white">{onboarding.chai_coffee}</span></div>}
                  {onboarding.alcohol && <div><span className="text-zinc-500">Alcohol:</span> <span className="text-white">{onboarding.alcohol}</span></div>}
                  {onboarding.meals_out && <div><span className="text-zinc-500">Meals out/week:</span> <span className="text-white">{onboarding.meals_out}</span></div>}
                  {onboarding.fast_food?.length > 0 && <div><span className="text-zinc-500">Fast food:</span> <span className="text-white">{onboarding.fast_food.join(", ")}</span></div>}
                  {onboarding.breakfast_person && <div><span className="text-zinc-500">Breakfast:</span> <span className="text-white">{onboarding.breakfast_person}</span></div>}
                  {onboarding.open_to_yogurt && <div><span className="text-zinc-500">Greek yogurt:</span> <span className="text-white">{onboarding.open_to_yogurt}</span></div>}
                  {onboarding.open_to_shakes && <div><span className="text-zinc-500">Protein shakes:</span> <span className="text-white">{onboarding.open_to_shakes}</span></div>}
                  {onboarding.open_to_bars && <div><span className="text-zinc-500">Protein bars:</span> <span className="text-white">{onboarding.open_to_bars}</span></div>}
                  {onboarding.daily_steps && <div><span className="text-zinc-500">Daily steps:</span> <span className="text-white">{onboarding.daily_steps}</span></div>}
                  {onboarding.cooking_comfort && <div><span className="text-zinc-500">Cooking:</span> <span className="text-white">{onboarding.cooking_comfort}</span></div>}
                  {onboarding.energy_level && <div><span className="text-zinc-500">Energy:</span> <span className="text-white">{onboarding.energy_level}</span></div>}
                  {onboarding.coaching_style && <div><span className="text-zinc-500">Coaching style:</span> <span className="text-white">{onboarding.coaching_style}</span></div>}
                </div>
              </Card>

              {/* Open-ended */}
              {(onboarding.day_structure || onboarding.weekend_routine || onboarding.weight_history || onboarding.biggest_struggle || onboarding.urgency || onboarding.vacation_plans || onboarding.notes) && (
                <Card className="!p-4">
                  <h3 className="text-xs font-semibold text-gold uppercase tracking-wide mb-3">In Their Words</h3>
                  <div className="space-y-3 text-sm">
                    {onboarding.day_structure && <div><p className="text-zinc-500 text-xs mb-0.5">Typical weekday:</p><p className="text-zinc-200">{onboarding.day_structure}</p></div>}
                    {onboarding.weekend_routine && <div><p className="text-zinc-500 text-xs mb-0.5">Weekends:</p><p className="text-zinc-200">{onboarding.weekend_routine}</p></div>}
                    {onboarding.last_meal_sleep && <div><p className="text-zinc-500 text-xs mb-0.5">Last meal & sleep:</p><p className="text-zinc-200">{onboarding.last_meal_sleep}</p></div>}
                    {onboarding.weight_history && <div><p className="text-zinc-500 text-xs mb-0.5">Weight history:</p><p className="text-zinc-200">{onboarding.weight_history}</p></div>}
                    {onboarding.biggest_struggle && <div><p className="text-zinc-500 text-xs mb-0.5">Biggest struggle:</p><p className="text-zinc-200">{onboarding.biggest_struggle}</p></div>}
                    {onboarding.urgency && <div><p className="text-zinc-500 text-xs mb-0.5">Why now:</p><p className="text-zinc-200">{onboarding.urgency}</p></div>}
                    {onboarding.vacation_plans && <div><p className="text-zinc-500 text-xs mb-0.5">Vacation plans:</p><p className="text-zinc-200">{onboarding.vacation_plans}</p></div>}
                    {onboarding.notes && <div><p className="text-zinc-500 text-xs mb-0.5">Additional notes:</p><p className="text-zinc-200">{onboarding.notes}</p></div>}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="!p-8 text-center">
              <p className="text-zinc-400 text-sm">Client hasn&apos;t completed onboarding yet.</p>
            </Card>
          )}
        </div>
      )}

      {tab === "diet" && (
        <div>
          {dietAssignment?.template ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">{dietAssignment.template.name}</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{dietAssignment.template.planType} · {dietAssignment.template.mealSlots?.length || 0} meals</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/coach/diet-templates/${dietAssignment.templateId}`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                  <button
                    onClick={async () => {
                      if (!confirm("Remove this diet plan from the client?")) return;
                      await deactivateAssignment(dietAssignment.id);
                      setDietAssignment(null);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {(dietAssignment.template.mealSlots || [])
                  .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                  .map((slot: any) => (
                    <div key={slot.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <div className="flex items-center justify-between p-4 pb-2">
                        <p className="text-sm font-semibold text-white">{slot.name}</p>
                        {slot.targetCalories && <span className="text-[10px] text-zinc-500">{slot.targetCalories} kcal target</span>}
                      </div>
                      <div className="px-4 pb-4">
                        <MealSlotView slot={slot} mode="view" compact />
                      </div>
                    </div>
                  ))}
              </div>
              <Link href="/coach/plans/create" className="block">
                <Button variant="secondary" size="sm" className="w-full">Reassign Different Plan</Button>
              </Link>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <UtensilsCrossed className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No diet plan assigned</p>
              <Link href="/coach/plans/create">
                <Button variant="gold" size="sm" className="mt-3">Assign Plan</Button>
              </Link>
            </Card>
          )}
        </div>
      )}

      {tab === "workout" && (
        <div>
          {workoutAssignment?.template ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">{workoutAssignment.template.name}</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{workoutAssignment.template.slots?.length || 0} workout days</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/coach/workout-templates/${workoutAssignment.templateId}`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                  <button
                    onClick={async () => {
                      if (!confirm("Remove this workout plan from the client?")) return;
                      await removeWorkoutAssignment(workoutAssignment.id);
                      setWorkoutAssignment(null);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {(workoutAssignment.template.slots || [])
                  .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                  .map((slot: any) => (
                    <Card key={slot.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-white">{slot.name}</p>
                        <span className="text-xs text-zinc-500">{slot.exercises?.length || 0} exercises</span>
                      </div>
                      <WorkoutSlotView slot={slot} mode="view" />
                    </Card>
                  ))}
              </div>
              <Link href="/coach/workouts/create" className="block">
                <Button variant="secondary" size="sm" className="w-full">Reassign Different Workout</Button>
              </Link>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Dumbbell className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No workout plan assigned</p>
              <Link href="/coach/workouts/create">
                <Button variant="gold" size="sm" className="mt-3">Assign Workout</Button>
              </Link>
            </Card>
          )}
        </div>
      )}

      {tab === "measurements" && (
        <div>
          {latest ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
              {latest.weight != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Weight</p><p className="text-xl font-bold text-white mt-1">{latest.weight} kg</p></Card>}
              {latest.body_fat != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Body Fat</p><p className="text-xl font-bold text-white mt-1">{latest.body_fat}%</p></Card>}
              {latest.chest != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Chest</p><p className="text-xl font-bold text-white mt-1">{latest.chest} cm</p></Card>}
              {latest.waist != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Waist</p><p className="text-xl font-bold text-white mt-1">{latest.waist} cm</p></Card>}
              {latest.arms != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Arms</p><p className="text-xl font-bold text-white mt-1">{latest.arms} cm</p></Card>}
              {latest.thighs != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Thighs</p><p className="text-xl font-bold text-white mt-1">{latest.thighs} cm</p></Card>}
            </div>
          ) : <Card><p className="text-sm text-zinc-500">No measurements yet.</p></Card>}

          {measurements.length >= 2 && (
            <div className="space-y-4">
              <Card>
                <h2 className="text-sm font-semibold text-white mb-3">Weight & Body Fat</h2>
                <MeasurementsChart data={measurements.map((m) => ({ ...m, bodyFat: m.body_fat }))} metrics={[{ key: "weight", label: "Weight", color: "#d4a853" }, { key: "bodyFat", label: "BF%", color: "#f87171" }]} />
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-white mb-3">Body Measurements</h2>
                <MeasurementsChart data={measurements} metrics={[{ key: "chest", label: "Chest", color: "#60a5fa" }, { key: "waist", label: "Waist", color: "#34d399" }, { key: "arms", label: "Arms", color: "#a78bfa" }, { key: "thighs", label: "Thighs", color: "#f472b6" }]} />
              </Card>
            </div>
          )}
        </div>
      )}

      {tab === "habits" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <h2 className="text-sm font-semibold text-white">Daily Habits</h2>
            </div>
            <Button variant="gold" size="sm" onClick={() => setShowHabitForm(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Habit
            </Button>
          </div>

          {habits.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-zinc-500 text-sm">No habits assigned yet.</p>
              <p className="text-zinc-600 text-xs mt-1">Add daily habits for this client to track.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => (
                <Card key={habit.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{habit.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{habit.name}</p>
                        {habit.target && <p className="text-xs text-zinc-500">{habit.target}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteHabit(habit.id)} className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Add habit modal */}
          {showHabitForm && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowHabitForm(false)}>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/[0.08] p-6 safe-area-bottom" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white">Add Habit</h2>
                  <button onClick={() => setShowHabitForm(false)} className="p-2 rounded-xl hover:bg-white/[0.06]"><X className="h-5 w-5 text-zinc-400" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1.5">Emoji</label>
                    <div className="flex gap-2 flex-wrap">
                      {["✅", "💧", "😴", "🚶", "💊", "🚫", "🏋️", "🥗", "📖", "🧘"].map((e) => (
                        <button key={e} onClick={() => setHabitEmoji(e)}
                          className={cn("h-10 w-10 rounded-xl text-lg flex items-center justify-center border transition-all",
                            habitEmoji === e ? "border-gold bg-gold/10" : "border-white/[0.06] hover:bg-white/[0.04]"
                          )}>{e}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1.5">Habit Name *</label>
                    <input type="text" value={habitName} onChange={(e) => setHabitName(e.target.value)} placeholder="e.g. Drink Water" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1.5">Target</label>
                    <input type="text" value={habitTarget} onChange={(e) => setHabitTarget(e.target.value)} placeholder="e.g. 3L per day" className={inputClass} />
                  </div>
                  <Button variant="gold" className="w-full h-12 text-base rounded-xl" onClick={handleAddHabit} disabled={habitSaving || !habitName}>
                    {habitSaving ? "Adding..." : "Add Habit"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weight Progression Graph Modal */}
      {showWeightGraph && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowWeightGraph(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/[0.08] p-6 safe-area-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Weight Progression</h2>
              <button onClick={() => setShowWeightGraph(false)} className="p-2 rounded-xl hover:bg-white/[0.06]"><X className="h-5 w-5 text-zinc-400" /></button>
            </div>
            {checkInWeights.length > 1 ? (
              <WeightChart data={checkInWeights} height={250} />
            ) : checkInWeights.length === 1 ? (
              <div className="text-center py-8">
                <p className="text-2xl font-bold text-white">{checkInWeights[0].weight} kg</p>
                <p className="text-xs text-zinc-500 mt-1">Only 1 check-in recorded ({checkInWeights[0].date})</p>
                <p className="text-xs text-zinc-600 mt-3">More data points needed to show a graph.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-zinc-500">No weight data from daily check-ins yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && (
        <EditClientModal
          client={client}
          onClose={() => setShowEditModal(false)}
          onSaved={() => { setShowEditModal(false); loadData(); }}
        />
      )}
    </div>
  );
}

// ─── Edit Client Modal ─────────────────────────────────────────
function EditClientModal({ client, onClose, onSaved }: { client: any; onClose: () => void; onSaved: () => void }) {
  const [goal, setGoal] = useState(client.goal || "");
  const [status, setStatus] = useState<"active" | "inactive">(client.status || "active");
  const [currentWeight, setCurrentWeight] = useState(client.current_weight?.toString() || "");
  const [name, setName] = useState(client.profile?.name || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    // Update client table
    await updateClient(client.id, {
      goal: goal.trim(),
      status,
      current_weight: currentWeight ? parseFloat(currentWeight) : null,
    });
    // Update profile name if changed
    if (name.trim() && name.trim() !== client.profile?.name) {
      await updateProfile(client.id, { name: name.trim() });
    }
    onSaved();
  }

  const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/[0.08] p-6 safe-area-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Edit Client</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06]"><X className="h-5 w-5 text-zinc-400" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Goal</label>
            <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Fat loss" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Status</label>
            <div className="flex gap-2">
              {(["active", "inactive"] as const).map((s) => (
                <button key={s} onClick={() => setStatus(s)}
                  className={cn("flex-1 rounded-xl py-2.5 text-sm font-medium border capitalize",
                    status === s ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
                  )}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Current Weight (kg)</label>
            <input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} placeholder="e.g. 85" className={inputClass} />
          </div>
          <Button variant="gold" className="w-full h-12 text-base rounded-xl" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Expandable Check-in Cards ─────────────────────────────────

function WeeklyCheckInCard({ checkIn }: { checkIn: any }) {
  const [expanded, setExpanded] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [feedback, setFeedback] = useState(checkIn.coach_feedback || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(checkIn.status || "pending");

  async function loadPhotos() {
    if (photoUrls.length > 0 || !checkIn.photos || checkIn.photos.length === 0) return;
    setLoadingPhotos(true);
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    const urls: string[] = [];
    for (const photo of checkIn.photos) {
      const path = typeof photo === "string" ? photo : photo.path || photo.url;
      if (!path) continue;
      if (path.startsWith("http")) {
        urls.push(path);
      } else {
        const { data } = await sb.storage.from("check-in-photos").createSignedUrl(path, 3600);
        if (data?.signedUrl) urls.push(data.signedUrl);
      }
    }
    setPhotoUrls(urls);
    setLoadingPhotos(false);
  }

  function handleExpand() {
    setExpanded(!expanded);
    if (!expanded) loadPhotos();
  }

  async function handleMarkReviewed() {
    setSaving(true);
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    await sb.from("check_ins").update({ status: "reviewed", coach_feedback: feedback }).eq("id", checkIn.id);
    setStatus("reviewed");
    setSaving(false);
  }

  return (
    <Card className="p-0 overflow-hidden">
      <button onClick={handleExpand} className="w-full p-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-9 w-14 shrink-0 rounded-lg bg-sky-500/10 flex items-center justify-center text-[10px] font-bold text-sky-400">
            {checkIn.weight ? `${checkIn.weight} kg` : "—"}
          </div>
          <div>
            <p className="text-sm text-white">{formatDate(checkIn.date || checkIn.created_at)}</p>
            {checkIn.notes && <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">{checkIn.notes}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(checkIn.photos || []).length > 0 && <span className="text-[10px] text-zinc-500">{checkIn.photos.length} photos</span>}
          <Badge variant={status === "reviewed" ? "success" : "warning"}>{status}</Badge>
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-white/[0.06] pt-3 space-y-3">
          {checkIn.weight && <p className="text-xs text-zinc-400">Weight: <span className="text-white">{checkIn.weight} kg</span></p>}
          {checkIn.notes && <p className="text-xs text-zinc-400">Notes: <span className="text-zinc-300">{checkIn.notes}</span></p>}
          {/* Photos */}
          {(checkIn.photos || []).length > 0 && (
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold mb-2">Progress Photos</p>
              {loadingPhotos ? (
                <p className="text-xs text-zinc-600">Loading photos...</p>
              ) : photoUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {photoUrls.map((url, i) => (
                    <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden border border-white/[0.08] bg-black">
                      <img src={url} alt={`Progress photo ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-600">{checkIn.photos.length} photos uploaded</p>
              )}
            </div>
          )}
          {/* Feedback + Review */}
          <div className="pt-2 border-t border-white/[0.06] space-y-2">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-semibold">Coach Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add feedback for the client..."
                className="w-full mt-1 rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none min-h-[50px]"
              />
            </div>
            {status !== "reviewed" && (
              <Button variant="gold" size="sm" className="w-full" onClick={handleMarkReviewed} disabled={saving}>
                {saving ? "Saving..." : "✓ Mark Reviewed"}
              </Button>
            )}
            {status === "reviewed" && feedback !== checkIn.coach_feedback && (
              <Button variant="secondary" size="sm" className="w-full" onClick={handleMarkReviewed} disabled={saving}>
                {saving ? "Saving..." : "Update Feedback"}
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function DailyCheckInCard({ checkIn }: { checkIn: any }) {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState(checkIn.coachFeedback || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(checkIn.status || "submitted");

  async function handleMarkReviewed() {
    setSaving(true);
    const { updateDailyCheckInFeedback } = await import("@/lib/db");
    await updateDailyCheckInFeedback(checkIn.id, feedback);
    setStatus("reviewed");
    setSaving(false);
  }

  return (
    <Card className="p-0 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-400">
            {checkIn.adherenceScore != null ? checkIn.adherenceScore : "—"}
          </div>
          <div>
            <p className="text-sm text-white">{formatDate(checkIn.date)}</p>
            <p className="text-[11px] text-zinc-500">
              {checkIn.totalCalories} cal · {checkIn.weight ? `${checkIn.weight} kg` : "no weight"}
            </p>
          </div>
        </div>
        <Badge variant={status === "reviewed" ? "success" : "warning"}>{status}</Badge>
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-white/[0.06] pt-3 space-y-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-lg bg-white/[0.03] p-2"><p className="text-xs font-bold text-white">{checkIn.totalCalories}</p><p className="text-[9px] text-zinc-500">cal</p></div>
            <div className="rounded-lg bg-white/[0.03] p-2"><p className="text-xs font-bold text-white">{checkIn.totalProtein}g</p><p className="text-[9px] text-zinc-500">protein</p></div>
            <div className="rounded-lg bg-white/[0.03] p-2"><p className="text-xs font-bold text-white">{checkIn.totalCarbs}g</p><p className="text-[9px] text-zinc-500">carbs</p></div>
            <div className="rounded-lg bg-white/[0.03] p-2"><p className="text-xs font-bold text-white">{checkIn.totalFat}g</p><p className="text-[9px] text-zinc-500">fat</p></div>
          </div>
          {checkIn.weight && <p className="text-xs text-zinc-400">Weight: <span className="text-white">{checkIn.weight} kg</span></p>}
          {checkIn.notes && <p className="text-xs text-zinc-400">Notes: <span className="text-zinc-300">{checkIn.notes}</span></p>}
          {/* Food items */}
          {checkIn.items?.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Meals</p>
              {checkIn.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {item._slot?.name && <span className="text-zinc-600 w-20 shrink-0">{item._slot.name}</span>}
                  {item._component?.component_category && (
                    <span className="text-[9px] uppercase text-zinc-500 w-16 shrink-0">{item._component.component_category.replace("_", " ")}</span>
                  )}
                  {item.isSkipped ? (
                    <span className="text-zinc-500">⏭️ Skipped</span>
                  ) : item._dish ? (
                    <span className="text-zinc-300">{item._dish.emoji} {item._dish.name}</span>
                  ) : item.customName ? (
                    <span className="text-zinc-300">✏️ {item.customName}</span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Feedback + Review */}
          <div className="pt-2 border-t border-white/[0.06] space-y-2">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-semibold">Coach Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add feedback for the client..."
                className="w-full mt-1 rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none min-h-[50px]"
              />
            </div>
            {status !== "reviewed" && (
              <Button variant="gold" size="sm" className="w-full" onClick={handleMarkReviewed} disabled={saving}>
                {saving ? "Saving..." : "✓ Mark Reviewed"}
              </Button>
            )}
            {status === "reviewed" && feedback !== checkIn.coachFeedback && (
              <Button variant="secondary" size="sm" className="w-full" onClick={handleMarkReviewed} disabled={saving}>
                {saving ? "Saving..." : "Update Feedback"}
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
