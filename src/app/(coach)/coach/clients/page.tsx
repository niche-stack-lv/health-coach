"use client";

import { useState, useEffect } from "react";
import { Plus, Search, X, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getClients, addClient, searchProfiles, promoteToClient, getLeads } from "@/lib/db";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"clients" | "find">("clients");

  // Existing clients search
  const [search, setSearch] = useState("");

  // Find & Add tab
  const [findQuery, setFindQuery] = useState("");
  const [findResults, setFindResults] = useState<any[]>([]);
  const [findLoading, setFindLoading] = useState(false);
  const [paidLeads, setPaidLeads] = useState<any[]>([]);
  const [promoteGoal, setPromoteGoal] = useState<Record<string, string>>({});
  const [promoteLoading, setPromoteLoading] = useState<string | null>(null);
  const [promoteMsg, setPromoteMsg] = useState<Record<string, string>>({});

  // Manual add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", goal: "" });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState<{ password: string } | null>(null);

  useEffect(() => { if (user) loadClients(); }, [user]);
  useEffect(() => { if (user && tab === "find") loadPaidLeads(); }, [user, tab]);

  async function loadClients() {
    if (!user) return;
    setLoading(true);
    const data = await getClients(user.id);
    setClients(data);
    setLoading(false);
  }

  async function loadPaidLeads() {
    const leads = await getLeads();
    // Show leads from pricing page that aren't already clients
    const clientIds = clients.map((c) => c.id);
    setPaidLeads(leads.filter((l) => l.source === "pricing" && l.email && !clientIds.includes(l.id)));
  }

  async function handleFind(q: string) {
    setFindQuery(q);
    if (q.length < 2) { setFindResults([]); return; }
    setFindLoading(true);
    const results = await searchProfiles(q);
    // Filter out already-clients
    const clientIds = clients.map((c) => c.id);
    setFindResults(results.filter((r: any) => !clientIds.includes(r.id)));
    setFindLoading(false);
  }

  async function handlePromote(profileId: string, name: string) {
    if (!user) return;
    setPromoteLoading(profileId);
    setPromoteMsg((p) => ({ ...p, [profileId]: "" }));
    const goal = promoteGoal[profileId] || "";
    const { error } = await promoteToClient(user.id, profileId, goal);
    setPromoteLoading(null);
    if (error) {
      setPromoteMsg((p) => ({ ...p, [profileId]: `Error: ${error}` }));
    } else {
      setPromoteMsg((p) => ({ ...p, [profileId]: `${name} added as client!` }));
      await loadClients();
      setFindResults((prev) => prev.filter((r) => r.id !== profileId));
    }
  }

  async function handleAdd() {
    if (!user || !addForm.name || !addForm.email) return;
    setAddError("");
    setAddLoading(true);
    const result = await addClient(user.id, addForm.email, addForm.name, addForm.goal);
    setAddLoading(false);
    if (result.error) { setAddError(result.error); return; }
    setAddSuccess({ password: result.tempPassword! });
    loadClients();
  }

  const filtered = clients.filter((c) => {
    const name = c.profile?.name || "";
    const email = c.profile?.email || "";
    return name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Clients</h1>
          <p className="text-zinc-500 mt-1 text-sm">{clients.length} total clients</p>
        </div>
        <Button variant="gold" onClick={() => { setShowAdd(true); setAddSuccess(null); setAddForm({ name: "", email: "", goal: "" }); setAddError(""); }}>
          <Plus className="h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab("clients")}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
            tab === "clients" ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500 hover:text-zinc-300")}>
          <Users className="h-4 w-4" /> My Clients
        </button>
        <button onClick={() => setTab("find")}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
            tab === "find" ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500 hover:text-zinc-300")}>
          <UserPlus className="h-4 w-4" /> Find & Add
        </button>
      </div>

      {/* ── MY CLIENTS TAB ── */}
      {tab === "clients" && (
        <>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." className={cn(inputClass, "pl-10")} />
          </div>
          {loading ? (
            <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-zinc-500">{clients.length === 0 ? "No clients yet." : "No clients match your search."}</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((client) => (
                <Link key={client.id} href={`/coach/clients/${client.id}`}>
                  <Card className="p-4 hover:border-gold/20 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar name={client.profile?.name || "?"} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{client.profile?.name}</p>
                          <Badge variant={client.status === "active" ? "success" : "default"}>{client.status}</Badge>
                        </div>
                        <p className="text-xs text-zinc-500 truncate">{client.profile?.email}</p>
                      </div>
                    </div>
                    {client.goal && <p className="text-xs text-zinc-500">{client.goal}</p>}
                    <div className="flex items-center justify-between mt-2 text-xs text-zinc-600">
                      {client.current_weight && <span>{client.current_weight} kg → {client.target_weight} kg</span>}
                      <span>Joined {formatDate(client.created_at)}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── FIND & ADD TAB ── */}
      {tab === "find" && (
        <div className="space-y-6">

          {/* Search signups */}
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-3">Search Signed-Up Users</p>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input type="text" value={findQuery} onChange={(e) => handleFind(e.target.value)}
                placeholder="Search by name or email..." className={cn(inputClass, "pl-10")} />
            </div>
            {findLoading && <div className="flex justify-center py-4"><div className="h-5 w-5 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}
            {findResults.length > 0 && (
              <div className="space-y-2">
                {findResults.map((profile) => (
                  <Card key={profile.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={profile.name || "?"} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{profile.name}</p>
                        <p className="text-xs text-zinc-500">{profile.email}</p>
                        <p className="text-xs text-zinc-600">Signed up {formatDate(profile.created_at)}</p>
                      </div>
                    </div>
                    <input type="text" value={promoteGoal[profile.id] || ""}
                      onChange={(e) => setPromoteGoal((p) => ({ ...p, [profile.id]: e.target.value }))}
                      placeholder="Goal (e.g. Fat loss)" className={cn(inputClass, "mb-2 py-2 text-xs")} />
                    {promoteMsg[profile.id] && (
                      <p className={cn("text-xs mb-2", promoteMsg[profile.id].includes("added") ? "text-gold" : "text-red-400")}>
                        {promoteMsg[profile.id]}
                      </p>
                    )}
                    <Button variant="gold" size="sm" className="w-full"
                      onClick={() => handlePromote(profile.id, profile.name)}
                      disabled={promoteLoading === profile.id}>
                      {promoteLoading === profile.id ? "Adding..." : "Add as Client"}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
            {findQuery.length >= 2 && !findLoading && findResults.length === 0 && (
              <p className="text-sm text-zinc-600 text-center py-4">No signed-up users found matching "{findQuery}"</p>
            )}
          </div>

          {/* Paid leads */}
          {paidLeads.length > 0 && (
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-3">Confirmed Payments (from Pricing Page)</p>
              <div className="space-y-2">
                {[...paidLeads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((lead) => (
                  <Card key={lead.id} className="p-4 border-gold/10">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{lead.name || "—"}</p>
                        <p className="text-xs text-zinc-500">{lead.email}</p>
                        <p className="text-xs text-zinc-600">{lead.phone} · {lead.plan_label} · <span className="text-gold font-semibold">{lead.price}</span></p>
                        <p className="text-xs text-zinc-700">{formatDate(lead.created_at)}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-gold/20 text-gold bg-gold/5 font-semibold uppercase shrink-0">Paid</span>
                    </div>
                    <input type="text" value={promoteGoal[lead.id] || lead.goal || ""}
                      onChange={(e) => setPromoteGoal((p) => ({ ...p, [lead.id]: e.target.value }))}
                      placeholder={lead.goal || "Goal (e.g. Fat loss)"} className={cn(inputClass, "mb-2 py-2 text-xs")} />
                    {promoteMsg[lead.id] && (
                      <p className={cn("text-xs mb-2", promoteMsg[lead.id].includes("added") ? "text-gold" : "text-red-400")}>
                        {promoteMsg[lead.id]}
                      </p>
                    )}
                    <p className="text-[10px] text-zinc-600 mb-2">They must sign up first. Search their email above to link their account, or add manually.</p>
                    <Button variant="gold" size="sm" className="w-full"
                      onClick={() => { setShowAdd(false); setFindQuery(lead.email || ""); handleFind(lead.email || ""); }}
                    >
                      Find Their Account
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/[0.08] p-6 safe-area-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Add New Client</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl hover:bg-white/[0.06]"><X className="h-5 w-5 text-zinc-400" /></button>
            </div>
            {addSuccess ? (
              <div className="text-center py-4">
                <p className="text-gold font-semibold mb-2">Client created!</p>
                <p className="text-sm text-zinc-400 mb-1">Share these login credentials:</p>
                <p className="text-sm text-white">Email: {addForm.email}</p>
                <p className="text-sm text-white">Temp password: <span className="text-gold font-mono">{addSuccess.password}</span></p>
                <p className="text-xs text-zinc-500 mt-3">Ask them to change their password after first login.</p>
                <Button variant="gold" className="mt-4 w-full" onClick={() => setShowAdd(false)}>Done</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {addError && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{addError}</div>}
                <div>
                  <label className="block text-sm text-zinc-300 mb-1.5">Full Name *</label>
                  <input type="text" value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} placeholder="Client name" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-zinc-300 mb-1.5">Email *</label>
                  <input type="email" value={addForm.email} onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))} placeholder="client@email.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-zinc-300 mb-1.5">Goal</label>
                  <input type="text" value={addForm.goal} onChange={(e) => setAddForm((p) => ({ ...p, goal: e.target.value }))} placeholder="e.g. Fat loss, muscle gain" className={inputClass} />
                </div>
                <Button variant="gold" className="w-full h-12 text-base rounded-xl" onClick={handleAdd} disabled={addLoading || !addForm.name || !addForm.email}>
                  {addLoading ? "Creating..." : "Add Client"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
