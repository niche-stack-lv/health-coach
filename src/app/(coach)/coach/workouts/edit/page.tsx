"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { exerciseDatabase, muscleGroups, type Exercise } from "@/lib/exercise-database";
import { getWorkoutPlan, updateWorkoutPlanDays } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EditExercise { name: string; emoji: string; sets: number; reps: string; rest: string; notes: string; }
interface EditDay { label: string; name: string; exercises: EditExercise[]; }

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

function EditWorkoutContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const planId = searchParams.get("id");

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState(muscleGroups[0].key);
  const [sheetExercise, setSheetExercise] = useState<Exercise | null>(null);
  const [sheetSets, setSheetSets] = useState("3");
  const [sheetReps, setSheetReps] = useState("10-12");
  const [sheetRest, setSheetRest] = useState("60s");
  const [sheetNotes, setSheetNotes] = useState("");

  const [days, setDays] = useState<EditDay[]>([]);

  useEffect(() => {
    if (planId) loadPlan();
  }, [planId]);

  async function loadPlan() {
    if (!planId) return;
    const data = await getWorkoutPlan(planId);
    if (!data) { setLoading(false); return; }
    setPlan(data);
    setDays((data.days || [])
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((d: any) => ({
        label: d.day_label,
        name: d.name,
        exercises: (d.exercises || []).map((e: any) => ({
          name: e.name,
          emoji: e.emoji || "🏋️",
          sets: e.sets || 3,
          reps: e.reps || "10-12",
          rest: e.rest || "60s",
          notes: e.notes || "",
        })),
      }))
    );
    setLoading(false);
  }

  const addExercise = (dayIndex: number) => {
    if (!sheetExercise) return;
    setDays((prev) => prev.map((d, i) => i === dayIndex ? {
      ...d, exercises: [...d.exercises, { name: sheetExercise.name, emoji: sheetExercise.emoji, sets: Number(sheetSets), reps: sheetReps, rest: sheetRest, notes: sheetNotes }]
    } : d));
    setSheetExercise(null);
    setSheetSets("3"); setSheetReps("10-12"); setSheetRest("60s"); setSheetNotes("");
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    setDays((prev) => prev.map((d, i) => i === dayIndex ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIndex) } : d));
  };

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    await updateWorkoutPlanDays(plan.id, days.map((d, i) => ({
      day_label: d.label,
      name: d.name,
      exercises: d.exercises.map((e) => ({
        name: e.name,
        emoji: e.emoji,
        sets: e.sets,
        reps: e.reps,
        rest: e.rest,
        notes: e.notes || undefined,
      })),
      sort_order: i,
    })));
    setSaving(false);
    setSaved(true);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  if (!plan) return (
    <div className="py-20 text-center">
      <p className="text-zinc-500">Workout plan not found.</p>
      <Link href="/coach/workouts"><Button variant="secondary" className="mt-4">Back</Button></Link>
    </div>
  );

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-gold" /></div>
        <h1 className="text-xl font-bold text-white">Workout Updated!</h1>
        <p className="text-sm text-zinc-500 mt-2">Changes have been saved.</p>
        <Link href="/coach/workouts"><Button variant="gold" className="mt-6">Back to Workouts</Button></Link>
      </div>
    );
  }

  const clientName = plan.client?.name;

  return (
    <div className="pb-24">
      <Link href="/coach/workouts" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-gold mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">{plan.title}</h1>
            <Badge variant={plan.status === "active" ? "success" : "default"}>{plan.status}</Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">{days.length}-day split</p>
        </div>
      </div>

      {clientName && (
        <Card className="mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={clientName} />
            <div>
              <p className="text-sm font-semibold text-white">{clientName}</p>
              <p className="text-xs text-zinc-500">{plan.client?.email}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Days */}
      <div className="space-y-4">
        {days.map((day, dayIndex) => {
          const isEditing = editingDay === dayIndex;
          return (
            <Card key={dayIndex}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-mono">{day.label}</span>
                  <p className="font-semibold text-white">{day.name}</p>
                </div>
                <button onClick={() => { setEditingDay(isEditing ? null : dayIndex); setActiveGroup(muscleGroups[0].key); }}
                  className={cn("flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all",
                    isEditing ? "bg-gold/10 text-gold" : "text-zinc-500 hover:text-gold hover:bg-white/[0.04]"
                  )}><Pencil className="h-3 w-3" /> {isEditing ? "Done" : "Edit"}</button>
              </div>

              <div className="space-y-2">
                {day.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm">{ex.emoji}</span>
                      <span className="text-sm text-zinc-300 truncate">{ex.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="gold">{ex.sets}×{ex.reps}</Badge>
                      <span className="text-xs text-zinc-500">{ex.rest}</span>
                      {isEditing && (
                        <button onClick={() => removeExercise(dayIndex, i)} className="p-1 text-zinc-600 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline exercise picker */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-6 px-6 mb-3">
                    {muscleGroups.map((g) => (
                      <button key={g.key} onClick={() => setActiveGroup(g.key)}
                        className={cn("shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border transition-all",
                          activeGroup === g.key ? "border-gold/30 bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
                        )}>{g.emoji} {g.label}</button>
                    ))}
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {exerciseDatabase.filter((e) => e.category === activeGroup).map((ex) => (
                      <button key={ex.id} onClick={() => { setSheetExercise(ex); setSheetSets("3"); setSheetReps("10-12"); setSheetRest("60s"); setSheetNotes(""); }}
                        className="w-full flex items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-2 text-left hover:bg-white/[0.04] transition-all text-sm">
                        <span>{ex.emoji}</span>
                        <span className="flex-1 text-zinc-300 truncate">{ex.name}</span>
                        <Plus className="h-3.5 w-3.5 text-zinc-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Exercise amount sheet */}
      {sheetExercise && editingDay !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSheetExercise(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] p-5 pb-8 safe-area-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{sheetExercise.emoji}</span>
                <p className="font-semibold text-white">{sheetExercise.name}</p>
              </div>
              <button onClick={() => setSheetExercise(null)} className="p-2 rounded-xl hover:bg-white/[0.06]"><X className="h-5 w-5 text-zinc-400" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Sets</label>
                <div className="flex gap-1.5">
                  {["3", "4", "5"].map((s) => (
                    <button key={s} onClick={() => setSheetSets(s)}
                      className={cn("flex-1 rounded-lg py-2 text-sm font-medium border transition-all",
                        sheetSets === s ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-400"
                      )}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Reps</label>
                <input type="text" value={sheetReps} onChange={(e) => setSheetReps(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Rest</label>
                <input type="text" value={sheetRest} onChange={(e) => setSheetRest(e.target.value)} className={inputClass} />
              </div>
            </div>
            <Button variant="gold" className="w-full h-12 text-base rounded-2xl" onClick={() => addExercise(editingDay)}>
              <Plus className="h-5 w-5" /> Add
            </Button>
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/[0.06] safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Button variant="gold" className="w-full h-12 text-base rounded-2xl" onClick={handleSave} disabled={saving}>
            <Check className="h-5 w-5" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EditWorkoutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <EditWorkoutContent />
    </Suspense>
  );
}
