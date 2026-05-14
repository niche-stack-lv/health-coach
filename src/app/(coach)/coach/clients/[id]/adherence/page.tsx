"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getCoachClientAdherence, getClients } from "@/lib/db";
import { calculateWeeklyAdherence } from "@/lib/macro-calc";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { FoodCheckIn } from "@/types";

export default function ClientAdherencePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <ClientAdherencePageInner />
    </Suspense>
  );
}

const mockCheckIns: FoodCheckIn[] = [
  { id: "fc1", clientId: "c1", assignmentId: "a1", date: "2026-03-28", totalCalories: 1650, totalProtein: 120, totalCarbs: 160, totalFat: 55, adherenceScore: 92, items: [], createdAt: "" },
  { id: "fc2", clientId: "c1", assignmentId: "a1", date: "2026-03-27", totalCalories: 1580, totalProtein: 115, totalCarbs: 155, totalFat: 50, adherenceScore: 85, items: [], createdAt: "" },
  { id: "fc3", clientId: "c1", assignmentId: "a1", date: "2026-03-26", totalCalories: 1700, totalProtein: 125, totalCarbs: 165, totalFat: 58, adherenceScore: 100, items: [], createdAt: "" },
  { id: "fc4", clientId: "c1", assignmentId: "a1", date: "2026-03-25", totalCalories: 1620, totalProtein: 118, totalCarbs: 150, totalFat: 52, adherenceScore: 78, items: [], createdAt: "" },
  { id: "fc5", clientId: "c1", assignmentId: "a1", date: "2026-03-24", totalCalories: 1690, totalProtein: 122, totalCarbs: 162, totalFat: 56, adherenceScore: 88, items: [], createdAt: "" },
  { id: "fc6", clientId: "c1", assignmentId: "a1", date: "2026-03-23", totalCalories: 1550, totalProtein: 110, totalCarbs: 148, totalFat: 48, adherenceScore: 71, items: [], createdAt: "" },
  { id: "fc7", clientId: "c1", assignmentId: "a1", date: "2026-03-22", totalCalories: 1680, totalProtein: 121, totalCarbs: 158, totalFat: 54, adherenceScore: 95, items: [], createdAt: "" },
];

function ClientAdherencePageInner() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();
  const [checkIns, setCheckIns] = useState<FoodCheckIn[]>([]);
  const [clientName, setClientName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setCheckIns(mockCheckIns);
      setClientName("Alex Rivera");
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const [adherenceData, clients] = await Promise.all([
      getCoachClientAdherence(user.id, id as string),
      getClients(user.id),
    ]);
    setCheckIns(adherenceData);
    const client = clients.find((c: any) => c.id === id);
    setClientName(client?.profile?.name || "Client");
    setLoading(false);
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  // Calculate weekly average from last 7 check-ins
  const recentScores = checkIns.slice(0, 7).map((c) => c.adherenceScore);
  const weeklyAverage = calculateWeeklyAdherence(recentScores);

  function getScoreColor(score: number) {
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  }

  function getScoreBg(score: number) {
    if (score >= 90) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "bg-amber-500/10 border-amber-500/20";
    return "bg-red-500/10 border-red-500/20";
  }

  return (
    <div>
      <Link href={`/coach/clients/${id}${demoSuffix}`} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-gold mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to {clientName}
      </Link>

      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Diet Adherence</h1>
        <p className="text-zinc-500 mt-1 text-sm">{clientName} — {checkIns.length} check-ins recorded</p>
      </div>

      {/* Weekly average */}
      {recentScores.length > 0 && (
        <Card className="p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Weekly Average</p>
              <p className={cn("text-3xl font-bold mt-1", getScoreColor(weeklyAverage))}>
                {Math.round(weeklyAverage)}%
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">Based on last {recentScores.length} day{recentScores.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center">
              {recentScores.length > 0 && (() => {
                const avgCal = Math.round(checkIns.slice(0, 7).reduce((s, c) => s + c.totalCalories, 0) / recentScores.length);
                const avgPro = Math.round(checkIns.slice(0, 7).reduce((s, c) => s + c.totalProtein, 0) / recentScores.length);
                const avgCarb = Math.round(checkIns.slice(0, 7).reduce((s, c) => s + c.totalCarbs, 0) / recentScores.length);
                const avgFat = Math.round(checkIns.slice(0, 7).reduce((s, c) => s + c.totalFat, 0) / recentScores.length);
                return (
                  <>
                    <div><p className="text-sm font-bold text-white">{avgCal}</p><p className="text-[9px] text-zinc-500">kcal</p></div>
                    <div><p className="text-sm font-bold text-emerald-400">{avgPro}g</p><p className="text-[9px] text-zinc-500">pro</p></div>
                    <div><p className="text-sm font-bold text-sky-400">{avgCarb}g</p><p className="text-[9px] text-zinc-500">carb</p></div>
                    <div><p className="text-sm font-bold text-amber-400">{avgFat}g</p><p className="text-[9px] text-zinc-500">fat</p></div>
                  </>
                );
              })()}
            </div>
          </div>
        </Card>
      )}

      {/* Daily check-in list */}
      {checkIns.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-zinc-500 text-sm">No food check-ins recorded yet.</p>
          <p className="text-zinc-600 text-xs mt-1">Check-ins will appear here once the client starts logging meals.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {checkIns.map((checkIn) => (
            <Card key={checkIn.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", getScoreBg(checkIn.adherenceScore))}>
                    <span className={cn("text-sm font-bold", getScoreColor(checkIn.adherenceScore))}>
                      {Math.round(checkIn.adherenceScore)}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {new Date(checkIn.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {checkIn.totalCalories} kcal · {checkIn.totalProtein}g P · {checkIn.totalCarbs}g C · {checkIn.totalFat}g F
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
