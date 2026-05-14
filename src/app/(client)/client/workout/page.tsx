"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getClientActiveWorkoutAssignment } from "@/lib/db";
import { getVideoUrl } from "@/lib/exercise-videos";
import { cn } from "@/lib/utils";
import { useIsDemo } from "@/lib/use-demo";
import { Play } from "lucide-react";
import type { WorkoutAssignment, WorkoutTemplateSlot, WorkoutSlotExercise } from "@/types";

function ClientWorkoutContent() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [assignment, setAssignment] = useState<WorkoutAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    if (isDemo) {
      setAssignment({
        id: "demo-assignment",
        templateId: "demo-template",
        clientId: "demo",
        coachId: "demo",
        createdAt: new Date().toISOString(),
        template: {
          id: "demo-template",
          coachId: "demo",
          name: "PPL Split",
          isTemplate: false,
          createdAt: new Date().toISOString(),
          slots: [
            {
              id: "s1", templateId: "demo-template", name: "Push", sortOrder: 0,
              exercises: [
                { id: "e1", slotId: "s1", exerciseId: null, customName: "Bench Press", customEmoji: "🏋️", sets: 4, reps: "8-10", restSeconds: 90, notes: "Control the eccentric", sortOrder: 0 },
                { id: "e2", slotId: "s1", exerciseId: null, customName: "Overhead Press", customEmoji: "🔥", sets: 3, reps: "8-10", restSeconds: 90, sortOrder: 1 },
                { id: "e3", slotId: "s1", exerciseId: null, customName: "Incline Dumbbell Press", customEmoji: "💪", sets: 3, reps: "10-12", restSeconds: 60, sortOrder: 2 },
                { id: "e4", slotId: "s1", exerciseId: null, customName: "Lateral Raises", customEmoji: "🦅", sets: 4, reps: "12-15", restSeconds: 45, notes: "Slow and controlled", sortOrder: 3 },
                { id: "e5", slotId: "s1", exerciseId: null, customName: "Tricep Pushdowns", customEmoji: "💪", sets: 3, reps: "12-15", restSeconds: 45, sortOrder: 4 },
              ],
            },
            {
              id: "s2", templateId: "demo-template", name: "Pull", sortOrder: 1,
              exercises: [
                { id: "e6", slotId: "s2", exerciseId: null, customName: "Barbell Rows", customEmoji: "🏋️", sets: 4, reps: "8-10", restSeconds: 90, notes: "Keep back flat", sortOrder: 0 },
                { id: "e7", slotId: "s2", exerciseId: null, customName: "Pull-ups", customEmoji: "💪", sets: 3, reps: "6-10", restSeconds: 90, sortOrder: 1 },
                { id: "e8", slotId: "s2", exerciseId: null, customName: "Face Pulls", customEmoji: "🎯", sets: 3, reps: "15-20", restSeconds: 45, sortOrder: 2 },
                { id: "e9", slotId: "s2", exerciseId: null, customName: "Barbell Curls", customEmoji: "💪", sets: 3, reps: "10-12", restSeconds: 45, sortOrder: 3 },
              ],
            },
            {
              id: "s3", templateId: "demo-template", name: "Legs", sortOrder: 2,
              exercises: [
                { id: "e10", slotId: "s3", exerciseId: null, customName: "Barbell Squats", customEmoji: "🦵", sets: 4, reps: "6-8", restSeconds: 120, notes: "Below parallel", sortOrder: 0 },
                { id: "e11", slotId: "s3", exerciseId: null, customName: "Romanian Deadlifts", customEmoji: "🏋️", sets: 3, reps: "8-10", restSeconds: 90, sortOrder: 1 },
                { id: "e12", slotId: "s3", exerciseId: null, customName: "Leg Press", customEmoji: "🦵", sets: 3, reps: "10-12", restSeconds: 90, sortOrder: 2 },
                { id: "e13", slotId: "s3", exerciseId: null, customName: "Calf Raises", customEmoji: "🦶", sets: 4, reps: "15-20", restSeconds: 45, sortOrder: 3 },
              ],
            },
          ],
        },
      });
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const data = await getClientActiveWorkoutAssignment(user.id);
    setAssignment(data);
    setLoading(false);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  if (!assignment?.template) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-white">Workout</h1>
        <Card className="p-8 text-center">
          <p className="text-zinc-400 text-sm">No workout plan assigned yet.</p>
          <p className="text-zinc-600 text-xs mt-1">Contact your coach to get a workout plan.</p>
        </Card>
      </div>
    );
  }

  const template = assignment.template;
  const slots = (template.slots || []).sort((a, b) => a.sortOrder - b.sortOrder);
  const currentSlot = slots[activeDay];
  const exercises = currentSlot ? [...currentSlot.exercises].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{template.name}</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{slots.length}-day split</p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {slots.map((slot, i) => (
          <button key={slot.id} onClick={() => setActiveDay(i)} className={cn("shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all", activeDay === i ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500")}>
            {slot.name}
          </button>
        ))}
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <Card key={ex.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 text-lg">{ex.customEmoji || "🏋️"}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{ex.customName || "Exercise"}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <Badge variant="gold">{ex.sets} sets</Badge>
                  <span className="text-xs text-zinc-400">{ex.reps} reps</span>
                  {ex.restSeconds > 0 && <span className="text-xs text-zinc-500">Rest {ex.restSeconds}s</span>}
                </div>
                {ex.notes && <p className="text-xs text-zinc-500 mt-2 bg-white/[0.03] rounded-lg px-2.5 py-1.5 border border-white/[0.06]">💡 {ex.notes}</p>}
                {getVideoUrl(ex.customName || "") && <a href={getVideoUrl(ex.customName || "")!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs text-gold font-medium"><Play className="h-3 w-3" /> Watch Demo</a>}
              </div>
              <span className="text-xs text-zinc-600 font-mono shrink-0">#{i + 1}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary stats */}
      {exercises.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center"><p className="text-lg font-bold text-white">{exercises.length}</p><p className="text-[10px] text-zinc-500">Exercises</p></div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center"><p className="text-lg font-bold text-gold">{exercises.reduce((s, e) => s + e.sets, 0)}</p><p className="text-[10px] text-zinc-500">Total Sets</p></div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center"><p className="text-lg font-bold text-white">~{Math.round(exercises.reduce((s, e) => s + e.sets * 1.5 + (e.restSeconds / 60) * e.sets, 0))}</p><p className="text-[10px] text-zinc-500">Min Est.</p></div>
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
