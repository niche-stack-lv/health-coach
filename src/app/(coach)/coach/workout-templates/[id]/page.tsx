"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExercisePicker, type Exercise } from "@/components/coach/exercise-picker";
import { WorkoutSlotView } from "@/components/shared/workout-slot-view";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getWorkoutTemplate, createWorkoutTemplate, updateWorkoutTemplate, deleteWorkoutTemplate } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate } from "@/types";

export default function WorkoutTemplateEditPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <WorkoutTemplateEditPageInner />
    </Suspense>
  );
}

// ---- Local state types ----

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
  warmupNotes: string;
  phaseIndex: number; // 0-based index into phases array
  exercises: LocalExercise[];
}

interface LocalPhase {
  localId: string;
  name: string;
  weekStart: string;
  weekEnd: string;
  description: string;
  collapsed: boolean;
}

// ---- Demo data ----

const demoTemplate: WorkoutTemplate = {
  id: "demo-template", coachId: "demo", name: "Demo PPL Template",
  isTemplate: true, phases: [], createdAt: new Date().toISOString(),
  slots: [
    { id: "s1", templateId: "demo-template", name: "Push", sortOrder: 0, phaseId: null, warmupNotes: null,
      exercises: [
        { id: "ex1", slotId: "s1", exerciseId: null, customName: "Bench Press", customEmoji: "🏋️", sets: 4, reps: "8-10", restSeconds: 90, sortOrder: 0 },
        { id: "ex2", slotId: "s1", exerciseId: null, customName: "Overhead Press", customEmoji: "🔥", sets: 3, reps: "8-10", restSeconds: 90, sortOrder: 1 },
      ],
    },
    { id: "s2", templateId: "demo-template", name: "Pull", sortOrder: 1, phaseId: null, warmupNotes: null,
      exercises: [
        { id: "ex3", slotId: "s2", exerciseId: null, customName: "Deadlift", customEmoji: "💪", sets: 4, reps: "5", restSeconds: 120, sortOrder: 0 },
      ],
    },
    { id: "s3", templateId: "demo-template", name: "Legs", sortOrder: 2, phaseId: null, warmupNotes: null,
      exercises: [
        { id: "ex5", slotId: "s3", exerciseId: null, customName: "Barbell Squat", customEmoji: "🦵", sets: 4, reps: "6-8", restSeconds: 120, sortOrder: 0 },
      ],
    },
  ],
};

// ---- Helpers ----

function createEmptySlot(name: string, phaseIndex = 0): LocalSlot {
  return { localId: crypto.randomUUID(), name, warmupNotes: "", phaseIndex, exercises: [] };
}

function createDefaultPhase(index: number): LocalPhase {
  return {
    localId: crypto.randomUUID(),
    name: index === 0 ? "Phase 1" : `Phase ${index + 1}`,
    weekStart: "", weekEnd: "", description: "", collapsed: false,
  };
}

function templateToLocal(template: WorkoutTemplate): { phases: LocalPhase[]; slots: LocalSlot[] } {
  const phases: LocalPhase[] = template.phases.map((p) => ({
    localId: p.id,
    name: p.name,
    weekStart: p.weekStart?.toString() ?? "",
    weekEnd: p.weekEnd?.toString() ?? "",
    description: p.description ?? "",
    collapsed: false,
  }));

  // Build phaseId → index map
  const phaseIdToIndex: Record<string, number> = {};
  template.phases.forEach((p, i) => { phaseIdToIndex[p.id] = i; });

  const slots: LocalSlot[] = template.slots.map((slot) => ({
    localId: slot.id,
    name: slot.name,
    warmupNotes: slot.warmupNotes ?? "",
    phaseIndex: slot.phaseId ? (phaseIdToIndex[slot.phaseId] ?? 0) : 0,
    exercises: slot.exercises.map((ex) => ({
      localId: ex.id,
      exerciseId: ex.exerciseId,
      name: ex.customName ?? "Exercise",
      emoji: ex.customEmoji ?? "🏋️",
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restSeconds,
      notes: ex.notes ?? "",
    })),
  }));

  return { phases, slots };
}

// ---- Main Component ----

function WorkoutTemplateEditPageInner() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();

  const templateId = params.id as string;
  const isCreateMode = templateId === "create";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState("");
  const [phases, setPhases] = useState<LocalPhase[]>([createDefaultPhase(0)]);
  const [usesPhases, setUsesPhases] = useState(false);
  const [slots, setSlots] = useState<LocalSlot[]>([
    createEmptySlot("Workout 1"), createEmptySlot("Workout 2"), createEmptySlot("Workout 3"),
  ]);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPlan, setIsPlan] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [pickerSlotIdx, setPickerSlotIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isCreateMode) {
      if (isDemo) { setName(demoTemplate.name); const l = templateToLocal(demoTemplate); setSlots(l.slots); }
      setExpandedSlots(new Set(slots.map((s) => s.localId)));
      return;
    }
    if (isDemo) {
      setName(demoTemplate.name);
      const l = templateToLocal(demoTemplate);
      setSlots(l.slots); setPhases(l.phases.length ? l.phases : [createDefaultPhase(0)]);
      setLoading(false); return;
    }
    if (user) loadTemplate();
  }, [user, isDemo, templateId]);

  async function loadTemplate() {
    const template = await getWorkoutTemplate(templateId);
    if (!template) { router.push(`/coach/workout-templates${demoSuffix}`); return; }
    setName(template.name);
    setDescription(template.description ?? "");
    setLevel(template.level ?? "");
    setLocation(template.location ?? "");
    if (!template.isTemplate) setIsPlan(true);
    const l = templateToLocal(template);
    const hasPhases = l.phases.length > 0;
    setUsesPhases(hasPhases);
    setPhases(hasPhases ? l.phases : [createDefaultPhase(0)]);
    setSlots(l.slots);
    setExpandedSlots(new Set(l.slots.map((s) => s.localId)));
    setLoading(false);
  }

  // ---- Phase management ----

  function addPhase() {
    const newPhase = createDefaultPhase(phases.length);
    setPhases((p) => [...p, newPhase]);
  }

  function removePhase(idx: number) {
    if (phases.length <= 1) return;
    setPhases((p) => p.filter((_, i) => i !== idx));
    // Reassign slots that were in the removed phase to phase 0
    setSlots((prev) => prev.map((s) => s.phaseIndex === idx ? { ...s, phaseIndex: 0 } : s.phaseIndex > idx ? { ...s, phaseIndex: s.phaseIndex - 1 } : s));
  }

  function updatePhase(idx: number, field: keyof Omit<LocalPhase, "localId" | "collapsed">, value: string) {
    setPhases((p) => { const u = [...p]; u[idx] = { ...u[idx], [field]: value }; return u; });
  }

  function togglePhaseCollapsed(idx: number) {
    setPhases((p) => { const u = [...p]; u[idx] = { ...u[idx], collapsed: !u[idx].collapsed }; return u; });
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
  function updateSlotWarmup(i: number, v: string) { setSlots((p) => { const u = [...p]; u[i] = { ...u[i], warmupNotes: v }; return u; }); }
  function updateSlotPhase(i: number, phaseIndex: number) { setSlots((p) => { const u = [...p]; u[i] = { ...u[i], phaseIndex }; return u; }); }

  // ---- Exercise management ----

  function addExerciseToSlot(slotIdx: number, exercise: Exercise, sets: number, reps: string, restSeconds: number, notes: string) {
    const isCustom = exercise.id.startsWith("custom-");
    setSlots((prev) => {
      const updated = [...prev];
      const slot = { ...updated[slotIdx], exercises: [...updated[slotIdx].exercises] };
      slot.exercises.push({
        localId: crypto.randomUUID(),
        exerciseId: isCustom ? null : exercise.id,
        name: exercise.name,
        emoji: exercise.emoji,
        sets, reps, restSeconds, notes,
      });
      updated[slotIdx] = slot;
      return updated;
    });
    setPickerSlotIdx(null);
  }

  function removeExercise(slotIdx: number, exIdx: number) {
    setSlots((prev) => {
      const updated = [...prev];
      updated[slotIdx] = { ...updated[slotIdx], exercises: updated[slotIdx].exercises.filter((_, i) => i !== exIdx) };
      return updated;
    });
  }

  // ---- Save ----

  async function handleSave() {
    if (!name.trim()) { setErrors({ name: "Template name is required" }); return; }
    if (isDemo || !user) return;
    setSaving(true);
    setErrors({});

    const phasesInput = usesPhases ? phases.map((p, i) => ({
      name: p.name,
      sortOrder: i,
      weekStart: p.weekStart ? Number(p.weekStart) : undefined,
      weekEnd: p.weekEnd ? Number(p.weekEnd) : undefined,
      description: p.description || undefined,
    })) : undefined;

    const slotsInput = slots.map((slot, i) => ({
      name: slot.name,
      sortOrder: i,
      phaseIndex: usesPhases ? slot.phaseIndex : undefined,
      warmupNotes: slot.warmupNotes || undefined,
      exercises: slot.exercises.map((ex, exIdx) => ({
        exerciseId: ex.exerciseId,
        customName: ex.name,
        customEmoji: ex.emoji,
        sets: ex.sets, reps: ex.reps, restSeconds: ex.restSeconds,
        notes: ex.notes || undefined, sortOrder: exIdx,
      })),
    }));

    const payload = {
      name: name.trim(),
      description: description || undefined,
      level: level || undefined,
      location: location || undefined,
      phases: phasesInput,
      slots: slotsInput,
    };

    const { error } = isCreateMode
      ? await createWorkoutTemplate({ coachId: user.id, ...payload })
      : await updateWorkoutTemplate(templateId, payload);

    if (error) { setErrors({ name: error }); setSaving(false); return; }
    router.push(`/coach/workout-templates${demoSuffix}`);
  }

  async function handleDelete() {
    if (isDemo || isCreateMode) return;
    if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
    setDeleting(true);
    const { error } = await deleteWorkoutTemplate(templateId);
    if (error) { setErrors({ name: error }); setDeleting(false); return; }
    router.push(`/coach/workout-templates${demoSuffix}`);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  const inputClass = "w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={isPlan ? `/coach/workouts${demoSuffix}` : `/coach/workout-templates${demoSuffix}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-white">
          {isCreateMode ? "Create Workout Template" : isPlan ? "Workout Plan" : "Edit Workout Template"}
        </h1>
      </div>

      {isDemo && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
          Demo mode — changes won&apos;t be saved
        </div>
      )}

      {/* Template metadata */}
      <Card className="p-5 mb-4 space-y-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">Template Name *</label>
          <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors({}); }} placeholder="e.g. Beginner at Home – 3 Days/Week" className={inputClass} />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">Description (optional)</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Bodyweight → Resistance Bands → Dumbbells" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Level (optional)</label>
            <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="e.g. Beginner" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Location (optional)</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Home / Gym" className={inputClass} />
          </div>
        </div>
      </Card>

      {/* Phases toggle */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Phases</p>
            <p className="text-xs text-zinc-500 mt-0.5">Group workouts into progressive phases (e.g. Phase 1: Bodyweights)</p>
          </div>
          <button
            onClick={() => setUsesPhases((v) => !v)}
            className={cn("relative shrink-0 h-6 w-11 rounded-full border transition-colors", usesPhases ? "border-gold bg-gold/20" : "border-white/[0.1] bg-white/[0.04]")}
          >
            <span className={cn("absolute top-0.5 h-5 w-5 rounded-full transition-transform", usesPhases ? "translate-x-5 bg-gold" : "translate-x-0.5 bg-zinc-500")} />
          </button>
        </div>

        {usesPhases && (
          <div className="mt-4 space-y-3">
            {phases.map((phase, phaseIdx) => (
              <div key={phase.localId} className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2 p-3 cursor-pointer" onClick={() => togglePhaseCollapsed(phaseIdx)}>
                  <span className="text-xs font-semibold text-gold w-5">{phaseIdx + 1}</span>
                  <input
                    type="text" value={phase.name}
                    onChange={(e) => updatePhase(phaseIdx, "name", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Phase name"
                    className="flex-1 h-7 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-gold/50"
                  />
                  <button onClick={(e) => { e.stopPropagation(); removePhase(phaseIdx); }} disabled={phases.length <= 1} className="p-1 rounded text-zinc-600 hover:text-red-400 disabled:opacity-30">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="text-zinc-600">{phase.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</div>
                </div>
                {!phase.collapsed && (
                  <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">Week Start</label>
                      <input type="number" value={phase.weekStart} onChange={(e) => updatePhase(phaseIdx, "weekStart", e.target.value)} placeholder="1" className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">Week End</label>
                      <input type="number" value={phase.weekEnd} onChange={(e) => updatePhase(phaseIdx, "weekEnd", e.target.value)} placeholder="6" className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold/50" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] text-zinc-500 mb-1">Phase Description (optional)</label>
                      <input type="text" value={phase.description} onChange={(e) => updatePhase(phaseIdx, "description", e.target.value)} placeholder="e.g. Bodyweight foundation" className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold/50" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={addPhase} className="w-full rounded-xl border border-dashed border-white/[0.1] py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/[0.2] transition-colors">
              <Plus className="h-3.5 w-3.5 inline mr-1" /> Add Phase
            </button>
          </div>
        )}
      </Card>

      {/* Workout Slots */}
      <Card className="p-5 mb-4">
        <label className="text-xs text-zinc-500 block mb-3">Workout Slots</label>
        <div className="space-y-3">
          {slots.map((slot, slotIdx) => {
            const isExpanded = expandedSlots.has(slot.localId);
            return (
              <div key={slot.localId} className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2 p-4 cursor-pointer" onClick={() => toggleSlotExpanded(slot.localId)}>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <input type="text" value={slot.name} onChange={(e) => updateSlotName(slotIdx, e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Workout name" className="flex-1 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50" />
                    {usesPhases && (
                      <select value={slot.phaseIndex} onChange={(e) => { e.stopPropagation(); updateSlotPhase(slotIdx, Number(e.target.value)); }} onClick={(e) => e.stopPropagation()} className="h-8 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-gold/50">
                        {phases.map((p, i) => <option key={p.localId} value={i}>{p.name || `Phase ${i + 1}`}</option>)}
                      </select>
                    )}
                    <span className="text-xs text-zinc-500 shrink-0">{slot.exercises.length} ex</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeSlot(slotIdx); }} disabled={slots.length <= 1} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
                  <div className="text-zinc-600">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
                </div>

                {!isExpanded && slot.exercises.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                    {slot.exercises.slice(0, 4).map((ex) => (
                      <span key={ex.localId} className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-300">
                        {ex.emoji} {ex.name} <span className="text-zinc-500">{ex.sets}×{ex.reps}</span>
                      </span>
                    ))}
                    {slot.exercises.length > 4 && <span className="text-[11px] text-zinc-500 px-1 py-0.5">+{slot.exercises.length - 4} more</span>}
                  </div>
                )}

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* Warm-up notes */}
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">Warm-up Notes (optional)</label>
                      <input type="text" value={slot.warmupNotes} onChange={(e) => updateSlotWarmup(slotIdx, e.target.value)} placeholder="e.g. Arm circles, shoulder stretches, 5 min" className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-gold/50" />
                    </div>
                    <WorkoutSlotView slot={slot} mode="edit" onAddExercise={() => setPickerSlotIdx(slotIdx)} onRemoveExercise={(exIdx) => removeExercise(slotIdx, exIdx)} />
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

      {showDeleteConfirm && (
        <Card className="p-4 mb-4 border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400 mb-3">Are you sure you want to delete this template?</p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Confirm Delete"}</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="gold" size="lg" className="flex-1" onClick={handleSave} disabled={saving || isDemo}>
          {saving ? "Saving..." : isCreateMode ? "Create Template" : "Save Changes"}
        </Button>
        {!isCreateMode && !showDeleteConfirm && (
          <Button variant="danger" size="lg" onClick={handleDelete} disabled={isDemo}><Trash2 className="h-4 w-4" /></Button>
        )}
      </div>

      {pickerSlotIdx !== null && (
        <ExercisePicker
          onSelect={(exercise, sets, reps, restSeconds, notes) => addExerciseToSlot(pickerSlotIdx, exercise, sets, reps, restSeconds, notes)}
          onClose={() => setPickerSlotIdx(null)}
        />
      )}
    </div>
  );
}
