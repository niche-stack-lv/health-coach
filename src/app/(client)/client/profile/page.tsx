"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getProfile, getCheckIns, getMeasurements } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { TrendingDown, Camera, Calendar, LogOut } from "lucide-react";

export default function ClientProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    const [p, ci, m] = await Promise.all([getProfile(user.id), getCheckIns(user.id), getMeasurements(user.id)]);
    setProfile(p);
    setCheckIns(ci);
    setMeasurements(m);
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

      <Button variant="secondary" className="w-full" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
