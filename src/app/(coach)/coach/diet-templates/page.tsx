"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getDietTemplates, getPlanTypes } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { DietTemplate } from "@/types";

export default function DietTemplatesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <DietTemplatesPageInner />
    </Suspense>
  );
}

const demoTemplates: DietTemplate[] = [
  { id: "demo-veg", coachId: "demo", name: "Veg Plan", planType: "Veg", mealSlots: [], createdAt: new Date().toISOString() },
  { id: "demo-nonveg", coachId: "demo", name: "Nonveg Plan", planType: "Nonveg", mealSlots: [], createdAt: new Date().toISOString() },
  { id: "demo-lowcarb", coachId: "demo", name: "Low Carb Nonveg", planType: "Low Carb Nonveg", mealSlots: [], createdAt: new Date().toISOString() },
  { id: "demo-if", coachId: "demo", name: "Intermittent Fasting", planType: "Intermittent Fasting", mealSlots: [], createdAt: new Date().toISOString() },
];

function DietTemplatesPageInner() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();
  const [templates, setTemplates] = useState<DietTemplate[]>([]);
  const [planTypes, setPlanTypes] = useState<Array<{ id: string; name: string; isDefault: boolean }>>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setTemplates(demoTemplates);
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const [data, types] = await Promise.all([getDietTemplates(user.id), getPlanTypes(user.id)]);
    setTemplates(data);
    setPlanTypes(types);
    setLoading(false);
  }

  const filteredTemplates = useMemo(() => {
    if (!selectedPlanType) return templates;
    return templates.filter((t) => t.planType === selectedPlanType);
  }, [templates, selectedPlanType]);

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

      {/* Plan type filter */}
      {planTypes.length > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedPlanType(null)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold border whitespace-nowrap",
              !selectedPlanType ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
            )}
          >All</button>
          {planTypes.map((pt) => (
            <button
              key={pt.id}
              onClick={() => setSelectedPlanType(selectedPlanType === pt.name ? null : pt.name)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium border whitespace-nowrap",
                selectedPlanType === pt.name ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
              )}
            >{pt.name}</button>
          ))}
        </div>
      )}

      {/* Templates grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-zinc-500 text-sm">
            {templates.length === 0
              ? "No templates yet. Create your first diet template to get started."
              : "No templates match this filter."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTemplates.map((template) => (
            <Link key={template.id} href={`/coach/diet-templates/${template.id}${demoSuffix}`}>
              <Card hover className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{template.name}</p>
                    <span className="inline-flex items-center rounded-md bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 text-[10px] font-medium text-zinc-400 mt-1.5">
                      {template.planType}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[11px] text-zinc-500">
                    {template.mealSlots.length} meals
                  </p>
                  <p className="text-[11px] text-zinc-600">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
