"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getMeasurements, addMeasurement } from "@/lib/db";
import { MeasurementsChart } from "@/components/charts/measurements-chart";
import { formatDate, cn } from "@/lib/utils";
import { useIsDemo } from "@/lib/use-demo";
import { Plus, Check } from "lucide-react";

const fields = [
  { key: "weight", label: "Weight", unit: "kg", emoji: "⚖️" },
  { key: "body_fat", label: "Body Fat", unit: "%", emoji: "📊" },
  { key: "chest", label: "Chest", unit: "cm", emoji: "📏" },
  { key: "waist", label: "Waist", unit: "cm", emoji: "📏" },
  { key: "hips", label: "Hips", unit: "cm", emoji: "📏" },
  { key: "arms", label: "Arms", unit: "cm", emoji: "💪" },
  { key: "thighs", label: "Thighs", unit: "cm", emoji: "🦵" },
];

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

function MeasurementsContent() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setData([
        { date: "2025-01-06", weight: 85.0, body_fat: 22.0, chest: 102, waist: 88, hips: 100, arms: 35, thighs: 58 },
        { date: "2025-01-13", weight: 84.3, body_fat: 21.5, chest: 102, waist: 87, hips: 100, arms: 35, thighs: 58 },
        { date: "2025-01-20", weight: 83.7, body_fat: 21.0, chest: 101, waist: 86, hips: 99, arms: 35.5, thighs: 57.5 },
        { date: "2025-01-27", weight: 83.1, body_fat: 20.4, chest: 101, waist: 85, hips: 99, arms: 35.5, thighs: 57 },
        { date: "2025-02-03", weight: 82.6, body_fat: 19.8, chest: 101, waist: 84, hips: 98, arms: 36, thighs: 57 },
      ]);
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const d = await getMeasurements(user.id);
    setData(d);
    setLoading(false);
  }

  async function handleSubmit() {
    if (!user) return;
    const entry: any = { client_id: user.id };
    fields.forEach((f) => { if (formValues[f.key]) entry[f.key] = Number(formValues[f.key]); });
    await addMeasurement(entry);
    setFormValues({});
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    loadData();
  }

  const latest = data[data.length - 1];

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Measurements</h1><p className="text-sm text-zinc-500 mt-0.5">Track your body progress</p></div>
        {!isDemo && <Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> Log</Button>}
      </div>

      {saved && <div className="flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/20 px-4 py-3"><Check className="h-4 w-4 text-gold" /><span className="text-sm text-gold font-medium">Saved!</span></div>}

      {showForm && (
        <Card>
          <p className="text-sm font-semibold text-white mb-4">Log New Measurements</p>
          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-zinc-400 mb-1">{f.emoji} {f.label} ({f.unit})</label>
                <input type="number" step="0.1" value={formValues[f.key] || ""} onChange={(e) => setFormValues((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={latest ? String(latest[f.key] || "") : ""} className={inputClass} />
              </div>
            ))}
          </div>
          <Button variant="gold" className="w-full mt-4" onClick={handleSubmit} disabled={!Object.values(formValues).some((v) => v)}><Check className="h-4 w-4" /> Save</Button>
        </Card>
      )}

      {latest && (
        <div className="grid grid-cols-2 gap-2">
          {fields.map((f) => {
            const val = latest[f.key];
            if (val == null) return null;
            return (
              <Card key={f.key} className="p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{f.emoji} {f.label}</p>
                <p className="text-xl font-bold text-white mt-1">{val}<span className="text-xs text-zinc-500 ml-0.5">{f.unit}</span></p>
              </Card>
            );
          })}
        </div>
      )}

      {data.length >= 2 && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-3">Trends</h2>
          <MeasurementsChart data={data.map((d) => ({ ...d, bodyFat: d.body_fat }))} metrics={[{ key: "weight", label: "Weight", color: "#d4a853" }, { key: "bodyFat", label: "BF%", color: "#f87171" }]} />
        </Card>
      )}

      {data.length > 0 && (
        <Card>
          <p className="text-sm font-semibold text-white mb-3">History</p>
          <div className="space-y-2">
            {[...data].reverse().map((entry, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
                <span className="text-sm text-zinc-300">{formatDate(entry.date || entry.created_at)}</span>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  {entry.weight && <span>{entry.weight}kg</span>}
                  {entry.body_fat && <span>{entry.body_fat}%</span>}
                  {entry.waist && <span>W:{entry.waist}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function MeasurementsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <MeasurementsContent />
    </Suspense>
  );
}
