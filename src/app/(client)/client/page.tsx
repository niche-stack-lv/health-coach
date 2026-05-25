"use client";

import { useState, useEffect } from "react";
import { Camera, TrendingDown, Calendar, Dumbbell, ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { getClientActiveAssignment, getClientActiveWorkoutAssignment, getCheckIns, getMeasurements, getFoodCheckIn, getClientFoodCheckIns } from "@/lib/db";
import { cn } from "@/lib/utils";
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
      setMeasurements([{ weight: 83.2 }]);
      setFoodCheckInDone(false);
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const [assignment, workoutAsgn, ci, m, foodCI, dci] = await Promise.all([
      getClientActiveAssignment(user.id),
      getClientActiveWorkoutAssignment(user.id),
      getCheckIns(user.id),
      getMeasurements(user.id),
      getFoodCheckIn(user.id, today),
      getClientFoodCheckIns(user.id, 10),
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

      {/* Current Weight */}
      <Card className="p-4">
        <TrendingDown className="h-4 w-4 text-emerald-400 mb-1.5" />
        <p className="text-xl font-bold text-white">{latestWeight ? `${latestWeight} kg` : "—"}</p>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Current Weight</p>
      </Card>

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
          const now = new Date();
          const day = now.getDay();
          const diff = day === 0 ? 6 : day - 1;
          const monday = new Date(now);
          monday.setDate(now.getDate() - diff);
          const mondayStr = monday.toISOString().split("T")[0];
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
          const now = new Date();
          const day = now.getDay();
          const diff = day === 0 ? 6 : day - 1;
          const monday = new Date(now);
          monday.setDate(now.getDate() - diff);
          const mondayStr = monday.toISOString().split("T")[0];
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
