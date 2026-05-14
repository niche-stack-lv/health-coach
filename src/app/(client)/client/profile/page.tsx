"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getProfile, getCheckIns, getMeasurements, getOnboarding } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { TrendingDown, Camera, Calendar, LogOut, Pencil } from "lucide-react";
import Link from "next/link";

export default function ClientProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [onboarding, setOnboarding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    const [p, ci, m, onb] = await Promise.all([getProfile(user.id), getCheckIns(user.id), getMeasurements(user.id), getOnboarding(user.id)]);
    setProfile(p);
    setCheckIns(ci);
    setMeasurements(m);
    setOnboarding(onb);
    setLoading(false);
  }

  const latestWeight = measurements.length > 0 ? measurements[measurements.length - 1].weight : null;

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <Card className="text-center">
        <div className="flex flex-col items-center">
          <Avatar name={profile?.name || "?"} size="lg" />
          <h1 className="text-lg font-bold text-white mt-3">{profile?.name}</h1>
          <p className="text-sm text-zinc-500">{profile?.email}</p>
          <Badge variant="success" className="mt-2">Active</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <TrendingDown className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{latestWeight || "—"}</p>
          <p className="text-[10px] text-zinc-500">Current kg</p>
        </Card>
        <Card className="p-3 text-center">
          <Camera className="h-4 w-4 text-gold mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{checkIns.length}</p>
          <p className="text-[10px] text-zinc-500">Check-ins</p>
        </Card>
        <Card className="p-3 text-center">
          <Calendar className="h-4 w-4 text-sky-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{measurements.length}</p>
          <p className="text-[10px] text-zinc-500">Logs</p>
        </Card>
      </div>

      {checkIns.length > 0 && (
        <Card>
          <p className="text-sm font-semibold text-white mb-3">Recent Check-ins</p>
          <div className="space-y-2">
            {checkIns.slice(0, 5).map((ci) => (
              <div key={ci.id} className="flex items-center justify-between">
                <p className="text-sm text-zinc-300">{formatDate(ci.date || ci.created_at)}</p>
                <div className="flex items-center gap-2">
                  {ci.weight && <span className="text-xs text-zinc-500">{ci.weight} kg</span>}
                  <Badge variant={ci.status === "reviewed" ? "success" : "warning"}>{ci.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Onboarding info */}
      {onboarding ? (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Your Profile</p>
            <Link href="/client/onboarding" className="text-xs text-gold flex items-center gap-1"><Pencil className="h-3 w-3" /> Edit</Link>
          </div>
          <div className="space-y-1.5 text-sm">
            {onboarding.primary_goal && <div className="flex justify-between"><span className="text-zinc-500">Goal</span><span className="text-white">{onboarding.primary_goal}</span></div>}
            {onboarding.diet_type && <div className="flex justify-between"><span className="text-zinc-500">Diet</span><span className="text-white">{onboarding.diet_type}</span></div>}
            {onboarding.work_type && <div className="flex justify-between"><span className="text-zinc-500">Work</span><span className="text-white">{onboarding.work_type}</span></div>}
            {onboarding.cooking_comfort && <div className="flex justify-between"><span className="text-zinc-500">Cooking</span><span className="text-white">{onboarding.cooking_comfort}</span></div>}
            {onboarding.daily_steps && <div className="flex justify-between"><span className="text-zinc-500">Steps</span><span className="text-white">{onboarding.daily_steps}</span></div>}
            {onboarding.coaching_style && <div className="flex justify-between"><span className="text-zinc-500">Coaching</span><span className="text-white">{onboarding.coaching_style}</span></div>}
          </div>
        </Card>
      ) : (
        <Link href="/client/onboarding">
          <Card className="border-gold/20 hover:border-gold/30 transition-colors">
            <div className="text-center py-2">
              <p className="text-sm font-semibold text-white">Complete Your Profile</p>
              <p className="text-xs text-zinc-500 mt-0.5">Help your coach build the perfect plan for you</p>
            </div>
          </Card>
        </Link>
      )}

      <Button variant="secondary" className="w-full" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
