"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getCoachDailyCheckIns, getClients, updateDailyCheckInFeedback } from "@/lib/db";
import { useIsDemo } from "@/lib/use-demo";
import { Check, MessageCircle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

type FilterType = "all" | "checked-in" | "missed";

function DailyCheckInsContent() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [loading, setLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isDemo) {
      setAllClients([
        { id: "c1", profile: { name: "Keerthana" } },
        { id: "c2", profile: { name: "Anil" } },
        { id: "c3", profile: { name: "Indu" } },
      ]);
      setCheckIns([
        { id: "1", client_id: "c1", date: today, weight: 65.5, total_calories: 1850, total_protein: 140, total_carbs: 200, total_fat: 55, adherence_score: 85, water_litres: 2.5, steps: 8500, sleep_hours: 7, energy_level: 4, mood: "good", notes: "Felt good today, energy was high", status: "submitted", profile: { name: "Keerthana" } },
        { id: "2", client_id: "c2", date: today, weight: 78, total_calories: 2100, total_protein: 160, total_carbs: 250, total_fat: 65, adherence_score: 100, water_litres: 3, steps: 10000, sleep_hours: 8, energy_level: 5, status: "reviewed", coach_feedback: "Perfect day! 100% adherence.", profile: { name: "Anil" } },
      ]);
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    const [cis, clients] = await Promise.all([
      getCoachDailyCheckIns(user!.id, today),
      getClients(user!.id),
    ]);
    setCheckIns(cis);
    setAllClients(clients);
    setLoading(false);
  }

  async function handleSaveFeedback() {
    if (!feedbackId) return;
    setSavingFeedback(true);
    await updateDailyCheckInFeedback(feedbackId, feedbackText || "");
    setCheckIns(prev => prev.map(ci => ci.id === feedbackId ? { ...ci, coach_feedback: feedbackText || null, status: "reviewed" } : ci));
    setFeedbackId(null);
    setFeedbackText("");
    setSavingFeedback(false);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  // Determine which clients checked in today
  const checkedInIds = new Set(checkIns.filter(ci => ci.date === today).map(ci => ci.client_id));
  const activeClients = allClients.filter((c: any) => c.status === "active");
  const missedClients = activeClients.filter((c: any) => !checkedInIds.has(c.id));
  const checkedInCount = checkedInIds.size;
  const totalActive = activeClients.length;

  // Filter check-ins
  const displayCheckIns = filter === "all" ? checkIns :
    filter === "checked-in" ? checkIns.filter(ci => ci.date === today) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Daily Check-ins</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {today} · {checkedInCount}/{totalActive} clients checked in
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-3 text-center">
          <p className="text-2xl font-black text-gold">{checkedInCount}</p>
          <p className="text-[9px] text-zinc-500 uppercase tracking-wide">Checked In</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-black text-zinc-400">{missedClients.length}</p>
          <p className="text-[9px] text-zinc-500 uppercase tracking-wide">Missed</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-black text-white">{totalActive > 0 ? Math.round((checkedInCount / totalActive) * 100) : 0}%</p>
          <p className="text-[9px] text-zinc-500 uppercase tracking-wide">Rate</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {([["all", "All"], ["checked-in", "Checked In"], ["missed", "Missed"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={cn("rounded-xl px-4 py-2 text-xs font-semibold border",
              filter === key ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
            )}>{label}</button>
        ))}
      </div>

      {/* Missed clients */}
      {filter === "missed" && (
        <div className="space-y-2">
          {missedClients.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">Everyone checked in today! 🎉</p>
          ) : (
            missedClients.map((c: any) => (
              <Card key={c.id} className="p-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-400">
                  {(c.profile?.name || "?")[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{c.profile?.name || "Unknown"}</p>
                  <p className="text-[10px] text-red-400/70 uppercase tracking-wide">No check-in today</p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Check-in list */}
      {filter !== "missed" && (
        <div className="space-y-3">
          {displayCheckIns.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">No check-ins yet today</p>
          ) : (
            displayCheckIns.map((ci: any) => {
              return (
                <Card key={ci.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center text-xs font-bold text-gold">
                        {(ci.profile?.name || "?")[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{ci.profile?.name || "Client"}</p>
                        <p className="text-[10px] text-zinc-500">{ci.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {ci.status === "submitted" && (
                        <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide">Pending</span>
                      )}
                      {ci.status === "reviewed" && (
                        <span className="text-[9px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wide">Reviewed</span>
                      )}
                    </div>
                  </div>

                  {/* Full details */}
                  <div className="space-y-2 mb-3">
                    {ci.weight && (
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <span className="text-zinc-500">⚖️ Weight:</span> {ci.weight} kg
                      </div>
                    )}

                    {/* Macros & Adherence */}
                    {ci.total_calories > 0 && (
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className="text-white font-medium">{ci.total_calories} cal</span>
                        <span className="text-emerald-400">{ci.total_protein}g P</span>
                        <span className="text-sky-400">{ci.total_carbs}g C</span>
                        <span className="text-amber-400">{ci.total_fat}g F</span>
                        {ci.adherence_score != null && ci.adherence_score > 0 && (
                          <span className={cn("font-semibold",
                            ci.adherence_score >= 90 ? "text-emerald-400" :
                            ci.adherence_score >= 70 ? "text-amber-400" : "text-red-400"
                          )}>
                            {ci.adherence_score}% adherence
                          </span>
                        )}
                      </div>
                    )}

                    {/* Food selections grouped by meal */}
                    {ci.food_check_in_items && ci.food_check_in_items.length > 0 && (() => {
                      // Group items by slot
                      const slotMap = new Map<string, { name: string; items: any[] }>();
                      for (const item of ci.food_check_in_items) {
                        const slotId = item.slot_id || "unknown";
                        const slotName = item.slot?.name || "Meal";
                        if (!slotMap.has(slotId)) slotMap.set(slotId, { name: slotName, items: [] });
                        slotMap.get(slotId)!.items.push(item);
                      }
                      return (
                        <div className="space-y-2">
                          {Array.from(slotMap.entries()).map(([slotId, { name: slotName, items }]) => (
                            <div key={slotId}>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-semibold mb-1">{slotName}</p>
                              <div className="space-y-1">
                                {items.filter((item: any) => !item.is_skipped && item.dish).map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                    <span>{item.dish?.emoji || "🍽️"}</span>
                                    <span className="text-zinc-200 flex-1">{item.dish?.name || "Unknown"}</span>
                                    {item.dish?.total_calories && (
                                      <span className="text-zinc-500">{item.dish.total_calories} cal</span>
                                    )}
                                  </div>
                                ))}
                                {items.every((item: any) => item.is_skipped) && (
                                  <div className="text-[10px] text-zinc-600 px-3 py-1">⏭️ Skipped</div>
                                )}
                                {items.some((item: any) => !item.is_skipped && !item.dish) && (
                                  <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                    <span>✏️</span>
                                    <span className="text-amber-300 flex-1">
                                      {items.filter((item: any) => !item.is_skipped && !item.dish).map((item: any) => 
                                        item.custom_name || "Other (off-plan)"
                                      ).join(", ")}
                                    </span>
                                    {items.filter((item: any) => !item.is_skipped && !item.dish && item.custom_calories).map((item: any, i: number) => (
                                      <span key={i} className="text-zinc-500">{item.custom_calories} cal</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Daily wellness */}
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                      {ci.water_litres && <span>💧 {ci.water_litres}L</span>}
                      {ci.steps && <span>👣 {ci.steps} steps</span>}
                      {ci.sleep_hours && <span>😴 {ci.sleep_hours}h</span>}
                      {ci.energy_level && <span>⚡ {ci.energy_level}/5</span>}
                      {ci.mood && <span>🧠 {ci.mood}</span>}
                    </div>

                    {ci.notes && (
                      <div className="text-xs">
                        <span className="text-zinc-500">Notes:</span>{" "}
                        <span className="text-zinc-300 italic">&ldquo;{ci.notes}&rdquo;</span>
                      </div>
                    )}
                  </div>

                  {/* Feedback & Review */}
                  <div className="pt-3 border-t border-white/[0.04]">
                    {ci.coach_feedback ? (
                      <p className="text-xs text-gold/80">💬 {ci.coach_feedback}</p>
                    ) : (
                      <>
                        {feedbackId === ci.id ? (
                          <div className="space-y-2">
                            <input value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Add feedback (optional)..." className={inputClass} />
                            <div className="flex gap-2">
                              <Button variant="gold" size="sm" onClick={handleSaveFeedback} disabled={savingFeedback}>
                                <Check className="h-3.5 w-3.5" /> {feedbackText ? "Save & Review" : "Mark Reviewed"}
                              </Button>
                              <button onClick={() => setFeedbackId(null)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <button onClick={() => { setFeedbackId(ci.id); setFeedbackText(""); }}
                              className="flex items-center gap-1.5 text-[10px] text-gold hover:text-gold/80 transition-colors font-medium uppercase tracking-wide">
                              <Check className="h-3 w-3" /> Review
                            </button>
                            <button onClick={() => { setFeedbackId(ci.id); setFeedbackText(""); }}
                              className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-white transition-colors">
                              <MessageCircle className="h-3 w-3" /> Add feedback
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function CoachDailyCheckInsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <DailyCheckInsContent />
    </Suspense>
  );
}
