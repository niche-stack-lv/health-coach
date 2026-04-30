"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getClientWorkoutPlans } from "@/lib/db";
import { exportWorkoutPlanPDF } from "@/lib/pdf-export";
import { getVideoUrl } from "@/lib/exercise-videos";
import { cn } from "@/lib/utils";
import { useIsDemo } from "@/lib/use-demo";
import { Download, Play } from "lucide-react";

function ClientWorkoutContent() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    if (isDemo) {
      setPlans([{
        id: "demo-workout-1",
        title: "PPL Split",
        status: "active",
        days: [
          {
            day_label: "Day 1", name: "Push", sort_order: 0,
            exercises: [
              { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s", emoji: "🏋️", notes: "Control the eccentric, 2 sec down" },
              { name: "Overhead Press", sets: 3, reps: "8-10", rest: "90s", emoji: "🏋️" },
              { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "60s", emoji: "💪" },
              { name: "Lateral Raises", sets: 4, reps: "12-15", rest: "45s", emoji: "🔥", notes: "Slow and controlled, slight lean forward" },
              { name: "Tricep Pushdowns", sets: 3, reps: "12-15", rest: "45s", emoji: "💪" },
              { name: "Overhead Tricep Extension", sets: 3, reps: "10-12", rest: "45s", emoji: "💪" },
            ],
          },
          {
            day_label: "Day 2", name: "Pull", sort_order: 1,
            exercises: [
              { name: "Barbell Rows", sets: 4, reps: "8-10", rest: "90s", emoji: "🏋️", notes: "Keep back flat, squeeze at top" },
              { name: "Pull-ups", sets: 3, reps: "6-10", rest: "90s", emoji: "💪" },
              { name: "Seated Cable Rows", sets: 3, reps: "10-12", rest: "60s", emoji: "🏋️" },
              { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s", emoji: "🔥" },
              { name: "Barbell Curls", sets: 3, reps: "10-12", rest: "45s", emoji: "💪" },
              { name: "Hammer Curls", sets: 3, reps: "10-12", rest: "45s", emoji: "💪" },
            ],
          },
          {
            day_label: "Day 3", name: "Legs", sort_order: 2,
            exercises: [
              { name: "Barbell Squats", sets: 4, reps: "6-8", rest: "120s", emoji: "🦵", notes: "Go below parallel, brace core" },
              { name: "Romanian Deadlifts", sets: 3, reps: "8-10", rest: "90s", emoji: "🦵" },
              { name: "Leg Press", sets: 3, reps: "10-12", rest: "90s", emoji: "🦵" },
              { name: "Walking Lunges", sets: 3, reps: "12 each", rest: "60s", emoji: "🔥" },
              { name: "Leg Curls", sets: 3, reps: "12-15", rest: "45s", emoji: "🦵" },
              { name: "Calf Raises", sets: 4, reps: "15-20", rest: "45s", emoji: "🦵" },
            ],
          },
        ],
      }]);
      setLoading(false);
      return;
    }
    if (user) getClientWorkoutPlans(user.id).then((d) => { setPlans(d); setLoading(false); });
  }, [user, isDemo]);

  const plan = plans.find((p) => p.status === "active") || plans[0];

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;
  if (!plan) return <div className="py-20 text-center text-zinc-500">No workout plan assigned yet. Your coach will create one for you.</div>;

  const days = (plan.days || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  const day = days[activeDay];
  const exercises = day?.exercises || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{plan.title}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{days.length}-day split</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => exportWorkoutPlanPDF(plan.title, user?.email || "Client", days.map((d: any) => ({ dayLabel: d.day_label, name: d.name, exercises: d.exercises || [] })))}>
          <Download className="h-3.5 w-3.5" /> PDF
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {days.map((d: any, i: number) => (
          <button key={i} onClick={() => setActiveDay(i)} className={cn("shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all", activeDay === i ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500")}>
            <span className="block text-xs opacity-60">{d.day_label}</span>{d.name}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {exercises.map((ex: any, i: number) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 text-lg">{ex.emoji || "🏋️"}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{ex.name}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <Badge variant="gold">{ex.sets} sets</Badge>
                  <span className="text-xs text-zinc-400">{ex.reps} reps</span>
                  <span className="text-xs text-zinc-500">Rest {ex.rest}</span>
                </div>
                {ex.notes && <p className="text-xs text-zinc-500 mt-2 bg-white/[0.03] rounded-lg px-2.5 py-1.5 border border-white/[0.06]">💡 {ex.notes}</p>}
                {getVideoUrl(ex.name) && <a href={getVideoUrl(ex.name)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs text-gold font-medium"><Play className="h-3 w-3" /> Watch Demo</a>}
              </div>
              <span className="text-xs text-zinc-600 font-mono shrink-0">#{i + 1}</span>
            </div>
          </Card>
        ))}
      </div>

      {exercises.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center"><p className="text-lg font-bold text-white">{exercises.length}</p><p className="text-[10px] text-zinc-500">Exercises</p></div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center"><p className="text-lg font-bold text-gold">{exercises.reduce((s: number, e: any) => s + (e.sets || 0), 0)}</p><p className="text-[10px] text-zinc-500">Total Sets</p></div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center"><p className="text-lg font-bold text-white">~60</p><p className="text-[10px] text-zinc-500">Min Est.</p></div>
        </div>
      )}
    </div>
  );
}

export default function ClientWorkoutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <ClientWorkoutContent />
    </Suspense>
  );
}
