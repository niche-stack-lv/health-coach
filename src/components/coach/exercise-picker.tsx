"use client";

import { useState, useEffect } from "react";
import { X, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getExercises } from "@/lib/db";
import { cn } from "@/lib/utils";

// Exercise type sourced entirely from DB
export interface Exercise {
  id: string;
  name: string;
  category: "chest" | "back" | "shoulders" | "arms" | "legs" | "core" | "cardio";
  emoji: string;
  equipment?: string;
  videoId?: string;
}

const MUSCLE_GROUPS = [
  { key: "chest" as const,     label: "Chest",     emoji: "🏋️" },
  { key: "back" as const,      label: "Back",      emoji: "💪" },
  { key: "shoulders" as const, label: "Shoulders", emoji: "🔥" },
  { key: "arms" as const,      label: "Arms",      emoji: "💪" },
  { key: "legs" as const,      label: "Legs",      emoji: "🦵" },
  { key: "core" as const,      label: "Core",      emoji: "🎯" },
  { key: "cardio" as const,    label: "Cardio",    emoji: "🏃" },
];

interface ExercisePickerProps {
  onSelect: (exercise: Exercise, sets: number, reps: string, restSeconds: number, notes: string) => void;
  onClose: () => void;
}

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [activeGroup, setActiveGroup] = useState<string>(MUSCLE_GROUPS[0].key);
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    getExercises().then((data) => {
      setExercises(
        data.map((e: any) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          emoji: e.emoji || "🏋️",
          equipment: e.equipment || undefined,
          videoId: e.video_id || undefined,
        }))
      );
      setLoading(false);
    });
  }, []);

  const filtered = exercises.filter((e) => {
    const matchesGroup = e.category === activeGroup;
    const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  if (selectedExercise) {
    return (
      <ExerciseDetailSheet
        exercise={selectedExercise}
        onAdd={(sets, reps, restSeconds, notes) => {
          onSelect(selectedExercise, sets, reps, restSeconds, notes);
        }}
        onClose={() => setSelectedExercise(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[85vh] bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] p-5 pb-8 safe-area-bottom flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Add Exercise</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06]">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>

        {/* Muscle group tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-5 px-5 mb-3">
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              className={cn(
                "shrink-0 flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold border transition-all",
                activeGroup === g.key
                  ? "border-gold/30 bg-gold/10 text-gold"
                  : "border-white/[0.06] text-zinc-500"
              )}
            >
              {g.emoji} {g.label}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              {filtered.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  className="w-full flex items-center gap-3 rounded-xl border border-white/[0.06] px-4 py-3 text-left hover:bg-white/[0.04] transition-all active:scale-[0.98]"
                >
                  <span className="text-xl">{ex.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{ex.name}</p>
                    {ex.equipment && <p className="text-xs text-zinc-500">{ex.equipment}</p>}
                  </div>
                  <Plus className="h-4 w-4 text-zinc-500 shrink-0" />
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-zinc-600 py-8">No exercises found</p>
              )}

              {/* Custom exercise option */}
              <button
                onClick={() =>
                  setSelectedExercise({
                    id: "custom-" + crypto.randomUUID(),
                    name: "Custom Exercise",
                    category: activeGroup as Exercise["category"],
                    emoji: "✏️",
                  })
                }
                className="w-full flex items-center gap-3 rounded-xl border border-dashed border-gold/30 px-4 py-3 text-left hover:bg-gold/5 transition-all active:scale-[0.98]"
              >
                <span className="text-xl">✏️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gold">Add Custom Exercise</p>
                  <p className="text-xs text-zinc-500">Not in the list? Add your own</p>
                </div>
                <Plus className="h-4 w-4 text-gold shrink-0" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Detail Sheet for sets/reps/rest/notes ----

function ExerciseDetailSheet({
  exercise,
  onAdd,
  onClose,
}: {
  exercise: Exercise;
  onAdd: (sets: number, reps: string, restSeconds: number, notes: string) => void;
  onClose: () => void;
}) {
  const isCustom = exercise.id.startsWith("custom-");
  const [customName, setCustomName] = useState(isCustom ? "" : exercise.name);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10-12");
  const [rest, setRest] = useState("60");
  const [notes, setNotes] = useState("");

  const inputClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] p-5 pb-8 safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{exercise.emoji}</span>
            <div>
              <p className="font-semibold text-white">{isCustom ? "Custom Exercise" : exercise.name}</p>
              {exercise.equipment && <p className="text-xs text-zinc-500">{exercise.equipment}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06]">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {isCustom && (
          <div className="mb-4">
            <label className="block text-xs text-zinc-400 mb-1">Exercise Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Cable Lateral Raise"
              className={inputClass}
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Sets</label>
            <div className="flex gap-1.5">
              {["3", "4", "5"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSets(s)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-sm font-medium border transition-all",
                    sets === s
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-white/[0.06] text-zinc-400"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Reps</label>
            <input type="text" value={reps} onChange={(e) => setReps(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Rest (sec)</label>
            <input type="text" value={rest} onChange={(e) => setRest(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs text-zinc-400 mb-1">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Slow eccentric, pause at bottom"
            className={inputClass}
          />
        </div>

        <Button
          variant="gold"
          className="w-full h-12 text-base rounded-2xl"
          disabled={isCustom && !customName.trim()}
          onClick={() => {
            const finalName = isCustom ? customName.trim() : exercise.name;
            // For custom exercises, pass the typed name back via the exercise object
            if (isCustom) {
              (exercise as any).name = finalName;
            }
            onAdd(Number(sets) || 3, reps || "10", Number(rest) || 60, notes);
          }}
        >
          <Plus className="h-5 w-5" /> Add Exercise
        </Button>
      </div>
    </div>
  );
}
