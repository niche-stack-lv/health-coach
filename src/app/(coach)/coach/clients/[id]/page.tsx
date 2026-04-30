"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeightChart } from "@/components/charts/weight-chart";
import { MeasurementsChart } from "@/components/charts/measurements-chart";
import { getClients, getCoachCheckIns, getDietPlans, getMeasurements, getHabits, addHabit, deleteHabit } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import { formatDate, cn } from "@/lib/utils";
import { ArrowLeft, TrendingDown, Camera, Calendar, Target, Plus, Trash2, Sparkles, X } from "lucide-react";
import Link from "next/link";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [tab, setTab] = useState<"overview" | "measurements" | "habits">("overview");
  const [client, setClient] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Habit form state
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [habitEmoji, setHabitEmoji] = useState("✅");
  const [habitTarget, setHabitTarget] = useState("");
  const [habitSaving, setHabitSaving] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user, id]);

  async function loadData() {
    if (!user) return;
    const [clients, cis, pls, meas, habs] = await Promise.all([
      getClients(user.id),
      getCoachCheckIns(user.id),
      getDietPlans(user.id),
      getMeasurements(id as string),
      getHabits(id as string),
    ]);
    const found = clients.find((c: any) => c.id === id);
    setClient(found || null);
    setCheckIns(cis.filter((c: any) => c.client_id === id));
    setPlans(pls.filter((p: any) => p.client_id === id));
    setMeasurements(meas);
    setHabits(habs);
    setLoading(false);
  }

  async function handleAddHabit() {
    if (!user || !habitName) return;
    setHabitSaving(true);
    await addHabit(user.id, id as string, habitName, habitEmoji, habitTarget);
    setHabitName("");
    setHabitEmoji("✅");
    setHabitTarget("");
    setShowHabitForm(false);
    setHabitSaving(false);
    const habs = await getHabits(id as string);
    setHabits(habs);
  }

  async function handleDeleteHabit(habitId: string) {
    await deleteHabit(habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;
  if (!client) return <div className="py-20 text-center"><p className="text-zinc-500">Client not found.</p><Link href="/coach/clients" className="text-gold text-sm mt-2 inline-block">← Back to clients</Link></div>;

  const name = client.profile?.name || "Unknown";
  const weightHistory = measurements.map((m: any) => ({ date: m.date || m.created_at, weight: m.weight })).filter((m: any) => m.weight);
  const latest = measurements[measurements.length - 1];

  return (
    <div>
      <Link href="/coach/clients" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-gold mb-4"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={name} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg lg:text-2xl font-bold text-white">{name}</h1>
            <Badge variant={client.status === "active" ? "success" : "default"}>{client.status}</Badge>
          </div>
          <p className="text-sm text-zinc-500 truncate">{client.goal}</p>
          <p className="text-xs text-zinc-600">{client.profile?.email}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["overview", "measurements", "habits"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-xl px-4 py-2 text-sm font-semibold border capitalize", tab === t ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500")}>{t}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Card className="p-3"><TrendingDown className="h-4 w-4 text-emerald-400 mb-1" /><p className="text-xl font-bold text-white">{latest?.weight || client.current_weight || "—"}</p><p className="text-[10px] text-zinc-500">Current kg</p></Card>
            <Card className="p-3"><Target className="h-4 w-4 text-gold mb-1" /><p className="text-xl font-bold text-white">{client.target_weight || "—"}</p><p className="text-[10px] text-zinc-500">Target kg</p></Card>
            <Card className="p-3"><Camera className="h-4 w-4 text-sky-400 mb-1" /><p className="text-xl font-bold text-white">{checkIns.length}</p><p className="text-[10px] text-zinc-500">Check-ins</p></Card>
            <Card className="p-3"><Calendar className="h-4 w-4 text-amber-400 mb-1" /><p className="text-xl font-bold text-white">{plans.length}</p><p className="text-[10px] text-zinc-500">Diet plans</p></Card>
          </div>

          {weightHistory.length > 0 && (
            <Card className="mb-6">
              <h2 className="text-sm font-semibold text-white mb-1">Weight Progress</h2>
              <WeightChart data={weightHistory} targetWeight={client.target_weight} height={250} />
            </Card>
          )}

          <Card>
            <h2 className="text-sm font-semibold text-white mb-4">Check-in History</h2>
            {checkIns.length === 0 ? (
              <p className="text-sm text-zinc-500">No check-ins yet.</p>
            ) : (
              <div className="space-y-3">
                {checkIns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.04] flex items-center justify-center text-xs font-bold text-gold">
                        {c.weight ? `${c.weight}` : "—"}
                      </div>
                      <p className="text-sm text-white">{formatDate(c.date || c.created_at)}</p>
                    </div>
                    <Badge variant={c.status === "reviewed" ? "success" : "warning"}>{c.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "measurements" && (
        <div>
          {latest ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
              {latest.weight != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Weight</p><p className="text-xl font-bold text-white mt-1">{latest.weight} kg</p></Card>}
              {latest.body_fat != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Body Fat</p><p className="text-xl font-bold text-white mt-1">{latest.body_fat}%</p></Card>}
              {latest.chest != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Chest</p><p className="text-xl font-bold text-white mt-1">{latest.chest} cm</p></Card>}
              {latest.waist != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Waist</p><p className="text-xl font-bold text-white mt-1">{latest.waist} cm</p></Card>}
              {latest.arms != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Arms</p><p className="text-xl font-bold text-white mt-1">{latest.arms} cm</p></Card>}
              {latest.thighs != null && <Card className="p-3"><p className="text-[10px] text-zinc-500 uppercase font-semibold">Thighs</p><p className="text-xl font-bold text-white mt-1">{latest.thighs} cm</p></Card>}
            </div>
          ) : <Card><p className="text-sm text-zinc-500">No measurements yet.</p></Card>}

          {measurements.length >= 2 && (
            <div className="space-y-4">
              <Card>
                <h2 className="text-sm font-semibold text-white mb-3">Weight & Body Fat</h2>
                <MeasurementsChart data={measurements.map((m) => ({ ...m, bodyFat: m.body_fat }))} metrics={[{ key: "weight", label: "Weight", color: "#d4a853" }, { key: "bodyFat", label: "BF%", color: "#f87171" }]} />
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-white mb-3">Body Measurements</h2>
                <MeasurementsChart data={measurements} metrics={[{ key: "chest", label: "Chest", color: "#60a5fa" }, { key: "waist", label: "Waist", color: "#34d399" }, { key: "arms", label: "Arms", color: "#a78bfa" }, { key: "thighs", label: "Thighs", color: "#f472b6" }]} />
              </Card>
            </div>
          )}
        </div>
      )}

      {tab === "habits" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <h2 className="text-sm font-semibold text-white">Daily Habits</h2>
            </div>
            <Button variant="gold" size="sm" onClick={() => setShowHabitForm(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Habit
            </Button>
          </div>

          {habits.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-zinc-500 text-sm">No habits assigned yet.</p>
              <p className="text-zinc-600 text-xs mt-1">Add daily habits for this client to track.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => (
                <Card key={habit.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{habit.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{habit.name}</p>
                        {habit.target && <p className="text-xs text-zinc-500">{habit.target}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteHabit(habit.id)} className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Add habit modal */}
          {showHabitForm && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowHabitForm(false)}>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/[0.08] p-6 safe-area-bottom" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white">Add Habit</h2>
                  <button onClick={() => setShowHabitForm(false)} className="p-2 rounded-xl hover:bg-white/[0.06]"><X className="h-5 w-5 text-zinc-400" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1.5">Emoji</label>
                    <div className="flex gap-2 flex-wrap">
                      {["✅", "💧", "😴", "🚶", "💊", "🚫", "🏋️", "🥗", "📖", "🧘"].map((e) => (
                        <button key={e} onClick={() => setHabitEmoji(e)}
                          className={cn("h-10 w-10 rounded-xl text-lg flex items-center justify-center border transition-all",
                            habitEmoji === e ? "border-gold bg-gold/10" : "border-white/[0.06] hover:bg-white/[0.04]"
                          )}>{e}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1.5">Habit Name *</label>
                    <input type="text" value={habitName} onChange={(e) => setHabitName(e.target.value)} placeholder="e.g. Drink Water" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1.5">Target</label>
                    <input type="text" value={habitTarget} onChange={(e) => setHabitTarget(e.target.value)} placeholder="e.g. 3L per day" className={inputClass} />
                  </div>
                  <Button variant="gold" className="w-full h-12 text-base rounded-xl" onClick={handleAddHabit} disabled={habitSaving || !habitName}>
                    {habitSaving ? "Adding..." : "Add Habit"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
