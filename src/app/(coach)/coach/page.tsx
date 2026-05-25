"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Users, Camera, MessageCircle } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsDemo } from "@/lib/use-demo";
import { useAuth } from "@/lib/auth-context";
import { getClients, getCoachCheckIns, getCoachDailyCheckIns } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { config } from "@/lib/config";

export default function CoachDashboard() {
  return <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}><CoachDashboardInner /></Suspense>;
}

function CoachDashboardInner() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [clients, setClients] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [dailyCheckIns, setDailyCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setClients([
        { id: "d1", status: "active", goal: "Fat loss", profile: { name: "Alex Rivera", email: "alex@demo.com" } },
        { id: "d2", status: "active", goal: "Body recomposition", profile: { name: "Jordan Smith", email: "jordan@demo.com" } },
        { id: "d3", status: "active", goal: "Muscle gain", profile: { name: "Sam Patel", email: "sam@demo.com" } },
        { id: "d4", status: "active", goal: "Contest prep", profile: { name: "Taylor Chen", email: "taylor@demo.com" } },
      ]);
      setCheckIns([
        { id: "ci1", status: "pending", date: "2026-03-28", weight: 83.2, photos: [1, 2, 3], client: { name: "Alex Rivera" } },
        { id: "ci2", status: "pending", date: "2026-03-28", weight: 71.5, photos: [1, 2], client: { name: "Jordan Smith" } },
        { id: "ci3", status: "reviewed", date: "2026-03-21", weight: 84.5, photos: [1], client: { name: "Alex Rivera" }, coach_feedback: "Great progress!" },
      ]);
      setLoading(false);
      return;
    }
    if (user) loadData();
  }, [user, isDemo]);

  async function loadData() {
    if (!user) return;
    const [c, ci, dci] = await Promise.all([
      getClients(user.id),
      getCoachCheckIns(user.id),
      getCoachDailyCheckIns(user.id),
    ]);
    setClients(c);
    setCheckIns(ci);
    setDailyCheckIns(dci);
    setLoading(false);
  }

  const activeClients = clients.filter((c) => c.status === "active");
  const pendingWeekly = checkIns.filter((c) => c.status === "pending");
  const pendingDaily = dailyCheckIns.filter((c: any) => c.status === "submitted");
  const totalPending = pendingWeekly.length + pendingDaily.length;

  // Get today's date for checking missing check-ins
  const today = new Date().toISOString().split("T")[0];
  
  // Find clients who haven't checked in today
  const clientsWithCheckIns = new Set(dailyCheckIns.map((ci: any) => ci.client_id));
  const missingCheckIns = activeClients.filter((client) => !clientsWithCheckIns.has(client.id));

  function sendWhatsAppReminder(clientName: string, phone?: string) {
    const message = encodeURIComponent(`Hi ${clientName}! Just a friendly reminder - you're missing today's daily check-in. Please log your meals and weight when you get a chance. 💪`);
    const whatsappUrl = phone 
      ? `https://wa.me/${phone}?text=${message}`
      : `https://wa.me/${config.contact.whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Welcome back 💪</h1>
        <p className="text-zinc-500 mt-1 text-sm">Here&apos;s your business overview.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-5 mb-6">
        <Link href="/coach/clients" className="block">
          <StatCard title="Active Clients" value={activeClients.length} subtitle={`${clients.length} total`} icon={Users} />
        </Link>
        <StatCard title="Pending Replies" value={totalPending} subtitle={`${pendingDaily.length} daily · ${pendingWeekly.length} weekly`} icon={Camera} />
      </div>

      <div className="space-y-6">
        {/* Section 1: Pending Check-in Replies from Coach */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Pending Check-in Replies</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Check-ins waiting for your feedback</p>
            </div>
            {totalPending > 0 && <Badge variant="warning">{totalPending} pending</Badge>}
          </div>
          {totalPending === 0 ? (
            <p className="text-sm text-zinc-500">All caught up! No pending check-ins to review.</p>
          ) : (
            <div className="space-y-3">
              {/* Daily pending */}
              {pendingDaily.map((ci: any) => (
                <Link key={ci.id} href={`/coach/clients/${ci.client_id}?tab=checkins`} className="block">
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.06] p-3 hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar name={ci.profile?.name || "?"} />
                      <div>
                        <p className="text-sm font-medium text-white">{ci.profile?.name || "Client"}</p>
                        <p className="text-xs text-zinc-500">{formatDate(ci.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ci.weight && <span className="text-xs text-zinc-400">{ci.weight} kg</span>}
                      <Badge variant="gold">Daily</Badge>
                    </div>
                  </div>
                </Link>
              ))}
              {/* Weekly pending */}
              {pendingWeekly.map((ci) => (
                <Link key={ci.id} href={`/coach/clients/${ci.client_id}?tab=checkins`} className="block">
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.06] p-3 hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar name={ci.client?.name || "?"} />
                      <div>
                        <p className="text-sm font-medium text-white">{ci.client?.name}</p>
                        <p className="text-xs text-zinc-500">{formatDate(ci.date || ci.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ci.weight && <span className="text-xs text-zinc-400">{ci.weight} kg</span>}
                      <Badge variant="info">Weekly</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Section 2: Missing Check-ins from Clients */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Missing Check-ins from Clients</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Clients who haven&apos;t checked in today</p>
            </div>
            {missingCheckIns.length > 0 && <Badge variant="default">{missingCheckIns.length} missing</Badge>}
          </div>
          {missingCheckIns.length === 0 ? (
            <p className="text-sm text-zinc-500">Great! All active clients have checked in today.</p>
          ) : (
            <div className="space-y-3">
              {missingCheckIns.map((client) => (
                <div key={client.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] p-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={client.profile?.name || "?"} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{client.profile?.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{client.goal || "No goal set"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendWhatsAppReminder(client.profile?.name || "there", client.phone)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                    title="Send WhatsApp reminder"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">Remind</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
