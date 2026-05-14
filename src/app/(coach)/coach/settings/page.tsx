"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getProfile, updateProfile, getFoods, createFood, deleteFood, getExercises, createExercise, deleteExercise } from "@/lib/db";
import { Check, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50";
const smallInputClass = "rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50";

type Tab = "profile" | "foods" | "exercises";

function SettingsContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500 mt-1 text-sm">Manage your account, food database, and exercise library</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(["profile", "foods", "exercises"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("rounded-xl px-4 py-2 text-sm font-semibold border capitalize",
              tab === t ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
            )}>{t}</button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab user={user} />}
      {tab === "foods" && <FoodsTab />}
      {tab === "exercises" && <ExercisesTab />}
    </div>
  );
}

// ─── PROFILE TAB ───────────────────────────────────────────────
function ProfileTab({ user }: { user: { id: string } | null }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (user) loadProfile(); }, [user]);

  async function loadProfile() {
    if (!user) return;
    const profile = await getProfile(user.id);
    if (profile) { setName(profile.name || ""); setEmail(profile.email || ""); }
    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true); setError(""); setSaved(false);
    const result = await updateProfile(user.id, { name, email });
    setSaving(false);
    if (result.error) { setError(result.error); }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div className="max-w-2xl">
      <Card>
        <h2 className="text-base font-semibold text-white mb-4">Profile</h2>
        <div className="space-y-4">
          {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>}
          {saved && <div className="flex items-center gap-2 rounded-lg bg-gold/10 border border-gold/20 px-4 py-3"><Check className="h-4 w-4 text-gold" /><span className="text-sm text-gold font-medium">Changes saved!</span></div>}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
        </div>
        <Button variant="gold" className="mt-4" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Card>
    </div>
  );
}

// ─── FOODS TAB ─────────────────────────────────────────────────
function FoodsTab() {
  const [foods, setFoods] = useState<Array<{ id: string; name: string; category: string; emoji: string; unit: string | null; grams_per_unit: number | null; calories: number; protein: number; carbs: number; fat: number; is_default: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => { loadFoods(); }, []);

  async function loadFoods() {
    const data = await getFoods();
    setFoods(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this food item?")) return;
    await deleteFood(id);
    setFoods(foods.filter(f => f.id !== id));
  }

  const filtered = filter === "all" ? foods : foods.filter(f => f.category === filter);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {["all", "protein", "carbs", "fats", "supplements"].map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={cn("rounded-lg px-3 py-1.5 text-[11px] font-semibold border uppercase tracking-wide",
                filter === c ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
              )}>{c}</button>
          ))}
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5" /> Add Food
        </Button>
      </div>

      {showAdd && <AddFoodForm onClose={() => setShowAdd(false)} onAdded={loadFoods} />}

      <div className="space-y-2">
        {filtered.map(food => (
          <Card key={food.id} className="p-3 flex items-center gap-3">
            <span className="text-lg">{food.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{food.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                {food.calories}cal · {food.protein}p · {food.carbs}c · {food.fat}f per 100g
                {food.unit && ` · 1 ${food.unit} = ${food.grams_per_unit}g`}
              </p>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-600 border border-white/[0.06] rounded px-2 py-0.5">
              {food.category}
            </span>
            {!food.is_default && (
              <button onClick={() => handleDelete(food.id)} className="text-zinc-600 hover:text-red-400 transition-colors p-1">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </Card>
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 mt-4">{foods.length} items total · Default items cannot be deleted</p>
    </div>
  );
}

function AddFoodForm({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("protein");
  const [emoji, setEmoji] = useState("🍽️");
  const [unit, setUnit] = useState("");
  const [gramsPerUnit, setGramsPerUnit] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    await createFood({
      name, category, emoji,
      unit: unit || undefined,
      grams_per_unit: gramsPerUnit ? Number(gramsPerUnit) : undefined,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });
    setSaving(false);
    onAdded();
    onClose();
  }

  return (
    <Card className="p-4 mb-4 border-gold/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Add Custom Food</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Food name" value={name} onChange={e => setName(e.target.value)} className={smallInputClass} required />
          <select value={category} onChange={e => setCategory(e.target.value)} className={smallInputClass}>
            <option value="protein">Protein</option>
            <option value="carbs">Carbs</option>
            <option value="fats">Fats</option>
            <option value="supplements">Supplements</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input placeholder="Emoji" value={emoji} onChange={e => setEmoji(e.target.value)} className={smallInputClass} />
          <input placeholder="Unit (optional)" value={unit} onChange={e => setUnit(e.target.value)} className={smallInputClass} />
          <input placeholder="g per unit" type="number" value={gramsPerUnit} onChange={e => setGramsPerUnit(e.target.value)} className={smallInputClass} />
        </div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Macros per 100g:</p>
        <div className="grid grid-cols-4 gap-3">
          <input placeholder="Calories" type="number" value={calories} onChange={e => setCalories(e.target.value)} className={smallInputClass} />
          <input placeholder="Protein" type="number" value={protein} onChange={e => setProtein(e.target.value)} className={smallInputClass} />
          <input placeholder="Carbs" type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className={smallInputClass} />
          <input placeholder="Fat" type="number" value={fat} onChange={e => setFat(e.target.value)} className={smallInputClass} />
        </div>
        <Button variant="gold" type="submit" disabled={saving} className="w-full">
          {saving ? "Adding..." : "Add Food"}
        </Button>
      </form>
    </Card>
  );
}

// ─── EXERCISES TAB ─────────────────────────────────────────────
function ExercisesTab() {
  const [exercises, setExercises] = useState<Array<{ id: string; name: string; category: string; emoji: string; equipment: string | null; video_id: string | null; is_default: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => { loadExercises(); }, []);

  async function loadExercises() {
    const data = await getExercises();
    setExercises(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this exercise?")) return;
    await deleteExercise(id);
    setExercises(exercises.filter(e => e.id !== id));
  }

  const filtered = filter === "all" ? exercises : exercises.filter(e => e.category === filter);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {["all", "chest", "back", "shoulders", "arms", "legs", "core", "cardio"].map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={cn("rounded-lg px-3 py-1.5 text-[11px] font-semibold border uppercase tracking-wide",
                filter === c ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
              )}>{c}</button>
          ))}
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5" /> Add Exercise
        </Button>
      </div>

      {showAdd && <AddExerciseForm onClose={() => setShowAdd(false)} onAdded={loadExercises} />}

      <div className="space-y-2">
        {filtered.map(ex => (
          <Card key={ex.id} className="p-3 flex items-center gap-3">
            <span className="text-lg">{ex.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{ex.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                {ex.equipment || "No equipment"}
                {ex.video_id && " · 🎥 Video linked"}
              </p>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-600 border border-white/[0.06] rounded px-2 py-0.5">
              {ex.category}
            </span>
            {!ex.is_default && (
              <button onClick={() => handleDelete(ex.id)} className="text-zinc-600 hover:text-red-400 transition-colors p-1">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </Card>
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 mt-4">{exercises.length} exercises total · Default items cannot be deleted</p>
    </div>
  );
}

function AddExerciseForm({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("chest");
  const [emoji, setEmoji] = useState("🏋️");
  const [equipment, setEquipment] = useState("");
  const [videoId, setVideoId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    await createExercise({
      name, category, emoji,
      equipment: equipment || undefined,
      video_id: videoId || undefined,
    });
    setSaving(false);
    onAdded();
    onClose();
  }

  return (
    <Card className="p-4 mb-4 border-gold/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Add Custom Exercise</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Exercise name" value={name} onChange={e => setName(e.target.value)} className={smallInputClass} required />
          <select value={category} onChange={e => setCategory(e.target.value)} className={smallInputClass}>
            <option value="chest">Chest</option>
            <option value="back">Back</option>
            <option value="shoulders">Shoulders</option>
            <option value="arms">Arms</option>
            <option value="legs">Legs</option>
            <option value="core">Core</option>
            <option value="cardio">Cardio</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input placeholder="Emoji" value={emoji} onChange={e => setEmoji(e.target.value)} className={smallInputClass} />
          <input placeholder="Equipment" value={equipment} onChange={e => setEquipment(e.target.value)} className={smallInputClass} />
          <input placeholder="YouTube Video ID" value={videoId} onChange={e => setVideoId(e.target.value)} className={smallInputClass} />
        </div>
        <Button variant="gold" type="submit" disabled={saving} className="w-full">
          {saving ? "Adding..." : "Add Exercise"}
        </Button>
      </form>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
