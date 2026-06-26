"use client";

import { Suspense, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Trash2, Pencil, Play, X, Film } from "lucide-react";
import { useIsDemo } from "@/lib/use-demo";
import { getExercises, createExercise, updateExercise, deleteExercise } from "@/lib/db";
import { parseYouTubeId, youtubeThumbnail } from "@/lib/youtube";
import { ExerciseVideoSheet } from "@/components/shared/exercise-video-sheet";
import { cn } from "@/lib/utils";

interface ExerciseRow {
  id: string;
  name: string;
  category: string;
  emoji: string;
  equipment: string | null;
  video_id: string | null;
  is_default: boolean;
}

const CATEGORIES = ["all", "chest", "back", "shoulders", "arms", "legs", "core", "cardio"];

const inputClass =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

const demoExercises: ExerciseRow[] = [
  { id: "d1", name: "Flat Bench Press", category: "chest", emoji: "🏋️", equipment: "Barbell", video_id: "gRVjAtPip0Y", is_default: true },
  { id: "d2", name: "Barbell Squat", category: "legs", emoji: "🦵", equipment: "Barbell", video_id: "ultWZbUMPL8", is_default: true },
  { id: "d3", name: "Pull-ups", category: "back", emoji: "💪", equipment: "Bodyweight", video_id: null, is_default: true },
];

export default function ExercisesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <ExercisesPageInner />
    </Suspense>
  );
}

function ExercisesPageInner() {
  const isDemo = useIsDemo();
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ExerciseRow | null>(null);
  const [playing, setPlaying] = useState<ExerciseRow | null>(null);

  useEffect(() => {
    if (isDemo) {
      setExercises(demoExercises);
      setLoading(false);
      return;
    }
    loadExercises();
  }, [isDemo]);

  async function loadExercises() {
    const data = await getExercises();
    setExercises(data as ExerciseRow[]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this exercise?")) return;
    setExercises((prev) => prev.filter((e) => e.id !== id));
    if (!isDemo) await deleteExercise(id);
  }

  const filtered = exercises.filter((e) => {
    const matchesCat = category === "all" || e.category === category;
    const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const withVideo = exercises.filter((e) => e.video_id).length;

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Exercises</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {exercises.length} exercises · {withVideo} with demo videos
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Exercise
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(inputClass, "pl-9")}
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-[11px] font-semibold border uppercase tracking-wide transition-colors",
              category === c ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {showForm && (
        <ExerciseForm
          initial={editing}
          isDemo={isDemo}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); loadExercises(); }}
        />
      )}

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Film className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-white font-semibold">No exercises found</p>
          <p className="text-zinc-500 text-sm mt-1">Add an exercise and paste a YouTube link so clients can watch the demo.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filtered.map((ex) => {
            const hasVideo = !!ex.video_id;
            return (
              <Card key={ex.id} className="p-0 overflow-hidden">
                <div
                  className={cn("flex items-center gap-3 p-3", hasVideo && "cursor-pointer active:bg-white/[0.03]")}
                  onClick={() => hasVideo && setPlaying(ex)}
                >
                  {/* Thumbnail or emoji */}
                  {hasVideo ? (
                    <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden bg-black">
                      <img src={youtubeThumbnail(ex.video_id!)} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-5 w-5 text-white fill-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-14 w-20 shrink-0 rounded-lg bg-white/[0.04] flex items-center justify-center text-2xl">
                      {ex.emoji || "🏋️"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ex.name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                      {ex.category}
                      {ex.equipment ? ` · ${ex.equipment}` : ""}
                    </p>
                    {!hasVideo && <p className="text-[10px] text-zinc-600 mt-0.5">No video yet</p>}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(ex); setShowForm(true); }}
                      className="p-1.5 text-zinc-500 hover:text-white"
                      aria-label="Edit exercise"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {!ex.is_default && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(ex.id); }}
                        className="p-1.5 text-zinc-500 hover:text-red-400"
                        aria-label="Delete exercise"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {playing && playing.video_id && (
        <ExerciseVideoSheet
          name={playing.name}
          emoji={playing.emoji}
          equipment={playing.equipment}
          videoId={playing.video_id}
          onClose={() => setPlaying(null)}
        />
      )}
    </div>
  );
}

// ─── Add / Edit form ────────────────────────────────────────────────────────

function ExerciseForm({
  initial,
  isDemo,
  onClose,
  onSaved,
}: {
  initial: ExerciseRow | null;
  isDemo: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryVal, setCategoryVal] = useState(initial?.category ?? "chest");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "🏋️");
  const [equipment, setEquipment] = useState(initial?.equipment ?? "");
  const [videoUrl, setVideoUrl] = useState(
    initial?.video_id ? `https://www.youtube.com/watch?v=${initial.video_id}` : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedId = parseYouTubeId(videoUrl);
  const videoInvalid = videoUrl.trim().length > 0 && !parsedId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (videoInvalid) {
      setError("That doesn't look like a valid YouTube link.");
      return;
    }
    setSaving(true);
    setError(null);

    if (isDemo) {
      setSaving(false);
      onSaved();
      return;
    }

    if (initial) {
      await updateExercise(initial.id, {
        name: name.trim(),
        category: categoryVal,
        emoji,
        equipment: equipment.trim() || null,
        video_id: parsedId,
      });
    } else {
      await createExercise({
        name: name.trim(),
        category: categoryVal,
        emoji,
        equipment: equipment.trim() || undefined,
        video_id: parsedId || undefined,
      });
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Card className="p-4 mb-4 border-gold/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">{initial ? "Edit Exercise" : "Add Exercise"}</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Exercise name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
          <select value={categoryVal} onChange={(e) => setCategoryVal(e.target.value)} className={inputClass}>
            {CATEGORIES.filter((c) => c !== "all").map((c) => (
              <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} className={inputClass} />
          <input placeholder="Equipment (optional)" value={equipment} onChange={(e) => setEquipment(e.target.value)} className={inputClass} />
        </div>
        <div>
          <input
            type="url"
            inputMode="url"
            placeholder="YouTube link (e.g. https://youtu.be/...)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className={cn(inputClass, videoInvalid && "ring-2 ring-red-500/50")}
          />
          <p className={cn("mt-1 text-[11px]", videoInvalid ? "text-red-400" : "text-zinc-600")}>
            {videoInvalid ? "Couldn't read a video id from that link." : "Paste any YouTube link — clients tap the exercise to watch."}
          </p>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button variant="gold" type="submit" disabled={saving || !name.trim()} className="w-full">
          {saving ? "Saving..." : initial ? "Save changes" : "Add Exercise"}
        </Button>
      </form>
    </Card>
  );
}
