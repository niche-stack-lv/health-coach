"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exerciseDatabase, muscleGroups, type Exercise } from "@/lib/exercise-database";
import { mockClients } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { getClients, createWorkoutPlan } from "@/lib/db";
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, X, Pencil } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ExerciseEntry { exercise: Exercise; sets: number; reps: string; rest: string; notes: string; }
interface DayData { label: string; name: string; exercises: ExerciseEntry[]; }

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

function ExerciseSheet({ exercise, onAdd, onClose }: { exercise: Exercise; onAdd: (entry: ExerciseEntry) => void; onClose: () => void; }) {
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10-12");
  const [rest, setRest] = useState("60s");
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] p-5 pb-8 safe-area-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{exercise.emoji}</span>
            <div>
              <p className="font-semibold text-white">{exercise.name}</p>
              <p className="text-xs text-zinc-500">{exercise.equipment}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06]"><X className="h-5 w-5 text-zinc-400" /></button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Sets</label>
            <div className="flex gap-1.5">
              {["3", "4", "5"].map((s) => (
                <button key={s} onClick={() => setSets(s)}
                  className={cn("flex-1 rounded-lg py-2 text-sm font-medium border transition-all",
                    sets === s ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-400"
                  )}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Reps</label>
            <input type="text" value={reps} onChange={(e) => setReps(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Rest</label>
            <input type="text" value={rest} onChange={(e) => setRest(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-zinc-400 mb-1">Notes (optional)</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Slow eccentric" className={inputClass} />
        </div>

        <Button variant="gold" className="w-full h-12 text-base rounded-2xl"
          onClick={() => { onAdd({ exercise, sets: Number(sets), reps, rest, notes }); onClose(); }}>
          <Plus className="h-5 w-5" /> Add Exercise
        </Button>
      </div>
    </div>
  );
}

export default function CreateWorkoutPage() {
  const [step, setStep] = useState(0); // 0=details, 1+=days, last=review
  const [planName, setPlanName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [numDays, setNumDays] = useState(3);
  const [saved, setSaved] = useState(false);
  const [activeGroup, setActiveGroup] = useState(muscleGroups[0].key);
  const [sheetExercise, setSheetExercise] = useState<Exercise | null>(null);
  const [returnToReview, setReturnToReview] = useState(false);
  const [days, setDays] = useState<DayData[]>([
    { label: "Day 1", name: "Push", exercises: [] },
    { label: "Day 2", name: "Pull", exercises: [] },
    { label: "Day 3", name: "Legs", exercises: [] },
  ]);

  const { user } = useAuth();
  const [dbClients, setDbClients] = useState<any[]>([]);
  useEffect(() => { if (user) getClients(user.id).then(setDbClients); }, [user]);
  const activeClients = dbClients.filter((c: any) => c.status === "active").map((c: any) => ({ id: c.id, name: c.profile?.name || "Unknown" }));
  const totalSteps = numDays + 2;
  const reviewStep = numDays + 1;
  const isReview = step === reviewStep;
  const currentDay = step >= 1 && step <= numDays ? days[step - 1] : null;
  const isLastDay = step === numDays;

  const addExercise = (dayIndex: number, entry: ExerciseEntry) => {
    setDays((prev) => prev.map((d, i) => i === dayIndex ? { ...d, exercises: [...d.exercises, entry] } : d));
  };
  const removeExercise = (dayIndex: number, exIndex: number) => {
    setDays((prev) => prev.map((d, i) => i === dayIndex ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIndex) } : d));
  };
  const updateDayName = (dayIndex: number, name: string) => {
    setDays((prev) => prev.map((d, i) => i === dayIndex ? { ...d, name } : d));
  };

  const handleNumDaysChange = (n: number) => {
    setNumDays(n);
    setDays((prev) => {
      if (n > prev.length) {
        return [...prev, ...Array.from({ length: n - prev.length }, (_, i) => ({ label: `Day ${prev.length + i + 1}`, name: "", exercises: [] }))];
      }
      return prev.slice(0, n);
    });
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-gold" /></div>
        <h1 className="text-xl font-bold text-white">Workout Plan Created!</h1>
        <p className="text-sm text-zinc-500 mt-2">The plan has been saved and assigned.</p>
        <Link href="/coach/workouts"><Button variant="gold" className="mt-6">Back to Workouts</Button></Link>
      </div>
    );
  }

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {step === 0 ? (
          <Link href="/coach/workouts" className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06]"><ArrowLeft className="h-5 w-5 text-zinc-400" /></Link>
        ) : (
          <button onClick={() => {
            if (returnToReview) { setReturnToReview(false); setStep(reviewStep); }
            else setStep(step - 1);
          }} className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06]"><ArrowLeft className="h-5 w-5 text-zinc-400" /></button>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">
            {step === 0 ? "New Workout Plan" : isReview ? "Review Plan" : `${currentDay?.label}: ${currentDay?.name || "Unnamed"}`}
          </h1>
          <p className="text-xs text-zinc-500">Step {step + 1} of {totalSteps}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6">
        {Array.from({ length: totalSteps }, (_, s) => (
          <div key={s} className={cn("h-1 flex-1 rounded-full transition-all", s <= step ? "gradient-gold" : "bg-white/[0.06]")} />
        ))}
      </div>

      {/* Step 0: Details */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Plan Name</label>
            <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. PPL Hypertrophy" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Client</label>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className={inputClass}>
              <option value="">Select client</option>
              {activeClients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Training Days</label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 4, 5, 6].map((n) => (
                <button key={n} onClick={() => handleNumDaysChange(n)}
                  className={cn("rounded-xl py-3 text-sm font-medium border transition-all",
                    numDays === n ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-400"
                  )}>{n} days</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Day builder */}
      {currentDay && (
        <div>
          {/* Day name input */}
          <div className="mb-4">
            <label className="block text-xs text-zinc-400 mb-1">Day Name</label>
            <input type="text" value={currentDay.name} onChange={(e) => updateDayName(step - 1, e.target.value)} placeholder="e.g. Push, Pull, Legs" className={inputClass} />
          </div>

          {/* Added exercises */}
          {currentDay.exercises.length > 0 && (
            <div className="space-y-2 mb-5">
              {currentDay.exercises.map((entry, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">{entry.exercise.emoji}</span>
                    <span className="text-sm font-medium text-white truncate">{entry.exercise.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="gold">{entry.sets}×{entry.reps}</Badge>
                    <button onClick={() => removeExercise(step - 1, i)} className="p-1 text-zinc-600 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Muscle group tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 mb-4">
            {muscleGroups.map((g) => (
              <button key={g.key} onClick={() => setActiveGroup(g.key)}
                className={cn("shrink-0 flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold border transition-all",
                  activeGroup === g.key ? "border-gold/30 bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
                )}>{g.emoji} {g.label}</button>
            ))}
          </div>

          {/* Exercise list */}
          <div className="space-y-2">
            {exerciseDatabase.filter((e) => e.category === activeGroup).map((ex) => (
              <button key={ex.id} onClick={() => setSheetExercise(ex)}
                className="w-full flex items-center gap-3 rounded-xl border border-white/[0.06] px-4 py-3 text-left hover:bg-white/[0.04] transition-all active:scale-[0.98]">
                <span className="text-xl">{ex.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{ex.name}</p>
                  <p className="text-xs text-zinc-500">{ex.equipment}</p>
                </div>
                <Plus className="h-4 w-4 text-zinc-500 shrink-0" />
              </button>
            ))}
            {/* Custom exercise */}
            <button onClick={() => setSheetExercise({ id: "custom", name: "Custom Exercise", category: activeGroup, emoji: "✏️" })}
              className="w-full flex items-center gap-3 rounded-xl border border-dashed border-gold/30 px-4 py-3 text-left hover:bg-gold/5 transition-all active:scale-[0.98]">
              <span className="text-xl">✏️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gold">Add Custom Exercise</p>
                <p className="text-xs text-zinc-500">Not in the list? Add your own</p>
              </div>
              <Plus className="h-4 w-4 text-gold shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* Review */}
      {isReview && (
        <div className="space-y-4">
          <Card>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Plan</p>
            <p className="text-white font-semibold">{planName}</p>
            <p className="text-xs text-zinc-500 mt-1">{numDays} days · {activeClients.find((c) => c.id === selectedClient)?.name}</p>
          </Card>

          {days.map((day, dayIndex) => (
            <Card key={dayIndex}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-mono">{day.label}</span>
                  <p className="font-semibold text-white">{day.name || "Unnamed"}</p>
                </div>
                <button onClick={() => { setReturnToReview(true); setStep(dayIndex + 1); }}
                  className="flex items-center gap-1 text-xs text-gold font-medium hover:text-gold-light transition-colors">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              </div>
              {day.exercises.length === 0 ? (
                <p className="text-xs text-zinc-600">No exercises added</p>
              ) : (
                <div className="space-y-1.5">
                  {day.exercises.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{entry.exercise.emoji} {entry.exercise.name}</span>
                      <span className="text-zinc-500">{entry.sets}×{entry.reps}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Exercise sheet */}
      {sheetExercise && currentDay && (
        <ExerciseSheet exercise={sheetExercise} onClose={() => setSheetExercise(null)}
          onAdd={(entry) => addExercise(step - 1, entry)} />
      )}

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/[0.06] safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="secondary" className="flex-1" onClick={() => {
                if (returnToReview) { setReturnToReview(false); setStep(reviewStep); }
                else setStep(step - 1);
              }}><ArrowLeft className="h-4 w-4" /> Back</Button>
            )}
            {step === 0 && (
              <Button variant="gold" className="flex-1 h-12 text-base rounded-2xl" disabled={!planName || !selectedClient} onClick={() => setStep(1)}>
                Start Building <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {currentDay && !isLastDay && (
              <Button variant="gold" className="flex-1" onClick={() => {
                if (returnToReview) { setReturnToReview(false); setStep(reviewStep); }
                else { setStep(step + 1); setActiveGroup(muscleGroups[0].key); }
              }}>{returnToReview ? (<>Done <Check className="h-4 w-4" /></>) : (<>Next Day <ArrowRight className="h-4 w-4" /></>)}</Button>
            )}
            {isLastDay && (
              <Button variant="gold" className="flex-1" onClick={() => setStep(reviewStep)}>
                {returnToReview ? "Done" : "Review"} {returnToReview ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            )}
            {isReview && (
              <Button variant="gold" className="flex-1 h-12 text-base rounded-2xl" onClick={async () => {
                if (!user) return;
                await createWorkoutPlan({
                  coach_id: user.id,
                  client_id: selectedClient,
                  title: planName,
                  days: days.map((d, i) => ({
                    day_label: d.label,
                    name: d.name,
                    exercises: d.exercises.map((e) => ({
                      name: e.exercise.name,
                      emoji: e.exercise.emoji,
                      sets: e.sets,
                      reps: e.reps,
                      rest: e.rest,
                      notes: e.notes || undefined,
                    })),
                    sort_order: i,
                  })),
                });
                setSaved(true);
              }}>
                <Check className="h-5 w-5" /> Save Workout Plan
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
