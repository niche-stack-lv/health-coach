"use client";

import { useState, useEffect, useMemo } from "react";
import { Camera, TrendingDown, TrendingUp, Calendar, Dumbbell, ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { getClientActiveAssignment, getClientActiveWorkoutAssignment, getCheckIns, getMeasurements, getFoodCheckIn, getClientFoodCheckIns } from "@/lib/db";
import { cn } from "@/lib/utils";
import { getTodayLocal, getMondayOfThisWeek } from "@/lib/date-utils";
import { WeightDisplay } from "@/components/shared/weight-display";
import { WeightChart } from "@/components/charts/weight-chart";
import Link from "next/link";
import { Suspense } from "react";

export default function ClientDashboard() {
  return <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}><ClientDashboardInner /></Suspense>;
}

function ClientDashboardInner() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [plan, setPlan] = useState<any>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [foodCheckInDone, setFoodCheckInDone] = useState<boolean | null>(null);
  const [dailyCheckIns, setDailyCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setPlan({ title: "Fat Loss Phase 1", weeks: 4, status: "active", meals: [
        { id: "m1", name: "Breakfast", time: "7:00 AM", calories: 380 },
        { id: "m2", name: "Lunch", time: "12:30 PM", calories: 520 },
        { id: "m3", name: "Snack", time: "4:00 PM", calories: 280 },
        { id: "m4", name: "Dinner", time: "7:30 PM", calories: 480 },
      ] });
      setCheckIns([{ id: "1", coach_feedback: "Great progress this week! Weight trending down nicely. Keep protein high." }]);
      setMeasurements([
        { date: "2026-06-01", weight: 85.0 },
        { date: "2026-06-08", weight: 84.3 },
        { date: "2026-06-15", weight: 83.6 },
        { date: "2026-06-22", weight: 83.2 },
        { date: "2026-06-28", weight: 82.7 },
      ]);
      setFoodCheckInDone(false);
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const today = getTodayLocal();
    const [assignment, workoutAsgn, ci, m, foodCI, dci] = await Promise.all([
      getClientActiveAssignment(user.id),
      getClientActiveWorkoutAssignment(user.id),
      getCheckIns(user.id),
      getMeasurements(user.id),
      getFoodCheckIn(user.id, today),
      getClientFoodCheckIns(user.id, 60),
    ]);
    // Convert template assignment to plan-like shape for the UI
    if (assignment?.template) {
      setPlan({
        title: assignment.template.name,
        status: "active",
        meals: (assignment.template.mealSlots || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          calories: s.targetCalories,
        })),
      });
    }
    if (workoutAsgn?.template) {
      setWorkout({ title: workoutAsgn.template.name, status: "active" });
    }
    setCheckIns(ci);
    setMeasurements(m);
    setFoodCheckInDone(!!foodCI);
    setDailyCheckIns(dci);
    setLoading(false);
  }

  const latestWeight = measurements.length > 0 ? measurements[measurements.length - 1].weight : null;
  const latestCheckIn = checkIns[0];
  const d = useDemoSuffix();

  // Combined weight history for the progression chart. Pulls from body
  // measurements and daily check-ins (both store weight in kg), one point per
  // date (latest source wins), sorted oldest → newest.
  const weightSeries = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const m of measurements) {
      if (m?.date && m.weight != null) byDate.set(m.date, m.weight);
    }
    for (const ci of dailyCheckIns) {
      if (ci?.date && ci.weight != null) byDate.set(ci.date, ci.weight);
    }
    return Array.from(byDate.entries())
      .map(([date, weight]) => ({ date, weight }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [measurements, dailyCheckIns]);

  const currentWeight = weightSeries.length > 0 ? weightSeries[weightSeries.length - 1].weight : latestWeight;
  const weightDeltaKg =
    weightSeries.length >= 2 ? weightSeries[weightSeries.length - 1].weight - weightSeries[0].weight : null;

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Welcome 👋</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Keep pushing, you&apos;re doing great.</p>
      </div>

      {/* Active plans — side by side */}
      <div className="grid grid-cols-2 gap-3">
        {plan ? (
          <Link href={`/client/diet-plan${d}`}>
            <Card className="gradient-gold border-0 text-black !p-4 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-black/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-black/60 mb-0.5">Diet Plan</p>
                <p className="text-sm font-bold leading-tight">{plan.title}</p>
                <p className="text-[10px] text-black/60 mt-1">{plan.meals?.length || 0} meals/day</p>
              </div>
            </Card>
          </Link>
        ) : (
          <Card className="!p-4 flex items-center"><p className="text-zinc-500 text-xs">No diet plan</p></Card>
        )}

        {workout ? (
          <Link href={`/client/workout${d}`}>
            <Card className="border-gold/30 bg-gold/5 !p-4 h-full">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-gold/70 mb-0.5">Workout</p>
              <p className="text-sm font-bold text-white leading-tight">{workout.title}</p>
            </Card>
          </Link>
        ) : (
          <Card className="!p-4 flex items-center"><p className="text-zinc-500 text-xs">No workout</p></Card>
        )}
      </div>

      {/* Weight progression */}
      {weightSeries.length >= 2 ? (
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Weight Progress</p>
              <p className="text-xl font-bold text-white mt-0.5">
                {currentWeight != null ? <WeightDisplay kg={currentWeight} /> : "—"}
              </p>
            </div>
            {weightDeltaKg != null && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-semibold rounded-lg px-2 py-1",
                  weightDeltaKg <= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                )}
              >
                {weightDeltaKg <= 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                {weightDeltaKg <= 0 ? "−" : "+"}
                <WeightDisplay kg={Math.abs(weightDeltaKg)} />
              </span>
            )}
          </div>
          <WeightChart data={weightSeries} height={200} />
        </Card>
      ) : (
        <Card className="p-4">
          <TrendingDown className="h-4 w-4 text-emerald-400 mb-1.5" />
          <p className="text-xl font-bold text-white">{currentWeight != null ? <WeightDisplay kg={currentWeight} /> : "—"}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Current Weight</p>
          <p className="text-[11px] text-zinc-600 mt-1.5">Log your weight in daily check-ins to see your progress graph.</p>
        </Card>
      )}

      {/* Check-in Status Cards */}
      <div className="flex flex-col gap-3">
        {/* Daily Check-in */}
        {foodCheckInDone ? (
          <Card className={cn("!p-4", dailyCheckIns[0]?.status === "reviewed" ? "border-emerald-500/20" : "border-amber-500/20")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-amber-400" />
                <p className="text-xs font-semibold text-white">Daily Check-in</p>
              </div>
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded",
                dailyCheckIns[0]?.status === "reviewed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
              )}>
                {dailyCheckIns[0]?.status === "reviewed" ? "Reviewed ✓" : "Submitted · In Review"}
              </span>
            </div>
            {dailyCheckIns[0]?.coachFeedback && (
              <p className="text-sm text-zinc-300 leading-relaxed mt-2 pl-6">&ldquo;{dailyCheckIns[0].coachFeedback}&rdquo;</p>
            )}
          </Card>
        ) : (
          <Link href={`/client/food-check-in${d}`}>
            <Card className="!p-4 border-white/[0.08] hover:border-gold/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-gold" />
                  <p className="text-xs font-semibold text-white">Submit Daily Check-in</p>
                </div>
                <span className="text-xs text-gold font-medium">→</span>
              </div>
            </Card>
          </Link>
        )}

        {/* Weekly Check-in */}
        {checkIns[0] && (() => {
          const mondayStr = getMondayOfThisWeek();
          const latestDate = checkIns[0].date || checkIns[0].created_at?.split("T")[0];
          const submittedThisWeek = latestDate >= mondayStr;

          if (submittedThisWeek) {
            return (
              <Card className={cn("!p-4", checkIns[0].status === "reviewed" ? "border-emerald-500/20" : "border-amber-500/20")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-sky-400" />
                    <p className="text-xs font-semibold text-white">Weekly Check-in</p>
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded",
                    checkIns[0].status === "reviewed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  )}>
                    {checkIns[0].status === "reviewed" ? "Reviewed ✓" : "Submitted · In Review"}
                  </span>
                </div>
                {checkIns[0].coach_feedback && (
                  <p className="text-sm text-zinc-300 leading-relaxed mt-2 pl-6">&ldquo;{checkIns[0].coach_feedback}&rdquo;</p>
                )}
              </Card>
            );
          }
          return null;
        })()}
        {(!checkIns[0] || (() => {
          const mondayStr = getMondayOfThisWeek();
          const latestDate = checkIns[0]?.date || checkIns[0]?.created_at?.split("T")[0] || "";
          return latestDate < mondayStr;
        })()) && (
          <Link href={`/client/check-in${d}`}>
            <Card className="!p-4 border-white/[0.08] hover:border-sky-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-sky-400" />
                  <p className="text-xs font-semibold text-white">Submit Weekly Check-in</p>
                </div>
                <span className="text-xs text-sky-400 font-medium">→</span>
              </div>
            </Card>
          </Link>
        )}

        {/* Body measurements link */}
        <Link href={`/client/measurements${d}`}>
          <Card className="!p-4 border-white/[0.08] hover:border-white/[0.15] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-zinc-400" />
                <p className="text-xs font-semibold text-white">Body Measurements</p>
              </div>
              <span className="text-xs text-zinc-500 font-medium">→</span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
