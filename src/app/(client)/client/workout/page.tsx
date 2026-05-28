"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getClientActiveWorkoutAssignment } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useIsDemo } from "@/lib/use-demo";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import type { WorkoutAssignment, WorkoutTemplateSlot } from "@/types";

function getVideoUrl(videoId?: string | null): string | null {
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
}

// ---- Demo data ----
const demoAssignment: WorkoutAssignment = {
  id: "demo-assignment", templateId: "demo-template", clientId: "demo", coachId: "demo",
  createdAt: new Date().toISOString(),
  template: {
    id: "demo-template", coachId: "demo", name: "PPL Split", isTemplate: false,
    phases: [], createdAt: new Date().toISOString(),
    slots: [
      {
        id: "s1", templateId: "demo-template", name: "Push", sortOrder: 0, phaseId: null, warmupNotes: "Arm circles, band pull-aparts, 5 min",
        exercises: [
          { id: "e1", slotId: "s1", exerciseId: null, customName: "Bench Press", customEmoji: "🏋️", sets: 4, reps: "8-10", restSeconds: 90, notes: "Control the eccentric", sortOrder: 0 },
          { id: "e2", slotId: "s1", exerciseId: null, customName: "Overhead Press", customEmoji: "🔥", sets: 3, reps: "8-10", restSeconds: 90, sortOrder: 1 },
          { id: "e3", slotId: "s1", exerciseId: null, customName: "Lateral Raises", customEmoji: "🦅", sets: 4, reps: "12-15", restSeconds: 45, notes: "Slow and controlled", sortOrder: 2 },
        ],
      },
      {
        id: "s2", templateId: "demo-template", name: "Pull", sortOrder: 1, phaseId: null, warmupNotes: null,
        exercises: [
          { id: "e6", slotId: "s2", exerciseId: null, customName: "Barbell Rows", customEmoji: "🏋️", sets: 4, reps: "8-10", restSeconds: 90, notes: "Keep back flat", sortOrder: 0 },
          { id: "e7", slotId: "s2", exerciseId: null, customName: "Pull-ups", customEmoji: "💪", sets: 3, reps: "6-10", restSeconds: 90, sortOrder: 1 },
        ],
      },
      {
        id: "s3", templateId: "demo-template", name: "Legs", sortOrder: 2, phaseId: null, warmupNotes: null,
        exercises: [
          { id: "e10", slotId: "s3", exerciseId: null, customName: "Barbell Squats", customEmoji: "🦵", sets: 4, reps: "6-8", restSeconds: 120, notes: "Below parallel", sortOrder: 0 },
          { id: "e11", slotId: "s3", exerciseId: null, customName: "Romanian Deadlifts", customEmoji: "🏋️", sets: 3, reps: "8-10", restSeconds: 90, sortOrder: 1 },
        ],
      },
    ],
  },
};

// ---- Exercise list for a slot ----

function ExerciseList({ slot }: { slot: WorkoutTemplateSlot }) {
  const exercises = [...slot.exercises].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4 pt-2">
      {/* Warm-up */}
      {slot.warmupNotes && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-xs font-semibold text-zinc-400 mb-1">🔥 Warm-up</p>
          <p className="text-xs text-zinc-400">{slot.warmupNotes}</p>
        </div>
      )}

      {/* Exercises */}
      {exercises.map((ex, i) => {
        const videoUrl = getVideoUrl((ex as any).videoId ?? null);
        return (
          <Card key={ex.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 text-lg">
                {ex.customEmoji || "🏋️"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{ex.customName || "Exercise"}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <Badge variant="gold">{ex.sets} sets</Badge>
                  <span className="text-xs text-zinc-400">{ex.reps} reps</span>
                  {ex.restSeconds > 0 && <span className="text-xs text-zinc-500">Rest {ex.restSeconds}s</span>}
                </div>
                {ex.notes && (
                  <p className="text-xs text-zinc-500 mt-2 bg-white/[0.03] rounded-lg px-2.5 py-1.5 border border-white/[0.06]">
                    💡 {ex.notes}
                  </p>
                )}
                {videoUrl && (
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs text-gold font-medium">
                    <Play className="h-3 w-3" /> Watch Demo
                  </a>
                )}
              </div>
              <span className="text-xs text-zinc-600 font-mono shrink-0">#{i + 1}</span>
            </div>
          </Card>
        );
      })}

      {/* Summary */}
      {exercises.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
            <p className="text-lg font-bold text-white">{exercises.length}</p>
            <p className="text-[10px] text-zinc-500">Exercises</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
            <p className="text-lg font-bold text-gold">{exercises.reduce((s, e) => s + e.sets, 0)}</p>
            <p className="text-[10px] text-zinc-500">Total Sets</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
            <p className="text-lg font-bold text-white">~{Math.round(exercises.reduce((s, e) => s + e.sets * 1.5 + (e.restSeconds / 60) * e.sets, 0))}</p>
            <p className="text-[10px] text-zinc-500">Min Est.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Main content ----

function ClientWorkoutContent() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [assignment, setAssignment] = useState<WorkoutAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  // Which phase is expanded (only one at a time)
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  // Which slot (day) is selected within the active phase (or flat list)
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) { setAssignment(demoAssignment); setLoading(false); return; }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const data = await getClientActiveWorkoutAssignment(user.id);
    setAssignment(data);
    setLoading(false);
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

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
  const phases = [...(template.phases ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const slots = [...(template.slots ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const hasPhases = phases.length > 0;

  // The currently selected slot to show exercises for
  const activeSlot = activeSlotId ? slots.find((s) => s.id === activeSlotId) ?? null : null;

  function togglePhase(phaseId: string) {
    if (activePhaseId === phaseId) {
      // Collapse — clear selection
      setActivePhaseId(null);
      setActiveSlotId(null);
    } else {
      setActivePhaseId(phaseId);
      setActiveSlotId(null); // clear day selection when switching phase
    }
  }

  function selectSlot(slotId: string) {
    setActiveSlotId((prev) => prev === slotId ? null : slotId);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{template.name}</h1>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p className="text-sm text-zinc-500">{slots.length}-day split</p>
          {template.level && <span className="text-xs text-zinc-500 border border-white/[0.08] rounded-full px-2 py-0.5">{template.level}</span>}
          {template.location && <span className="text-xs text-zinc-500 border border-white/[0.08] rounded-full px-2 py-0.5">{template.location}</span>}
        </div>
        {template.description && <p className="text-xs text-zinc-500 mt-1">{template.description}</p>}
      </div>

      {/* ---- PHASED VIEW ---- */}
      {hasPhases && (
        <div className="space-y-2">
          {phases.map((phase) => {
            const phaseSlots = slots.filter((s) => s.phaseId === phase.id);
            const isPhaseOpen = activePhaseId === phase.id;

            return (
              <div key={phase.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                {/* Phase header — tap to expand/collapse */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{phase.name}</p>
                    {(phase.weekStart || phase.weekEnd) && (
                      <p className="text-xs text-zinc-500">Weeks {phase.weekStart}–{phase.weekEnd}</p>
                    )}
                    {phase.description && <p className="text-xs text-zinc-500">{phase.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-zinc-500">{phaseSlots.length} days</span>
                    {isPhaseOpen
                      ? <ChevronUp className="h-4 w-4 text-zinc-400" />
                      : <ChevronDown className="h-4 w-4 text-zinc-500" />
                    }
                  </div>
                </button>

                {/* Day tabs — only shown when phase is open */}
                {isPhaseOpen && (
                  <div className="border-t border-white/[0.06]">
                    {/* Scrollable day tabs */}
                    <div className="flex gap-2 overflow-x-auto px-4 py-3">
                      {phaseSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => selectSlot(slot.id)}
                          className={cn(
                            "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all",
                            activeSlotId === slot.id
                              ? "border-gold bg-gold/10 text-gold"
                              : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          {slot.name}
                        </button>
                      ))}
                    </div>

                    {/* Exercises for selected day — inline within the phase card */}
                    {activeSlot && phaseSlots.some((s) => s.id === activeSlot.id) && (
                      <div className="px-4 pb-4">
                        <ExerciseList slot={activeSlot} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ---- FLAT VIEW (no phases) ---- */}
      {!hasPhases && (
        <>
          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => selectSlot(slot.id)}
                className={cn(
                  "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all",
                  activeSlotId === slot.id
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
                )}
              >
                {slot.name}
              </button>
            ))}
          </div>

          {/* Exercises for selected day */}
          {activeSlot && <ExerciseList slot={activeSlot} />}

          {!activeSlot && (
            <p className="text-xs text-zinc-600 text-center py-4">Select a day above to see exercises</p>
          )}
        </>
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
