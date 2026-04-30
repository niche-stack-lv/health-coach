"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { getWorkoutPlans } from "@/lib/db";
import Link from "next/link";

export default function WorkoutsPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) getWorkoutPlans(user.id).then((d) => { setPlans(d); setLoading(false); });
  }, [user]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Workout Plans</h1>
          <p className="text-zinc-500 mt-1 text-sm">{plans.length} plans</p>
        </div>
        <Link href="/coach/workouts/create">
          <Button variant="gold"><Plus className="h-4 w-4" /> New Workout</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>
      ) : plans.length === 0 ? (
        <Card className="text-center py-12"><p className="text-zinc-500">No workout plans yet. Create your first one!</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const days = plan.days || [];
            return (
              <Link key={plan.id} href={`/coach/workouts/edit?id=${plan.id}`}>
                <Card hover>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">{plan.title}</h3>
                      <p className="text-sm text-zinc-500 mt-0.5">{days.length}-day split</p>
                    </div>
                    <Badge variant={plan.status === "active" ? "success" : "default"}>{plan.status}</Badge>
                  </div>
                  {plan.client && (
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar name={plan.client.name} size="sm" />
                      <span className="text-sm text-zinc-300">{plan.client.name}</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {days.map((day: any, i: number) => {
                      const exercises = day.exercises || [];
                      return (
                        <div key={i} className="flex items-center justify-between text-sm rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 font-mono">{day.day_label}</span>
                            <span className="font-medium text-zinc-300">{day.name}</span>
                          </div>
                          <span className="text-xs text-zinc-500">{exercises.length} exercises</span>
                        </div>
                      );
                    })}
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
