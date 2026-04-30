"use client";

import { useState, useEffect } from "react";
import { getLeads, updateLeadStatus } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Users, TrendingUp, ShoppingBag } from "lucide-react";

const statusColors: Record<string, string> = {
  new: "bg-gold/10 text-gold border-gold/20",
  contacted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  converted: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "converted">("all");

  useEffect(() => { loadLeads(); }, []);

  async function loadLeads() {
    const data = await getLeads();
    setLeads(data);
    setLoading(false);
  }

  async function handleStatusChange(id: string, status: "new" | "contacted" | "converted") {
    await updateLeadStatus(id, status);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  }

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);
  const counts = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Leads</h1>
        <p className="text-zinc-500 mt-1 text-sm">Everyone who enquired or started checkout.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: counts.all, icon: Users },
          { label: "Contacted", value: counts.contacted, icon: TrendingUp },
          { label: "Converted", value: counts.converted, icon: ShoppingBag },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <Icon className="h-4 w-4 text-gold mb-2" />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["all", "new", "contacted", "converted"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === s ? "bg-gold text-black" : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"
            }`}>
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Leads list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">No leads yet.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <div key={lead.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{lead.name || "—"}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] text-zinc-500 uppercase tracking-wider">
                      {lead.source}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-zinc-500">
                    {lead.phone && <span>📱 {lead.phone}</span>}
                    {lead.email && <span>✉️ {lead.email}</span>}
                    {lead.goal && <span>🎯 {lead.goal}</span>}
                    {lead.plan_label && <span>📋 {lead.plan_label}</span>}
                    {lead.price && <span className="text-gold font-semibold">{lead.price}</span>}
                  </div>
                  {(lead.age || lead.gender || lead.weight) && (
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-zinc-600">
                      {lead.age && <span>Age: {lead.age}</span>}
                      {lead.gender && <span>{lead.gender}</span>}
                      {lead.weight && <span>{lead.weight}kg</span>}
                      {lead.diet && <span>{lead.diet}</span>}
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-700 mt-1">{formatDate(lead.created_at)}</p>
                </div>

                {/* Status changer */}
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                  className="text-xs bg-white/[0.04] border border-white/[0.08] text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold/40"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
