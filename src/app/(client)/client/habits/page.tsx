"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { getHabits, getHabitLogs, toggleHabitLog } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useIsDemo } from "@/lib/use-demo";
import { Check } from "lucide-react";

function HabitsContent() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [habits, setHabits] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isDemo) {
      setHabits([
        { id: "dh1", name: "Drink Water", target: "3+ litres per day", emoji: "💧", unit: "L" },
        { id: "dh2", name: "Sleep", target: "8 hours", emoji: "😴", unit: "hrs" },
        { id: "dh4", name: "Steps", target: "10,000 steps", emoji: "🚶", unit: "steps" },
        { id: "dh5", name: "No Sugar", target: "Avoid processed sugar", emoji: "🚫", unit: "" },
      ]);
      setLogs([
        { habit_id: "dh1", completed: true, value: "2.5" },
      ]);
      setValues({ dh1: "2.5" });
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const [h, l] = await Promise.all([getHabits(user.id), getHabitLogs(user.id, today)]);
    setHabits(h);
    setLogs(l);
    const vals: Record<string, string> = {};
    l.forEach((log: any) => { if (log.value) vals[log.habit_id] = log.value; });
    setValues(vals);
    setLoading(false);
  }

  async function toggle(habitId: string) {
    const existing = logs.find((l) => l.habit_id === habitId);
    const newVal = !existing?.completed;

    if (isDemo) {
      if (existing) {
        setLogs((prev) => prev.map((l) => l.habit_id === habitId ? { ...l, completed: newVal, value: newVal ? values[habitId] || "" : "" } : l));
      } else {
        setLogs((prev) => [...prev, { habit_id: habitId, completed: true, value: values[habitId] || "" }]);
      }
      if (!newVal) setValues((p) => ({ ...p, [habitId]: "" }));
      return;
    }
    if (!user) return;
    await toggleHabitLog(habitId, user.id, today, newVal, newVal ? values[habitId] || undefined : undefined);
    if (existing) {
      setLogs((prev) => prev.map((l) => l.habit_id === habitId ? { ...l, completed: newVal, value: newVal ? values[habitId] || "" : "" } : l));
    } else {
      setLogs((prev) => [...prev, { habit_id: habitId, completed: true, value: values[habitId] || "" }]);
    }
    if (!newVal) setValues((p) => ({ ...p, [habitId]: "" }));
  }

  const completedCount = habits.filter((h) => logs.some((l) => l.habit_id === h.id && l.completed)).length;

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  if (habits.length === 0) return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-white">Daily Checklist</h1><p className="text-sm text-zinc-500 mt-0.5">Your coach hasn&apos;t assigned habits yet.</p></div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-white">Daily Checklist</h1><p className="text-sm text-zinc-500 mt-0.5">{completedCount}/{habits.length} logged today</p></div>
      <div className="h-2 rounded-full bg-white/[0.06]">
        <div className="h-2 rounded-full gradient-gold transition-all duration-500" style={{ width: habits.length > 0 ? `${(completedCount / habits.length) * 100}%` : "0%" }} />
      </div>
      <div className="space-y-2">
        {habits.map((habit) => {
          const log = logs.find((l) => l.habit_id === habit.id);
          const done = log?.completed;

          return (
            <div key={habit.id} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all",
              done ? "border-gold/30 bg-gold/5" : "border-white/[0.06] bg-[#141414]"
            )}>
              {/* Checkbox */}
              <button onClick={() => toggle(habit.id)} className="shrink-0 active:scale-90 transition-transform">
                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center border transition-colors",
                  done ? "bg-gold border-gold text-black" : "border-white/[0.15] hover:border-white/[0.3]"
                )}>{done && <Check className="h-4 w-4" />}</div>
              </button>

              {/* Name + target */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{habit.emoji}</span>
                  <p className={cn("text-sm font-medium", done ? "text-gold" : "text-white")}>{habit.name}</p>
                </div>
                <p className="text-[10px] text-zinc-600 mt-0.5">{habit.target}</p>
              </div>

              {/* Inline value input or display */}
              {habit.unit ? (
                done ? (
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-gold">{values[habit.id] || "—"}</p>
                    <p className="text-[9px] text-gold/50 uppercase">{habit.unit}</p>
                  </div>
                ) : (
                  <div className="shrink-0 flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      value={values[habit.id] || ""}
                      onChange={(e) => setValues((p) => ({ ...p, [habit.id]: e.target.value }))}
                      placeholder="0"
                      className="w-14 text-right rounded-lg border border-white/[0.1] bg-white/[0.04] py-1.5 px-2 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-gold/40"
                    />
                    <span className="text-[10px] text-zinc-500 w-8">{habit.unit}</span>
                  </div>
                )
              ) : null}
            </div>
          );
        })}
      </div>
      {completedCount === habits.length && habits.length > 0 && (
        <Card className="text-center py-6 border-gold/20 bg-gold/5">
          <p className="text-2xl mb-2">🔥</p>
          <p className="text-sm font-bold text-gold">All done for today!</p>
        </Card>
      )}
    </div>
  );
}

export default function HabitsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <HabitsContent />
    </Suspense>
  );
}
