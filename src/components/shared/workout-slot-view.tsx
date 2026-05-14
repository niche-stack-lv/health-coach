"use client";

import { Plus, Trash2 } from "lucide-react";
import type { WorkoutTemplateSlot, WorkoutSlotExercise } from "@/types";

// ---- Editable types (used by template editors with local state) ----

export interface EditableExercise {
  localId: string;
  exerciseId: string | null;
  name: string;
  emoji: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
}

export interface EditableWorkoutSlot {
  localId: string;
  name: string;
  exercises: EditableExercise[];
}

// ---- Props ----

export interface WorkoutSlotViewProps {
  /** The slot data — WorkoutTemplateSlot for view, EditableWorkoutSlot for edit */
  slot: WorkoutTemplateSlot | EditableWorkoutSlot;
  mode: "edit" | "view";
  /** Edit mode: open exercise picker for this slot */
  onAddExercise?: () => void;
  /** Edit mode: remove an exercise by index */
  onRemoveExercise?: (exerciseIdx: number) => void;
}

// ---- Type guard ----

function isWorkoutTemplateSlot(slot: WorkoutTemplateSlot | EditableWorkoutSlot): slot is WorkoutTemplateSlot {
  return "id" in slot && "templateId" in slot;
}

/**
 * Shared workout slot rendering component.
 *
 * Renders exercises within a workout slot in one of two modes:
 * - "edit": exercise rows with sets×reps badge + trash button + "Add Exercise" button
 * - "view": exercise rows read-only
 */
export function WorkoutSlotView({
  slot,
  mode,
  onAddExercise,
  onRemoveExercise,
}: WorkoutSlotViewProps) {
  if (isWorkoutTemplateSlot(slot)) {
    return (
      <WorkoutSlotFromTemplate
        slot={slot}
        mode={mode}
        onAddExercise={onAddExercise}
        onRemoveExercise={onRemoveExercise}
      />
    );
  }

  return (
    <WorkoutSlotFromEditable
      slot={slot}
      mode={mode}
      onAddExercise={onAddExercise}
      onRemoveExercise={onRemoveExercise}
    />
  );
}

// ---- Render from WorkoutTemplateSlot (DB type) ----

function WorkoutSlotFromTemplate({
  slot,
  mode,
  onAddExercise,
  onRemoveExercise,
}: {
  slot: WorkoutTemplateSlot;
  mode: "edit" | "view";
  onAddExercise?: () => void;
  onRemoveExercise?: (exerciseIdx: number) => void;
}) {
  const exercises = [...slot.exercises].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-2">
      {exercises.map((ex, exIdx) => (
        <div
          key={ex.id}
          className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">{ex.customEmoji || "🏋️"}</span>
            <span className="text-sm font-medium text-white truncate">{ex.customName || "Exercise"}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center rounded-md bg-gold/10 text-gold px-2 py-0.5 text-[10px] font-semibold">
              {ex.sets}×{ex.reps}
            </span>
            {ex.restSeconds > 0 && (
              <span className="text-[10px] text-zinc-500">{ex.restSeconds}s</span>
            )}
            {mode === "edit" && onRemoveExercise && (
              <button
                onClick={() => onRemoveExercise(exIdx)}
                className="p-1 text-zinc-600 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {mode === "edit" && onAddExercise && (
        <button
          onClick={onAddExercise}
          className="w-full flex items-center justify-center gap-1 rounded-xl border border-dashed border-white/[0.1] py-2.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/[0.2] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Exercise
        </button>
      )}
    </div>
  );
}

// ---- Render from EditableWorkoutSlot (local state) ----

function WorkoutSlotFromEditable({
  slot,
  mode,
  onAddExercise,
  onRemoveExercise,
}: {
  slot: EditableWorkoutSlot;
  mode: "edit" | "view";
  onAddExercise?: () => void;
  onRemoveExercise?: (exerciseIdx: number) => void;
}) {
  return (
    <div className="space-y-2">
      {slot.exercises.map((ex, exIdx) => (
        <div
          key={ex.localId}
          className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">{ex.emoji}</span>
            <span className="text-sm font-medium text-white truncate">{ex.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center rounded-md bg-gold/10 text-gold px-2 py-0.5 text-[10px] font-semibold">
              {ex.sets}×{ex.reps}
            </span>
            {ex.restSeconds > 0 && (
              <span className="text-[10px] text-zinc-500">{ex.restSeconds}s</span>
            )}
            {mode === "edit" && onRemoveExercise && (
              <button
                onClick={() => onRemoveExercise(exIdx)}
                className="p-1 text-zinc-600 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {mode === "edit" && onAddExercise && (
        <button
          onClick={onAddExercise}
          className="w-full flex items-center justify-center gap-1 rounded-xl border border-dashed border-white/[0.1] py-2.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/[0.2] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Exercise
        </button>
      )}
    </div>
  );
}
