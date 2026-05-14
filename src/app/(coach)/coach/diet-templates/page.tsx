"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getDietTemplates } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { DietTemplate, PlanType } from "@/types";

export default function DietTemplatesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <DietTemplatesPageInner />
    </Suspense>
  );
}

const demoTemplates: DietTemplate[] = [
  { id: "demo-veg", coachId: "demo", name: "Veg Plan", planType: "veg", days: [], createdAt: new Date().toISOString() },
  { id: "demo-nonveg", coachId: "demo", name: "Nonveg Plan", planType: "nonveg", days: [], createdAt: new Date().toISOString() },
  { id: "demo-lowcarb", coachId: "demo", name: "Low Carb Nonveg", planType: "low_carb_nonveg", days: [], createdAt: new Date().toISOString() },
  { id: "demo-if", coachId: "demo", name: "Intermittent Fasting", planType: "intermittent_fasting", days: [], createdAt: new Date().toISOString() },
];

const planTypeBadgeColors: Record<PlanType, string> = {
  veg: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  nonveg: "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20",
  low_carb_nonveg: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20",
  intermittent_fasting: "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20",
};

const planTypeLabels: Record<PlanType, string> = {
  veg: "Veg",
  nonveg: "Nonveg",
  low_carb_nonveg: "Low Carb Nonveg",
  intermittent_fasting: "Intermittent Fasting",
};

function DietTemplatesPageInner() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();
  const [templates, setTemplates] = useState<DietTemplate[]>([]);
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
    const data = await getDietTemplates(user.id);
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
          <h1 className="text-xl lg:text-2xl font-bold text-white">Diet Templates</h1>
          <p className="text-zinc-500 mt-1 text-sm">{templates.length} templates in your library</p>
        </div>
        <Link href={`/coach/diet-templates/create${demoSuffix}`}>
          <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Create Template</Button>
        </Link>
      </div>

      {/* Templates grid */}
      {templates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-zinc-500 text-sm">
            No templates yet. Create your first diet template to get started.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((template) => (
            <Link key={template.id} href={`/coach/diet-templates/${template.id}${demoSuffix}`}>
              <Card hover className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{template.name}</p>
                    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide mt-1", planTypeBadgeColors[template.planType])}>
                      {planTypeLabels[template.planType]}
                    </span>
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
