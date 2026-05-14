"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getWorkoutTemplates } from "@/lib/db";
import type { WorkoutTemplate } from "@/types";

export default function WorkoutTemplatesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <WorkoutTemplatesPageInner />
    </Suspense>
  );
}

const demoTemplates: WorkoutTemplate[] = [
  { id: "demo-ppl", coachId: "demo", name: "Push Pull Legs", isTemplate: true, slots: [
    { id: "s1", templateId: "demo-ppl", name: "Push", sortOrder: 0, exercises: [] },
    { id: "s2", templateId: "demo-ppl", name: "Pull", sortOrder: 1, exercises: [] },
    { id: "s3", templateId: "demo-ppl", name: "Legs", sortOrder: 2, exercises: [] },
  ], createdAt: new Date().toISOString() },
  { id: "demo-upper-lower", coachId: "demo", name: "Upper Lower Split", isTemplate: true, slots: [
    { id: "s4", templateId: "demo-upper-lower", name: "Upper A", sortOrder: 0, exercises: [] },
    { id: "s5", templateId: "demo-upper-lower", name: "Lower A", sortOrder: 1, exercises: [] },
    { id: "s6", templateId: "demo-upper-lower", name: "Upper B", sortOrder: 2, exercises: [] },
    { id: "s7", templateId: "demo-upper-lower", name: "Lower B", sortOrder: 3, exercises: [] },
  ], createdAt: new Date().toISOString() },
  { id: "demo-fullbody", coachId: "demo", name: "Full Body 3x", isTemplate: true, slots: [
    { id: "s8", templateId: "demo-fullbody", name: "Workout 1", sortOrder: 0, exercises: [] },
    { id: "s9", templateId: "demo-fullbody", name: "Workout 2", sortOrder: 1, exercises: [] },
    { id: "s10", templateId: "demo-fullbody", name: "Workout 3", sortOrder: 2, exercises: [] },
  ], createdAt: new Date().toISOString() },
];

function WorkoutTemplatesPageInner() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setTemplates(demoTemplates);
      setLoading(false);
      return;
    }
    if (user) loadTemplates();
  }, [user, isDemo]);

  async function loadTemplates() {
    if (!user) return;
    const data = await getWorkoutTemplates(user.id);
    setTemplates(data);
    setLoading(false);
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Workout Templates</h1>
          <p className="text-zinc-500 mt-1 text-sm">{templates.length} templates in your library</p>
        </div>
        <Link href={`/coach/workout-templates/create${demoSuffix}`}>
          <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Create Template</Button>
        </Link>
      </div>

      {/* Templates grid */}
      {templates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-zinc-500 text-sm">
            No workout templates yet. Create your first template to get started.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((template) => (
            <Link key={template.id} href={`/coach/workout-templates/${template.id}${demoSuffix}`}>
              <Card hover className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{template.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {template.slots.length} workout{template.slots.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 mt-3">
                  Created {new Date(template.createdAt).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
