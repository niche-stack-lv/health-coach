"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsDemo, useDemoSuffix } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getDietTemplates, getClients, getClientActiveAssignment, assignTemplate } from "@/lib/db";
import Link from "next/link";
import type { DietTemplate } from "@/types";

export default function AssignTemplatePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <AssignTemplatePageInner />
    </Suspense>
  );
}

const demoTemplates = [
  { id: "demo-veg", name: "Veg Plan" },
  { id: "demo-nonveg", name: "Nonveg Plan" },
];

const demoClients = [
  { id: "c1", profile: { name: "Alex Rivera" } },
  { id: "c2", profile: { name: "Jordan Smith" } },
];

function AssignTemplatePageInner() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const demoSuffix = useDemoSuffix();
  const router = useRouter();

  const [templates, setTemplates] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [existingAssignment, setExistingAssignment] = useState<any>(null);
  const [checkingAssignment, setCheckingAssignment] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setTemplates(demoTemplates);
      setClients(demoClients);
      setSelectedTemplateId("demo-veg");
      setSelectedClientId("c1");
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const [t, c] = await Promise.all([
      getDietTemplates(user.id),
      getClients(user.id),
    ]);
    setTemplates(t);
    setClients(c);
    setLoading(false);
  }

  // Check for existing assignment when client changes
  useEffect(() => {
    if (!selectedClientId || isDemo) {
      setExistingAssignment(null);
      return;
    }
    checkExistingAssignment();
  }, [selectedClientId]);

  async function checkExistingAssignment() {
    setCheckingAssignment(true);
    const assignment = await getClientActiveAssignment(selectedClientId);
    setExistingAssignment(assignment);
    setCheckingAssignment(false);
  }

  async function handleAssign() {
    if (!user || !selectedTemplateId || !selectedClientId) return;
    setAssigning(true);
    setError(null);
    const { error: err } = await assignTemplate({
      templateId: selectedTemplateId,
      clientId: selectedClientId,
      coachId: user.id,
    });
    if (err) {
      setError(err);
      setAssigning(false);
    } else {
      router.push(`/coach/diet-templates${demoSuffix}`);
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  const selectClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none";

  return (
    <div>
      <Link href={`/coach/diet-templates${demoSuffix}`} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-gold mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Templates
      </Link>

      <h1 className="text-xl lg:text-2xl font-bold text-white mb-6">Assign Template to Client</h1>

      <Card className="p-6 max-w-lg">
        <div className="space-y-5">
          {/* Template selector */}
          <div>
            <label className="block text-sm text-zinc-300 mb-1.5">Diet Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className={selectClass}
              disabled={isDemo}
            >
              <option value="" className="bg-zinc-900">Select a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id} className="bg-zinc-900">{t.name}</option>
              ))}
            </select>
          </div>

          {/* Client selector */}
          <div>
            <label className="block text-sm text-zinc-300 mb-1.5">Client</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className={selectClass}
              disabled={isDemo}
            >
              <option value="" className="bg-zinc-900">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-900">
                  {c.profile?.name || c.name || "Unknown"}
                </option>
              ))}
            </select>
          </div>

          {/* Warning if client already has an active assignment */}
          {existingAssignment && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-300">Active assignment exists</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  This client already has &quot;{existingAssignment.template?.name || "a template"}&quot; assigned.
                  Assigning a new template will deactivate the current one.
                </p>
              </div>
            </div>
          )}

          {checkingAssignment && (
            <p className="text-xs text-zinc-500">Checking existing assignment...</p>
          )}

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Assign button */}
          <Button
            variant="gold"
            className="w-full h-12 text-base rounded-xl"
            onClick={handleAssign}
            disabled={isDemo || !selectedTemplateId || !selectedClientId || assigning}
          >
            {isDemo ? "Demo Mode — Assign Disabled" : assigning ? "Assigning..." : "Assign Template"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
