"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { getWorkoutAssignments } from "@/lib/db";
import Link from "next/link";

export default function WorkoutsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getWorkoutAssignments(user.id).then((data) => {
        setAssignments(data);
        setLoading(false);
      });
    }
  }, [user]);

  // Determine latest assignment per client (= active)
  const latestPerClient = new Map<string, string>();
  for (const a of assignments) {
    if (!latestPerClient.has(a.clientId)) latestPerClient.set(a.clientId, a.id);
  }

  const plans = assignments.map((a: any) => ({
    id: a.id,
    templateId: a.templateId,
    title: a.template?.name || "Workout Plan",
    status: latestPerClient.get(a.clientId) === a.id ? "active" : "inactive",
    clientName: a.clientName || "Client",
    slots: a.template?.slots || [],
  }));

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
          {plans.map((plan) => (
            <Link key={plan.id} href={`/coach/workout-templates/${plan.templateId}`}>
              <Card hover>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{plan.title}</h3>
                    <p className="text-sm text-zinc-500 mt-0.5">{plan.slots.length}-day split</p>
                  </div>
                  <Badge variant={plan.status === "active" ? "success" : "default"}>{plan.status}</Badge>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Avatar name={plan.clientName} size="sm" />
                  <span className="text-sm text-zinc-300">{plan.clientName}</span>
                </div>
                <div className="space-y-1.5">
                  {plan.slots
                    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    .map((slot: any) => (
                      <div key={slot.id} className="flex items-center justify-between text-sm rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                        <span className="font-medium text-zinc-300">{slot.name}</span>
                        <span className="text-xs text-zinc-500">{slot.exercises?.length || 0} exercises</span>
                      </div>
                    ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
