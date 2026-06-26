"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useIsDemo } from "@/lib/use-demo";
import { useWeightUnit } from "@/lib/use-weight-unit";
import { getClientFoodCheckIns } from "@/lib/db";
import { formatCheckInDate, formatDateForDisplay } from "@/lib/date-utils";
import { fromKg } from "@/lib/units";
import { cn } from "@/lib/utils";
import { ChevronRight, Flame, Scale, CheckCircle2, ClipboardList } from "lucide-react";
import type { FoodCheckIn } from "@/types";

export default function CheckInHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </div>
      }
    >
      <CheckInHistoryInner />
    </Suspense>
  );
}

// Demo rows so the page looks alive in demo mode.
const demoHistory: Pick<
  FoodCheckIn,
  "id" | "date" | "totalCalories" | "adherenceScore" | "weight" | "status"
>[] = [
  { id: "h1", date: offsetDate(0), totalCalories: 1820, adherenceScore: 92, weight: 74.2, status: "submitted" },
  { id: "h2", date: offsetDate(1), totalCalories: 2010, adherenceScore: 78, weight: 74.4, status: "submitted" },
  { id: "h3", date: offsetDate(2), totalCalories: 1650, adherenceScore: 100, weight: 74.5, status: "reviewed" },
];

function offsetDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function adherenceColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 60) return "text-gold";
  return "text-orange-400";
}

function CheckInHistoryInner() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const { unit: weightUnit } = useWeightUnit();
  const searchParams = useSearchParams();
  const demoSuffix = searchParams.get("demo") === "true" ? "?demo=true" : "";

  const [checkIns, setCheckIns] = useState<FoodCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setCheckIns(demoHistory as FoodCheckIn[]);
      setLoading(false);
      return;
    }
    if (!user) return;
    getClientFoodCheckIns(user.id)
      .then((rows) => setCheckIns(rows))
      .finally(() => setLoading(false));
  }, [user, isDemo]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-bold text-white">Check-in History</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {checkIns.length > 0
            ? `${checkIns.length} check-in${checkIns.length === 1 ? "" : "s"} logged`
            : "Your past daily check-ins will show here"}
        </p>
      </div>

      {checkIns.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardList className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-white font-semibold">No check-ins yet</p>
          <p className="text-zinc-500 text-sm mt-1">
            Log your first daily check-in and it&apos;ll appear here.
          </p>
          <Link
            href={`/client/food-check-in${demoSuffix}`}
            className="inline-block mt-4 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-black active:opacity-90"
          >
            Start a check-in
          </Link>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {checkIns.map((ci) => {
            const mealsLogged = (ci.items || []).filter((it) => !it.isSkipped).length;
            return (
              <Link
                key={ci.id}
                href={`/client/food-check-in?date=${ci.date}${demoSuffix ? "&demo=true" : ""}`}
                className="block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 active:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{formatCheckInDate(ci.date)}</span>
                      {ci.status === "reviewed" && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Reviewed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {formatDateForDisplay(ci.date, { weekday: "long" })}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-orange-400/80" />
                        {Math.round(ci.totalCalories)} kcal
                      </span>
                      {ci.weight != null && (
                        <span className="flex items-center gap-1">
                          <Scale className="h-3.5 w-3.5 text-sky-400/80" />
                          {fromKg(ci.weight, weightUnit).toFixed(1)} {weightUnit}
                        </span>
                      )}
                      {mealsLogged > 0 && (
                        <span className="text-zinc-500">
                          {mealsLogged} meal{mealsLogged === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={cn("text-lg font-bold leading-none", adherenceColor(ci.adherenceScore))}>
                      {Math.round(ci.adherenceScore)}%
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">adherence</p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />
                </div>

                {ci.coachFeedback && (
                  <div className="mt-3 rounded-xl border border-gold/15 bg-gold/[0.04] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-gold/80 font-semibold mb-0.5">
                      Coach feedback
                    </p>
                    <p className="text-xs text-zinc-300 line-clamp-2">{ci.coachFeedback}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
