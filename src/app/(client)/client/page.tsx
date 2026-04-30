"use client";

import { useState, useEffect } from "react";
import { Camera, UtensilsCrossed, TrendingDown, Calendar, Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { getClientDietPlans, getClientWorkoutPlans, getCheckIns, getMeasurements } from "@/lib/db";
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
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const [dp, wp, ci, m] = await Promise.all([
      getClientDietPlans(user.id),
      getClientWorkoutPlans(user.id),
      getCheckIns(user.id),
      getMeasurements(user.id),
    ]);
    setPlan(dp.find((p) => p.status === "active") || dp[0] || null);
    setWorkout(wp.find((p) => p.status === "active") || wp[0] || null);
    setCheckIns(ci);
    setMeasurements(m);
    setLoading(false);
  }

  const latestWeight = measurements.length > 0 ? measurements[measurements.length - 1].weight : null;
  const latestCheckIn = checkIns[0];
  const d = useDemoSuffix();

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Welcome 👋</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Keep pushing, you&apos;re doing great.</p>
      </div>

      {/* Active plan card */}
      {plan ? (
        <Card className="gradient-gold border-0 text-black p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-black/60 mb-1">Current Plan</p>
            <p className="text-lg font-bold">{plan.title}</p>
            <p className="text-sm text-black/60 mt-0.5">{plan.weeks} weeks</p>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-8"><p className="text-zinc-500">No plan assigned yet. Your coach will set one up for you.</p></Card>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <TrendingDown className="h-5 w-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white tracking-tight">{latestWeight || "—"}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">kg current</p>
        </Card>
        <Card className="p-4">
          <Calendar className="h-5 w-5 text-gold mb-2" />
          <p className="text-sm font-bold text-white">Check-ins</p>
          <p className="text-2xl font-bold text-gold mt-1">{checkIns.length}</p>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/client/check-in${d}`}>
          <Button variant="gold" className="w-full h-12 rounded-2xl"><Camera className="h-5 w-5" /> Check-in</Button>
        </Link>
        <Link href={`/client/measurements${d}`}>
          <Button variant="secondary" className="w-full h-12 rounded-2xl"><TrendingDown className="h-5 w-5" /> Log Body</Button>
        </Link>
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link href={`/client/plan${d}`} className="flex-1">
          <Card className="p-4 hover:border-gold/20 transition-colors text-center">
            <UtensilsCrossed className="h-5 w-5 text-gold mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Diet Plan</p>
          </Card>
        </Link>
        <Link href={`/client/workout${d}`} className="flex-1">
          <Card className="p-4 hover:border-gold/20 transition-colors text-center">
            <Dumbbell className="h-5 w-5 text-gold mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Workout</p>
          </Card>
        </Link>
      </div>

      {/* Latest check-in feedback */}
      {latestCheckIn?.coach_feedback && (
        <Card>
          <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-2">Latest Coach Feedback</p>
          <p className="text-sm text-zinc-300 leading-relaxed">{latestCheckIn.coach_feedback}</p>
        </Card>
      )}

      {/* Today's meals preview */}
      {plan && (plan.meals || []).length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Today&apos;s Meals</p>
            <Link href={`/client/plan${d}`} className="text-xs text-zinc-500 hover:text-gold font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {(plan.meals || []).slice(0, 3).map((meal: any) => (
              <div key={meal.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gold/10 flex items-center justify-center ring-1 ring-gold/20"><UtensilsCrossed className="h-4 w-4 text-gold" /></div>
                  <div><p className="text-sm font-medium text-white">{meal.name}</p><p className="text-[10px] text-zinc-500">{meal.time}</p></div>
                </div>
                <span className="text-xs text-zinc-400">{meal.calories} kcal</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
