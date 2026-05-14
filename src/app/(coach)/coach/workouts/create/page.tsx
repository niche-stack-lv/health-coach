"use client";

/**
 * Workout Plan Creation Page (REWRITTEN)
 *
 * Same pattern as diet plan creation:
 * - Step 1: Client selector + optional template selector (pre-fills from template)
 * - Shows workout slots with exercises (same editor UI as template page)
 * - "+ Add Exercise" to add more
 * - "Create & Assign" button creates a new workout_template (is_template=false) and assigns to client
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExercisePicker } from "@/components/coach/exercise-picker";
import { WorkoutSlotView } from "@/components/shared/workout-slot-view";
import { useAuth } from "@/lib/auth-context";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { getClients, getWorkoutTemplates, createWorkoutTemplate, assignWorkoutTemplate } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate } from "@/types";
import type { Exercise } from "@/lib/exercise-database";

export default function CreateWorkoutPlanPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <CreateWorkoutPlanPageInner />
    </Suspense>
  );
}

// ---- Types ----

interface LocalExercise {
  localId: string;
  exerciseId: string | null;
  name: string;
  emoji: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
}

interface LocalSlot {
  localId: string;
  name: string;
  exercises: LocalExercise[];
}

// ---- Constants ----

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

// ---- Helpers ----

function createEmptySlot(name: string): LocalSlot {
  return {
    localId: crypto.randomUUID(),
    name,
    exercises: [],
  };
}

function templateToLocalSlots(template: WorkoutTemplate): LocalSlot[] {
  return template.slots
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slot) => ({
      localId: crypto.randomUUID(),
      name: slot.name,
      exercises: slot.exercises
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((ex) => ({
          localId: crypto.randomUUID(),
          exerciseId: ex.exerciseId,
          name: ex.customName || "Exercise",
          emoji: ex.customEmoji || "🏋️",
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          notes: ex.notes || "",
        })),
    }));
}

// ---- Main Component ----

function CreateWorkoutPlanPageInner() {
  const router = useRouter();
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();

  // Form state
  const [planName, setPlanName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [slots, setSlots] = useState<LocalSlot[]>([
    createEmptySlot("Workout 1"),
    createEmptySlot("Workout 2"),
    createEmptySlot("Workout 3"),
  ]);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());

  // Picker state
  const [pickerSlotIdx, setPickerSlotIdx] = useState<number | null>(null);

  // Data
  const [dbClients, setDbClients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Load data
  useEffect(() => {
    if (isDemo) {
      setDbClients([{ id: "demo", status: "active", profile: { name: "Demo Client" } }]);
      setLoading(false);
      return;
    }
    if (!user) return;
    Promise.all([
      getClients(user.id),
      getWorkoutTemplates(user.id),
    ]).then(([clients, tmpls]) => {
      setDbClients(clients);
      setTemplates(tmpls);
      setLoading(false);
    });
  }, [user, isDemo]);

  // Expand all slots by default
  useEffect(() => {
    setExpandedSlots(new Set(slots.map((s) => s.localId)));
  }, []);

  const activeClients = dbClients
    .filter((c: any) => c.status === "active")
    .map((c: any) => ({ id: c.id, name: c.profile?.name || "Unknown" }));

  // ---- Template pre-fill ----

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      const newSlots = [createEmptySlot("Workout 1"), createEmptySlot("Workout 2"), createEmptySlot("Workout 3")];
      setSlots(newSlots);
      setExpandedSlots(new Set(newSlots.map((s) => s.localId)));
      return;
    }
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) return;
    const newSlots = templateToLocalSlots(tmpl);
    setSlots(newSlots);
    setExpandedSlots(new Set(newSlots.map((s) => s.localId)));
    if (!planName) setPlanName(tmpl.name + " — Custom");
  }

  // ---- Slot management ----

  function toggleSlotExpanded(localId: string) {
    setExpandedSlots((prev) => { const n = new Set(prev); if (n.has(localId)) n.delete(localId); else n.add(localId); return n; });
  }
  function addSlot() {
    if (slots.length >= 7) return;
    const s = createEmptySlot("Workout " + (slots.length + 1));
    setSlots((p) => [...p, s]);
    setExpandedSlots((p) => new Set([...p, s.localId]));
  }
  function removeSlot(i: number) { if (slots.length <= 1) return; setSlots((p) => p.filter((_, idx) => idx !== i)); }
  function updateSlotName(i: number, v: string) { setSlots((p) => { const u = [...p]; u[i] = { ...u[i], name: v }; return u; }); }

  // ---- Exercise management ----

  function addExerciseToSlot(slotIdx: number, exercise: Exercise, sets: number, reps: string, restSeconds: number, notes: string) {
    const isCustom = exercise.id.startsWith("custom-");
    setSlots((prev) => {
      const updated = [...prev];
      const slot = { ...updated[slotIdx], exercises: [...updated[slotIdx].exercises] };
      slot.exercises.push({
        localId: crypto.randomUUID(),
        exerciseId: isCustom ? null : (exercise.id.length === 36 ? exercise.id : null),
        name: exercise.name,
        emoji: exercise.emoji,
        sets,
        reps,
        restSeconds,
        notes,
      });
      updated[slotIdx] = slot;
      return updated;
    });
    setPickerSlotIdx(null);
  }

  function removeExercise(slotIdx: number, exIdx: number) {
    setSlots((prev) => {
      const updated = [...prev];
      const slot = { ...updated[slotIdx], exercises: updated[slotIdx].exercises.filter((_, i) => i !== exIdx) };
      updated[slotIdx] = slot;
      return updated;
    });
  }

  // ---- Save: creates a new workout template (is_template=false) + assigns to client ----

  async function handleSave() {
    if (!user || !selectedClient || saving) return;
    setSaving(true);

    const { error: createErr, templateId } = await createWorkoutTemplate({
      coachId: user.id,
      name: planName.trim() || "Custom Workout Plan",
      isTemplate: false,
      slots: slots.map((slot, i) => ({
        name: slot.name,
        sortOrder: i,
        exercises: slot.exercises.map((ex, exIdx) => ({
          exerciseId: ex.exerciseId,
          customName: ex.name,
          customEmoji: ex.emoji,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          notes: ex.notes || undefined,
          sortOrder: exIdx,
        })),
      })),
    });

    if (createErr || !templateId) { setSaving(false); return; }

    const { error: assignErr } = await assignWorkoutTemplate({
      templateId,
      clientId: selectedClient,
      coachId: user.id,
    });

    if (assignErr) { setSaving(false); return; }
    setDone(true);
  }

  // ---- Render ----

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-gold" /></div>
        <h1 className="text-xl font-bold text-white">Workout Plan Assigned!</h1>
        <p className="text-sm text-zinc-500 mt-2">The plan has been created and assigned to the client.</p>
        <Link href="/coach/workouts"><Button variant="gold" className="mt-6">Back to Workouts</Button></Link>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/coach/workouts${demoSuffix}`} className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06]">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <h1 className="text-lg font-bold text-white">New Workout Plan</h1>
      </div>

      {/* Plan details */}
      <Card className="p-5 mb-4">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Plan Name</label>
            <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. PPL Hypertrophy" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Client</label>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className={inputClass}>
              <option value="">Select client</option>
              {activeClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Start from Template (optional)</label>
            <select value={selectedTemplateId} onChange={(e) => handleTemplateSelect(e.target.value)} className={inputClass}>
              <option value="">Start from scratch</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <p className="text-[10px] text-zinc-600 mt-1">Pre-fills workouts from template. Original template stays unchanged.</p>
          </div>
        </div>
      </Card>

      {/* Workout Slots — same UI as template editor */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-zinc-500">Workout Slots</label>
        </div>

        <div className="space-y-3">
          {slots.map((slot, slotIdx) => {
            const isExpanded = expandedSlots.has(slot.localId);
            return (
              <div key={slot.localId} className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
                {/* Header */}
                <div className="flex items-center gap-2 p-4 cursor-pointer" onClick={() => toggleSlotExpanded(slot.localId)}>
                  <input type="text" value={slot.name} onChange={(e) => updateSlotName(slotIdx, e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Workout name" className="flex-1 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50" />
                  <span className="text-xs text-zinc-500 shrink-0">{slot.exercises.length} ex</span>
                  <button onClick={(e) => { e.stopPropagation(); removeSlot(slotIdx); }} disabled={slots.length <= 1} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
                  <div className="text-zinc-600">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
                </div>

                {/* Collapsed summary */}
                {!isExpanded && slot.exercises.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                    {slot.exercises.slice(0, 4).map((ex) => (
                      <span key={ex.localId} className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-300">
                        {ex.emoji} {ex.name} <span className="text-zinc-500">{ex.sets}×{ex.reps}</span>
                      </span>
                    ))}
                    {slot.exercises.length > 4 && (
                      <span className="text-[11px] text-zinc-500 px-1 py-0.5">+{slot.exercises.length - 4} more</span>
                    )}
                  </div>
                )}

                {/* Expanded: exercises list */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <WorkoutSlotView
                      slot={slot}
                      mode="edit"
                      onAddExercise={() => setPickerSlotIdx(slotIdx)}
                      onRemoveExercise={(exIdx) => removeExercise(slotIdx, exIdx)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {slots.length < 7 && (
          <button onClick={addSlot} className="mt-3 w-full rounded-xl border border-dashed border-white/[0.1] py-2.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/[0.2] transition-colors">
            <Plus className="h-3.5 w-3.5 inline mr-1" /> Add Workout Slot ({slots.length}/7)
          </button>
        )}
      </Card>

      {/* Save */}
      <Button variant="gold" className="w-full h-12 text-base rounded-2xl" disabled={!selectedClient || saving || isDemo} onClick={handleSave}>
        {saving ? "Creating..." : <><Check className="h-5 w-5" /> Create & Assign Plan</>}
      </Button>

      {/* Exercise Picker */}
      {pickerSlotIdx !== null && (
        <ExercisePicker
          onSelect={(exercise, sets, reps, restSeconds, notes) =>
            addExerciseToSlot(pickerSlotIdx, exercise, sets, reps, restSeconds, notes)
          }
          onClose={() => setPickerSlotIdx(null)}
        />
      )}
    </div>
  );
}
