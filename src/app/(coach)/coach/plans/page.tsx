"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { getDietPlans } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function PlansPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadPlans();
  }, [user]);

  async function loadPlans() {
    if (!user) return;
    const data = await getDietPlans(user.id);
    setPlans(data);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Diet Plans</h1>
          <p className="text-zinc-500 mt-1 text-sm">{plans.length} plans</p>
        </div>
        <Link href="/coach/plans/create">
          <Button variant="gold"><Plus className="h-4 w-4" /> New Plan</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>
      ) : plans.length === 0 ? (
        <Card className="text-center py-12"><p className="text-zinc-500">No diet plans yet. Create your first one!</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const meals = plan.meals || [];
            const totalCal = meals.reduce((s: number, m: any) => s + (m.calories || 0), 0);
            const totalP = meals.reduce((s: number, m: any) => s + (m.protein || 0), 0);
            return (
              <Link key={plan.id} href={`/coach/plans/${plan.id}`}>
                <Card hover>
                  <CardHeader className="mb-3">
                    <div className="flex items-start justify-between">
                      <div><CardTitle>{plan.title}</CardTitle><CardDescription>{plan.description}</CardDescription></div>
                      <Badge variant={plan.status === "active" ? "success" : "default"}>{plan.status}</Badge>
                    </div>
                  </CardHeader>
                  {plan.client && (
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar name={plan.client.name} size="sm" />
                      <span className="text-sm text-zinc-300">{plan.client.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-zinc-500 mb-3">
                    <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{plan.start_date && formatDate(plan.start_date)} — {plan.end_date && formatDate(plan.end_date)}</div>
                    <span>{plan.weeks} weeks</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                    <div className="text-center"><p className="text-lg font-bold text-white">{totalCal}</p><p className="text-xs text-zinc-500">kcal/day</p></div>
                    <div className="text-center"><p className="text-lg font-bold text-white">{totalP}g</p><p className="text-xs text-zinc-500">protein</p></div>
                    <div className="text-center"><p className="text-lg font-bold text-white">{meals.length}</p><p className="text-xs text-zinc-500">meals</p></div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
