"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, Check, Pencil, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExercisePicker, type Exercise } from "@/components/coach/exercise-picker";
import { WorkoutSlotView } from "@/components/shared/workout-slot-view";
import { useAuth } from "@/lib/auth-context";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { getClients, getWorkoutTemplates, createWorkoutTemplate, assignWorkoutTemplate } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate } from "@/types";

export default function CreateWorkoutPlanPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <CreateWorkoutPlanPageInner />
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
  phaseIndex: number;
  exercises: LocalExercise[];
}

interface LocalPhase {
  localId: string;
  name: string;
  weekStart: string;
  weekEnd: string;
  description: string;
}

type Mode = "select" | "assign" | "customise";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

// ---- Helpers ----

function templateToLocal(template: WorkoutTemplate): { phases: LocalPhase[]; slots: LocalSlot[] } {
  const phases: LocalPhase[] = template.phases.map((p) => ({
    localId: p.id,
    name: p.name,
    weekStart: p.weekStart?.toString() ?? "",
    weekEnd: p.weekEnd?.toString() ?? "",
    description: p.description ?? "",
  }));

  const phaseIdToIndex: Record<string, number> = {};
  template.phases.forEach((p, i) => { phaseIdToIndex[p.id] = i; });

  const slots: LocalSlot[] = template.slots
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slot) => ({
      localId: crypto.randomUUID(),
      name: slot.name,
      warmupNotes: slot.warmupNotes ?? "",
      phaseIndex: slot.phaseId ? (phaseIdToIndex[slot.phaseId] ?? 0) : 0,
      exercises: slot.exercises
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((ex) => ({
          localId: crypto.randomUUID(),
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

function CreateWorkoutPlanPageInner() {
  const router = useRouter();
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();

  // Step state
  const [mode, setMode] = useState<Mode>("select");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [planName, setPlanName] = useState("");

  // Customise state
  const [phases, setPhases] = useState<LocalPhase[]>([]);
  const [slots, setSlots] = useState<LocalSlot[]>([]);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [pickerSlotIdx, setPickerSlotIdx] = useState<number | null>(null);

  // Data
  const [dbClients, setDbClients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isDemo) { setDbClients([{ id: "demo", status: "active", profile: { name: "Demo Client" } }]); setLoading(false); return; }
    if (!user) return;
    Promise.all([getClients(user.id), getWorkoutTemplates(user.id)]).then(([clients, tmpls]) => {
      setDbClients(clients); setTemplates(tmpls); setLoading(false);
    });
  }, [user, isDemo]);

  const activeClients = dbClients.filter((c: any) => c.status === "active").map((c: any) => ({ id: c.id, name: c.profile?.name || "Unknown" }));
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || null;

  // ---- Mode transitions ----

  function enterAssign() {
    if (!selectedClient || !selectedTemplateId) return;
    setMode("assign");
  }

  function enterCustomise() {
    if (!selectedTemplate) return;
    const { phases: p, slots: s } = templateToLocal(selectedTemplate);
    setPhases(p);
    setSlots(s);
    setExpandedSlots(new Set(s.map((sl) => sl.localId)));
    setPlanName(selectedTemplate.name + " — Custom");
    setMode("customise");
  }

  // ---- Assign directly ----

  async function handleAssign() {
    if (!user || !selectedClient || !selectedTemplateId || saving) return;
    setSaving(true);
    const { error } = await assignWorkoutTemplate({ templateId: selectedTemplateId, clientId: selectedClient, coachId: user.id });
    if (error) { setSaving(false); return; }
    setDone(true);
  }

  // ---- Save customised copy ----

  async function handleSaveCustom() {
    if (!user || !selectedClient || saving) return;
    setSaving(true);

    const phasesInput = phases.length > 0 ? phases.map((p, i) => ({
      name: p.name, sortOrder: i,
      weekStart: p.weekStart ? Number(p.weekStart) : undefined,
      weekEnd: p.weekEnd ? Number(p.weekEnd) : undefined,
      description: p.description || undefined,
    })) : undefined;

    const { error: createErr, templateId } = await createWorkoutTemplate({
      coachId: user.id,
      name: planName.trim() || "Custom Workout Plan",
      description: selectedTemplate?.description || undefined,
      level: selectedTemplate?.level || undefined,
      location: selectedTemplate?.location || undefined,
      isTemplate: false,
      phases: phasesInput,
      slots: slots.map((slot, i) => ({
        name: slot.name,
        sortOrder: i,
        phaseIndex: phases.length > 0 ? slot.phaseIndex : undefined,
        warmupNotes: slot.warmupNotes || undefined,
        exercises: slot.exercises.map((ex, exIdx) => ({
          exerciseId: ex.exerciseId,
          customName: ex.name,
          customEmoji: ex.emoji,
          sets: ex.sets, reps: ex.reps, restSeconds: ex.restSeconds,
          notes: ex.notes || undefined, sortOrder: exIdx,
        })),
      })),
    });

    if (createErr || !templateId) { setSaving(false); return; }
    const { error: assignErr } = await assignWorkoutTemplate({ templateId, clientId: selectedClient, coachId: user.id });
    if (assignErr) { setSaving(false); return; }
    setDone(true);
  }

  // ---- Slot management (customise mode) ----

  function toggleSlot(id: string) { setExpandedSlots((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }
  function addSlot() {
    if (slots.length >= 7) return;
    const s: LocalSlot = { localId: crypto.randomUUID(), name: "Workout " + (slots.length + 1), warmupNotes: "", phaseIndex: 0, exercises: [] };
    setSlots((p) => [...p, s]);
    setExpandedSlots((p) => new Set([...p, s.localId]));
  }
  function removeSlot(i: number) { if (slots.length <= 1) return; setSlots((p) => p.filter((_, idx) => idx !== i)); }
  function updateSlotName(i: number, v: string) { setSlots((p) => { const u = [...p]; u[i] = { ...u[i], name: v }; return u; }); }
  function updateSlotWarmup(i: number, v: string) { setSlots((p) => { const u = [...p]; u[i] = { ...u[i], warmupNotes: v }; return u; }); }
  function updateSlotPhase(i: number, phaseIndex: number) { setSlots((p) => { const u = [...p]; u[i] = { ...u[i], phaseIndex }; return u; }); }

  function addExerciseToSlot(slotIdx: number, exercise: Exercise, sets: number, reps: string, restSeconds: number, notes: string) {
    setSlots((prev) => {
      const updated = [...prev];
      const slot = { ...updated[slotIdx], exercises: [...updated[slotIdx].exercises] };
      slot.exercises.push({ localId: crypto.randomUUID(), exerciseId: exercise.id.startsWith("custom-") ? null : exercise.id, name: exercise.name, emoji: exercise.emoji, sets, reps, restSeconds, notes });
      updated[slotIdx] = slot;
      return updated;
    });
    setPickerSlotIdx(null);
  }

  function removeExercise(slotIdx: number, exIdx: number) {
    setSlots((prev) => { const u = [...prev]; u[slotIdx] = { ...u[slotIdx], exercises: u[slotIdx].exercises.filter((_, i) => i !== exIdx) }; return u; });
  }

  // ---- Render ----

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-gold" /></div>
        <h1 className="text-xl font-bold text-white">Workout Plan Assigned!</h1>
        <p className="text-sm text-zinc-500 mt-2">The plan has been assigned to the client.</p>
        <Link href="/coach/workouts"><Button variant="gold" className="mt-6">Back to Workouts</Button></Link>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => mode === "select" ? router.push(`/coach/workouts${demoSuffix}`) : setMode("select")} className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06]">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </button>
        <h1 className="text-lg font-bold text-white">
          {mode === "customise" ? "Customise & Assign" : "Assign Workout Plan"}
        </h1>
      </div>

      {/* ---- SELECT MODE ---- */}
      {(mode === "select" || mode === "assign") && (
        <>
          <Card className="p-5 mb-4 space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Client</label>
              <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className={inputClass}>
                <option value="">Select client</option>
                {activeClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Workout Template</label>
              <select value={selectedTemplateId} onChange={(e) => { setSelectedTemplateId(e.target.value); setMode("select"); }} className={inputClass}>
                <option value="">Select template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.level ? ` · ${t.level}` : ""}{t.location ? ` · ${t.location}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Template preview */}
          {selectedTemplate && (
            <Card className="p-5 mb-4">
              <div className="mb-3">
                <p className="text-sm font-semibold text-white">{selectedTemplate.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {selectedTemplate.level && <span className="text-[11px] text-zinc-500 border border-white/[0.08] rounded-full px-2 py-0.5">{selectedTemplate.level}</span>}
                  {selectedTemplate.location && <span className="text-[11px] text-zinc-500 border border-white/[0.08] rounded-full px-2 py-0.5">{selectedTemplate.location}</span>}
                  <span className="text-[11px] text-zinc-500">{selectedTemplate.slots.length} days</span>
                  {selectedTemplate.phases.length > 0 && <span className="text-[11px] text-gold border border-gold/20 rounded-full px-2 py-0.5">{selectedTemplate.phases.length} phases</span>}
                </div>
                {selectedTemplate.description && <p className="text-xs text-zinc-500 mt-1">{selectedTemplate.description}</p>}
              </div>

              {selectedTemplate.phases.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedTemplate.phases.map((phase) => {
                    const phaseSlots = selectedTemplate.slots.filter((s) => s.phaseId === phase.id);
                    return (
                      <div key={phase.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-white">{phase.name}</p>
                          <span className="text-[11px] text-zinc-500">{phaseSlots.length} days{phase.weekStart ? ` · Wks ${phase.weekStart}–${phase.weekEnd}` : ""}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  {selectedTemplate.slots.sort((a, b) => a.sortOrder - b.sortOrder).map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                      <p className="text-xs text-zinc-300">{slot.name}</p>
                      <span className="text-[11px] text-zinc-500">{slot.exercises.length} exercises</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Action buttons */}
          {selectedTemplate && selectedClient && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={enterCustomise}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors"
              >
                <Pencil className="h-5 w-5 text-zinc-400" />
                <span className="text-sm font-medium text-white">Customise First</span>
                <span className="text-[11px] text-zinc-500 text-center">Edit slots & exercises before assigning</span>
              </button>
              <button
                onClick={handleAssign}
                disabled={saving}
                className="flex flex-col items-center gap-2 rounded-2xl border border-gold/30 bg-gold/5 p-4 hover:bg-gold/10 transition-colors"
              >
                <Zap className="h-5 w-5 text-gold" />
                <span className="text-sm font-medium text-gold">Assign Directly</span>
                <span className="text-[11px] text-zinc-500 text-center">Assign as-is, phases preserved</span>
              </button>
            </div>
          )}

          {(!selectedTemplate || !selectedClient) && (
            <p className="text-xs text-zinc-600 text-center mt-4">Select a client and template to continue</p>
          )}
        </>
      )}

      {/* ---- CUSTOMISE MODE ---- */}
      {mode === "customise" && (
        <>
          {/* Plan name */}
          <Card className="p-5 mb-4">
            <label className="block text-xs text-zinc-500 mb-1.5">Plan Name</label>
            <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. PPL Hypertrophy — Custom" className={inputClass} />
          </Card>

          {/* Phases info (read-only in customise — phases are preserved from template) */}
          {phases.length > 0 && (
            <Card className="p-5 mb-4">
              <p className="text-xs text-zinc-500 mb-2">Phases (from template)</p>
              <div className="space-y-1.5">
                {phases.map((p, i) => (
                  <div key={p.localId} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                    <span className="text-xs font-semibold text-gold w-4">{i + 1}</span>
                    <span className="text-xs text-white flex-1">{p.name}</span>
                    {p.weekStart && <span className="text-[11px] text-zinc-500">Wks {p.weekStart}–{p.weekEnd}</span>}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">Phase structure is preserved. You can edit slot names and exercises below.</p>
            </Card>
          )}

          {/* Workout Slots */}
          <Card className="p-5 mb-4">
            <label className="text-xs text-zinc-500 block mb-3">Workout Slots</label>
            <div className="space-y-3">
              {slots.map((slot, slotIdx) => {
                const isExpanded = expandedSlots.has(slot.localId);
                return (
                  <div key={slot.localId} className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center gap-2 p-4 cursor-pointer" onClick={() => toggleSlot(slot.localId)}>
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <input type="text" value={slot.name} onChange={(e) => updateSlotName(slotIdx, e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Workout name" className="flex-1 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50" />
                        {phases.length > 0 && (
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
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-1">Warm-up Notes (optional)</label>
                          <input type="text" value={slot.warmupNotes} onChange={(e) => updateSlotWarmup(slotIdx, e.target.value)} placeholder="e.g. Arm circles, 5 min" className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-gold/50" />
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

          <Button variant="gold" className="w-full h-12 text-base rounded-2xl" disabled={!selectedClient || saving || isDemo} onClick={handleSaveCustom}>
            {saving ? "Creating..." : <><Check className="h-5 w-5" /> Create Custom Plan & Assign</>}
          </Button>

          {pickerSlotIdx !== null && (
            <ExercisePicker
              onSelect={(exercise, sets, reps, restSeconds, notes) => addExerciseToSlot(pickerSlotIdx, exercise, sets, reps, restSeconds, notes)}
              onClose={() => setPickerSlotIdx(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
