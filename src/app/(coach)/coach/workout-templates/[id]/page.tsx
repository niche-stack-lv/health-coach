"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExercisePicker } from "@/components/coach/exercise-picker";
import { WorkoutSlotView } from "@/components/shared/workout-slot-view";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getWorkoutTemplate, createWorkoutTemplate, updateWorkoutTemplate, deleteWorkoutTemplate } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate } from "@/types";
import type { Exercise } from "@/lib/exercise-database";

export default function WorkoutTemplateEditPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <WorkoutTemplateEditPageInner />
    </Suspense>
  );
}

// ---- Types for local state ----

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

// ---- Demo template ----

const demoTemplate: WorkoutTemplate = {
  id: "demo-template",
  coachId: "demo",
  name: "Demo PPL Template",
  isTemplate: true,
  slots: [
    { id: "s1", templateId: "demo-template", name: "Push", sortOrder: 0, exercises: [
      { id: "ex1", slotId: "s1", exerciseId: null, customName: "Bench Press", customEmoji: "🏋️", sets: 4, reps: "8-10", restSeconds: 90, sortOrder: 0 },
      { id: "ex2", slotId: "s1", exerciseId: null, customName: "Overhead Press", customEmoji: "🔥", sets: 3, reps: "8-10", restSeconds: 90, sortOrder: 1 },
    ] },
    { id: "s2", templateId: "demo-template", name: "Pull", sortOrder: 1, exercises: [
      { id: "ex3", slotId: "s2", exerciseId: null, customName: "Deadlift", customEmoji: "💪", sets: 4, reps: "5", restSeconds: 120, sortOrder: 0 },
      { id: "ex4", slotId: "s2", exerciseId: null, customName: "Barbell Row", customEmoji: "💪", sets: 3, reps: "8-10", restSeconds: 90, sortOrder: 1 },
    ] },
    { id: "s3", templateId: "demo-template", name: "Legs", sortOrder: 2, exercises: [
      { id: "ex5", slotId: "s3", exerciseId: null, customName: "Barbell Squat", customEmoji: "🦵", sets: 4, reps: "6-8", restSeconds: 120, sortOrder: 0 },
      { id: "ex6", slotId: "s3", exerciseId: null, customName: "Leg Press", customEmoji: "🦵", sets: 3, reps: "10-12", restSeconds: 90, sortOrder: 1 },
    ] },
  ],
  createdAt: new Date().toISOString(),
};

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
      localId: slot.id || crypto.randomUUID(),
      name: slot.name,
      exercises: slot.exercises
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((ex) => ({
          localId: ex.id || crypto.randomUUID(),
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

function WorkoutTemplateEditPageInner() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();

  const templateId = params.id as string;
  const isCreateMode = templateId === "create";

  // Form state
  const [name, setName] = useState("");
  const [slots, setSlots] = useState<LocalSlot[]>(() => [
    createEmptySlot("Workout 1"),
    createEmptySlot("Workout 2"),
    createEmptySlot("Workout 3"),
  ]);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPlan, setIsPlan] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; slots?: string }>({});

  // Exercise picker state
  const [pickerSlotIdx, setPickerSlotIdx] = useState<number | null>(null);

  // Load template in edit mode
  useEffect(() => {
    if (isCreateMode && isDemo) {
      setName(demoTemplate.name);
      setSlots(templateToLocalSlots(demoTemplate));
      return;
    }
    if (isCreateMode) {
      setExpandedSlots(new Set(slots.map((s) => s.localId)));
      return;
    }
    if (isDemo) {
      setName(demoTemplate.name);
      setSlots(templateToLocalSlots(demoTemplate));
      setLoading(false);
      return;
    }
    if (user) loadTemplate();
  }, [user, isDemo, templateId]);

  async function loadTemplate() {
    const template = await getWorkoutTemplate(templateId);
    if (!template) {
      router.push(`/coach/workout-templates${demoSuffix}`);
      return;
    }
    setName(template.name);
    if (!template.isTemplate) setIsPlan(true);
    const localSlots = templateToLocalSlots(template);
    setSlots(localSlots);
    setExpandedSlots(new Set(localSlots.map((s) => s.localId)));
    setLoading(false);
  }

  // ---- Validation ----

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Template name is required";
    if (newErrors.name) { setErrors(newErrors); return false; }
    setErrors({});
    return true;
  }

  // ---- Save ----

  async function handleSave() {
    if (!validate()) return;
    if (isDemo || !user) return;
    setSaving(true);

    const slotsInput = slots.map((slot, slotIdx) => ({
      name: slot.name,
      sortOrder: slotIdx,
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
    }));

    if (isCreateMode) {
      const { error } = await createWorkoutTemplate({
        coachId: user.id,
        name: name.trim(),
        slots: slotsInput,
      });
      if (error) {
        setErrors({ name: error });
        setSaving(false);
        return;
      }
    } else {
      const { error } = await updateWorkoutTemplate(templateId, {
        name: name.trim(),
        slots: slotsInput,
      });
      if (error) {
        setErrors({ name: error });
        setSaving(false);
        return;
      }
    }

    router.push(`/coach/workout-templates${demoSuffix}`);
  }

  // ---- Delete ----

  async function handleDelete() {
    if (isDemo || isCreateMode) return;
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    const { error } = await deleteWorkoutTemplate(templateId);
    if (error) {
      setErrors({ name: error });
      setDeleting(false);
      return;
    }
    router.push(`/coach/workout-templates${demoSuffix}`);
  }

  // ---- Slot management ----

  function toggleSlotExpanded(localId: string) {
    setExpandedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(localId)) next.delete(localId);
      else next.add(localId);
      return next;
    });
  }

  function addSlot() {
    if (slots.length >= 7) return;
    const newSlot = createEmptySlot("Workout " + (slots.length + 1));
    setSlots((prev) => [...prev, newSlot]);
    setExpandedSlots((prev) => new Set([...prev, newSlot.localId]));
  }

  function removeSlot(slotIdx: number) {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((_, i) => i !== slotIdx));
  }

  function updateSlotName(slotIdx: number, value: string) {
    setSlots((prev) => {
      const updated = [...prev];
      updated[slotIdx] = { ...updated[slotIdx], name: value };
      return updated;
    });
  }

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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
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

      {/* Name */}
      <Card className="p-5 mb-4">
        <label className="block text-xs text-zinc-500 mb-1.5">Template Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
          placeholder="e.g. Push Pull Legs"
          className="w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
      </Card>

      {/* Workout Slots */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-zinc-500">Workout Slots</label>
        </div>

        {errors.slots && <p className="text-xs text-red-400 mb-3">{errors.slots}</p>}

        <div className="space-y-3">
          {slots.map((slot, slotIdx) => {
            const isExpanded = expandedSlots.has(slot.localId);
            return (
              <div
                key={slot.localId}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02]"
              >
                {/* Slot header */}
                <div className="flex items-center gap-2 p-4 cursor-pointer" onClick={() => toggleSlotExpanded(slot.localId)}>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <input
                      type="text"
                      value={slot.name}
                      onChange={(e) => updateSlotName(slotIdx, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Workout name"
                      className="flex-1 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                    <span className="text-xs text-zinc-500 shrink-0">
                      {slot.exercises.length} exercise{slot.exercises.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSlot(slotIdx); }}
                    disabled={slots.length <= 1}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="text-zinc-600">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
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

                {/* Expanded content */}
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

        {/* Add slot button */}
        {slots.length < 7 && (
          <button
            onClick={addSlot}
            className="mt-3 w-full rounded-xl border border-dashed border-white/[0.1] py-2.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/[0.2] transition-colors"
          >
            <Plus className="h-3.5 w-3.5 inline mr-1" />
            Add Workout Slot ({slots.length}/7)
          </button>
        )}
      </Card>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Card className="p-4 mb-4 border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400 mb-3">Are you sure you want to delete this template?</p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Confirm Delete"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="gold"
          size="lg"
          className="flex-1"
          onClick={handleSave}
          disabled={saving || isDemo}
        >
          {saving ? "Saving..." : isCreateMode ? "Create Template" : "Save Changes"}
        </Button>
        {!isCreateMode && !showDeleteConfirm && (
          <Button
            variant="danger"
            size="lg"
            onClick={handleDelete}
            disabled={isDemo}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

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
