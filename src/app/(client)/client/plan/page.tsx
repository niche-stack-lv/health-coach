"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getClientDietPlans } from "@/lib/db";
import { exportDietPlanPDF } from "@/lib/pdf-export";
import { formatDate } from "@/lib/utils";
import { useIsDemo } from "@/lib/use-demo";
import { Download } from "lucide-react";

function ClientPlanContent() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setPlans([{
        id: "demo-plan-1",
        title: "Fat Loss Phase 1",
        description: "High protein, moderate carb plan for lean muscle retention",
        status: "active",
        start_date: "2025-01-06",
        end_date: "2025-03-31",
        meals: [
          { id: "m1", name: "Breakfast", time: "8:00 AM", calories: 450, protein: 35, carbs: 40, fat: 15, items: ["4 egg whites + 1 whole egg scramble", "1 cup oats with berries", "Black coffee"] },
          { id: "m2", name: "Lunch", time: "1:00 PM", calories: 550, protein: 45, carbs: 50, fat: 18, items: ["200g grilled chicken breast", "1 cup brown rice", "Mixed green salad with olive oil", "1 medium apple"] },
          { id: "m3", name: "Pre-Workout Snack", time: "4:30 PM", calories: 300, protein: 25, carbs: 35, fat: 8, items: ["1 scoop whey protein shake", "1 banana", "1 tbsp peanut butter"] },
          { id: "m4", name: "Dinner", time: "8:00 PM", calories: 500, protein: 40, carbs: 30, fat: 22, items: ["200g salmon fillet", "Roasted sweet potato (150g)", "Steamed broccoli & asparagus", "1 tsp olive oil drizzle"] },
        ],
      }]);
      setLoading(false);
      return;
    }
    if (user) getClientDietPlans(user.id).then((d) => { setPlans(d); setLoading(false); });
  }, [user, isDemo]);

  const plan = plans.find((p) => p.status === "active") || plans[0];

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;
  if (!plan) return <div className="py-20 text-center text-zinc-500">No diet plan assigned yet. Your coach will create one for you.</div>;

  const meals = plan.meals || [];
  const totalCal = meals.reduce((s: number, m: any) => s + (m.calories || 0), 0);
  const totalP = meals.reduce((s: number, m: any) => s + (m.protein || 0), 0);
  const totalC = meals.reduce((s: number, m: any) => s + (m.carbs || 0), 0);
  const totalF = meals.reduce((s: number, m: any) => s + (m.fat || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{plan.title}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{plan.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="success">{plan.status}</Badge>
            {plan.start_date && <span className="text-xs text-zinc-500">{formatDate(plan.start_date)} — {formatDate(plan.end_date)}</span>}
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => exportDietPlanPDF(
          { ...plan, startDate: plan.start_date, endDate: plan.end_date, meals: meals.map((m: any) => ({ ...m, items: m.items || [] })) },
          user?.email || "Client"
        )}><Download className="h-3.5 w-3.5" /> PDF</Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[{ label: "Calories", value: totalCal }, { label: "Protein", value: `${totalP}g` }, { label: "Carbs", value: `${totalC}g` }, { label: "Fat", value: `${totalF}g` }].map((m) => (
          <div key={m.label} className="rounded-xl bg-[#141414] border border-white/[0.06] p-3 text-center">
            <p className="text-lg font-bold text-white">{m.value}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {meals.map((meal: any) => (
          <Card key={meal.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div><p className="font-semibold text-white">{meal.name}</p><p className="text-xs text-zinc-500">{meal.time}</p></div>
              <span className="text-sm font-medium text-gold">{meal.calories} kcal</span>
            </div>
            <ul className="space-y-1.5">
              {(meal.items || []).map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-300"><span className="h-1.5 w-1.5 rounded-full bg-gold/40" />{item}</li>
              ))}
            </ul>
            <div className="flex gap-4 mt-3 pt-3 border-t border-white/[0.06]">
              <span className="text-xs text-zinc-500">P: {meal.protein}g</span>
              <span className="text-xs text-zinc-500">C: {meal.carbs}g</span>
              <span className="text-xs text-zinc-500">F: {meal.fat}g</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ClientPlanPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <ClientPlanContent />
    </Suspense>
  );
}
